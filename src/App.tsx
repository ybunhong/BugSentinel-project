import { useState, useEffect } from 'react';
import { MainDashboard } from './pages/MainDashboard';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { SupabaseService } from './services/supabaseService';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();
  const [route, setRoute] = useState('home');

  useEffect(() => {
    testSupabaseConnection();
    // Listen for hash changes
    const onHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      setRoute(hash || 'home');
    };
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const testSupabaseConnection = async () => {
    const result = await SupabaseService.testConnection();
    if (result.success) {
      console.log('✅ Supabase connected successfully');
    } else {
      console.warn('❌ Supabase connection failed:', result.error);
    }
  };

  if (!isAuthenticated && route === 'analysis') {
    return <AuthPage />;
  }

  switch (route) {
    case 'home':
      return <HomePage />;
    case 'analysis':
      return <MainDashboard />;
    default:
      return <HomePage />;
  }
}

export default App;
