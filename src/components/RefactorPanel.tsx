import { useState } from 'react';
import { useStore } from '../store/useStore';
import { GeminiService, type RefactorSuggestion } from '../services/geminiService';
import { SnippetService } from '../services/snippetService';

interface RefactorPanelProps {
  onCodeChange?: (code: string) => void;
}

export const RefactorPanel: React.FC<RefactorPanelProps> = ({ onCodeChange }) => {
  const { currentSnippet, analysisResults, theme } = useStore();
  const [refactorSuggestion, setRefactorSuggestion] = useState<RefactorSuggestion | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const handleGetRefactoringSuggestions = async () => {
    if (!currentSnippet) return;

    setIsRefactoring(true);
    setError(null);

    const result = await GeminiService.getRefactoringSuggestions({
      code: currentSnippet.code,
      language: currentSnippet.language,
      issues: analysisResults,
    });

    if (result.error) {
      setError(result.error);
      setRefactorSuggestion(null);
    } else {
      setRefactorSuggestion(result.data);
      setShowDiff(true);
    }

    setIsRefactoring(false);
  };

  const handleApplyRefactoring = async () => {
    if (!refactorSuggestion || !currentSnippet) return;

    // Update the code in the editor
    onCodeChange?.(refactorSuggestion.refactoredCode);

    // Save the refactored code to the snippet
    await SnippetService.updateSnippet(currentSnippet.id, {
      code: refactorSuggestion.refactoredCode,
    });

    // Clear the suggestion
    setRefactorSuggestion(null);
    setShowDiff(false);
  };

  const handleRejectRefactoring = () => {
    setRefactorSuggestion(null);
    setShowDiff(false);
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
            ✨ AI Refactoring
          </h3>
          
          {currentSnippet && !refactorSuggestion && (
            <button
              onClick={handleGetRefactoringSuggestions}
              disabled={isRefactoring || !isGeminiAvailable}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: isGeminiAvailable ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isRefactoring || !isGeminiAvailable) ? 'not-allowed' : 'pointer',
                opacity: (isRefactoring || !isGeminiAvailable) ? 0.6 : 1,
              }}
              title={!isGeminiAvailable ? 'Gemini API key required' : 'Get refactoring suggestions'}
            >
              {isRefactoring ? '🔄 Refactoring...' : '✨ Refactor'}
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
              Add your Gemini API key to enable AI-powered refactoring.
            </p>
          </div>
        )}

        {!currentSnippet && (
          <div style={{
            textAlign: 'center',
            color: theme === 'dark' ? '#cccccc' : '#6c757d',
            padding: '40px 20px',
          }}>
            <p>Select a snippet to refactor</p>
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
            <strong>Refactoring Error:</strong> {error}
          </div>
        )}

        {currentSnippet && !refactorSuggestion && !isRefactoring && !error && (
          <div style={{
            textAlign: 'center',
            color: theme === 'dark' ? '#cccccc' : '#6c757d',
            padding: '40px 20px',
          }}>
            <p>Click "Refactor" to get AI-powered code improvements</p>
            {analysisResults.length > 0 && (
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Found {analysisResults.length} issue{analysisResults.length !== 1 ? 's' : ''} to address
              </p>
            )}
          </div>
        )}

        {refactorSuggestion && (
          <div>
            {/* Explanation */}
            <div style={{
              padding: '16px',
              backgroundColor: theme === 'dark' ? '#3a3a3a' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
              borderRadius: '6px',
              marginBottom: '16px',
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: theme === 'dark' ? '#ffffff' : '#000000',
              }}>
                💡 Refactoring Explanation
              </h4>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: theme === 'dark' ? '#cccccc' : '#666666',
                lineHeight: '1.4',
              }}>
                {refactorSuggestion.explanation}
              </p>
            </div>

            {/* Improvements */}
            {refactorSuggestion.improvements.length > 0 && (
              <div style={{
                padding: '16px',
                backgroundColor: theme === 'dark' ? '#3a3a3a' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
                borderRadius: '6px',
                marginBottom: '16px',
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                }}>
                  🚀 Improvements Made
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#cccccc' : '#666666',
                }}>
                  {refactorSuggestion.improvements.map((improvement, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code Diff */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#3a3a3a' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
              borderRadius: '6px',
              marginBottom: '16px',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                }}>
                  📝 Code Changes
                </h4>
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    color: theme === 'dark' ? '#cccccc' : '#666666',
                    border: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  {showDiff ? 'Hide' : 'Show'} Diff
                </button>
              </div>

              {showDiff && (
                <div style={{ padding: '16px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      color: '#dc3545',
                      fontWeight: '600',
                    }}>
                      - Original Code
                    </h5>
                    <pre style={{
                      margin: 0,
                      padding: '12px',
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
                      border: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'Monaco, Consolas, monospace',
                      color: theme === 'dark' ? '#cccccc' : '#333333',
                      overflow: 'auto',
                      maxHeight: '200px',
                    }}>
                      {refactorSuggestion.originalCode}
                    </pre>
                  </div>

                  <div>
                    <h5 style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      color: '#28a745',
                      fontWeight: '600',
                    }}>
                      + Refactored Code
                    </h5>
                    <pre style={{
                      margin: 0,
                      padding: '12px',
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
                      border: `1px solid ${theme === 'dark' ? '#3e3e42' : '#dee2e6'}`,
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'Monaco, Consolas, monospace',
                      color: theme === 'dark' ? '#cccccc' : '#333333',
                      overflow: 'auto',
                      maxHeight: '200px',
                    }}>
                      {refactorSuggestion.refactoredCode}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleRejectRefactoring}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ❌ Reject
              </button>
              <button
                onClick={handleApplyRefactoring}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ✅ Apply Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
