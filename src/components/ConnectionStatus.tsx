import { useState, useEffect } from 'react';
import { SyncService } from '../services/syncService';
import { GeminiService } from '../services/geminiService';
import { useStore } from '../store/useStore';

export const ConnectionStatus: React.FC = () => {
  const { theme } = useStore();
  const [connectionStatus, setConnectionStatus] = useState(SyncService.getConnectionStatus());
  const [rateLimitStatus, setRateLimitStatus] = useState(GeminiService.getRateLimitStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(SyncService.getConnectionStatus());
      setRateLimitStatus(GeminiService.getRateLimitStatus());
    };

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForceSync = async () => {
    if (connectionStatus.isOnline) {
      await SyncService.forceSyncNow();
      setConnectionStatus(SyncService.getConnectionStatus());
    }
  };

  const getStatusColor = () => {
    if (!connectionStatus.isOnline) return '#ff6b6b';
    if (connectionStatus.syncInProgress) return '#ffa500';
    if (connectionStatus.pendingChanges > 0) return '#ffc107';
    return '#28a745';
  };

  const getStatusText = () => {
    if (!connectionStatus.isOnline) return 'Offline';
    if (connectionStatus.syncInProgress) return 'Syncing...';
    if (connectionStatus.pendingChanges > 0) return `${connectionStatus.pendingChanges} pending`;
    return 'Synced';
  };

  const getStatusIcon = () => {
    if (!connectionStatus.isOnline) return '📴';
    if (connectionStatus.syncInProgress) return '🔄';
    if (connectionStatus.pendingChanges > 0) return '⏳';
    return '✅';
  };

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
    }}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '500',
          background: 'rgba(255, 255, 255, 0.1)',
          color: getStatusColor(),
          border: `1px solid ${getStatusColor()}`,
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <span>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </button>

      {showDetails && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          minWidth: '280px',
          background: theme === 'dark'
            ? 'rgba(15, 15, 35, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: theme === 'dark'
            ? '1px solid rgba(102, 126, 234, 0.2)'
            : '1px solid rgba(118, 75, 162, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: theme === 'dark'
            ? '0 8px 32px rgba(102, 126, 234, 0.2)'
            : '0 8px 32px rgba(118, 75, 162, 0.2)',
          zIndex: 1000,
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: theme === 'dark' ? '#ffffff' : '#000000',
          }}>
            Connection Status
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            color: theme === 'dark' ? '#cccccc' : '#666666',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Network:</span>
              <span style={{ color: connectionStatus.isOnline ? '#28a745' : '#ff6b6b' }}>
                {connectionStatus.isOnline ? '🌐 Online' : '📴 Offline'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sync Status:</span>
              <span style={{ color: getStatusColor() }}>
                {connectionStatus.syncInProgress ? '🔄 Syncing' : '✅ Ready'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Changes:</span>
              <span style={{ color: connectionStatus.pendingChanges > 0 ? '#ffc107' : '#28a745' }}>
                {connectionStatus.pendingChanges}
              </span>
            </div>

            <hr style={{
              border: 'none',
              borderTop: `1px solid ${theme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(118, 75, 162, 0.2)'}`,
              margin: '8px 0',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>AI Status:</span>
              <span style={{ color: GeminiService.isAvailable() ? '#28a745' : '#ff6b6b' }}>
                {GeminiService.isAvailable() ? '🤖 Available' : '❌ Disabled'}
              </span>
            </div>

            {GeminiService.isAvailable() && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>AI Requests Left:</span>
                <span style={{ 
                  color: rateLimitStatus.requestsRemaining > 5 ? '#28a745' : 
                        rateLimitStatus.requestsRemaining > 2 ? '#ffc107' : '#ff6b6b' 
                }}>
                  {rateLimitStatus.requestsRemaining}/10
                </span>
              </div>
            )}

            {!GeminiService.hasValidApiKey() && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#ffc107',
              }}>
                ⚠️ Add Gemini API key to enable AI features
              </div>
            )}

            {connectionStatus.isOnline && connectionStatus.pendingChanges > 0 && (
              <button
                onClick={handleForceSync}
                disabled={connectionStatus.syncInProgress}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #00f5ff, #0099ff)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: connectionStatus.syncInProgress ? 'not-allowed' : 'pointer',
                  opacity: connectionStatus.syncInProgress ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {connectionStatus.syncInProgress ? '🔄 Syncing...' : '🔄 Sync Now'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
