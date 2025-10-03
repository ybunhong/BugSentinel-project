import { Editor } from "@monaco-editor/react";
import { useStore } from "../store/useStore";
import { useEffect, useRef } from "react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  value?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  onJumpToLine?: (jumpToLine: (line: number) => void) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value = "",
  language = "javascript",
  onChange,
  readOnly = false,
  onJumpToLine,
}) => {
  const { theme, analysisResults } = useStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    // Force focus on mount
    setTimeout(() => {
      editor.focus();
    }, 0);

    // Provide jump to line function to parent
    if (onJumpToLine) {
      onJumpToLine((line: number) => {
        // Validate line number
        if (!line || line < 1) {
          console.warn("Invalid line number for jump:", line);
          return;
        }

        try {
          const model = editor.getModel();
          if (model) {
            const lineCount = model.getLineCount();
            const validLine = Math.min(Math.max(1, line), lineCount);

            editor.revealLineInCenter(validLine);
            editor.setPosition({ lineNumber: validLine, column: 1 });
            editor.focus();
          }
        } catch (error) {
          console.error("Error jumping to line:", error);
        }
      });
    }
  };

  // Update decorations when analysis results change
  useEffect(() => {
    if (!editorRef.current || !analysisResults) return;

    const editor = editorRef.current;

    // Clear previous decorations
    if (decorationsRef.current.length > 0) {
      editor.removeDecorations(decorationsRef.current);
    }

    // Create new decorations for analysis results
    const newDecorations = analysisResults.map((result) => ({
      range: {
        startLineNumber: result.line,
        startColumn: result.column,
        endLineNumber: result.line,
        endColumn: result.column + 10, // Highlight a few characters
      },
      options: {
        className: `analysis-decoration-${result.severity}`,
        hoverMessage: {
          value: `**${result.type.toUpperCase()}** (${result.severity})\n\n${
            result.message
          }${
            result.suggestion
              ? `\n\n💡 **Suggestion:** ${result.suggestion}`
              : ""
          }`,
        },
        glyphMarginClassName: `analysis-glyph-${result.severity}`,
        minimap: {
          color:
            result.severity === "high"
              ? "#ff0000"
              : result.severity === "medium"
              ? "#ff8800"
              : "#ffaa00",
          position: 2,
        },
      },
    }));

    // Apply decorations
    decorationsRef.current = editor.deltaDecorations([], newDecorations);
  }, [analysisResults]);

  return (
    <div
      style={{
        height: window.innerWidth < 768 ? "200px" : "300px", // Reduced default height
        border: "none",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <style>{`
        .analysis-decoration-high {
          border-bottom: 2px wavy #dc3545;
        }
        .analysis-decoration-medium {
          border-bottom: 2px wavy #fd7e14;
        }
        .analysis-decoration-low {
          border-bottom: 2px wavy #ffc107;
        }
        .analysis-glyph-high::before {
          content: "🔴";
          font-size: 12px;
        }
        .analysis-glyph-medium::before {
          content: "🟠";
          font-size: 12px;
        }
        .analysis-glyph-low::before {
          content: "🟡";
          font-size: 12px;
        }
      `}</style>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
        options={{
          readOnly,
          minimap: { enabled: window.innerWidth >= 768 },
          fontSize: window.innerWidth < 768 ? 12 : 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "off", // Disable word wrap for horizontal scrolling
          contextmenu: true,
          selectOnLineNumbers: true,
          glyphMargin: true,
          folding: true,
          foldingHighlight: true,
          showFoldingControls:
            window.innerWidth >= 768 ? "always" : "mouseover",
          matchBrackets: "always",
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: window.innerWidth < 768 ? 8 : 12,
            horizontalScrollbarSize: window.innerWidth < 768 ? 8 : 12,
          },
        }}
      />
    </div>
  );
};
