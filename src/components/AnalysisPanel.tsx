import { useState } from 'react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../services/geminiService';
import type { AnalysisResult } from '../store/types';

interface AnalysisPanelProps {
  onJumpToLine?: (line: number) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onJumpToLine }) => {
  const { 
    currentSnippet, 
    analysisResults, 
    setAnalysisResults, 
    isAnalyzing, 
    setAnalyzing,
    theme 
  } = useStore();
  
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeCode = async () => {
    if (!currentSnippet) return;

    setAnalyzing(true);
    setError(null);

    const result = await GeminiService.analyzeCode({
      code: currentSnippet.code,
      language: currentSnippet.language,
      filename: currentSnippet.title
    });

    if (result.error) {
      setError(result.error);
      setAnalysisResults([]);
    } else {
      setAnalysisResults(result.data || []);
    }

    setAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'syntax': return '⚠️';
      case 'logic': return '🐛';
      case 'security': return '🔒';
      case 'performance': return '⚡';
      default: return '💡';
    }
  };

  const isGeminiAvailable = GeminiService.isAvailable();

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme === 'dark' ? '#252526' : '#f8f9fa',
      border: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
      borderRadius: '8px',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
        backgroundColor: theme === 'dark' ? '#2d2d30' : '#ffffff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600',
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }}>
            🤖 AI Analysis
          </h3>
          
          {currentSnippet && (
            <button
              onClick={handleAnalyzeCode}
              disabled={isAnalyzing || !isGeminiAvailable}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: isGeminiAvailable ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isAnalyzing || !isGeminiAvailable) ? 'not-allowed' : 'pointer',
                opacity: (isAnalyzing || !isGeminiAvailable) ? 0.6 : 1,
              }}
              title={!isGeminiAvailable ? 'Gemini API key required' : 'Analyze code with AI'}
            >
              {isAnalyzing ? '🔄 Analyzing...' : '🔍 Analyze'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {!isGeminiAvailable && (
          <div style={{
            padding: '16px',
            backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff3cd',
            color: theme === 'dark' ? '#ffc107' : '#856404',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            <strong>⚠️ AI Features Disabled</strong>
            <p style={{ margin: '8px 0 0 0' }}>
              Add your Gemini API key to the .env file to enable AI-powered code analysis.
            </p>
          </div>
        )}

        {!currentSnippet && (
          <div style={{
            textAlign: 'center',
            color: theme === 'dark' ? '#cccccc' : '#6c757d',
            padding: '40px 20px',
          }}>
            <p>Select a snippet to analyze</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: theme === 'dark' ? '#5a2d2d' : '#f8d7da',
            color: theme === 'dark' ? '#ff6b6b' : '#721c24',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            <strong>Analysis Error:</strong> {error}
          </div>
        )}

        {currentSnippet && analysisResults.length === 0 && !isAnalyzing && !error && (
          <div style={{
            textAlign: 'center',
            color: theme === 'dark' ? '#cccccc' : '#6c757d',
            padding: '40px 20px',
          }}>
            <p>Click "Analyze" to check your code for issues</p>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div>
            <div style={{
              marginBottom: '16px',
              fontSize: '14px',
              color: theme === 'dark' ? '#cccccc' : '#6c757d',
            }}>
              Found {analysisResults.length} issue{analysisResults.length !== 1 ? 's' : ''}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analysisResults.map((result) => (
                <div
                  key={result.id}
                  style={{
                    padding: '12px',
                    backgroundColor: theme === 'dark' ? '#3a3a3a' : '#ffffff',
                    border: `1px solid ${getSeverityColor(result.severity)}`,
                    borderLeft: `4px solid ${getSeverityColor(result.severity)}`,
                    borderRadius: '6px',
                    cursor: onJumpToLine ? 'pointer' : 'default',
                  }}
                  onClick={() => onJumpToLine?.(result.line)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {getTypeIcon(result.type)}
                    </span>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: getSeverityColor(result.severity),
                            textTransform: 'uppercase',
                          }}
                        >
                          {result.severity}
                        </span>
                        
                        <span
                          style={{
                            fontSize: '12px',
                            color: theme === 'dark' ? '#cccccc' : '#6c757d',
                            textTransform: 'capitalize',
                          }}
                        >
                          {result.type}
                        </span>
                        
                        <span
                          style={{
                            fontSize: '12px',
                            color: theme === 'dark' ? '#cccccc' : '#6c757d',
                          }}
                        >
                          Line {result.line}
                        </span>
                      </div>
                      
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        lineHeight: '1.4',
                      }}>
                        {result.message}
                      </p>
                      
                      {result.suggestion && (
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: theme === 'dark' ? '#a0a0a0' : '#666666',
                          fontStyle: 'italic',
                          lineHeight: '1.3',
                        }}>
                          💡 {result.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
