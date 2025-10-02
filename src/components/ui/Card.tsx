import React from 'react';
import { useStore } from '../../store/useStore';
import { components, glassmorphism } from '../../styles/design-system';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  hoverable = false,
  onClick,
  style,
  className,
  ...props
}) => {
  const { theme } = useStore();
  const isDark = theme === 'dark';

  const paddingMap = {
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px'
  };

  const getCardStyles = (): React.CSSProperties => {
    const baseStyles = isDark ? components.card.dark : components.card.base;
    
    let variantStyles: React.CSSProperties = {};
    
    switch (variant) {
      case 'glass':
        variantStyles = glassmorphism(isDark);
        break;
      case 'elevated':
        variantStyles = {
          ...baseStyles,
          boxShadow: isDark 
            ? '0 8px 30px rgba(102, 126, 234, 0.2)'
            : '0 8px 30px rgba(118, 75, 162, 0.2)'
        };
        break;
      default:
        variantStyles = baseStyles;
    }

    return {
      ...variantStyles,
      padding: paddingMap[padding],
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      ...style
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable || onClick) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = isDark
        ? '0 12px 40px rgba(102, 126, 234, 0.3)'
        : '0 12px 40px rgba(118, 75, 162, 0.3)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable || onClick) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = isDark
        ? '0 4px 20px rgba(102, 126, 234, 0.1)'
        : '0 4px 20px rgba(118, 75, 162, 0.1)';
    }
  };

  return (
    <div
      style={getCardStyles()}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};
