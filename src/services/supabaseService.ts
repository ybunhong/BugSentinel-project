import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Snippet } from "../store/types";

export class SupabaseService {
  // Authentication methods
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
        return { error: error.message };
      }
      console.log("✅ Successfully signed out from Supabase");
      return { error: null };
    } catch (error) {
      console.error("Unexpected signOut error:", error);
      return {
        error: error instanceof Error ? error.message : "Sign out failed",
      };
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }

  static async getCurrentUser(): Promise<{
    user: User | null;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        return { user: null, error: error.message };
      }
      return { user, error: null };
    } catch (error) {
      return {
        user: null,
        error:
          error instanceof Error ? error.message : "Failed to get current user",
      };
    }
  }

  // Snippet CRUD operations
  static async getSnippets(userId: string) {
    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    return { data, error };
  }

  static async createSnippet(
    snippet: Omit<Snippet, "id" | "createdAt" | "updatedAt"> & {
      userId: string;
    }
  ) {
    const { data, error } = await supabase
      .from("snippets")
      .insert({
        user_id: snippet.userId,
        title: snippet.title,
        language: snippet.language,
        code: snippet.code,
      })
      .select()
      .single();

    return { data, error };
  }

  static async updateSnippet(id: string, updates: Partial<Snippet>) {
    const { data, error } = await supabase
      .from("snippets")
      .update({
        title: updates.title,
        language: updates.language,
        code: updates.code,
      })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }

  static async deleteSnippet(id: string) {
    const { error } = await supabase.from("snippets").delete().eq("id", id);

    return { error };
  }

  // User preferences
  static async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    return { data, error };
  }

  static async upsertUserPreferences(
    userId: string,
    preferences: {
      theme?: "light" | "dark";
      editorSettings?: any;
      lastSnippetId?: string | null;
    }
  ) {
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          theme: preferences.theme,
          editor_settings: preferences.editorSettings,
          last_snippet_id: preferences.lastSnippetId,
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    return { data, error };
  }

  // Test connection with dummy data
  static async testConnection() {
    try {
      // Try to perform a simple query that doesn't require authentication
      const { data, error } = await supabase
        .from("snippets")
        .select("count")
        .limit(1);

      if (
        error &&
        error.message.includes('relation "public.snippets" does not exist')
      ) {
        // This is expected if tables haven't been created yet
        console.log("Supabase connected but tables not yet created");
        return {
          success: true,
          message: "Connected - tables need to be created",
        };
      }

      if (error) {
        console.warn("Supabase test query failed:", error);
        return { success: false, error: error.message };
      }

      console.log("Supabase connection test successful");
      return { success: true, data };
    } catch (err) {
      console.warn("Supabase connection error:", err);
      return { success: false, error: "Connection failed" };
    }
  }
}
