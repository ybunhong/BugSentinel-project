import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, User, Snippet, AnalysisResult } from './types';

interface StoreActions {
  // User actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
  
  // Snippet actions
  setSnippets: (snippets: Snippet[]) => void;
  addSnippet: (snippet: Snippet) => void;
  updateSnippet: (id: string, updates: Partial<Snippet>) => void;
  deleteSnippet: (id: string) => void;
  setCurrentSnippet: (snippet: Snippet | null) => void;
  
  // Analysis actions
  setAnalysisResults: (results: AnalysisResult[]) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarOpen: (open: boolean) => void;
}

type Store = AppState & StoreActions;

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      snippets: [],
      currentSnippet: null,
      analysisResults: [],
      isAnalyzing: false,
      theme: 'light',
      sidebarOpen: true,
      
      // User actions
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        snippets: [],
        currentSnippet: null,
        analysisResults: []
      }),
      
      // Snippet actions
      setSnippets: (snippets) => set({ snippets }),
      addSnippet: (snippet) => set((state) => ({ 
        snippets: [...state.snippets, snippet] 
      })),
      updateSnippet: (id, updates) => set((state) => ({
        snippets: state.snippets.map(snippet => 
          snippet.id === id ? { ...snippet, ...updates } : snippet
        ),
        currentSnippet: state.currentSnippet?.id === id 
          ? { ...state.currentSnippet, ...updates }
          : state.currentSnippet
      })),
      deleteSnippet: (id) => set((state) => ({
        snippets: state.snippets.filter(snippet => snippet.id !== id),
        currentSnippet: state.currentSnippet?.id === id ? null : state.currentSnippet
      })),
      setCurrentSnippet: (snippet) => set({ currentSnippet: snippet }),
      
      // Analysis actions
      setAnalysisResults: (analysisResults) => set({ analysisResults }),
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      
      // UI actions
      setTheme: (theme) => {
        set({ theme });
        // Sync theme preference to Supabase (async, don't wait)
        import('../services/preferencesService').then(({ PreferencesService }) => {
          PreferencesService.syncTheme(theme);
        });
      },
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'bugsentinel-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        // Don't persist sensitive data like user info and snippets in localStorage
        // These will be handled by Supabase sync
      }),
    }
  )
);
