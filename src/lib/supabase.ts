import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo_key'
);

// Database schema types
export interface Database {
  public: {
    Tables: {
      snippets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          language: string;
          code: string;
          created_at: string;
          updated_at: string;
          analysis_results: any[] | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          language: string;
          code: string;
          created_at?: string;
          updated_at?: string;
          analysis_results?: any[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          language?: string;
          code?: string;
          created_at?: string;
          updated_at?: string;
          analysis_results?: any[] | null;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark';
          editor_settings: any;
          last_snippet_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'light' | 'dark';
          editor_settings?: any;
          last_snippet_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'light' | 'dark';
          editor_settings?: any;
          last_snippet_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('snippets').select('count').limit(1);
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
      return { success: false, error: error.message };
    }
    console.log('Supabase connection successful');
    return { success: true, data };
  } catch (err) {
    console.warn('Supabase connection test error:', err);
    return { success: false, error: 'Connection failed' };
  }
};
