import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../services/geminiService';
import { SnippetService } from '../services/snippetService';
import { Layout } from '../components/Layout';
import { SnippetsPage } from './SnippetsPage';
import { CodeAnalysisPage } from './CodeAnalysisPage';
import { SettingsPage } from './SettingsPage';
import { CodeEditor } from '../components/CodeEditor';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { RefactorPanel } from '../components/RefactorPanel';
import { SnippetForm } from '../components/SnippetForm';
import type { Snippet } from '../store/types';

export const MainDashboard: React.FC = () => {
  const { currentSnippet, theme } = useStore();
  const [currentPage, setCurrentPage] = useState('analysis');
  const [showSnippetForm, setShowSnippetForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [code, setCode] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'analysis' | 'refactor'>('analysis');
  const [jumpToLineFunction, setJumpToLineFunction] = useState<((line: number) => void) | undefined>(undefined);

  // Initialize services
  useEffect(() => {
    GeminiService.initialize();
    SnippetService.initializeSync();
    
    return () => {
      SnippetService.cleanupSync();
    };
  }, []);

  // Update code when current snippet changes
  useEffect(() => {
    if (currentSnippet) {
      setCode(currentSnippet.code);
      setHasUnsavedChanges(false);
    } else {
      setCode('// Select a snippet to start editing...\n');
      setHasUnsavedChanges(false);
      setJumpToLineFunction(undefined);
    }
  }, [currentSnippet]);

  const handleCodeChange = (newCode: string | undefined) => {
    const codeValue = newCode || '';
    setCode(codeValue);
    
    if (currentSnippet && codeValue !== currentSnippet.code) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveCode = async () => {
    if (!currentSnippet || !hasUnsavedChanges) return;

    setSaving(true);
    const result = await SnippetService.updateSnippet(currentSnippet.id, {
      code: code,
    });

    if (result.error) {
      alert('Failed to save: ' + result.error);
    } else {
      setHasUnsavedChanges(false);
    }
    setSaving(false);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    SnippetService.setCurrentSnippet(snippet);
    setCurrentPage('editor');
  };


  const handleEditSnippetInfo = () => {
    if (currentSnippet) {
      setEditingSnippet(currentSnippet);
      setShowSnippetForm(true);
    }
  };

  const handleSnippetFormSave = (snippet: Snippet) => {
    setShowSnippetForm(false);
    setEditingSnippet(null);
    SnippetService.setCurrentSnippet(snippet);
  };

  const handleSnippetFormCancel = () => {
    setShowSnippetForm(false);
    setEditingSnippet(null);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'snippets':
        return <SnippetsPage onEditSnippet={handleEditSnippet} />;
      
      case 'analysis':
        return <CodeAnalysisPage />;
      
      case 'settings':
        return <SettingsPage />;
      
      case 'editor':
        return (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Editor Header */}
            {currentSnippet && (
              <div style={{
                padding: '16px 24px',
                background: theme === 'dark' 
                  ? 'rgba(15, 15, 35, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                borderBottom: theme === 'dark'
                  ? '1px solid rgba(102, 126, 234, 0.2)'
                  : '1px solid rgba(118, 75, 162, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    margin: '0 0 4px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                  }}>
                    {currentSnippet.title}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: theme === 'dark' ? '#cccccc' : '#666666',
                  }}>
                    <span>{SnippetService.getLanguageLabel(currentSnippet.language)}</span>
                    {hasUnsavedChanges && (
                      <span style={{ color: '#ffc107' }}>• Unsaved changes</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleEditSnippetInfo}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ✏️ Edit Info
                  </button>

                  <button
                    onClick={handleSaveCode}
                    disabled={!hasUnsavedChanges || saving}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: hasUnsavedChanges 
                        ? 'linear-gradient(135deg, #00f5ff, #0099ff)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: hasUnsavedChanges 
                        ? 'none'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      cursor: (!hasUnsavedChanges || saving) ? 'not-allowed' : 'pointer',
                      opacity: (!hasUnsavedChanges || saving) ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {saving ? '💾 Saving...' : hasUnsavedChanges ? '💾 Save' : '✅ Saved'}
                  </button>
                </div>
              </div>
            )}

            {/* Main Editor Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
            }}>
              {/* Code Editor */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
              }}>
                {currentSnippet ? (
                  <CodeEditor
                    value={code}
                    language={currentSnippet.language}
                    onChange={handleCodeChange}
                    onJumpToLine={setJumpToLineFunction}
                  />
                ) : (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    textAlign: 'center',
                    color: '#ffffff',
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '24px' }}>📝</div>
                    <h2 style={{
                      fontSize: '32px',
                      marginBottom: '16px',
                      fontWeight: '700',
                      color: '#ffffff',
                    }}>
                      Snippet Editor
                    </h2>
                    <p style={{
                      fontSize: '18px',
                      marginBottom: '32px',
                      opacity: '0.8',
                      maxWidth: '400px',
                    }}>
                      Select a snippet from the Snippets page to edit and analyze it.
                    </p>
                    <button
                      onClick={() => setCurrentPage('snippets')}
                      style={{
                        padding: '16px 32px',
                        fontSize: '16px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      📝 Go to Snippets
                    </button>
                  </div>
                )}
              </div>

              {/* AI Panel */}
              {currentSnippet && (
                <div style={{
                  width: '380px',
                  background: theme === 'dark' 
                    ? 'rgba(15, 15, 35, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderLeft: theme === 'dark'
                    ? '1px solid rgba(102, 126, 234, 0.2)'
                    : '1px solid rgba(118, 75, 162, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Tab Header */}
                  <div style={{
                    display: 'flex',
                    borderBottom: theme === 'dark'
                      ? '1px solid rgba(102, 126, 234, 0.2)'
                      : '1px solid rgba(118, 75, 162, 0.2)',
                    background: theme === 'dark' 
                      ? 'rgba(26, 26, 46, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                  }}>
                    <button
                      onClick={() => setRightPanelTab('analysis')}
                      style={{
                        flex: 1,
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: rightPanelTab === 'analysis' 
                          ? 'linear-gradient(135deg, #667eea, #764ba2)'
                          : 'transparent',
                        color: rightPanelTab === 'analysis' ? '#ffffff' : (theme === 'dark' ? '#cccccc' : '#666666'),
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      🔍 Analysis
                    </button>
                    <button
                      onClick={() => setRightPanelTab('refactor')}
                      style={{
                        flex: 1,
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: rightPanelTab === 'refactor' 
                          ? 'linear-gradient(135deg, #ff6b6b, #ffa500)'
                          : 'transparent',
                        color: rightPanelTab === 'refactor' ? '#ffffff' : (theme === 'dark' ? '#cccccc' : '#666666'),
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      ✨ Refactor
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    {rightPanelTab === 'analysis' ? (
                      <AnalysisPanel onJumpToLine={jumpToLineFunction} />
                    ) : (
                      <RefactorPanel onCodeChange={setCode} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return <CodeAnalysisPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPageContent()}
      
      {/* Snippet Form Modal */}
      {showSnippetForm && (
        <SnippetForm
          snippet={editingSnippet}
          onSave={handleSnippetFormSave}
          onCancel={handleSnippetFormCancel}
        />
      )}
    </Layout>
  );
};
