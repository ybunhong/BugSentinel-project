import React, { useEffect, useState } from 'react';
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/design-system';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  isVisible = true
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: colors.success.light,
          color: colors.success.dark,
          border: `1px solid ${colors.success.main}`,
          icon: '✅'
        };
      case 'error':
        return {
          background: colors.error.light,
          color: colors.error.dark,
          border: `1px solid ${colors.error.main}`,
          icon: '❌'
        };
      case 'warning':
        return {
          background: colors.warning.light,
          color: colors.warning.dark,
          border: `1px solid ${colors.warning.main}`,
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          background: colors.info.light,
          color: colors.info.dark,
          border: `1px solid ${colors.info.main}`,
          icon: 'ℹ️'
        };
    }
  };

  const typeStyles = getTypeStyles();

  const toastStyles: React.CSSProperties = {
    position: 'fixed',
    top: spacing['2xl'],
    right: spacing['2xl'],
    zIndex: 1700,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    maxWidth: '400px',
    minWidth: '300px',
    transform: show ? 'translateX(0)' : 'translateX(100%)',
    opacity: show ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...typeStyles
  };

  if (!isVisible && !show) return null;

  return (
    <div style={toastStyles}>
      <span style={{ fontSize: '16px' }}>{typeStyles.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => {
          setShow(false);
          setTimeout(() => onClose?.(), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: 'inherit',
          opacity: 0.7,
          padding: '2px',
          borderRadius: borderRadius.sm,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        ✕
      </button>
    </div>
  );
};
