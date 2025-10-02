import { useState } from 'react';
import { useStore } from '../store/useStore';
import { AuthForm } from '../components/AuthForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button, Card } from '../components/ui';
import { colors } from '../styles/design-system';

export const AuthPage: React.FC = () => {
  const { theme } = useStore();
  const [currentView, setCurrentView] = useState<'welcome' | 'auth'>('welcome');

  return (
    <div 
      className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme === 'dark' 
          ? 'rgba(15, 15, 35, 0.8)'
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: theme === 'dark' 
          ? '1px solid rgba(102, 126, 234, 0.2)'
          : '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '28px', 
          fontWeight: '700',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : 'linear-gradient(135deg, #ffffff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px'
        }}>
          BugSentinel ✨
        </h1>
        
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        {currentView === 'welcome' ? (
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
            color: '#ffffff',
          }}>
            {/* Hero Section */}
            <div style={{
              marginBottom: '40px',
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}>
                🐛
              </div>
              
              <h2 style={{
                fontSize: window.innerWidth < 768 ? '28px' : '36px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: '1.2',
              }}>
                BugSentinel
              </h2>
              
              <p style={{
                fontSize: window.innerWidth < 768 ? '16px' : '18px',
                marginBottom: '24px',
                opacity: '0.8',
                lineHeight: '1.5',
                fontWeight: '400',
              }}>
                AI-powered code analysis and bug detection
              </p>
            </div>

            {/* Features */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: window.innerWidth < 768 ? '16px' : '32px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔍</div>
                <p style={{ fontSize: '14px', opacity: '0.7', margin: 0 }}>Analysis</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>✨</div>
                <p style={{ fontSize: '14px', opacity: '0.7', margin: 0 }}>Refactor</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📱</div>
                <p style={{ fontSize: '14px', opacity: '0.7', margin: 0 }}>Offline</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => setCurrentView('auth')}
              style={{
                background: colors.gradients.primary,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}
            >
              Get Started 🚀
            </Button>
          </div>
        ) : (
          <Card
            variant="glass"
            padding="xl"
            style={{
              width: '100%',
              maxWidth: '400px'
            }}
          >
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
            }}>
              <button
                onClick={() => setCurrentView('welcome')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme === 'dark' ? '#cccccc' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '16px',
                  opacity: '0.7',
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                ← Back to Welcome
              </button>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff',
                margin: '0 0 8px 0',
              }}>
                Sign In
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: theme === 'dark' ? '#cccccc' : '#ffffff',
                opacity: '0.8',
                margin: 0,
              }}>
                Sign in to access your code snippets
              </p>
            </div>

            <AuthForm />
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        color: theme === 'dark' ? '#cccccc' : '#ffffff',
        opacity: '0.7',
        fontSize: '14px',
      }}>
        <p style={{ margin: 0 }}>
          Built with ❤️ using React, TypeScript, and AI
        </p>
      </footer>
    </div>
  );
};
