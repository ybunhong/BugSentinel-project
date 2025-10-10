import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Background decoration */}
    <div style={{
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
      animation: 'float 6s ease-in-out infinite'
    }} />

    <Card
      variant="glass"
      padding="xl"
      hoverable
      style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
          lineHeight: 1.2
        }}>
          Welcome to BugSentinel
        </h1>

        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '2px',
          margin: '1.5rem auto',
          maxWidth: '120px'
        }} />
      </div>

      {/* Description Section */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255, 255, 255, 0.9)',
          lineHeight: 1.6,
          marginBottom: '2rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Analyze, refactor, and save your code snippets with AI-powered insights.
          Detect bugs, improve code quality, and build your personal snippet library.
        </p>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {[
            {
              icon: '🔍',
              title: 'AI Code Analysis',
              description: 'Intelligent bug detection and performance insights'
            },
            {
              icon: '🔧',
              title: 'Smart Refactoring',
              description: 'AI-powered code improvements and optimization'
            },
            {
              icon: '💾',
              title: 'Snippet Library',
              description: 'Save and organize your code snippets securely'
            },
            {
              icon: '🔐',
              title: 'Secure Auth',
              description: 'Protected access with user authentication'
            }
          ].map((feature, index) => (
            <Card
              key={index}
              variant="glass"
              padding="lg"
              hoverable
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
                opacity: 0.9
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '0.5rem'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.5
              }}>
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => window.location.href = '#/analysis'}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: '50px',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          🚀 Get Started
        </Button>

        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.7)',
          marginTop: '1rem'
        }}>
          Ready to elevate your coding experience?
        </p>
      </div>
    </Card>

    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
      }
    `}</style>
  </div>
);
