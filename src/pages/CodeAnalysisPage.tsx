import { useState } from 'react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../services/geminiService';
import { SnippetService } from '../services/snippetService';
import { CodeEditor } from '../components/CodeEditor';
import { Button, Card, Input, Badge } from '../components/ui';
import { Icon } from '../components/ui/Icon';
import { colors } from '../styles/design-system';

export const CodeAnalysisPage: React.FC = () => {
  const { theme } = useStore();
  const [code, setCode] = useState('// Paste your code here for AI analysis\nconsole.log("Hello, BugSentinel!");');
  const [language, setLanguage] = useState('javascript');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showSaveOption, setShowSaveOption] = useState(false);

  const predefinedPrompts = [
    {
      id: 'bugs',
      label: 'Find Bugs',
      icon: 'warning',
      prompt: 'Analyze this code for potential bugs, errors, and issues. Provide specific line numbers and suggestions for fixes.'
    },
    {
      id: 'optimize',
      label: 'Optimize Code',
      icon: 'zap',
      prompt: 'Review this code for performance optimizations, better algorithms, and efficiency improvements.'
    },
    {
      id: 'security',
      label: 'Security Review',
      icon: 'lock',
      prompt: 'Check this code for security vulnerabilities, potential exploits, and security best practices.'
    },
    {
      id: 'refactor',
      label: 'Refactor',
      icon: 'edit',
      prompt: 'Suggest refactoring improvements for better code structure, readability, and maintainability.'
    },
    {
      id: 'explain',
      label: 'Explain Code',
      icon: 'book',
      prompt: 'Explain what this code does, how it works, and document its functionality.'
    },
    {
      id: 'custom',
      label: 'Custom Prompt',
      icon: 'comment',
      prompt: ''
    }
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

    const selectedPrompt = predefinedPrompts.find(p => p.id === prompt);
    const analysisPrompt = prompt === 'custom' ? customPrompt : selectedPrompt?.prompt || '';

    if (!analysisPrompt.trim()) {
      setError('Please select a prompt or enter a custom prompt');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const result = await GeminiService.analyzeCode({
        code,
        language,
        prompt: analysisPrompt
      });
      
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

    const title = `Analysis - ${new Date().toLocaleDateString()}`;
    const result = await SnippetService.createSnippet({
      title,
      code,
      language
    });

    if (result.data) {
      alert('Code saved as snippet!');
      setShowSaveOption(false);
    } else {
      alert('Failed to save snippet: ' + result.error);
    }
  };

  const handleClearAll = () => {
    setCode('// Paste your code here for AI analysis\nconsole.log("Hello, BugSentinel!");');
    setAnalysisResults(null);
    setError(null);
    setPrompt('');
    setCustomPrompt('');
    setShowSaveOption(false);
  };

  const supportedLanguages = SnippetService.getSupportedLanguages();

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      gap: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '700',
            background: colors.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AI Code Analysis
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {showSaveOption && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAsSnippet}
                  leftIcon={<Icon name="save" size={16} />}
                >
                  Save as Snippet
                </Button>
                <Input
                  placeholder="Enter your custom analysis prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
              </>
            )}

          {error && (
            <Card variant="glass" style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)'
            }}>
              <div style={{
                color: '#ff6b6b',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Icon name="warning" size={18} color="#ff6b6b" />
                <span>{error}</span>
              </div>
            </Card>
          )}

          {analysisResults && (
            <Card variant="glass" style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}>
                <Icon name="info" size={16} style={{ marginRight: 6 }} /> Quick Tips
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '14px',
                color: theme === 'dark' ? '#cccccc' : '#666666',
                lineHeight: '1.5'
              }}>
                <li>Paste any code snippet for instant analysis</li>
                <li>Choose from predefined prompts or write custom ones</li>
                <li>Save useful analyses as snippets for later</li>
                <li>Works with 15+ programming languages</li>
              </ul>
              </div>
            </Card>
          )}
          
        </div>
        
      </div>
    
  );
};
