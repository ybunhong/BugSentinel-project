import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { SnippetService } from "../services/snippetService";
import { GeminiService } from "../services/geminiService";
import { Layout } from "../components/Layout";
import { SnippetsPage } from "./SnippetsPage";
import { CodeAnalysisPage } from "./CodeAnalysisPage";
import { SettingsPage } from "./SettingsPage";
import { CodeEditor } from "../components/CodeEditor";
import { SnippetAnalysisPanel } from "../components/SnippetAnalysisPanel";
import { SnippetForm } from "../components/SnippetForm";
import type { Snippet } from "../store/types";

export const MainDashboard: React.FC = () => {
  const { currentSnippet, theme } = useStore();
  const [currentPage, setCurrentPage] = useState("analysis");
  const [showSnippetForm, setShowSnippetForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [code, setCode] = useState("");
  const [jumpToLineFunction, setJumpToLineFunction] = useState<
    ((line: number) => void) | undefined
  >(undefined);
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(400); // Initial width
  const [isResizing, setIsResizing] = useState(false);
  const [codeEditorWidth, setCodeEditorWidth] = useState(700); // Initial width for code editor

  // Initialize services
  useEffect(() => {
    GeminiService.initialize();
    SnippetService.initializeSync();

    return () => {
      SnippetService.cleanupSync();
    };
  }, []);

  // Update code when current snippet changes
  useEffect(() => {
    if (currentSnippet) {
      setCode(currentSnippet.code);
      // setHasUnsavedChanges(false); // Removed unused state
    } else {
      setCode("// Select a snippet to start editing...\n");
      // setHasUnsavedChanges(false); // Removed unused state
      setJumpToLineFunction(undefined);
    }
  }, [currentSnippet]);

  const handleCodeChange = (newCode: string | undefined) => {
    const codeValue = newCode || "";
    setCode(codeValue);

    if (currentSnippet && codeValue !== currentSnippet.code) {
      // setHasUnsavedChanges(true); // Removed unused state
    } else {
      // setHasUnsavedChanges(false); // Removed unused state
    }
  };

  const handleEditSnippet = (snippet: Snippet) => {
    SnippetService.setCurrentSnippet(snippet);
    setCurrentPage("editor");
  };

  const handleSnippetFormSave = (snippet: Snippet) => {
    setShowSnippetForm(false);
    setEditingSnippet(null);
    SnippetService.setCurrentSnippet(snippet);
  };

  const handleSnippetFormCancel = () => {
    setShowSnippetForm(false);
    setEditingSnippet(null);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "analysis":
        return <CodeAnalysisPage />;

      case "snippets":
        return <SnippetsPage onEditSnippet={handleEditSnippet} />;

      case "settings":
        return <SettingsPage />;

      case "editor":
        return (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Main Editor Area */}
            <div
              style={{
                flex: 1,
                display: "flex",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${codeEditorWidth}px`, // Fixed width for code editor
                  flexShrink: 0,
                  flexGrow: 0,
                  padding: "24px",
                }}
              >
                <CodeEditor
                  value={code}
                  language={
                    currentSnippet ? currentSnippet.language : "javascript"
                  }
                  onChange={handleCodeChange}
                  onJumpToLine={setJumpToLineFunction}
                />
              </div>

              {/* Resizer */}
              <div
                style={{
                  width: "8px",
                  cursor: "ew-resize",
                  backgroundColor: theme === "dark" ? "#3e3e42" : "#dee2e6",
                  flexShrink: 0, // Prevent shrinking
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                }}
              />

              {/* AI Analysis Panel */}
              <div
                style={{
                  width: `${analysisPanelWidth}px`, // Dynamic width
                  background:
                    theme === "dark"
                      ? "rgba(15, 15, 35, 0.9)"
                      : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                  borderLeft:
                    theme === "dark"
                      ? "1px solid rgba(102, 126, 234, 0.2)"
                      : "1px solid rgba(118, 75, 162, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden", // Hide overflow when resizing
                }}
              >
                <SnippetAnalysisPanel
                  code={code}
                  language={
                    currentSnippet ? currentSnippet.language : "javascript"
                  }
                  onChange={handleCodeChange}
                  onJumpToLine={jumpToLineFunction}
                />
              </div>
            </div>
          </div>
        );

      default:
        return <CodeAnalysisPage />;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const mainEditorArea = document.querySelector(
        'div[style*="flex: 1"][style*="display: flex"][style*="overflow: hidden"]'
      ) as HTMLDivElement;
      if (!mainEditorArea) return; // Should not happen

      const parentRect = mainEditorArea.getBoundingClientRect();
      const newCodeEditorWidth = e.clientX - parentRect.left; // Calculate width relative to parent

      const resizerWidth = 8; // Width of the resizer
      const newAnalysisPanelWidth =
        parentRect.width - newCodeEditorWidth - resizerWidth;

      setCodeEditorWidth(
        Math.max(
          200,
          Math.min(newCodeEditorWidth, parentRect.width - 50 - resizerWidth)
        )
      ); // Code editor min 200px, max (total - analysis_min - resizer)
      setAnalysisPanelWidth(
        Math.max(
          50,
          Math.min(newAnalysisPanelWidth, parentRect.width - 200 - resizerWidth)
        )
      ); // Analysis panel min 50px, max (total - editor_min - resizer)
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize"; // Set cursor globally
      document.body.style.userSelect = "none"; // Disable text selection
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = ""; // Reset cursor
      document.body.style.userSelect = ""; // Re-enable text selection
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPageContent()}

      {/* Snippet Form Modal */}
      {showSnippetForm && (
        <SnippetForm
          snippet={editingSnippet}
          onSave={handleSnippetFormSave}
          onCancel={handleSnippetFormCancel}
        />
      )}
    </Layout>
  );
};
