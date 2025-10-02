import { useState, useEffect } from 'react';
import { SnippetService } from '../services/snippetService';
import type { Snippet } from '../store/types';

interface SnippetFormProps {
  snippet?: Snippet | null;
  onSave: (snippet: Snippet) => void;
  onCancel: () => void;
}

export const SnippetForm: React.FC<SnippetFormProps> = ({ 
  snippet, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supportedLanguages = SnippetService.getSupportedLanguages();
  const isEditing = !!snippet;

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setLanguage(snippet.language);
    } else {
      // Generate default title for new snippet
      setTitle(SnippetService.generateDefaultTitle(language));
    }
  }, [snippet, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && snippet) {
        // Update existing snippet
        const result = await SnippetService.updateSnippet(snippet.id, {
          title: title.trim(),
          language,
        });
        
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          onSave(result.data);
        }
      } else {
        // Create new snippet
        const result = await SnippetService.createSnippet({
          title: title.trim(),
          language,
          code: '// Start coding here...\n',
        });
        
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          onSave(result.data);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Snippet form error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!isEditing) {
      // Update title for new snippets when language changes
      setTitle(SnippetService.generateDefaultTitle(newLanguage));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
          {isEditing ? 'Edit Snippet' : 'Create New Snippet'}
        </h3>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="title" style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter snippet title..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="language" style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Language *
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
                boxSizing: 'border-box',
              }}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end' 
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || !title.trim()) ? 'not-allowed' : 'pointer',
                opacity: (loading || !title.trim()) ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
