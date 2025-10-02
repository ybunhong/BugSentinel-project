import { useStore } from '../store/useStore';
import { PreferencesService } from '../services/preferencesService';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useStore();

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Sync theme preference to backend
    await PreferencesService.syncTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: '500',
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #ffd700, #ffed4e)'
          : 'linear-gradient(135deg, #4a5568, #2d3748)',
        color: theme === 'dark' ? '#000000' : '#ffffff',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        boxShadow: theme === 'dark'
          ? '0 4px 15px rgba(255, 215, 0, 0.3)'
          : '0 4px 15px rgba(74, 85, 104, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 6px 20px rgba(255, 215, 0, 0.4)'
          : '0 6px 20px rgba(74, 85, 104, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 4px 15px rgba(255, 215, 0, 0.3)'
          : '0 4px 15px rgba(74, 85, 104, 0.3)';
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
      <span style={{ fontSize: '12px' }}>
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};
