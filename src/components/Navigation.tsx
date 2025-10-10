import { useState } from "react";
import { useStore } from "../store/useStore";
import { a11y } from "../utils/accessibility";
import { Icon } from "./ui/Icon";
import { Card } from "./ui/Card";

import type { IconName } from "./ui/Icon";

interface NavigationItem {
  id: string;
  label: string;
  icon: IconName;
}

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpandToggle?: () => void; // Optional since we don't use it anymore
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  isOpen,
  isExpanded,
  onToggle,
}) => {
  const { theme } = useStore();
  const [isMobile] = useState(window.innerWidth < 768);

  const navigationItems: NavigationItem[] = [
    { id: "analysis", label: "AI Analysis", icon: "zap" },
    { id: "snippets", label: "Snippets", icon: "snippets" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  if (!isOpen && isMobile) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 998,
          }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? 0 : "auto",
          left: isMobile ? 0 : "auto",
          height: isMobile ? "100vh" : "auto",
          width: isMobile ? "280px" : isExpanded ? "240px" : "70px",
          background:
            theme === "dark"
              ? "rgba(15, 15, 35, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight:
            theme === "dark"
              ? "1px solid rgba(102, 126, 234, 0.2)"
              : "1px solid rgba(118, 75, 162, 0.2)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
          zIndex: 999,
          boxShadow:
            theme === "dark"
              ? "8px 0 32px rgba(102, 126, 234, 0.1)"
              : "8px 0 32px rgba(118, 75, 162, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0 20px 20px 20px",
            borderBottom:
              theme === "dark"
                ? "1px solid rgba(102, 126, 234, 0.2)"
                : "1px solid rgba(118, 75, 162, 0.2)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {isExpanded && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Icon name="code" size={20} />
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "600",
                    background: theme === "dark"
                      ? 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  BugSentinel
                </h2>
              </div>
            )}

            {!isExpanded && !isMobile && (
              <div
                style={{
                  fontSize: "24px",
                  textAlign: "center",
                  width: "100%",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  opacity: 0.9,
                }}
              >
                <Icon name="code" size={28} />
              </div>
            )}

            {isMobile && (
              <button
                onClick={onToggle}
                aria-label="Close navigation menu"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: theme === "dark" ? "#cccccc" : "#666666",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "0 12px",
          }}
        >
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                if (isMobile) onToggle();
                a11y.aria.announce(`Navigated to ${item.label}`);
              }}
              aria-current={currentPage === item.id ? "page" : undefined}
              aria-label={`Navigate to ${item.label}`}
              tabIndex={0}
              title={!isExpanded ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isExpanded ? "flex-start" : "center",
                gap: isExpanded ? "12px" : "0",
                padding: isExpanded ? "12px 16px" : "12px 8px",
                background:
                  currentPage === item.id
                    ? theme === "dark"
                      ? "rgba(102, 126, 234, 0.2)"
                      : "rgba(118, 75, 162, 0.2)"
                    : "transparent",
                border:
                  currentPage === item.id
                    ? theme === "dark"
                      ? "1px solid rgba(102, 126, 234, 0.3)"
                      : "1px solid rgba(118, 75, 162, 0.3)"
                    : "1px solid transparent",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color:
                  currentPage === item.id
                    ? theme === "dark"
                      ? "#ffffff"
                      : "#000000"
                    : theme === "dark"
                    ? "#cccccc"
                    : "#666666",
                fontSize: "14px",
                fontWeight: currentPage === item.id ? "500" : "400",
                textAlign: "left",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background =
                    theme === "dark"
                      ? "rgba(102, 126, 234, 0.1)"
                      : "rgba(118, 75, 162, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPageChange(item.id);
                  if (isMobile) onToggle();
                }
              }}
            >
              <Icon name={item.icon} size={20} />
              {isExpanded && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Modern Footer */}
        {isExpanded && (
          <div style={{ marginTop: "20px" }}>
            <Card
              variant="glass"
              padding="md"
              style={{
                background: theme === "dark"
                  ? 'rgba(102, 126, 234, 0.1)'
                  : 'rgba(118, 75, 162, 0.1)',
                border: `1px solid ${theme === "dark"
                  ? 'rgba(102, 126, 234, 0.2)'
                  : 'rgba(118, 75, 162, 0.2)'}`,
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flexDirection: 'column',
                }}
                role="contentinfo"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <Icon name="code" size={16} />
                  <span style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}>
                    BugSentinel
                  </span>
                </div>
                <div style={{
                  fontSize: "11px",
                  color: theme === "dark" ? "#888888" : "#999999",
                  opacity: 0.8,
                  textAlign: 'center'
                }}>
                  AI-Powered Code Analysis
                </div>
              </div>
            </Card>
          </div>
        )}
      </nav>
    </>
  );
};
