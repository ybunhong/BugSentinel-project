import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SnippetService } from '../services/snippetService';
import { PreferencesService } from '../services/preferencesService';
import type { Snippet } from '../store/types';

interface SnippetListProps {
  onSelectSnippet: (snippet: Snippet) => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({ onSelectSnippet }) => {
  const { snippets, currentSnippet, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSnippets();
    }
  }, [user]);

  const loadSnippets = async () => {
    setLoading(true);
    setError(null);
    const result = await SnippetService.loadSnippets();
    if (result.error) {
      setError(result.error);
    } else {
      // After snippets are loaded, try to load the last opened snippet
      await PreferencesService.loadLastSnippet();
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
      console.error('Date formatting error:', error);
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
      rust: '#000000',
      php: '#777bb4',
      ruby: '#cc342d',
      html: '#e34f26',
      css: '#1572b6',
      json: '#000000',
      yaml: '#cb171e',
      markdown: '#083fa1',
    };
    return colors[language] || '#666666';
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to view your snippets.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            My Snippets ({snippets.length})
          </h3>
          <button
            onClick={loadSnippets}
            disabled={loading}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderBottom: '1px solid #dee2e6'
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '8px'
      }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Loading snippets...</p>
          </div>
        ) : snippets.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
            <p>No snippets yet.</p>
            <p style={{ fontSize: '14px' }}>Create your first snippet to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                style={{
                  padding: '12px',
                  backgroundColor: currentSnippet?.id === snippet.id ? '#e3f2fd' : '#ffffff',
                  border: `1px solid ${currentSnippet?.id === snippet.id ? '#2196f3' : '#dee2e6'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onSelectSnippet(snippet)}
                onMouseEnter={(e) => {
                  if (currentSnippet?.id !== snippet.id) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentSnippet?.id !== snippet.id) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {snippet.title}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: getLanguageColor(snippet.language),
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#6c757d', textTransform: 'capitalize' }}>
                        {snippet.language}
                      </span>
                    </div>
                    
                    <p style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '12px', 
                      color: '#6c757d',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {snippet.code.split('\n')[0] || 'Empty snippet'}
                    </p>
                    
                    <p style={{ 
                      margin: 0, 
                      fontSize: '11px', 
                      color: '#adb5bd' 
                    }}>
                      Updated: {formatDate(snippet.updatedAt)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSnippet(snippet.id, snippet.title);
                    }}
                    style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title="Delete snippet"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
