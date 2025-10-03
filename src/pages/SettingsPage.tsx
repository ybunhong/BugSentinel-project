import { useState } from "react";
import { useStore } from "../store/useStore";
import { SupabaseService } from "../services/supabaseService";
import { LocalStorageService } from "../services/localStorageService";
import { SnippetService } from "../services/snippetService";
import { GeminiService } from "../services/geminiService";
import { Button, Card } from "../components/ui";
import { Icon } from "../components/ui/Icon";
import { colors } from "../styles/design-system";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const { theme } = useStore();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card variant="glass" style={{ marginBottom: "16px" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "600",
          color: theme === "dark" ? "#ffffff" : "#000000",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span>{title}</span>
        </div>
        <span
          style={{
            fontSize: "16px",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            paddingTop: "16px",
            borderTop:
              theme === "dark"
                ? "1px solid rgba(102, 126, 234, 0.2)"
                : "1px solid rgba(118, 75, 162, 0.2)",
            animation: "slideDown 0.3s ease",
          }}
        >
          {children}
        </div>
      )}
    </Card>
  );
};

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, user } = useStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const confirmLogout = confirm(
      "Are you sure you want to log out? Any unsaved changes will be lost."
    );
    if (!confirmLogout) return;

    setIsLoggingOut(true);

    try {
      await SupabaseService.signOut();
      LocalStorageService.clearAllLocalData();

      const store = useStore.getState();
      store.setUser(null);
      store.setSnippets([]);
      store.setCurrentSnippet(null);

      SnippetService.cleanupSync();

      console.log("✅ Successfully logged out");
    } catch (error) {
      console.error("❌ Logout error:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    LocalStorageService.saveLocalPreferences({
      theme: newTheme,
      editorSettings: {},
      lastSnippetId: null,
    });
  };

  const handleClearAllData = () => {
    const confirmClear = confirm(
      "Are you sure you want to clear all local data? This will remove all cached snippets and settings. Your data in the cloud will remain safe."
    );
    if (!confirmClear) return;

    try {
      LocalStorageService.clearAllLocalData();
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      alert("Failed to clear data. Please try again.");
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "32px",
            fontWeight: "700",
            background: colors.gradients.primary,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            color: theme === "dark" ? "#cccccc" : "#666666",
          }}
        >
          Customize your BugSentinel experience
        </p>
      </div>

      {/* Account Settings */}
      <SettingsSection title="Account" defaultExpanded={true}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              Signed in as
            </h4>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: theme === "dark" ? "#cccccc" : "#666666",
                padding: "8px 12px",
                background:
                  theme === "dark"
                    ? "rgba(0, 0, 0, 0.3)"
                    : "rgba(0, 0, 0, 0.05)",
                borderRadius: "6px",
                fontFamily: "Monaco, Consolas, monospace",
              }}
            >
              {user?.email || "Unknown user"}
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            leftIcon={<Icon name="logout" size={18} />}
            style={{
              background: "rgba(255, 107, 107, 0.1)",
              color: "#ff6b6b",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              alignSelf: "flex-start",
            }}
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </Button>
        </div>
      </SettingsSection>

      {/* Appearance Settings */}
      <SettingsSection title="Appearance" defaultExpanded={true}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              Theme
            </h4>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => handleThemeChange("light")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  background:
                    theme === "light"
                      ? colors.gradients.primary
                      : theme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  color:
                    theme === "light"
                      ? "#ffffff"
                      : theme === "dark"
                      ? "#cccccc"
                      : "#666666",
                  border:
                    theme === "light"
                      ? "none"
                      : `1px solid ${
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.2)"
                        }`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icon name="sun" size={16} />
                <span>Light</span>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  background:
                    theme === "dark"
                      ? colors.gradients.primary
                      : "rgba(0, 0, 0, 0.1)",
                  color: theme === "dark" ? "#ffffff" : "#666666",
                  border:
                    theme === "dark" ? "none" : "1px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icon name="moon" size={16} />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* AI Configuration */}
      <SettingsSection title="AI Configuration">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              Gemini API Status
            </h4>

            <div
              style={{
                padding: "12px",
                background: GeminiService.isAvailable()
                  ? "rgba(40, 167, 69, 0.1)"
                  : "rgba(255, 193, 7, 0.1)",
                border: GeminiService.isAvailable()
                  ? "1px solid rgba(40, 167, 69, 0.3)"
                  : "1px solid rgba(255, 193, 7, 0.3)",
                borderRadius: "6px",
                fontSize: "14px",
                color: GeminiService.isAvailable() ? "#28a745" : "#ffc107",
                marginBottom: "12px",
              }}
            >
              {GeminiService.isAvailable()
                ? "✅ AI features are enabled and ready"
                : "⚠️ AI features are disabled - API key required"}
            </div>

            <p
              style={{
                fontSize: "14px",
                color: theme === "dark" ? "#cccccc" : "#666666",
                marginBottom: "12px",
              }}
            >
              To enable AI features, add your Gemini API key to the .env file:
            </p>

            <code
              style={{
                display: "block",
                padding: "12px",
                background:
                  theme === "dark"
                    ? "rgba(0, 0, 0, 0.3)"
                    : "rgba(0, 0, 0, 0.05)",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "Monaco, Consolas, monospace",
                color: theme === "dark" ? "#e5e5e5" : "#333333",
                border:
                  theme === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              VITE_GEMINI_API_KEY=your_api_key_here
            </code>
          </div>
        </div>
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection title="Data Management">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              Local Data
            </h4>
            <p
              style={{
                fontSize: "14px",
                color: theme === "dark" ? "#cccccc" : "#666666",
                marginBottom: "12px",
              }}
            >
              Clear all locally cached data including snippets and settings.
              Your cloud data will remain safe.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllData}
              leftIcon={<Icon name="trash" size={16} />}
              style={{
                color: "#ff6b6b",
                borderColor: "rgba(255, 107, 107, 0.3)",
                alignSelf: "flex-start",
              }}
            >
              Clear Local Data
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              BugSentinel
            </h4>
            <p
              style={{
                fontSize: "14px",
                color: theme === "dark" ? "#cccccc" : "#666666",
                margin: "0 0 8px 0",
              }}
            >
              AI-powered code analysis and bug detection tool
            </p>
          </div>

          <div>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              Features
            </h4>
            <ul
              style={{
                fontSize: "14px",
                color: theme === "dark" ? "#cccccc" : "#666666",
                margin: 0,
                paddingLeft: "20px",
              }}
            >
              <li>Real-time code analysis with AI</li>
              <li>15+ programming languages supported</li>
              <li>Custom analysis prompts</li>
              <li>Snippet management and storage</li>
              <li>Offline-first with cloud sync</li>
            </ul>
          </div>
        </div>
      </SettingsSection>

      {/* Add CSS for animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
