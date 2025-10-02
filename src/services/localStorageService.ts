import type { Snippet } from '../store/types';

export interface LocalSnippet extends Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'> {
  localId: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced' | 'error';
  userId?: string;
}

export interface LocalPreferences {
  theme: 'light' | 'dark';
  editorSettings: any;
  lastSnippetId: string | null;
  syncStatus: 'pending' | 'synced' | 'error';
}

export class LocalStorageService {
  private static readonly SNIPPETS_KEY = 'bugsentinel_snippets';
  private static readonly PREFERENCES_KEY = 'bugsentinel_preferences';
  private static readonly SYNC_QUEUE_KEY = 'bugsentinel_sync_queue';

  // Snippet operations
  static getLocalSnippets(): LocalSnippet[] {
    try {
      const stored = localStorage.getItem(this.SNIPPETS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local snippets:', error);
      return [];
    }
  }

  static saveLocalSnippet(snippet: Omit<LocalSnippet, 'localId' | 'createdAt' | 'updatedAt' | 'syncStatus'>): LocalSnippet {
    const snippets = this.getLocalSnippets();
    const now = new Date().toISOString();
    
    const localSnippet: LocalSnippet = {
      ...snippet,
      localId: this.generateLocalId(),
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    snippets.push(localSnippet);
    this.saveSnippets(snippets);
    this.addToSyncQueue('create', localSnippet);
    
    return localSnippet;
  }

  static updateLocalSnippet(localId: string, updates: Partial<LocalSnippet>): LocalSnippet | null {
    const snippets = this.getLocalSnippets();
    const index = snippets.findIndex(s => s.localId === localId);
    
    if (index === -1) return null;

    const updatedSnippet: LocalSnippet = {
      ...snippets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    snippets[index] = updatedSnippet;
    this.saveSnippets(snippets);
    this.addToSyncQueue('update', updatedSnippet);
    
    return updatedSnippet;
  }

  static deleteLocalSnippet(localId: string): boolean {
    const snippets = this.getLocalSnippets();
    const index = snippets.findIndex(s => s.localId === localId);
    
    if (index === -1) return false;

    const deletedSnippet = snippets[index];
    snippets.splice(index, 1);
    this.saveSnippets(snippets);
    this.addToSyncQueue('delete', deletedSnippet);
    
    return true;
  }

  // Preferences operations
  static getLocalPreferences(): LocalPreferences | null {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading local preferences:', error);
      return null;
    }
  }

  static saveLocalPreferences(preferences: Omit<LocalPreferences, 'syncStatus'>): void {
    const localPreferences: LocalPreferences = {
      ...preferences,
      syncStatus: 'pending'
    };
    
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(localPreferences));
      this.addToSyncQueue('preferences', localPreferences);
    } catch (error) {
      console.error('Error saving local preferences:', error);
    }
  }

  // Sync queue operations
  static getSyncQueue(): Array<{
    type: 'create' | 'update' | 'delete' | 'preferences';
    data: LocalSnippet | LocalPreferences;
    timestamp: string;
  }> {
    try {
      const stored = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading sync queue:', error);
      return [];
    }
  }

  static addToSyncQueue(
    type: 'create' | 'update' | 'delete' | 'preferences',
    data: LocalSnippet | LocalPreferences
  ): void {
    const queue = this.getSyncQueue();
    queue.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  static clearSyncQueue(): void {
    try {
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  // Utility methods
  static markSnippetAsSynced(localId: string): void {
    const snippets = this.getLocalSnippets();
    const index = snippets.findIndex(s => s.localId === localId);
    
    if (index !== -1) {
      snippets[index].syncStatus = 'synced';
      this.saveSnippets(snippets);
    }
  }

  static markPreferencesAsSynced(): void {
    const preferences = this.getLocalPreferences();
    if (preferences) {
      preferences.syncStatus = 'synced';
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    }
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static getStorageUsage(): { used: number; quota: number } {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      });
    }
    
    // Fallback estimation
    const totalSize = Object.keys(localStorage).reduce((total, key) => {
      return total + localStorage.getItem(key)!.length;
    }, 0);
    
    return {
      used: totalSize,
      quota: 5 * 1024 * 1024 // 5MB typical localStorage limit
    };
  }

  // Private helper methods
  private static saveSnippets(snippets: LocalSnippet[]): void {
    try {
      localStorage.setItem(this.SNIPPETS_KEY, JSON.stringify(snippets));
    } catch (error) {
      console.error('Error saving snippets to localStorage:', error);
      // Handle storage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        this.handleStorageQuotaExceeded();
      }
    }
  }

  private static generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static handleStorageQuotaExceeded(): void {
    console.warn('localStorage quota exceeded. Consider cleaning up old data.');
    // Could implement cleanup strategy here
    // For now, just alert the user
    alert('Local storage is full. Some features may not work properly.');
  }

  // Clear all local data (for logout)
  static clearAllLocalData(): void {
    try {
      localStorage.removeItem(this.SNIPPETS_KEY);
      localStorage.removeItem(this.PREFERENCES_KEY);
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }
}
