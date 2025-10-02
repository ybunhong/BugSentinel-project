import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalysisResult } from '../store/types';

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  filename?: string;
  prompt?: string;
}

export interface CodeRefactorRequest {
  code: string;
  language: string;
  issues?: AnalysisResult[];
}

export interface RefactorSuggestion {
  originalCode: string;
  refactoredCode: string;
  explanation: string;
  improvements: string[];
}

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: any = null;
  private static rateLimitCount = 0;
  private static rateLimitWindow = Date.now();
  private static readonly MAX_REQUESTS_PER_MINUTE = 10;
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

  // Initialize Gemini AI
  static initialize(): boolean {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
      console.warn('Gemini API key not configured. AI features will be disabled.');
      this.model = null;
      this.genAI = null;
      return false;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      console.log('✅ Gemini AI initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      this.model = null;
      this.genAI = null;
      return false;
    }
  }

  // Check if Gemini is available
  static isAvailable(): boolean {
    return this.model !== null && this.hasValidApiKey();
  }

  // Check if API key is properly configured
  static hasValidApiKey(): boolean {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    return !!(apiKey && apiKey !== 'your_gemini_api_key' && apiKey.trim() !== '');
  }

  // Check rate limiting
  static checkRateLimit(): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.rateLimitWindow > this.RATE_LIMIT_WINDOW) {
      this.rateLimitCount = 0;
      this.rateLimitWindow = now;
    }
    
    if (this.rateLimitCount >= this.MAX_REQUESTS_PER_MINUTE) {
      const resetTime = this.rateLimitWindow + this.RATE_LIMIT_WINDOW;
      return { 
        allowed: false, 
        resetTime 
      };
    }
    
    return { allowed: true };
  }

  // Increment rate limit counter
  private static incrementRateLimit(): void {
    this.rateLimitCount++;
  }

  // Analyze code for bugs and issues
  static async analyzeCode(request: CodeAnalysisRequest): Promise<{
    data: AnalysisResult[] | null;
    error: string | null;
  }> {
    // Check if AI is available
    if (!this.isAvailable()) {
      if (!this.hasValidApiKey()) {
        return { 
          data: null, 
          error: 'AI analysis requires a valid Gemini API key. Please add your API key to the .env file.' 
        };
      }
      if (!this.initialize()) {
        return { data: null, error: 'Failed to initialize Gemini AI service' };
      }
    }

    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime).toLocaleTimeString() : 'soon';
      return { 
        data: null, 
        error: `Rate limit exceeded. Please try again after ${resetTime}` 
      };
    }

    // Check if code is too large (prevent abuse)
    if (request.code.length > 10000) {
      return {
        data: null,
        error: 'Code is too large for analysis. Please limit to 10,000 characters.'
      };
    }

    this.incrementRateLimit();

    try {
      const defaultPrompt = `
Analyze the following ${request.language} code for potential issues, bugs, and improvements.
Focus on:
1. Syntax errors
2. Logic errors
3. Security vulnerabilities
4. Performance issues
5. Code quality problems

Code to analyze:
\`\`\`${request.language}
${request.code}
\`\`\`

Please respond with a JSON array of issues found. Each issue should have this structure:`;

      const customPrompt = `
${request.prompt || 'Analyze this code for issues and improvements.'}

Code to analyze:
\`\`\`${request.language}
${request.code}
\`\`\`

Please provide a detailed analysis.`;

      const finalPrompt = request.prompt ? customPrompt : (defaultPrompt + `
{
  "type": "syntax" | "logic" | "security" | "performance",
  "severity": "low" | "medium" | "high",
  "message": "Description of the issue",
  "line": number (1-based line number where issue occurs),
  "column": number (1-based column number, estimate if needed),
  "suggestion": "How to fix this issue"
}

If no issues are found, return an empty array [].
Only return valid JSON, no additional text.`);

      const result = await this.model.generateContent(finalPrompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse the JSON response
      let analysisResults: any[];
      try {
        // Clean the response text (remove markdown code blocks if present)
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        analysisResults = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        return { data: null, error: 'Invalid response format from AI' };
      }

      // Validate and transform the results
      const validResults: AnalysisResult[] = analysisResults
        .filter(result => 
          result.type && 
          result.severity && 
          result.message && 
          typeof result.line === 'number'
        )
        .map((result, index) => ({
          id: `analysis-${Date.now()}-${index}`,
          type: result.type,
          severity: result.severity,
          message: result.message,
          line: Math.max(1, result.line), // Ensure line is at least 1
          column: Math.max(1, result.column || 1), // Default column to 1
          suggestion: result.suggestion || ''
        }));

      return { data: validResults, error: null };

    } catch (error) {
      console.error('Gemini analysis error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      };
    }
  }

  // Get refactoring suggestions
  static async getRefactoringSuggestions(request: CodeRefactorRequest): Promise<{
    data: RefactorSuggestion | null;
    error: string | null;
  }> {
    // Check if AI is available
    if (!this.isAvailable()) {
      if (!this.hasValidApiKey()) {
        return { 
          data: null, 
          error: 'AI refactoring requires a valid Gemini API key. Please add your API key to the .env file.' 
        };
      }
      if (!this.initialize()) {
        return { data: null, error: 'Failed to initialize Gemini AI service' };
      }
    }

    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime).toLocaleTimeString() : 'soon';
      return { 
        data: null, 
        error: `Rate limit exceeded. Please try again after ${resetTime}` 
      };
    }

    // Check if code is too large
    if (request.code.length > 10000) {
      return {
        data: null,
        error: 'Code is too large for refactoring. Please limit to 10,000 characters.'
      };
    }

    this.incrementRateLimit();

    try {
      const issuesContext = request.issues && request.issues.length > 0
        ? `\n\nKnown issues to address:\n${request.issues.map(issue => 
            `- ${issue.message} (Line ${issue.line})`
          ).join('\n')}`
        : '';

      const prompt = `
Refactor and improve the following ${request.language} code.
Focus on:
1. Fixing any bugs or issues
2. Improving code quality and readability
3. Optimizing performance
4. Following best practices
5. Adding helpful comments where needed

Original code:
\`\`\`${request.language}
${request.code}
\`\`\`${issuesContext}

Please respond with a JSON object in this exact format:
{
  "refactoredCode": "The improved code here",
  "explanation": "Brief explanation of what was changed and why",
  "improvements": ["List of specific improvements made", "Another improvement", "etc."]
}

Only return valid JSON, no additional text or markdown.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse the JSON response
      let refactorResult: any;
      try {
        // Clean the response text
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        refactorResult = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini refactor response:', text);
        return { data: null, error: 'Invalid response format from AI' };
      }

      // Validate the response
      if (!refactorResult.refactoredCode || !refactorResult.explanation) {
        return { data: null, error: 'Incomplete refactoring response' };
      }

      const suggestion: RefactorSuggestion = {
        originalCode: request.code,
        refactoredCode: refactorResult.refactoredCode,
        explanation: refactorResult.explanation,
        improvements: Array.isArray(refactorResult.improvements) 
          ? refactorResult.improvements 
          : []
      };

      return { data: suggestion, error: null };

    } catch (error) {
      console.error('Gemini refactoring error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Refactoring failed' 
      };
    }
  }

  // Get a quick code explanation
  static async explainCode(code: string, language: string): Promise<{
    data: string | null;
    error: string | null;
  }> {
    // Check if AI is available
    if (!this.isAvailable()) {
      if (!this.hasValidApiKey()) {
        return { 
          data: null, 
          error: 'AI explanation requires a valid Gemini API key. Please add your API key to the .env file.' 
        };
      }
      if (!this.initialize()) {
        return { data: null, error: 'Failed to initialize Gemini AI service' };
      }
    }

    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime).toLocaleTimeString() : 'soon';
      return { 
        data: null, 
        error: `Rate limit exceeded. Please try again after ${resetTime}` 
      };
    }

    // Check if code is too large
    if (code.length > 5000) {
      return {
        data: null,
        error: 'Code is too large for explanation. Please limit to 5,000 characters.'
      };
    }

    this.incrementRateLimit();

    try {
      const prompt = `
Explain what this ${language} code does in simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide a clear, concise explanation that a developer would find helpful.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const explanation = response.text().trim();

      return { data: explanation, error: null };

    } catch (error) {
      console.error('Gemini explanation error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Explanation failed' 
      };
    }
  }

  // Get current rate limit status
  static getRateLimitStatus(): {
    requestsRemaining: number;
    resetTime: number;
    windowStart: number;
  } {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.rateLimitWindow > this.RATE_LIMIT_WINDOW) {
      this.rateLimitCount = 0;
      this.rateLimitWindow = now;
    }
    
    return {
      requestsRemaining: Math.max(0, this.MAX_REQUESTS_PER_MINUTE - this.rateLimitCount),
      resetTime: this.rateLimitWindow + this.RATE_LIMIT_WINDOW,
      windowStart: this.rateLimitWindow
    };
  }

  // Reset rate limit (for testing or admin purposes)
  static resetRateLimit(): void {
    this.rateLimitCount = 0;
    this.rateLimitWindow = Date.now();
  }
}
