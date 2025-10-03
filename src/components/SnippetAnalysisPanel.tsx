import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { GeminiService } from "../services/geminiService";
import { Button, Card } from "../components/ui";
import type { CodeSuggestion } from "../store/types";
import { Editor, DiffEditor } from "@monaco-editor/react";

interface SnippetAnalysisPanelProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onJumpToLine?: (line: number) => void;
}

export const SnippetAnalysisPanel: React.FC<SnippetAnalysisPanelProps> = ({
  code,
  language,
  onCodeChange,
  onJumpToLine,
}) => {
  const {
    analysisResults,
    isAnalyzing,
    refactorResult,
    codeSuggestions,
    setAnalysisResults,
    setAnalyzing,
    setRefactorResult,
    setCodeSuggestions,
    theme,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "analysis" | "refactor" | "suggestions" | "diff"
  >("analysis");
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to analyze");
      return;
    }

    if (!GeminiService.isAvailable()) {
      setError(
        "AI analysis is not available. Please add your Gemini API key to the .env file."
      );
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisResults([]);
    setRefactorResult(null);
    setCodeSuggestions([]);

    try {
      const [analysisResponse, refactorResponse, suggestionsResponse] =
        await Promise.allSettled([
          GeminiService.analyzeCode({ code, language }),
          GeminiService.getRefactoringSuggestions({ code, language }),
          GeminiService.getCodeSuggestions({ code, language }),
        ]);

      // Handle Analysis Results
      if (
        analysisResponse.status === "fulfilled" &&
        analysisResponse.value.data
      ) {
        setAnalysisResults(analysisResponse.value.data);
      } else if (
        analysisResponse.status === "fulfilled" &&
        analysisResponse.value.error
      ) {
        console.error("Analysis failed:", analysisResponse.value.error);
        setError(analysisResponse.value.error);
      } else if (analysisResponse.status === "rejected") {
        console.error("Analysis failed:", analysisResponse.reason);
        setError(analysisResponse.reason.message || "Analysis failed");
      }

      // Handle Refactoring Results
      if (
        refactorResponse.status === "fulfilled" &&
        refactorResponse.value.data
      ) {
        setRefactorResult(refactorResponse.value.data);
        setActiveTab("diff"); // Automatically switch to diff tab if refactor successful
      } else if (
        refactorResponse.status === "fulfilled" &&
        refactorResponse.value.error
      ) {
        console.error("Refactoring failed:", refactorResponse.value.error);
        // Optionally set error if refactoring is critical
      } else if (refactorResponse.status === "rejected") {
        console.error("Refactoring failed:", refactorResponse.reason);
      }

      // Handle Suggestions Results
      if (
        suggestionsResponse.status === "fulfilled" &&
        suggestionsResponse.value.data
      ) {
        setCodeSuggestions(suggestionsResponse.value.data);
      } else if (
        suggestionsResponse.status === "fulfilled" &&
        suggestionsResponse.value.error
      ) {
        console.error("Suggestions failed:", suggestionsResponse.value.error);
        // Optionally set error if suggestions are critical
      } else if (suggestionsResponse.status === "rejected") {
        console.error("Suggestions failed:", suggestionsResponse.reason);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during analysis"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const applyRefactoredCode = () => {
    if (refactorResult) {
      onCodeChange(refactorResult.refactoredCode);
      setRefactorResult(null);
    }
  };

  const applySuggestion = (suggestion: CodeSuggestion) => {
    onCodeChange(suggestion.code);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#fd7e14";
      case "low":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "syntax":
        return "⚠️";
      case "logic":
        return "🐛";
      case "security":
        return "🔒";
      case "performance":
        return "⚡";
      case "style":
        return "💡";
      default:
        return "💡";
    }
  };

  const isGeminiAvailable = GeminiService.isAvailable();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme === "dark" ? "#252526" : "#f8f9fa",
        border: `1px solid ${theme === "dark" ? "#3e3e42" : "#dee2e6"}`,
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          backgroundColor: theme === "dark" ? "#2d2d30" : "#ffffff",
          cursor: "pointer", // Indicate interactivity
          borderBottom: `1px solid ${theme === "dark" ? "#3e3e42" : "#dee2e6"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px", // Remove margin when collapsed
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          >
            🤖 AI Analysis
          </h3>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAnalyzeCode}
              disabled={isAnalyzing || !isGeminiAvailable}
              leftIcon="🔍"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze All"}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { id: "analysis", label: "Bugs", icon: "🐛" },
            { id: "refactor", label: "Refactor", icon: "✨" },
            { id: "suggestions", label: "Suggestions", icon: "💡" },
            { id: "diff", label: "Diff", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: "500",
                background:
                  activeTab === tab.id
                    ? theme === "dark"
                      ? "#007acc"
                      : "#007acc"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "#ffffff"
                    : theme === "dark"
                    ? "#cccccc"
                    : "#666666",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {!isGeminiAvailable && (
          <div
            style={{
              padding: "16px",
              backgroundColor: theme === "dark" ? "#3a3a3a" : "#fff3cd",
              color: theme === "dark" ? "#ffc107" : "#856404",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            <strong>⚠️ AI Features Disabled</strong>
            <p style={{ margin: "8px 0 0 0" }}>
              Add your Gemini API key to the .env file to enable AI-powered code
              analysis.
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: theme === "dark" ? "#5a2d2d" : "#f8d7da",
              color: theme === "dark" ? "#ff6b6b" : "#721c24",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && (
          <div>
            {analysisResults.length === 0 && !isAnalyzing && !error && (
              <div
                style={{
                  textAlign: "center",
                  color: theme === "dark" ? "#cccccc" : "#6c757d",
                  padding: "40px 20px",
                }}
              >
                <p>Click "Analyze" to check your code for bugs and issues</p>
              </div>
            )}

            {analysisResults.length > 0 && (
              <div>
                <div
                  style={{
                    marginBottom: "16px",
                    fontSize: "14px",
                    color: theme === "dark" ? "#cccccc" : "#6c757d",
                  }}
                >
                  Found {analysisResults.length} issue
                  {analysisResults.length !== 1 ? "s" : ""}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {analysisResults.map((result) => (
                    <Card
                      key={result.id}
                      variant="glass"
                      style={{
                        border: `1px solid ${getSeverityColor(
                          result.severity
                        )}`,
                        borderLeft: `4px solid ${getSeverityColor(
                          result.severity
                        )}`,
                        cursor: onJumpToLine ? "pointer" : "default",
                      }}
                      onClick={() => onJumpToLine?.(result.line)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>
                          {getTypeIcon(result.type)}
                        </span>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: getSeverityColor(result.severity),
                                textTransform: "uppercase",
                              }}
                            >
                              {result.severity}
                            </span>

                            <span
                              style={{
                                fontSize: "12px",
                                color: theme === "dark" ? "#cccccc" : "#6c757d",
                                textTransform: "capitalize",
                              }}
                            >
                              {result.type}
                            </span>

                            <span
                              style={{
                                fontSize: "12px",
                                color: theme === "dark" ? "#cccccc" : "#6c757d",
                              }}
                            >
                              Line {result.line}
                            </span>
                          </div>

                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "14px",
                              color: theme === "dark" ? "#ffffff" : "#000000",
                              lineHeight: "1.4",
                            }}
                          >
                            {result.message}
                          </p>

                          {result.suggestion && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                color: theme === "dark" ? "#a0a0a0" : "#666666",
                                fontStyle: "italic",
                                lineHeight: "1.3",
                              }}
                            >
                              💡 {result.suggestion}
                            </p>
                          )}

                          {result.fixedCode && (
                            <div
                              style={{
                                marginTop: "8px",
                                padding: "8px",
                                backgroundColor:
                                  theme === "dark"
                                    ? "rgba(0, 0, 0, 0.3)"
                                    : "rgba(0, 0, 0, 0.05)",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontFamily: "Monaco, Consolas, monospace",
                              }}
                            >
                              <div
                                style={{
                                  marginBottom: "4px",
                                  fontWeight: "600",
                                }}
                              >
                                Fixed code:
                              </div>
                              <pre
                                style={{
                                  margin: 0,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {result.fixedCode}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Refactor Tab */}
        {activeTab === "refactor" && (
          <div style={{ padding: "16px" }}>
            {!refactorResult && !isAnalyzing && !error && (
              <div
                style={{
                  textAlign: "center",
                  color: theme === "dark" ? "#cccccc" : "#6c757d",
                  padding: "40px 20px",
                }}
              >
                <p>Click "Analyze All" to get code refactoring suggestions</p>
              </div>
            )}

            {refactorResult && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <Card variant="glass" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme === "dark" ? "#ffffff" : "#000000",
                    }}
                  >
                    Refactoring Explanation
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: theme === "dark" ? "#cccccc" : "#666666",
                      lineHeight: "1.6",
                    }}
                  >
                    {refactorResult.explanation}
                  </p>
                </Card>

                <Card variant="glass" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme === "dark" ? "#ffffff" : "#000000",
                    }}
                  >
                    Key Improvements Made
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      fontSize: "14px",
                      color: theme === "dark" ? "#cccccc" : "#666666",
                      lineHeight: "1.6",
                    }}
                  >
                    {refactorResult.improvements.map((improvement, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Button
                  variant="primary"
                  size="md"
                  onClick={applyRefactoredCode}
                  leftIcon="✨"
                  style={{ alignSelf: "flex-start" }}
                >
                  Apply Refactored Code
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === "suggestions" && (
          <div style={{ padding: "16px" }}>
            {codeSuggestions.length === 0 && !isAnalyzing && !error && (
              <div
                style={{
                  textAlign: "center",
                  color: theme === "dark" ? "#cccccc" : "#6c757d",
                  padding: "40px 20px",
                }}
              >
                <p>Click "Analyze All" to get code improvement suggestions</p>
              </div>
            )}

            {codeSuggestions.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {codeSuggestions.map((suggestion, index) => (
                  <Card key={index} variant="glass" style={{ padding: "20px" }}>
                    <div>
                      <h3
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: "16px",
                          fontWeight: "700",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                        }}
                      >
                        {suggestion.suggestion}
                      </h3>

                      <p
                        style={{
                          margin: "0 0 16px 0",
                          fontSize: "14px",
                          color: theme === "dark" ? "#cccccc" : "#666666",
                          lineHeight: "1.6",
                        }}
                      >
                        {suggestion.explanation}
                      </p>

                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          backgroundColor:
                            theme === "dark"
                              ? "rgba(0, 0, 0, 0.3)"
                              : "rgba(0, 0, 0, 0.05)",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontFamily: "Monaco, Consolas, monospace",
                          maxHeight: "150px",
                          overflow: "auto",
                          border:
                            theme === "dark"
                              ? "1px solid rgba(255,255,255,0.1)"
                              : "1px solid rgba(0,0,0,0.1)",
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {suggestion.code}
                        </pre>
                      </div>

                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => applySuggestion(suggestion)}
                        leftIcon="💡"
                        style={{ alignSelf: "flex-start" }}
                      >
                        Apply Suggestion
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Diff Tab */}
        {activeTab === "diff" && (
          <div style={{ padding: "16px" }}>
            {!refactorResult && !isAnalyzing && !error && (
              <div
                style={{
                  textAlign: "center",
                  color: theme === "dark" ? "#cccccc" : "#6c757d",
                  padding: "40px 20px",
                }}
              >
                <p>Click "Analyze All" to see the diff comparison</p>
              </div>
            )}

            {refactorResult && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <Card variant="glass" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme === "dark" ? "#ffffff" : "#000000",
                    }}
                  >
                    Code Comparison (Original vs. Refactored)
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      marginTop: "20px",
                      height: "80vh", // Increased height to make it bigger
                    }}
                  >
                    <DiffEditor
                      height="100%"
                      language={language}
                      original={refactorResult.originalCode}
                      modified={refactorResult.refactoredCode}
                      theme="vs-dark" // Always dark theme as requested
                      options={{
                        readOnly: true,
                        renderSideBySide: false, // Display original on top, modified on bottom
                        minimap: { enabled: false },
                        // Optional: Add line numbers if desired for better comparison
                        originalAriaLabel: "Original code",
                        modifiedAriaLabel: "Refactored code",
                        cursorBlinking: "solid", // Disable cursor blinking
                        smoothScrolling: false, // Disable smooth scrolling
                        cursorSmoothCaretAnimation: false, // Disable smooth caret animation
                        measurePerformance: false, // Disable performance measure events
                      }}
                    />
                  </div>
                </Card>

                <Button
                  variant="primary"
                  size="md"
                  onClick={applyRefactoredCode}
                  leftIcon="✨"
                  style={{ alignSelf: "flex-start" }}
                >
                  Apply Refactored Code
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    if (refactorResult) {
                      navigator.clipboard.writeText(
                        refactorResult.refactoredCode
                      );
                    }
                  }}
                  leftIcon="📋"
                  style={{ alignSelf: "flex-start", marginLeft: "12px" }} // Add some margin
                >
                  Copy Fixed Code
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
