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

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  analysisResults: AnalysisResult[];
  refactorResult: RefactorResult | null;
  codeSuggestions: CodeSuggestion[];
  timestamp: number;
}

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

function getCached(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION_MS) return entry;
  cache.delete(key);
  return null;
}

// ─── Rate limit ───────────────────────────────────────────────────────────────

const rateLimit = {
  requestsRemaining: 10,
  resetTime: Date.now() + 3_600_000,
};

// ─── JSON extraction ──────────────────────────────────────────────────────────

/**
 * Extracts the first JSON object from a string that may contain markdown fences.
 * More robust than a simple regex match.
 */
function extractJSON(text: string): unknown {
  // Strip markdown fences if present
  const stripped = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "");

  // Find first { and last } to grab the outermost object
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");

  let jsonStr = stripped.slice(start, end + 1);

  // Clean up common Gemini JSON quirks
  jsonStr = jsonStr
    .replace(/,(\s*[}\]])/g, "$1")   // trailing commas
    .replace(/\n/g, "\\n")           // bare newlines inside strings (basic fix)
    .replace(/\\n(?=[^"]*(?:"[^"]*"[^"]*)*$)/g, "\n"); // re-unescape outside strings

  return JSON.parse(jsonStr);
}

// ─── Model factory ────────────────────────────────────────────────────────────

function getModel(genAI: GoogleGenerativeAI) {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      // Ask for JSON mode where the model only outputs valid JSON
      responseMimeType: "application/json",
    },
  });
}

// ─── Core request helpers ─────────────────────────────────────────────────────

/**
 * Single non-streaming request. Returns parsed text.
 */
async function makeRequest(genAI: GoogleGenerativeAI, prompt: string): Promise<string> {
  if (rateLimit.requestsRemaining <= 0) {
    const wait = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    throw new Error(`Rate limit exceeded. Resets in ~${wait}s.`);
  }

  const model = getModel(genAI);
  const result = await model.generateContent(prompt);
  rateLimit.requestsRemaining--;

  return result.response.text();
}

/**
 * Streaming request — calls `onChunk` with each text delta.
 * Returns the complete assembled text when done.
 */
async function makeStreamingRequest(
  genAI: GoogleGenerativeAI,
  prompt: string,
  onChunk?: (delta: string) => void
): Promise<string> {
  if (rateLimit.requestsRemaining <= 0) {
    const wait = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    throw new Error(`Rate limit exceeded. Resets in ~${wait}s.`);
  }

  const model = getModel(genAI);
  const result = await model.generateContentStream(prompt);
  rateLimit.requestsRemaining--;

  let full = "";
  for await (const chunk of result.stream) {
    const delta = chunk.text();
    full += delta;
    onChunk?.(delta);
  }

  return full;
}

// ─── Prompt builders (kept concise for speed) ─────────────────────────────────

function buildAnalysisPrompt(code: string, language: string, prompt?: string): string {
  return `${prompt ?? `Analyze this ${language} code for bugs and issues.`}

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON (no markdown):
{"issues":[{"type":"syntax|logic|security|performance|style","severity":"low|medium|high","message":"...","line":1,"column":1,"suggestion":"...","fixedCode":"..."}]}`;
}

function buildRefactorPrompt(code: string, language: string): string {
  return `Refactor this ${language} code for clarity, performance, and best practices.

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON (no markdown):
{"refactoredCode":"...","explanation":"...","improvements":["..."]}`;
}

function buildSuggestionsPrompt(code: string, language: string, context?: string): string {
  return `Give 3 concise improvement suggestions for this ${language} code.${context ? ` Context: ${context}` : ""}

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON (no markdown):
{"suggestions":[{"suggestion":"...","code":"...","explanation":"..."}]}`;
}

/**
 * Single combined prompt — one API call instead of three.
 * This is the fastest path for analyzeAll.
 */
function buildCombinedPrompt(code: string, language: string): string {
  return `Analyze, refactor, and suggest improvements for this ${language} code.

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON (no markdown):
{
  "analysis":{"issues":[{"type":"syntax|logic|security|performance|style","severity":"low|medium|high","message":"...","line":1,"column":1,"suggestion":"...","fixedCode":"..."}]},
  "refactoring":{"refactoredCode":"...","explanation":"...","improvements":["..."]},
  "suggestions":[{"suggestion":"...","code":"...","explanation":"..."}]
}`;
}

// ─── Public service class ─────────────────────────────────────────────────────

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static initialized = false;

  static initialize(): void {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.initialized = true;
      console.log("✅ Gemini AI initialized");
    } else {
      console.warn("⚠️ VITE_GEMINI_API_KEY not set");
    }
  }

  static isAvailable(): boolean {
    return this.initialized && this.genAI !== null;
  }

  static hasValidApiKey(): boolean {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
  }

  static getRateLimitStatus() {
    return { ...rateLimit };
  }

  private static requireGenAI(): GoogleGenerativeAI {
    if (!this.genAI) throw new Error("GeminiService not initialized. Call initialize() first.");
    return this.genAI;
  }

  // ── analyzeCode ─────────────────────────────────────────────────────────────

  static async analyzeCode(params: {
    code: string;
    language: string;
    prompt?: string;
    onChunk?: (delta: string) => void; // optional streaming callback
  }): Promise<{ data: AnalysisResult[] | null; error: string | null }> {
    try {
      const { code, language, prompt, onChunk } = params;
      const fullPrompt = buildAnalysisPrompt(code, language, prompt);

      const text = onChunk
        ? await makeStreamingRequest(this.requireGenAI(), fullPrompt, onChunk)
        : await makeRequest(this.requireGenAI(), fullPrompt);

      const parsed = extractJSON(text) as any;
      const results: AnalysisResult[] = (parsed.issues ?? []).map(
        (issue: any, i: number) => ({
          id: `issue-${Date.now()}-${i}`,
          type: issue.type ?? "logic",
          severity: issue.severity ?? "medium",
          message: issue.message ?? "Issue found",
          line: issue.line ?? 1,
          column: issue.column ?? 1,
          suggestion: issue.suggestion,
          fixedCode: issue.fixedCode,
        })
      );

      return { data: results, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Analysis failed" };
    }
  }

  // ── getRefactoringSuggestions ────────────────────────────────────────────────

  static async getRefactoringSuggestions(params: {
    code: string;
    language: string;
    onChunk?: (delta: string) => void;
  }): Promise<{ data: RefactorResult | null; error: string | null }> {
    try {
      const { code, language, onChunk } = params;
      const prompt = buildRefactorPrompt(code, language);

      const text = onChunk
        ? await makeStreamingRequest(this.requireGenAI(), prompt, onChunk)
        : await makeRequest(this.requireGenAI(), prompt);

      const parsed = extractJSON(text) as any;

      return {
        data: {
          originalCode: code,
          refactoredCode: parsed.refactoredCode ?? code,
          explanation: parsed.explanation ?? "Code refactored",
          improvements: parsed.improvements ?? [],
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Refactoring failed" };
    }
  }

  // ── getCodeSuggestions ───────────────────────────────────────────────────────

  static async getCodeSuggestions(params: {
    code: string;
    language: string;
    context?: string;
    onChunk?: (delta: string) => void;
  }): Promise<{ data: CodeSuggestion[] | null; error: string | null }> {
    try {
      const { code, language, context, onChunk } = params;
      const prompt = buildSuggestionsPrompt(code, language, context);

      const text = onChunk
        ? await makeStreamingRequest(this.requireGenAI(), prompt, onChunk)
        : await makeRequest(this.requireGenAI(), prompt);

      const parsed = extractJSON(text) as any;
      return { data: parsed.suggestions ?? [], error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Suggestions failed" };
    }
  }

  // ── analyzeAll — fastest path ────────────────────────────────────────────────
  /**
   * One combined API call (vs. the previous 3 sequential calls).
   * ~3× faster. Results are cached for 5 minutes per code+language hash.
   */
  static async analyzeAll(params: {
    code: string;
    language: string;
    onChunk?: (delta: string) => void;
  }): Promise<{
    analysisResults: AnalysisResult[];
    refactorResult: RefactorResult | null;
    codeSuggestions: CodeSuggestion[];
    error: string | null;
  }> {
    const { code, language, onChunk } = params;
    const cacheKey = hashCode(code + language);

    // ── Cache hit ──────────────────────────────────────────────────────────────
    const cached = getCached(cacheKey);
    if (cached) {
      return { ...cached, error: null };
    }

    try {
      const prompt = buildCombinedPrompt(code, language);

      const text = onChunk
        ? await makeStreamingRequest(this.requireGenAI(), prompt, onChunk)
        : await makeRequest(this.requireGenAI(), prompt);

      const result = extractJSON(text) as any;

      const analysisResults: AnalysisResult[] = (result.analysis?.issues ?? []).map(
        (issue: any, i: number) => ({
          id: `issue-${Date.now()}-${i}`,
          type: issue.type ?? "logic",
          severity: issue.severity ?? "medium",
          message: issue.message ?? "Issue found",
          line: issue.line ?? 1,
          column: issue.column ?? 1,
          suggestion: issue.suggestion,
          fixedCode: issue.fixedCode,
        })
      );

      const refactorResult: RefactorResult | null = result.refactoring
        ? {
            originalCode: code,
            refactoredCode: result.refactoring.refactoredCode ?? code,
            explanation: result.refactoring.explanation ?? "Code refactored",
            improvements: result.refactoring.improvements ?? [],
          }
        : null;

      const codeSuggestions: CodeSuggestion[] = result.suggestions ?? [];

      // ── Store in cache ───────────────────────────────────────────────────────
      cache.set(cacheKey, {
        analysisResults,
        refactorResult,
        codeSuggestions,
        timestamp: Date.now(),
      });

      return { analysisResults, refactorResult, codeSuggestions, error: null };
    } catch (err) {
      return {
        analysisResults: [],
        refactorResult: null,
        codeSuggestions: [],
        error: err instanceof Error ? err.message : "Analysis failed",
      };
    }
  }

  // ── analyzeAllParallel — alternative: 3 parallel calls ──────────────────────
  /**
   * Fires all three requests simultaneously. Useful if you need streaming
   * callbacks per-section, or if the combined prompt gives worse results.
   * Costs 3 rate-limit tokens instead of 1.
   */
  static async analyzeAllParallel(params: {
    code: string;
    language: string;
    onAnalysisChunk?: (delta: string) => void;
    onRefactorChunk?: (delta: string) => void;
    onSuggestionsChunk?: (delta: string) => void;
  }): Promise<{
    analysisResults: AnalysisResult[];
    refactorResult: RefactorResult | null;
    codeSuggestions: CodeSuggestion[];
    errors: string[];
  }> {
    const { code, language, onAnalysisChunk, onRefactorChunk, onSuggestionsChunk } = params;

    const [analysisRes, refactorRes, suggestionsRes] = await Promise.allSettled([
      this.analyzeCode({ code, language, onChunk: onAnalysisChunk }),
      this.getRefactoringSuggestions({ code, language, onChunk: onRefactorChunk }),
      this.getCodeSuggestions({ code, language, onChunk: onSuggestionsChunk }),
    ]);

    const errors: string[] = [];
    const get = <T>(res: PromiseSettledResult<{ data: T | null; error: string | null }>, fallback: T): T => {
      if (res.status === "rejected") { errors.push(String(res.reason)); return fallback; }
      if (res.value.error) { errors.push(res.value.error); return fallback; }
      return res.value.data ?? fallback;
    };

    return {
      analysisResults: get(analysisRes, []),
      refactorResult: get(refactorRes, null),
      codeSuggestions: get(suggestionsRes, []),
      errors,
    };
  }
}