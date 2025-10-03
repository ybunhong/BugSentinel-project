import {
  LocalStorageService,
  type LocalSnippet,
  type LocalPreferences,
} from "./localStorageService";
import { SupabaseService } from "./supabaseService";
import { useStore } from "../store/useStore";
import type { Snippet } from "../store/types";

export class SyncService {
  private static isOnline = navigator.onLine;
  private static syncInProgress = false;
  private static retryCount = 0;
  private static maxRetries = 3;
  private static _lastSyncTimestamp: Date | null = null; // Added to track last sync time

  static initialize(): void {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Initial sync if online
    if (this.isOnline) {
      this.syncWhenOnline();
    }
  }

  static cleanup(): void {
    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));
  }

  private static handleOnline(): void {
    console.log("🌐 Back online - starting sync...");
    this.isOnline = true;
    this.retryCount = 0;
    this.syncWhenOnline();
  }

  private static handleOffline(): void {
    console.log("📴 Gone offline - switching to local mode");
    this.isOnline = false;
  }

  static async syncWhenOnline(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      await this.syncToServer();
      await this.syncFromServer();
      LocalStorageService.clearSyncQueue();
      this.retryCount = 0;
      this._lastSyncTimestamp = new Date(); // Update last sync timestamp on successful sync
    } catch (error) {
      console.error("Sync failed:", error);
      this.retryCount++;

      if (this.retryCount < this.maxRetries) {
        // Exponential backoff retry
        setTimeout(() => {
          this.syncWhenOnline();
        }, Math.pow(2, this.retryCount) * 1000);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private static async syncToServer(): Promise<void> {
    const user = useStore.getState().user;
    if (!user) return;

    const syncQueue = LocalStorageService.getSyncQueue();

    for (const item of syncQueue) {
      try {
        switch (item.type) {
          case "create":
            await this.syncCreateSnippet(item.data as LocalSnippet, user.id);
            break;
          case "update":
            await this.syncUpdateSnippet(item.data as LocalSnippet, user.id);
            break;
          case "delete":
            await this.syncDeleteSnippet(item.data as LocalSnippet, user.id);
            break;
          case "preferences":
            await this.syncPreferences(item.data as LocalPreferences, user.id);
            break;
        }
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
        // Continue with other items even if one fails
      }
    }
  }

  private static async syncFromServer(): Promise<void> {
    const user = useStore.getState().user;
    if (!user) return;

    try {
      // Sync snippets from server
      const { data: serverSnippets, error: snippetsError } =
        await SupabaseService.getSnippets(user.id);
      if (!snippetsError && serverSnippets) {
        const store = useStore.getState();
        store.setSnippets(serverSnippets);
      }

      // Sync preferences from server
      const { data: serverPreferences, error: prefsError } =
        await SupabaseService.getUserPreferences(user.id);
      if (!prefsError && serverPreferences) {
        const store = useStore.getState();
        if (serverPreferences.theme) {
          store.setTheme(serverPreferences.theme);
        }
      }
    } catch (error) {
      console.error("Failed to sync from server:", error);
    }
  }

  private static async syncCreateSnippet(
    localSnippet: LocalSnippet,
    userId: string
  ): Promise<void> {
    const snippetData = {
      userId,
      title: localSnippet.title,
      language: localSnippet.language,
      code: localSnippet.code,
    };

    const { data, error } = await SupabaseService.createSnippet(snippetData);
    if (!error && data) {
      LocalStorageService.markSnippetAsSynced(localSnippet.localId);
    } else {
      throw error;
    }
  }

  private static async syncUpdateSnippet(
    localSnippet: LocalSnippet,
    userId: string
  ): Promise<void> {
    // For local snippets, we need to find the corresponding server snippet
    // This is a simplified approach - in production, you'd want better ID mapping
    const { data: serverSnippets } = await SupabaseService.getSnippets(userId);
    const matchingSnippet = serverSnippets?.find(
      (s) =>
        s.title === localSnippet.title && s.language === localSnippet.language
    );

    if (matchingSnippet) {
      const { error } = await SupabaseService.updateSnippet(
        matchingSnippet.id,
        {
          title: localSnippet.title,
          language: localSnippet.language,
          code: localSnippet.code,
        }
      );

      if (!error) {
        LocalStorageService.markSnippetAsSynced(localSnippet.localId);
      } else {
        throw error;
      }
    }
  }

  private static async syncDeleteSnippet(
    localSnippet: LocalSnippet,
    userId: string
  ): Promise<void> {
    // Similar to update - find matching server snippet
    const { data: serverSnippets } = await SupabaseService.getSnippets(userId);
    const matchingSnippet = serverSnippets?.find(
      (s) =>
        s.title === localSnippet.title && s.language === localSnippet.language
    );

    if (matchingSnippet) {
      const { error } = await SupabaseService.deleteSnippet(matchingSnippet.id);
      if (error) {
        throw error;
      }
    }
  }

  private static async syncPreferences(
    localPreferences: LocalPreferences,
    userId: string
  ): Promise<void> {
    const { error } = await SupabaseService.upsertUserPreferences(userId, {
      theme: localPreferences.theme,
      editorSettings: localPreferences.editorSettings,
      lastSnippetId: localPreferences.lastSnippetId,
    });

    if (!error) {
      LocalStorageService.markPreferencesAsSynced();
    } else {
      throw error;
    }
  }

  // Public methods for offline-first operations
  static async createSnippetOfflineFirst(snippetData: {
    title: string;
    language: string;
    code: string;
  }): Promise<LocalSnippet | Snippet> {
    const user = useStore.getState().user;

    if (this.isOnline && user) {
      // Try online first
      try {
        const { data, error } = await SupabaseService.createSnippet({
          ...snippetData,
          userId: user.id,
        });

        if (!error && data) {
          return data;
        }
      } catch (error) {
        console.warn("Online create failed, falling back to local:", error);
      }
    }

    // Fallback to local storage
    return LocalStorageService.saveLocalSnippet({
      ...snippetData,
      userId: user?.id,
    });
  }

  static async updateSnippetOfflineFirst(
    snippetId: string,
    updates: Partial<Snippet>
  ): Promise<Snippet | LocalSnippet | null> {
    const user = useStore.getState().user;

    if (this.isOnline && user) {
      // Try online first
      try {
        const { data, error } = await SupabaseService.updateSnippet(
          snippetId,
          updates
        );
        if (!error && data) {
          return data;
        }
      } catch (error) {
        console.warn("Online update failed, falling back to local:", error);
      }
    }

    // Fallback to local storage
    return LocalStorageService.updateLocalSnippet(
      snippetId,
      updates as Partial<LocalSnippet>
    );
  }

  static async deleteSnippetOfflineFirst(snippetId: string): Promise<boolean> {
    const user = useStore.getState().user;

    if (this.isOnline && user) {
      // Try online first
      try {
        const { error } = await SupabaseService.deleteSnippet(snippetId);
        if (!error) {
          return true;
        }
      } catch (error) {
        console.warn("Online delete failed, falling back to local:", error);
      }
    }

    // Fallback to local storage
    return LocalStorageService.deleteLocalSnippet(snippetId);
  }

  static getConnectionStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    pendingChanges: number;
    lastSync: Date | null; // Added lastSync to the return type
  } {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingChanges: LocalStorageService.getSyncQueue().length,
      lastSync: this._lastSyncTimestamp, // Return the last sync timestamp
    };
  }

  static async forceSyncNow(): Promise<void> {
    if (this.isOnline) {
      await this.syncWhenOnline();
    }
  }
}
