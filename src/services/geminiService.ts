import { GoogleGenerativeAI } from "@google/generative-ai";

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

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static isInitialized = false;
  private static rateLimitStatus = {
    requestsRemaining: 10,
    resetTime: Date.now() + 3600000, // 1 hour
  };

  private static cache = new Map<string, {
    analysisResults: AnalysisResult[];
    refactorResult: RefactorResult | null;
    codeSuggestions: CodeSuggestion[];
    timestamp: number;
  }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  static initialize(): void {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isInitialized = true;
      console.log("✅ Gemini AI initialized");
    } else {
      console.warn("⚠️ Gemini API key not found");
    }
  }

  static isAvailable(): boolean {
    return this.isInitialized && this.genAI !== null;
  }

  static hasValidApiKey(): boolean {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
  }

  static getRateLimitStatus() {
    return this.rateLimitStatus;
  }

  private static async makeRequest(prompt: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("Gemini AI is not available");
    }

    if (this.rateLimitStatus.requestsRemaining <= 0) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    try {
      const model = this.genAI!.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Update rate limit
      this.rateLimitStatus.requestsRemaining--;
      if (this.rateLimitStatus.requestsRemaining <= 0) {
        this.rateLimitStatus.resetTime = Date.now() + 3600000;
      }

      return text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  static async analyzeCode(params: {
    code: string;
    language: string;
    prompt?: string;
  }): Promise<{ data: AnalysisResult[] | null; error: string | null }> {
    try {
      const { code, language, prompt } = params;

      const analysisPrompt =
        prompt ||
        `Analyze this ${language} code for bugs, errors, and issues. Provide specific line numbers and suggestions for fixes.`;

      const fullPrompt = `${analysisPrompt}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis in the following JSON format:
{
  "issues": [
    {
      "type": "syntax|logic|security|performance|style",
      "severity": "low|medium|high",
      "message": "Description of the issue",
      "line": 1,
      "column": 1,
      "suggestion": "How to fix this issue",
      "fixedCode": "Corrected code snippet"
    }
  ]
}

Focus on:
- Syntax errors
- Logic bugs
- Security vulnerabilities
- Performance issues
- Code style improvements
- Best practices violations

Be specific with line numbers and provide actionable suggestions.`;

      const response = await this.makeRequest(fullPrompt);

      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const analysis = JSON.parse(jsonMatch[0]);
        const results: AnalysisResult[] = analysis.issues.map(
          (issue: any, index: number) => ({
            id: `issue-${Date.now()}-${index}`,
            type: issue.type || "logic",
            severity: issue.severity || "medium",
            message: issue.message || "Issue found",
            line: issue.line || 1,
            column: issue.column || 1,
            suggestion: issue.suggestion,
            fixedCode: issue.fixedCode,
          })
        );

        return { data: results, error: null };
      } catch (parseError) {
        console.error("Failed to parse analysis response:", parseError);
        return {
          data: null,
          error: "Failed to parse analysis results. Please try again.",
        };
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Analysis failed",
      };
    }
  }

  static async getRefactoringSuggestions(params: {
    code: string;
    language: string;
  }): Promise<{ data: RefactorResult | null; error: string | null }> {
    try {
      const { code, language } = params;

      const prompt = `Refactor this ${language} code to improve its structure, readability, and maintainability.

Original code:
\`\`\`${language}
${code}
\`\`\`

Please provide a refactored version in the following JSON format:
{
  "refactoredCode": "The improved code",
  "explanation": "Explanation of the refactoring changes",
  "improvements": [
    "List of specific improvements made",
    "Better variable names",
    "Improved structure",
    "etc."
  ]
}

Focus on:
- Better variable and function names
- Improved code structure
- Reduced complexity
- Better error handling
- Performance optimizations
- Code readability`;

      const response = await this.makeRequest(prompt);

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        let jsonString = jsonMatch[0];
        // Attempt to clean up common JSON parsing issues (e.g., trailing commas)
        jsonString = jsonString.replace(/,[\s\n]*}/g, "}"); // Remove trailing commas before a closing brace
        jsonString = jsonString.replace(/,[\s\n]*]/g, "]"); // Remove trailing commas before a closing bracket
        // Add more cleanup rules as needed based on common errors

        const result = JSON.parse(jsonString);

        return {
          data: {
            originalCode: code,
            refactoredCode: result.refactoredCode || code,
            explanation: result.explanation || "Code refactored",
            improvements: result.improvements || ["Code improved"],
          },
          error: null,
        };
      } catch (parseError) {
        console.error("Failed to parse refactor response:", parseError);
        return {
          data: null,
          error: "Failed to parse refactoring results. Please try again.",
        };
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Refactoring failed",
      };
    }
  }

  static async getCodeSuggestions(params: {
    code: string;
    language: string;
    context?: string;
  }): Promise<{ data: CodeSuggestion[] | null; error: string | null }> {
    try {
      const { code, language, context } = params;

      const prompt = `Provide code suggestions and improvements for this ${language} code.

Code:
\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ""}

Please provide suggestions in the following JSON format:
{
  "suggestions": [
    {
      "suggestion": "Brief description of the suggestion",
      "code": "Improved code snippet",
      "explanation": "Detailed explanation of the improvement"
    }
  ]
}

Focus on:
- Modern language features
- Performance improvements
- Code clarity
- Best practices
- Alternative approaches`;

      const response = await this.makeRequest(prompt);

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const result = JSON.parse(jsonMatch[0]);

        return {
          data: result.suggestions || [],
          error: null,
        };
      } catch (parseError) {
        console.error("Failed to parse suggestions response:", parseError);
        return {
          data: null,
          error: "Failed to parse suggestions. Please try again.",
        };
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Suggestions failed",
      };
    }
  }

  static async analyzeAll(params: {
    code: string;
    language: string;
  }): Promise<{
    analysisResults: AnalysisResult[];
    refactorResult: RefactorResult | null;
    codeSuggestions: CodeSuggestion[];
    error: string | null;
  }> {
    try {
      const { code, language } = params;
      const cacheKey = this.hashCode(code + language);

      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return {
          analysisResults: cached.analysisResults,
          refactorResult: cached.refactorResult,
          codeSuggestions: cached.codeSuggestions,
          error: null,
        };
      }

      const prompt = `Analyze this ${language} code comprehensively. Provide analysis, refactoring suggestions, and code improvements in one response.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis in the following JSON format:
{
  "analysis": {
    "issues": [
      {
        "type": "syntax|logic|security|performance|style",
        "severity": "low|medium|high",
        "message": "Description of the issue",
        "line": 1,
        "column": 1,
        "suggestion": "How to fix this issue",
        "fixedCode": "Corrected code snippet"
      }
    ]
  },
  "refactoring": {
    "refactoredCode": "The improved code",
    "explanation": "Explanation of the refactoring changes",
    "improvements": [
      "List of specific improvements made"
    ]
  },
  "suggestions": [
    {
      "suggestion": "Brief description of the suggestion",
      "code": "Improved code snippet",
      "explanation": "Detailed explanation of the improvement"
    }
  ]
}

Focus on:
- Syntax errors, logic bugs, security vulnerabilities, performance issues, code style
- Refactoring for better structure, readability, maintainability
- Modern language features, performance improvements, best practices

Be specific with line numbers and provide actionable suggestions.`;

      const response = await this.makeRequest(prompt);

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const result = JSON.parse(jsonMatch[0]);

        const analysisResults: AnalysisResult[] = (result.analysis?.issues || []).map(
          (issue: any, index: number) => ({
            id: `issue-${Date.now()}-${index}`,
            type: issue.type || "logic",
            severity: issue.severity || "medium",
            message: issue.message || "Issue found",
            line: issue.line || 1,
            column: issue.column || 1,
            suggestion: issue.suggestion,
            fixedCode: issue.fixedCode,
          })
        );

        const refactorResult: RefactorResult | null = result.refactoring ? {
          originalCode: code,
          refactoredCode: result.refactoring.refactoredCode || code,
          explanation: result.refactoring.explanation || "Code refactored",
          improvements: result.refactoring.improvements || ["Code improved"],
        } : null;

        const codeSuggestions: CodeSuggestion[] = result.suggestions || [];

        // Cache the results
        this.cache.set(cacheKey, {
          analysisResults,
          refactorResult,
          codeSuggestions,
          timestamp: Date.now(),
        });

        return {
          analysisResults,
          refactorResult,
          codeSuggestions,
          error: null,
        };
      } catch (parseError) {
        console.error("Failed to parse comprehensive analysis response:", parseError);
        return {
          analysisResults: [],
          refactorResult: null,
          codeSuggestions: [],
          error: "Failed to parse analysis results. Please try again.",
        };
      }
    } catch (error) {
      return {
        analysisResults: [],
        refactorResult: null,
        codeSuggestions: [],
        error: error instanceof Error ? error.message : "Analysis failed",
      };
    }
  }
}
