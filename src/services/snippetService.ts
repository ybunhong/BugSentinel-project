import { SupabaseService } from './supabaseService';
import { SyncService } from './syncService';
import { LocalStorageService } from './localStorageService';
import { useStore } from '../store/useStore';
import type { Snippet } from '../store/types';

export class SnippetService {
  // Create a new snippet (offline-first)
  static async createSnippet(snippetData: {
    title: string;
    language: string;
    code: string;
  }): Promise<{ data: Snippet | null; error: string | null }> {
    const user = useStore.getState().user;
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      // Use offline-first approach
      const result = await SyncService.createSnippetOfflineFirst(snippetData);
      
      // Convert LocalSnippet to Snippet format for store
      const snippet: Snippet = {
        id: 'localId' in result ? result.localId : result.id,
        title: result.title,
        language: result.language,
        code: result.code,
        analysisResults: result.analysisResults || undefined,
        createdAt: new Date('localId' in result ? result.createdAt : result.createdAt),
        updatedAt: new Date('localId' in result ? result.updatedAt : result.updatedAt),
      };

      // Update store with new snippet
      const store = useStore.getState();
      store.addSnippet(snippet);

      return { data: snippet, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create snippet' 
      };
    }
  }

  // Load all snippets for the current user (offline-first)
  static async loadSnippets(): Promise<{ error: string | null }> {
    const user = useStore.getState().user;
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      // Load local snippets first
      const localSnippets = LocalStorageService.getLocalSnippets();
      
      // Convert local snippets to store format
      const snippets: Snippet[] = localSnippets.map(local => ({
        id: local.localId,
        title: local.title,
        language: local.language,
        code: local.code,
        analysisResults: local.analysisResults || undefined,
        createdAt: new Date(local.createdAt),
        updatedAt: new Date(local.updatedAt),
      }));

      // Update store with local snippets immediately
      const store = useStore.getState();
      store.setSnippets(snippets);

      // Try to sync from server if online
      if (navigator.onLine) {
        try {
          const { data: serverSnippets, error } = await SupabaseService.getSnippets(user.id);
          if (!error && serverSnippets) {
            // Merge server snippets with local ones
            const mergedSnippets = this.mergeSnippets(snippets, serverSnippets);
            store.setSnippets(mergedSnippets);
          }
        } catch (error) {
          console.warn('Failed to sync from server, using local data:', error);
        }
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to load snippets' 
      };
    }
  }

  // Update an existing snippet (offline-first)
  static async updateSnippet(
    id: string,
    updates: Partial<Snippet>
  ): Promise<{ data: Snippet | null; error: string | null }> {
    try {
      // Use offline-first approach
      const result = await SyncService.updateSnippetOfflineFirst(id, updates);
      
      if (!result) {
        return { data: null, error: 'Snippet not found' };
      }

      // Convert to Snippet format for store
      const snippet: Snippet = {
        id: 'localId' in result ? result.localId : result.id,
        title: result.title,
        language: result.language,
        code: result.code,
        analysisResults: result.analysisResults || undefined,
        createdAt: new Date('localId' in result ? result.createdAt : result.createdAt),
        updatedAt: new Date('localId' in result ? result.updatedAt : result.updatedAt),
      };

      // Update store
      const store = useStore.getState();
      store.updateSnippet(id, snippet);

      return { data: snippet, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update snippet' 
      };
    }
  }

  // Delete a snippet (offline-first)
  static async deleteSnippet(id: string): Promise<{ error: string | null }> {
    try {
      // Use offline-first approach
      const success = await SyncService.deleteSnippetOfflineFirst(id);
      
      if (!success) {
        return { error: 'Failed to delete snippet' };
      }

      // Update store
      const store = useStore.getState();
      const snippets = store.snippets.filter(s => s.id !== id);
      store.setSnippets(snippets);

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete snippet' 
      };
    }
  }

  // Set the current snippet in the store
  static setCurrentSnippet(snippet: Snippet): void {
    const store = useStore.getState();
    store.setCurrentSnippet(snippet);
  }

  // Merge local and server snippets (avoiding duplicates)
  private static mergeSnippets(localSnippets: Snippet[], serverSnippets: Snippet[]): Snippet[] {
    const merged = [...serverSnippets];
    
    // Add local snippets that don't exist on server
    for (const localSnippet of localSnippets) {
      const existsOnServer = serverSnippets.some(serverSnippet => 
        serverSnippet.title === localSnippet.title && 
        serverSnippet.language === localSnippet.language &&
        Math.abs(new Date(serverSnippet.createdAt).getTime() - new Date(localSnippet.createdAt).getTime()) < 60000 // Within 1 minute
      );
      
      if (!existsOnServer) {
        merged.push(localSnippet);
      }
    }
    
    // Sort by updated date
    return merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Initialize sync service
  static initializeSync(): void {
    SyncService.initialize();
  }

  // Cleanup sync service
  static cleanupSync(): void {
    SyncService.cleanup();
  }

  // Get connection status
  static getConnectionStatus() {
    return SyncService.getConnectionStatus();
  }

  // Force sync now
  static async forceSyncNow(): Promise<void> {
    await SyncService.forceSyncNow();
  }

  // Get supported programming languages
  static getSupportedLanguages(): Array<{ value: string; label: string }> {
    return [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'cpp', label: 'C++' },
      { value: 'csharp', label: 'C#' },
      { value: 'go', label: 'Go' },
      { value: 'rust', label: 'Rust' },
      { value: 'php', label: 'PHP' },
      { value: 'ruby', label: 'Ruby' },
      { value: 'html', label: 'HTML' },
      { value: 'css', label: 'CSS' },
      { value: 'json', label: 'JSON' },
      { value: 'sql', label: 'SQL' },
      { value: 'bash', label: 'Bash' },
    ];
  }

  // Get language display name
  static getLanguageLabel(language: string): string {
    const lang = this.getSupportedLanguages().find(l => l.value === language);
    return lang ? lang.label : language.charAt(0).toUpperCase() + language.slice(1);
  }

  // Generate a default title for new snippets
  static generateDefaultTitle(language: string): string {
    const languageLabel = this.getLanguageLabel(language);
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${languageLabel} Snippet - ${timestamp}`;
  }
}
