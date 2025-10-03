import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Navigation } from "./Navigation";
import { ConnectionStatus } from "./ConnectionStatus";
import { Icon } from "./ui/Icon";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onPageChange,
}) => {
  const { theme } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  // const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Removed unused state

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      // setIsMobile(mobile); // Removed unused setter
      if (mobile) {
        setSidebarOpen(false);
        setSidebarExpanded(true); // Always expanded on mobile when open
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          theme === "dark"
            ? "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: "60px",
          background:
            theme === "dark"
              ? "rgba(15, 15, 35, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom:
            theme === "dark"
              ? "1px solid rgba(102, 126, 234, 0.2)"
              : "1px solid rgba(118, 75, 162, 0.2)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "16px",
          boxShadow:
            theme === "dark"
              ? "0 4px 20px rgba(102, 126, 234, 0.1)"
              : "0 4px 20px rgba(118, 75, 162, 0.1)",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Menu Button */}
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              setSidebarExpanded(!sidebarOpen ? true : false); // expand on open, collapse on close
            }}
            style={{
              padding: "8px",
              background:
                theme === "dark"
                  ? "rgba(102, 126, 234, 0.1)"
                  : "rgba(118, 75, 162, 0.1)",
              border:
                theme === "dark"
                  ? "1px solid rgba(102, 126, 234, 0.2)"
                  : "1px solid rgba(118, 75, 162, 0.2)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              color: theme === "dark" ? "#667eea" : "#764ba2",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                theme === "dark"
                  ? "rgba(102, 126, 234, 0.2)"
                  : "rgba(118, 75, 162, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                theme === "dark"
                  ? "rgba(102, 126, 234, 0.1)"
                  : "rgba(118, 75, 162, 0.1)";
            }}
            aria-label="Toggle sidebar"
          >
            <Icon name="menu" size={20} />
          </button>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            color: theme === "dark" ? "#ffffff" : "#000000",
            flex: 1,
          }}
        >
          {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
        </h1>

        {/* Header Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <ConnectionStatus />
        </div>
      </header>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Navigation Sidebar */}
        <Navigation
          currentPage={currentPage}
          onPageChange={onPageChange}
          isOpen={sidebarOpen}
          isExpanded={sidebarExpanded}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onExpandToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            background:
              theme === "dark"
                ? "rgba(26, 26, 46, 0.3)"
                : "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
