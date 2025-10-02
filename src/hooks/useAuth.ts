import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SupabaseService } from '../services/supabaseService';
import { PreferencesService } from '../services/preferencesService';

export const useAuth = () => {
  const { setUser, setAuthenticated, user, isAuthenticated } = useStore();

  useEffect(() => {
    // Check for existing session on app load
    const checkSession = async () => {
      const currentUser = await SupabaseService.getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name
        });
        setAuthenticated(true);
        
        // Load user preferences after authentication
        await PreferencesService.loadPreferences();
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = SupabaseService.onAuthStateChange(async (user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name
        });
        setAuthenticated(true);
        
        // Load user preferences on login
        await PreferencesService.loadPreferences();
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setAuthenticated]);

  return {
    user,
    isAuthenticated,
    loading: false // You can add loading state if needed
  };
};
