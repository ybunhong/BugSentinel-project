import React from 'react';
import { colors, spacing, borderRadius, typography } from '../../styles/design-system';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.primary.main,
          color: colors.primary.contrast
        };
      case 'secondary':
        return {
          background: colors.secondary.main,
          color: colors.secondary.contrast
        };
      case 'success':
        return {
          background: colors.success.main,
          color: '#ffffff'
        };
      case 'error':
        return {
          background: colors.error.main,
          color: '#ffffff'
        };
      case 'warning':
        return {
          background: colors.warning.main,
          color: '#000000'
        };
      case 'info':
        return {
          background: colors.info.main,
          color: '#ffffff'
        };
      default:
        return {
          background: colors.primary.main,
          color: colors.primary.contrast
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `2px ${spacing.sm}`,
          fontSize: typography.fontSize.xs,
          borderRadius: borderRadius.sm
        };
      case 'md':
        return {
          padding: `4px ${spacing.md}`,
          fontSize: typography.fontSize.xs,
          borderRadius: borderRadius.md
        };
      case 'lg':
        return {
          padding: `6px ${spacing.lg}`,
          fontSize: typography.fontSize.sm,
          borderRadius: borderRadius.lg
        };
      default:
        return {
          padding: `4px ${spacing.md}`,
          fontSize: typography.fontSize.xs,
          borderRadius: borderRadius.md
        };
    }
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: typography.fontWeight.medium,
    whiteSpace: 'nowrap',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <span style={badgeStyles} {...props}>
      {children}
    </span>
  );
};
