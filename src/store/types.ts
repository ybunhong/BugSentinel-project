// Store types for BugSentinel application

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  analysisResults?: AnalysisResult[];
}

export interface AnalysisResult {
  id: string;
  type: "syntax" | "logic" | "security" | "performance" | "style";
  severity: "low" | "medium" | "high";
  message: string;
  line: number;
  column: number;
  suggestion?: string;
  fixedCode?: string;
}

export interface RefactorResult {
  originalCode: string;
  refactoredCode: string;
  explanation: string;
  improvements: string[];
}

export interface CodeSuggestion {
  suggestion: string;
  code: string;
  explanation: string;
}

export interface AppState {
  // User session
  user: User | null;
  isAuthenticated: boolean;

  // Snippets
  snippets: Snippet[];
  currentSnippet: Snippet | null;

  // Analysis
  analysisResults: AnalysisResult[];
  isAnalyzing: boolean;
  refactorResult: RefactorResult | null;
  codeSuggestions: CodeSuggestion[];

  // UI state
  theme: "light" | "dark";
  sidebarOpen: boolean;
}
