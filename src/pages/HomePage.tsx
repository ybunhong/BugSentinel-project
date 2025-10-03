import React from 'react';

export const HomePage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}>
    <h1 style={{ fontSize: 40, color: '#6366f1', marginBottom: 16 }}>Welcome to BugSentinel</h1>
    <p style={{ fontSize: 20, color: '#374151', maxWidth: 600, textAlign: 'center', marginBottom: 32 }}>
      Analyze, refactor, and save your code snippets with AI-powered insights. Detect bugs, improve code quality, and build your personal snippet library.
    </p>
    <p style={{ fontSize: 16, color: '#6366f1', marginBottom: 8 }}>Main Features:</p>
    <ul style={{ fontSize: 16, color: '#374151', listStyle: 'disc', marginLeft: 32, marginBottom: 24 }}>
      <li>AI code analysis & bug detection</li>
      <li>Refactoring suggestions & code diff</li>
      <li>Save snippets to your library</li>
      <li>Secure authentication for saving</li>
    </ul>
    <a href="#/analysis" style={{
      background: '#6366f1',
      color: '#fff',
      padding: '12px 32px',
      borderRadius: 8,
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: 18
    }}>Get Started</a>
  </div>
);
