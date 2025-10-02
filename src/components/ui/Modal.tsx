import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { colors, spacing, borderRadius, shadows, zIndex } from '../../styles/design-system';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const { theme } = useStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { maxWidth: '400px', width: '90vw' };
      case 'md':
        return { maxWidth: '500px', width: '90vw' };
      case 'lg':
        return { maxWidth: '700px', width: '90vw' };
      case 'xl':
        return { maxWidth: '900px', width: '95vw' };
      default:
        return { maxWidth: '500px', width: '90vw' };
    }
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.modal,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
    padding: spacing.lg
  };

  const modalStyles: React.CSSProperties = {
    background: isDark ? colors.background.darkPaper : colors.background.paper,
    borderRadius: borderRadius.xl,
    boxShadow: shadows['2xl'],
    border: isDark ? `1px solid ${colors.border.dark}` : `1px solid ${colors.border.light}`,
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...getSizeStyles()
  };

  const headerStyles: React.CSSProperties = {
    padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`,
    borderBottom: isDark ? `1px solid ${colors.border.dark}` : `1px solid ${colors.border.light}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyles: React.CSSProperties = {
    padding: spacing.xl,
    flex: 1,
    overflow: 'auto'
  };

  if (!isOpen) return null;

  return (
    <div
      style={overlayStyles}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        style={modalStyles}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && (
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: isDark ? colors.text.primaryDark : colors.text.primary
              }}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: isDark ? colors.text.secondaryDark : colors.text.secondary,
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
};
