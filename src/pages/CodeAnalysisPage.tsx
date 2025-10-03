import { useState } from "react";
import { useStore } from "../store/useStore";
import { GeminiService } from "../services/geminiService";
import { CodeEditor } from "../components/CodeEditor";
import { SnippetAnalysisPanel } from "../components/SnippetAnalysisPanel";
import { Button } from "../components/ui";

export const CodeAnalysisPage: React.FC = () => {
  const { theme } = useStore();
  const [code, setCode] = useState(
    '// Enter your code here for AI analysis...\n\nfunction example() {\n  console.log("Hello World");\n}'
  );
  const [language, setLanguage] = useState("javascript");
  const [jumpToLineFunction, setJumpToLineFunction] = useState<
    ((line: number) => void) | undefined
  >(undefined);

  const supportedLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "28px",
                fontWeight: "700",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              🤖 AI Code Analysis
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                color: theme === "dark" ? "#cccccc" : "#666666",
              }}
            >
              Analyze your code for bugs, get refactoring suggestions, and
              improve your code quality
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <label
              htmlFor="language-select"
              style={{
                fontWeight: 500,
                color: theme === "dark" ? "#ffffff" : "#000000",
                fontSize: "14px",
              }}
            >
              Language:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontSize: "14px",
                background: "rgba(255, 255, 255, 0.1)",
                color: theme === "dark" ? "#ffffff" : "#000000",
                backdropFilter: "blur(10px)",
              }}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          padding: "24px",
          gap: "24px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Code Editor */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "24px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
            >
              Code Editor
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCode(
                  '// Enter your code here for AI analysis...\n\nfunction example() {\n  console.log("Hello World");\n}'
                )
              }
            >
              Clear
            </Button>
          </div>

          <div style={{ flex: 1 }}>
            <CodeEditor
              value={code}
              language={language}
              onChange={(value) => setCode(value ?? "")}
              onJumpToLine={setJumpToLineFunction}
            />
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div
          style={{
            width: "450px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SnippetAnalysisPanel
            code={code}
            language={language}
            onCodeChange={setCode}
            onJumpToLine={jumpToLineFunction}
          />
        </div>
      </div>
    </div>
  );
};
