import React from 'react';
import { components } from '../../styles/design-system';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const baseStyles = components.button.base;
  const variantStyles = components.button.variants[variant];
  const sizeStyles = components.button.sizes[size];

  const buttonStyle: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles,
    ...sizeStyles,
    opacity: (disabled || isLoading) ? 0.6 : 1,
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.transform = 'translateY(-1px)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
      }
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.transform = 'translateY(0)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
      }
    }
    onMouseLeave?.(e);
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-disabled={disabled || isLoading}
      role="button"
      tabIndex={disabled || isLoading ? -1 : 0}
      {...props}
    >
      {isLoading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      {!isLoading && leftIcon && leftIcon}
      {children}
      {!isLoading && rightIcon && rightIcon}
    </button>
  );
};
