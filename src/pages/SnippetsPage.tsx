import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SnippetService } from '../services/snippetService';
import { SnippetForm } from '../components/SnippetForm';
import { Button, Card, Input, Badge } from '../components/ui';
import type { Snippet } from '../store/types';

interface SnippetsPageProps {
  onEditSnippet?: (snippet: Snippet) => void;
}

export const SnippetsPage: React.FC<SnippetsPageProps> = ({ onEditSnippet }) => {
  const { snippets, theme, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  useEffect(() => {
    if (user && snippets.length === 0) {
      loadSnippets();
    }
  }, [user]);

  const loadSnippets = async () => {
    setLoading(true);
    setError(null);
    const result = await SnippetService.loadSnippets();
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleDeleteSnippet = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    const result = await SnippetService.deleteSnippet(id);
    if (result.error) {
      setError(result.error);
    }
  };

  const handleCreateSnippet = () => {
    setEditingSnippet(null);
    setShowForm(true);
  };

  const handleEditSnippetInfo = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setShowForm(true);
  };

  const handleOpenSnippet = (snippet: Snippet) => {
    if (onEditSnippet) {
      onEditSnippet(snippet);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingSnippet(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSnippet(null);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown date';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      
      return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      csharp: '#239120',
      go: '#00add8',
      rust: '#ce422b',
      php: '#777bb4',
      ruby: '#cc342d',
      html: '#e34f26',
      css: '#1572b6',
      json: '#000000',
      sql: '#336791',
      bash: '#4eaa25',
    };
    return colors[language.toLowerCase()] || '#6b7280';
  };

  // Filter and sort snippets
  const filteredSnippets = snippets
    .filter(snippet => {
      const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           snippet.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const uniqueLanguages = Array.from(new Set(snippets.map(s => s.language)));

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700',
            color: theme === 'dark' ? '#ffffff' : '#000000',
          }}>
            Code Snippets
          </h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            color: theme === 'dark' ? '#cccccc' : '#666666',
          }}>
            Manage and organize your code snippets
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleCreateSnippet}
          leftIcon="✨"
        >
          New Snippet
        </Button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <Input
          type="text"
          placeholder="Search snippets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon="🔍"
          style={{
            flex: 1,
            minWidth: '200px'
          }}
        />

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            background: theme === 'dark' 
              ? 'rgba(15, 15, 35, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            border: theme === 'dark'
              ? '1px solid rgba(102, 126, 234, 0.2)'
              : '1px solid rgba(118, 75, 162, 0.2)',
            borderRadius: '8px',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            backdropFilter: 'blur(10px)',
          }}
        >
          <option value="all">All Languages</option>
          {uniqueLanguages.map(lang => (
            <option key={lang} value={lang}>
              {SnippetService.getLanguageLabel(lang)}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'title')}
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            background: theme === 'dark' 
              ? 'rgba(15, 15, 35, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            border: theme === 'dark'
              ? '1px solid rgba(102, 126, 234, 0.2)'
              : '1px solid rgba(118, 75, 162, 0.2)',
            borderRadius: '8px',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            backdropFilter: 'blur(10px)',
          }}
        >
          <option value="updated">Last Updated</option>
          <option value="created">Date Created</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          color: '#ff6b6b',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: theme === 'dark' ? '#cccccc' : '#666666',
        }}>
          Loading snippets...
        </div>
      )}

      {/* Snippets Grid */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {filteredSnippets.map((snippet) => (
            <Card
              key={snippet.id}
              variant="glass"
              hoverable
              onClick={() => handleOpenSnippet(snippet)}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    lineHeight: '1.3',
                  }}>
                    {snippet.title}
                  </h3>
                  <Badge
                    variant="primary"
                    size="sm"
                    style={{
                      background: getLanguageColor(snippet.language),
                      color: '#ffffff'
                    }}
                  >
                    {SnippetService.getLanguageLabel(snippet.language)}
                  </Badge>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginLeft: '12px',
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSnippetInfo(snippet);
                    }}
                    style={{
                      padding: '6px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#667eea',
                    }}
                    title="Edit snippet info"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSnippet(snippet.id, snippet.title);
                    }}
                    style={{
                      padding: '6px',
                      background: 'rgba(255, 107, 107, 0.1)',
                      border: '1px solid rgba(255, 107, 107, 0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#ff6b6b',
                    }}
                    title="Delete snippet"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Code Preview */}
              <div style={{
                background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '12px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '12px',
                lineHeight: '1.4',
                color: theme === 'dark' ? '#e5e5e5' : '#333333',
                overflow: 'hidden',
                position: 'relative',
                maxHeight: '80px',
              }}>
                <pre style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {snippet.code.slice(0, 150)}
                  {snippet.code.length > 150 && '...'}
                </pre>
                {snippet.code.length > 150 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    background: theme === 'dark' 
                      ? 'linear-gradient(transparent, rgba(0, 0, 0, 0.3))'
                      : 'linear-gradient(transparent, rgba(0, 0, 0, 0.05))',
                  }} />
                )}
              </div>

              {/* Footer */}
              <div style={{
                fontSize: '12px',
                color: theme === 'dark' ? '#888888' : '#999999',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>Updated: {formatDate(snippet.updatedAt)}</span>
                {snippet.analysisResults && (
                  <span style={{
                    padding: '2px 6px',
                    background: 'rgba(0, 245, 255, 0.1)',
                    color: '#00f5ff',
                    borderRadius: '3px',
                    fontSize: '11px',
                  }}>
                    Analyzed
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSnippets.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: theme === 'dark' ? '#cccccc' : '#666666',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '8px',
            color: theme === 'dark' ? '#ffffff' : '#000000',
          }}>
            {searchTerm || selectedLanguage !== 'all' ? 'No snippets found' : 'No snippets yet'}
          </h3>
          <p style={{ marginBottom: '24px' }}>
            {searchTerm || selectedLanguage !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first code snippet to get started'
            }
          </p>
          {(!searchTerm && selectedLanguage === 'all') && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateSnippet}
              leftIcon="✨"
            >
              Create First Snippet
            </Button>
          )}
        </div>
      )}

      {/* Snippet Form Modal */}
      {showForm && (
        <SnippetForm
          snippet={editingSnippet}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};
