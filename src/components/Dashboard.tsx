import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SnippetService } from '../services/snippetService';
import { PreferencesService } from '../services/preferencesService';
import { GeminiService } from '../services/geminiService';
import { SupabaseService } from '../services/supabaseService';
import { LocalStorageService } from '../services/localStorageService';
import { CodeEditor } from './CodeEditor';
import { SnippetList } from './SnippetList';
import { SnippetForm } from './SnippetForm';
import { AnalysisPanel } from './AnalysisPanel';
import { RefactorPanel } from './RefactorPanel';
import { ThemeToggle } from './ThemeToggle';
import { ConnectionStatus } from './ConnectionStatus';
import type { Snippet } from '../store/types';

export const Dashboard: React.FC = () => {
  const { currentSnippet, theme, sidebarOpen, setSidebarOpen } = useStore();
  const [showSnippetForm, setShowSnippetForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [code, setCode] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'analysis' | 'refactor'>('analysis');
  const [jumpToLineFunction, setJumpToLineFunction] = useState<((line: number) => void) | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Initialize services on component mount
  useEffect(() => {
    GeminiService.initialize();
    SnippetService.initializeSync();
    
    // Cleanup on unmount
    return () => {
      SnippetService.cleanupSync();
    };
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowRightPanel(false);
      } else {
        setShowRightPanel(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update code when current snippet changes
  useEffect(() => {
    if (currentSnippet) {
      setCode(currentSnippet.code);
      setHasUnsavedChanges(false);
    } else {
      setCode('// Select a snippet to start editing...\n');
      setHasUnsavedChanges(false);
      setJumpToLineFunction(undefined); // Reset jump function when no snippet
    }
  }, [currentSnippet]);

  const handleSelectSnippet = (snippet: Snippet) => {
    if (hasUnsavedChanges && currentSnippet) {
      const shouldDiscard = confirm('You have unsaved changes. Do you want to discard them?');
      if (!shouldDiscard) {
        return;
      }
    }
    SnippetService.setCurrentSnippet(snippet);
    // Sync last opened snippet
    PreferencesService.syncLastSnippet(snippet.id);
  };

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

  const handleCreateSnippet = () => {
    setEditingSnippet(null);
    setShowSnippetForm(true);
  };

  const handleEditSnippet = () => {
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    try {
      // Sign out from Supabase
      await SupabaseService.signOut();
      
      // Clear local storage
      LocalStorageService.clearAllLocalData();
      
      // Clear store
      const store = useStore.getState();
      store.setUser(null);
      store.setSnippets([]);
      store.setCurrentSnippet(null);
      
      // Cleanup sync service
      SnippetService.cleanupSync();
      
      console.log('✅ Successfully logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        height: isMobile ? '60px' : '70px',
        background: theme === 'dark' 
          ? 'rgba(15, 15, 35, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: theme === 'dark' 
          ? '1px solid rgba(102, 126, 234, 0.2)'
          : '1px solid rgba(118, 75, 162, 0.2)',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 16px' : '0 24px',
        gap: isMobile ? '12px' : '20px',
        boxShadow: theme === 'dark'
          ? '0 8px 32px rgba(102, 126, 234, 0.1)'
          : '0 8px 32px rgba(118, 75, 162, 0.1)',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={toggleSidebar}
          style={{
            padding: '12px',
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #667eea, #764ba2)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          }}
          title="Toggle sidebar"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          ☰
        </button>

        <h1 style={{ 
          margin: 0, 
          fontSize: isMobile ? '18px' : '24px', 
          fontWeight: '700',
          backgroundImage: theme === 'dark'
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : 'linear-gradient(135deg, #ffffff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px'
        }}>
          {isMobile ? 'BugSentinel' : 'BugSentinel ✨'}
        </h1>

        <div style={{ flex: 1 }} />

        {/* User Info & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '12px',
        }}>
          {/* Connection Status */}
          <ConnectionStatus />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              background: 'rgba(255, 107, 107, 0.1)',
              color: '#ff6b6b',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            title="Sign out"
          >
            {isMobile ? '🚪' : '🚪 Logout'}
          </button>
        </div>

        {/* Mobile AI Panel Toggle */}
        {isMobile && (
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
          >
            🤖 AI
          </button>
        )}

        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '8px' : '12px', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {currentSnippet && (
            <>
              {!isMobile && (
                <span style={{ 
                  fontSize: '14px', 
                  color: theme === 'dark' ? '#cccccc' : '#ffffff',
                  fontWeight: '500',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentSnippet.title}
                </span>
              )}
              
              {hasUnsavedChanges && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#ffc107',
                  fontWeight: '500'
                }}>
                  • Unsaved
                </span>
              )}

              <button
                onClick={handleEditSnippet}
                style={{
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '500',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isMobile ? '✏️' : '✏️ Edit Info'}
              </button>

              <button
                onClick={handleSaveCode}
                disabled={!hasUnsavedChanges || saving}
                style={{
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '500',
                  background: hasUnsavedChanges 
                    ? 'linear-gradient(135deg, #00f5ff, #0099ff)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: hasUnsavedChanges 
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  cursor: (!hasUnsavedChanges || saving) ? 'not-allowed' : 'pointer',
                  opacity: (!hasUnsavedChanges || saving) ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  boxShadow: hasUnsavedChanges ? '0 4px 15px rgba(0, 245, 255, 0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (hasUnsavedChanges && !saving) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 245, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasUnsavedChanges && !saving) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 245, 255, 0.3)';
                  }
                }}
              >
                {isMobile 
                  ? (saving ? '💾' : hasUnsavedChanges ? '💾' : '✅')
                  : (saving ? '💾 Saving...' : hasUnsavedChanges ? '💾 Save' : '✅ Saved')
                }
              </button>
            </>
          )}

          <button
            onClick={handleCreateSnippet}
            style={{
              padding: isMobile ? '8px 16px' : '10px 20px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            }}
          >
            {isMobile ? '✨ New' : '✨ New Snippet'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{
            width: isMobile ? '100%' : '320px',
            height: isMobile ? '200px' : 'auto',
            background: theme === 'dark' 
              ? 'rgba(15, 15, 35, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRight: !isMobile ? (theme === 'dark'
              ? '1px solid rgba(102, 126, 234, 0.2)'
              : '1px solid rgba(118, 75, 162, 0.2)') : 'none',
            borderBottom: isMobile ? (theme === 'dark'
              ? '1px solid rgba(102, 126, 234, 0.2)'
              : '1px solid rgba(118, 75, 162, 0.2)') : 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme === 'dark'
              ? (isMobile ? '0 8px 32px rgba(102, 126, 234, 0.1)' : '8px 0 32px rgba(102, 126, 234, 0.1)')
              : (isMobile ? '0 8px 32px rgba(118, 75, 162, 0.1)' : '8px 0 32px rgba(118, 75, 162, 0.1)'),
          }}>
            <SnippetList onSelectSnippet={handleSelectSnippet} />
          </aside>
        )}

        {/* Editor Area */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0,
          background: theme === 'dark'
            ? 'rgba(26, 26, 46, 0.5)'
            : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          margin: isMobile ? '8px' : '16px',
          borderRadius: isMobile ? '16px' : '20px',
          border: theme === 'dark'
            ? '1px solid rgba(102, 126, 234, 0.2)'
            : '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden',
        }}>
          {currentSnippet ? (
            <div style={{ flex: 1, padding: isMobile ? '16px' : '24px' }}>
              <CodeEditor
                value={code}
                language={currentSnippet.language}
                onChange={handleCodeChange}
                onJumpToLine={setJumpToLineFunction}
              />
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#ffffff',
              textAlign: 'center',
              padding: '60px',
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
              }}>
                🚀
              </div>
              <h2 style={{ 
                fontSize: '32px', 
                marginBottom: '16px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-1px'
              }}>
                Ready to debug? ✨
              </h2>
              <p style={{ 
                fontSize: isMobile ? '16px' : '18px', 
                marginBottom: isMobile ? '24px' : '32px', 
                maxWidth: isMobile ? '300px' : '500px',
                lineHeight: '1.6',
                opacity: '0.9'
              }}>
                Select a snippet from the sidebar to start editing, or create a new one to get started with AI-powered code analysis! 🔥
              </p>
              <button
                onClick={handleCreateSnippet}
                style={{
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
                }}
              >
                ✨ Create Your First Snippet
              </button>
            </div>
          )}
        </main>

        {/* AI Analysis Panel */}
        {showRightPanel && (
          <aside style={{
            width: isMobile ? '100%' : '380px',
            height: isMobile ? '300px' : 'auto',
            background: theme === 'dark' 
              ? 'rgba(15, 15, 35, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderLeft: !isMobile ? (theme === 'dark'
              ? '1px solid rgba(102, 126, 234, 0.2)'
              : '1px solid rgba(118, 75, 162, 0.2)') : 'none',
            borderTop: isMobile ? (theme === 'dark'
              ? '1px solid rgba(102, 126, 234, 0.2)'
              : '1px solid rgba(118, 75, 162, 0.2)') : 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme === 'dark'
              ? (isMobile ? '0 -8px 32px rgba(102, 126, 234, 0.1)' : '-8px 0 32px rgba(102, 126, 234, 0.1)')
              : (isMobile ? '0 -8px 32px rgba(118, 75, 162, 0.1)' : '-8px 0 32px rgba(118, 75, 162, 0.1)'),
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
              backdropFilter: 'blur(10px)',
            }}>
              <button
                onClick={() => setRightPanelTab('analysis')}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: rightPanelTab === 'analysis' 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'transparent',
                  color: rightPanelTab === 'analysis' ? '#ffffff' : (theme === 'dark' ? '#cccccc' : '#666666'),
                  border: 'none',
                  borderRadius: rightPanelTab === 'analysis' ? '12px 12px 0 0' : '0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: rightPanelTab === 'analysis' ? '0 4px 15px rgba(102, 126, 234, 0.2)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (rightPanelTab !== 'analysis') {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (rightPanelTab !== 'analysis') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                🔍 Analysis
              </button>
              <button
                onClick={() => setRightPanelTab('refactor')}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: rightPanelTab === 'refactor' 
                    ? 'linear-gradient(135deg, #ff6b6b, #ffa500)'
                    : 'transparent',
                  color: rightPanelTab === 'refactor' ? '#ffffff' : (theme === 'dark' ? '#cccccc' : '#666666'),
                  border: 'none',
                  borderRadius: rightPanelTab === 'refactor' ? '12px 12px 0 0' : '0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: rightPanelTab === 'refactor' ? '0 4px 15px rgba(255, 107, 107, 0.2)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (rightPanelTab !== 'refactor') {
                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (rightPanelTab !== 'refactor') {
                    e.currentTarget.style.background = 'transparent';
                  }
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
          </aside>
        )}
      </div>

      {/* Snippet Form Modal */}
      {showSnippetForm && (
        <SnippetForm
          snippet={editingSnippet}
          onSave={handleSnippetFormSave}
          onCancel={handleSnippetFormCancel}
        />
      )}
    </div>
  );
};
