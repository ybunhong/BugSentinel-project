import { useEffect } from 'react';
import { MainDashboard } from './pages/MainDashboard';
import { AuthPage } from './pages/AuthPage';
import { SupabaseService } from './services/supabaseService';
import { useAuth } from './hooks/useAuth';
import './App.css'

function App() {
  const { isAuthenticated } = useAuth(); // Initialize auth hook for session management
  
  useEffect(() => {
    // Test Supabase connection on app load
    testSupabaseConnection();
  }, []);


  const testSupabaseConnection = async () => {
    const result = await SupabaseService.testConnection();
    if (result.success) {
      console.log('✅ Supabase connected successfully');
    } else {
      console.warn('❌ Supabase connection failed:', result.error);
    }
  };


  // Show dashboard for authenticated users, auth page for non-authenticated
  return isAuthenticated ? <MainDashboard /> : <AuthPage />;
}

export default App
