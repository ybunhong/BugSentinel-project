import { useState } from "react";
import { ModernInput } from "./ModernInput";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "./ui";
import { SupabaseService } from "../services/supabaseService";
import { useStore } from "../store/useStore";

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { user, isAuthenticated, setUser, setAuthenticated } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { data, error } = await SupabaseService.signIn(email, password);
        if (error) {
          setError(
            error && typeof error === "object" && "message" in error
              ? error.message
              : String(error)
          );
        } else if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.name,
          });
          setAuthenticated(true);
          setSuccess("Successfully logged in!");
          onSuccess?.();
        }
      } else {
        const { data, error } = await SupabaseService.signUp(email, password);
        if (error) {
          setError(
            error && typeof error === "object" && "message" in error
              ? error.message
              : String(error)
          );
        } else if (data.user) {
          setSuccess(
            "Account created! Please check your email to verify your account."
          );
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await SupabaseService.signOut();
    if (error) {
      setError(error);
    } else {
      setUser(null);
      setAuthenticated(false);
      setSuccess("Successfully logged out!");
    }
    setLoading(false);
  };

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Welcome, {user.email}!</h3>
        <p className="mb-4">You are successfully logged in.</p>
        <Button
          variant="destructive"
          size="lg"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Logging out..." : "Logout"}
        </Button>
        {error && (
          <p className="text-red-600 dark:text-red-400 mt-4 font-medium">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 dark:text-green-400 mt-4 font-medium">
            {success}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {isLogin ? "Login" : "Sign Up"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModernInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<EnvelopeIcon className="h-6 w-6" />}
          required
        />

        <ModernInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockClosedIcon className="h-6 w-6" />}
          required
          minLength={6}
        />

        <Button
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          style={{ color: "#3b82f6", textDecoration: "underline" }} // Tailwind blue-500
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccess(null);
          }}
        >
          {isLogin
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </Button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};
