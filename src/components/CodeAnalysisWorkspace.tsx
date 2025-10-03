import { useState } from 'react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../services/geminiService';
import { SnippetService } from '../services/snippetService';
import { CodeEditor } from '../components/CodeEditor';
import { Button, Card, Input, Badge } from '../components/ui';
import { Icon } from '../components/ui/Icon';

interface CodeAnalysisWorkspaceProps {
  initialCode?: string;
  initialLanguage?: string;
  snippetId?: string;
  readOnly?: boolean;
  onSave?: (code: string, language: string) => void;
}

export const CodeAnalysisWorkspace: React.FC<CodeAnalysisWorkspaceProps> = ({
  initialCode = '',
  initialLanguage = 'javascript',
  snippetId,
  readOnly = false,
  onSave,
}) => {
  const { theme } = useStore();
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showSaveOption, setShowSaveOption] = useState(false);

  const predefinedPrompts = [
    { id: 'bugs', label: 'Find Bugs', icon: 'warning', prompt: 'Analyze this code for potential bugs, errors, and issues. Provide specific line numbers and suggestions for fixes.' },
    { id: 'optimize', label: 'Optimize Code', icon: 'zap', prompt: 'Review this code for performance optimizations, better algorithms, and efficiency improvements.' },
    { id: 'security', label: 'Security Review', icon: 'lock', prompt: 'Check this code for security vulnerabilities, potential exploits, and security best practices.' },
    { id: 'refactor', label: 'Refactor', icon: 'edit', prompt: 'Suggest refactoring improvements for better code structure, readability, and maintainability.' },
    { id: 'explain', label: 'Explain Code', icon: 'book', prompt: 'Explain what this code does, how it works, and document its functionality.' },
    { id: 'custom', label: 'Custom Prompt', icon: 'comment', prompt: '' },
  ];

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }
    if (!GeminiService.isAvailable()) {
      setError('AI analysis is not available. Please add your Gemini API key to the .env file.');
      return;
    }
    let analysisPrompt = '';
    if (prompt === 'custom') {
      analysisPrompt = customPrompt;
    } else if (prompt && predefinedPrompts.find(p => p.id === prompt)) {
      analysisPrompt = predefinedPrompts.find(p => p.id === prompt)?.prompt || '';
    } else {
      analysisPrompt = 'Analyze this code for potential bugs, errors, and issues. Provide specific line numbers and suggestions for fixes.';
    }
    if (!analysisPrompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);
    try {
      const result = await GeminiService.analyzeCode({ code, language, prompt: analysisPrompt });
      if (result.data) {
        setAnalysisResults(result.data);
        setShowSaveOption(true);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAsSnippet = async () => {
    if (!code.trim()) return;
    if (onSave) {
      onSave(code, language);
      return;
    }
    const title = `Analysis - ${new Date().toLocaleDateString()}`;
    const result = await SnippetService.createSnippet({ title, code, language });
    if (result.data) {
      alert('Code saved as snippet!');
      setShowSaveOption(false);
    } else {
      alert('Failed to save snippet: ' + result.error);
    }
  };

  const handleClearAll = () => {
    setCode('');
    setAnalysisResults(null);
    setError(null);
    setPrompt('');
    setCustomPrompt('');
    setShowSaveOption(false);
  };

  const supportedLanguages = SnippetService.getSupportedLanguages();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'row', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', minHeight: '100vh', width: '100%' }}>
      {/* Editor Section */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 16px', background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)', borderRight: '1px solid #e0e7ff' }}>
        <div style={{ width: '100%', maxWidth: 700, background: '#fff', borderRadius: 16, boxShadow: '0 6px 36px rgba(100,100,200,0.10)', padding: 0, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0 8px 0' }}>
            <label htmlFor="language-select" style={{ fontWeight: 500, color: '#6366f1' }}>Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 16 }}
              disabled={readOnly}
            >
              {supportedLanguages.map(lang => (
  <option key={lang.value} value={lang.value}>{lang.label}</option>
))}
            </select>
          </div>
          <CodeEditor
            value={code}
            language={language}
            onChange={readOnly ? undefined : (value) => setCode(value ?? '')}
            readOnly={readOnly}
          />
        </div>
      </div>
      {/* Analysis/Refactor Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 16px', background: '#f8fafc', minWidth: 340, maxWidth: 420 }}>
        <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 12px rgba(100,100,200,0.06)' }}>
          <button style={{ flex: 1, padding: '16px', fontWeight: 600, fontSize: 16, background: '#ede9fe', border: 'none', color: '#7c3aed', cursor: 'pointer', outline: 'none' }} disabled>Analysis</button>
          <button style={{ flex: 1, padding: '16px', fontWeight: 600, fontSize: 16, background: '#fff', border: 'none', color: '#a1a1aa', cursor: 'not-allowed', outline: 'none' }} disabled>Refactor</button>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, minHeight: 200, boxShadow: '0 2px 12px rgba(100,100,200,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="zap" size={20} /> AI Analysis
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || readOnly}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, marginBottom: 18, cursor: isAnalyzing ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
          <div style={{ color: '#64748b', fontSize: 15, marginTop: 10 }}>Click "Analyze" to check your code for issues</div>
          {error && (
            <Card variant="glass" style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)', marginTop: 18 }}>
              <div style={{ color: '#ff6b6b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="warning" size={18} color="#ff6b6b" />
                <span>{error}</span>
              </div>
            </Card>
          )}
          {analysisResults && (
            <Card variant="glass" style={{ marginTop: 18 }}>
              <div style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                <Icon name="info" size={16} style={{ marginRight: 6 }} />
                <b>Result:</b>
                <pre style={{ maxHeight: 200, overflow: 'auto', background: '#222', color: '#fff', padding: 12, borderRadius: 8 }}>{typeof analysisResults === 'string' ? analysisResults : JSON.stringify(analysisResults, null, 2)}</pre>
              </div>
            </Card>
          )}
          {!readOnly && (
            <div style={{ marginTop: 18, width: '100%' }}>
              <Button variant="primary" size="md" onClick={handleSaveAsSnippet} style={{ marginRight: 8 }}>Save as Snippet</Button>
              <Button variant="secondary" size="md" onClick={handleClearAll}>Clear</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
