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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [jumpToLineFunction, setJumpToLineFunction] = useState<
    ((line: number) => void) | undefined
  >(undefined);

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
      setHasUnsavedChanges(false);
    } else {
      setCode("// Select a snippet to start editing...\n");
      setHasUnsavedChanges(false);
      setJumpToLineFunction(undefined);
    }
  }, [currentSnippet]);

  const handleCodeChange = (newCode: string | undefined) => {
    const codeValue = newCode || "";
    setCode(codeValue);

    if (currentSnippet && codeValue !== currentSnippet.code) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  const handleCreateSnippet = () => {
    setEditingSnippet(null);
    setShowSnippetForm(true);
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
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
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

              {/* AI Analysis Panel */}
              <div
                style={{
                  width: "400px",
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
                }}
              >
                <SnippetAnalysisPanel
                  code={code}
                  language={
                    currentSnippet ? currentSnippet.language : "javascript"
                  }
                  onCodeChange={handleCodeChange}
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
