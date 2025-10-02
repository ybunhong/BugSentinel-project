import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { components, colors, spacing } from '../../styles/design-system';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyles = (): React.CSSProperties => {
    const baseStyles = components.input.base;
    
    let variantStyles: React.CSSProperties = {};
    
    switch (variant) {
      case 'filled':
        variantStyles = {
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          border: 'none',
          borderBottom: `2px solid ${isDark ? colors.border.dark : colors.border.light}`
        };
        break;
      case 'outline':
        variantStyles = {
          background: 'transparent',
          border: `2px solid ${isDark ? colors.border.dark : colors.border.light}`
        };
        break;
      default:
        variantStyles = {
          background: isDark ? colors.background.darkPaper : colors.background.paper,
          border: `1px solid ${isDark ? colors.border.dark : colors.border.light}`
        };
    }

    if (isFocused) {
      variantStyles = {
        ...variantStyles,
        borderColor: error ? colors.error.main : colors.primary.main,
        boxShadow: `0 0 0 3px ${error ? colors.error.main : colors.primary.main}20`
      };
    }

    if (error) {
      variantStyles.borderColor = colors.error.main;
    }

    return {
      ...baseStyles,
      ...variantStyles,
      color: isDark ? colors.text.primaryDark : colors.text.primary,
      paddingLeft: leftIcon ? '40px' : baseStyles.padding?.toString().split(' ')[1] || spacing.lg,
      paddingRight: rightIcon ? '40px' : baseStyles.padding?.toString().split(' ')[1] || spacing.lg,
      ...style
    };
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId, props['aria-describedby']].filter(Boolean).join(' ');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: spacing.sm,
            fontSize: '14px',
            fontWeight: 500,
            color: isDark ? colors.text.primaryDark : colors.text.primary
          }}
        >
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: spacing.md,
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDark ? colors.text.secondaryDark : colors.text.secondary,
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          style={getInputStyles()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          {...props}
        />
        
        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: spacing.md,
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDark ? colors.text.secondaryDark : colors.text.secondary,
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div
          style={{
            marginTop: spacing.sm,
            fontSize: '12px',
            color: error ? colors.error.main : (isDark ? colors.text.secondaryDark : colors.text.secondary)
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
};
