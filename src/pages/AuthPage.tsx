import { useState } from "react";
import { useStore } from "../store/useStore";
import { AuthForm } from "../components/AuthForm";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button, Card } from "../components/ui";
import { colors } from "../styles/design-system";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  BugAntIcon,
} from "@heroicons/react/24/outline";
import "../styles/auth-page.css";

export const AuthPage: React.FC = () => {
  const { theme } = useStore();
  const [currentView, setCurrentView] = useState<"welcome" | "auth">("welcome");

  return (
    <div
      className={`auth-root ${theme === "dark" ? "dark-theme" : "light-theme"}`}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          background: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BugAntIcon
            style={{
              width: "1.25rem",
              height: "1.25rem",
              color: theme === "dark" ? "#ffffff" : "#1F2937",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: theme === "dark" ? "#ffffff" : "#1F2937",
            }}
          >
            BugSentinel
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="auth-main">
        {currentView === "welcome" ? (
          <>
            <section className="welcome-container fade-in">
              <div className="welcome-hero">
                <div className="welcome-icon">
                  <CodeBracketIcon className="h-6 w-6 text-purple-500" />
                </div>
                <h2 className="welcome-heading">BugSentinel</h2>
                <p className="welcome-subtitle">
                  AI-powered code analysis and bug detection
                </p>
              </div>

              {/* Features */}
              <div className="welcome-features">
                <div className="feature-box">
                  <div className="feature-icon">
                    <MagnifyingGlassIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <p>Analysis</p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon">
                    <SparklesIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <p>Refactor</p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon">
                    <CloudArrowUpIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <p>Cloud Sync</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentView("auth")}
                className="welcome-cta inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium whitespace-nowrap"
                style={{
                  background: colors.gradients.primary,
                  minWidth: "120px",
                }}
              >
                Get Started
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </section>
          </>
        ) : (
          <Card variant="glass" padding="xl" className="auth-card slide-up">
            <button
              className="auth-back"
              onClick={() => setCurrentView("welcome")}
            >
              ← Back to Welcome
            </button>

            <h2 className="auth-card-title">Sign In</h2>
            <p className="auth-card-subtitle">
              Sign in to access your code snippets
            </p>

            <AuthForm />
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="auth-footer"></footer>
    </div>
  );
};
