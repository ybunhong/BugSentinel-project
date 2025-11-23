import { useEffect } from "react";
import { MainDashboard } from "./pages/MainDashboard";
import { AuthPage } from "./pages/AuthPage";
import { SupabaseService } from "./services/supabaseService";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    testSupabaseConnection();

    const onHashChange = () => {
      // Handle hash change if needed
      // const hash = window.location.hash.replace("#/", "");
    };

    window.addEventListener("hashchange", onHashChange);
    onHashChange();

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const testSupabaseConnection = async () => {
    const result = await SupabaseService.testConnection();
    if (result.success) {
      console.log("✅ Supabase connected successfully");
    } else {
      console.warn("❌ Supabase connection failed:", result.error);
    }
  };

  // Require login for dashboard
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Authenticated users go to dashboard
  return <MainDashboard />;
}

export default App;
