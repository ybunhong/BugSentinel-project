import { SupabaseService } from './supabaseService';
import { useStore } from '../store/useStore';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  lineNumbers: 'on' | 'off';
}

export class PreferencesService {
  // Default editor settings
  static getDefaultEditorSettings(): EditorSettings {
    return {
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'on',
      minimap: false,
      lineNumbers: 'on',
    };
  }

  // Load user preferences from Supabase
  static async loadPreferences(): Promise<{ error: string | null }> {
    try {
      const user = useStore.getState().user;
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { data, error } = await SupabaseService.getUserPreferences(user.id);
      
      if (error && !error.message.includes('No rows')) {
        return { error: error.message };
      }

      if (data) {
        // Update store with synced preferences
        const store = useStore.getState();
        
        if (data.theme) {
          store.setTheme(data.theme);
        }
        
        // Set last opened snippet if it exists
        if (data.last_snippet_id) {
          // We'll load this snippet after snippets are loaded
          // For now, just store the ID
          localStorage.setItem('lastSnippetId', data.last_snippet_id);
        }
      }

      return { error: null };
    } catch (err) {
      console.error('Load preferences error:', err);
      return { error: 'Failed to load preferences' };
    }
  }

  // Save user preferences to Supabase
  static async savePreferences(preferences: {
    theme?: 'light' | 'dark';
    editorSettings?: EditorSettings;
    lastSnippetId?: string | null;
  }): Promise<{ error: string | null }> {
    try {
      const user = useStore.getState().user;
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await SupabaseService.upsertUserPreferences(user.id, {
        theme: preferences.theme,
        editorSettings: preferences.editorSettings,
        lastSnippetId: preferences.lastSnippetId,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Save preferences error:', err);
      return { error: 'Failed to save preferences' };
    }
  }

  // Sync theme preference
  static async syncTheme(theme: 'light' | 'dark'): Promise<void> {
    const result = await this.savePreferences({ theme });
    if (result.error) {
      console.warn('Failed to sync theme:', result.error);
    }
  }

  // Sync last opened snippet
  static async syncLastSnippet(snippetId: string | null): Promise<void> {
    const result = await this.savePreferences({ lastSnippetId: snippetId });
    if (result.error) {
      console.warn('Failed to sync last snippet:', result.error);
    }
  }

  // Load last opened snippet after snippets are loaded
  static async loadLastSnippet(): Promise<void> {
    const lastSnippetId = localStorage.getItem('lastSnippetId');
    if (lastSnippetId) {
      const store = useStore.getState();
      const snippet = store.snippets.find(s => s.id === lastSnippetId);
      if (snippet) {
        store.setCurrentSnippet(snippet);
      }
      // Clear the temporary storage
      localStorage.removeItem('lastSnippetId');
    }
  }
}
