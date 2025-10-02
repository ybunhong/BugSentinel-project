// Design System Foundation for BugSentinel
// Based on UX/UI Design Documentation

export const colors = {
  // Primary Colors
  primary: {
    main: 'rgb(34, 150, 243)', // #2296F3
    light: 'rgb(66, 165, 245)',
    dark: 'rgb(25, 118, 210)',
    contrast: '#ffffff'
  },
  
  // Secondary Colors
  secondary: {
    main: 'rgb(255, 193, 7)', // #FFC107
    light: 'rgb(255, 213, 79)',
    dark: 'rgb(255, 160, 0)',
    contrast: '#000000'
  },
  
  // Background Colors
  background: {
    default: 'rgb(248, 249, 250)', // #F8F9FA
    paper: '#ffffff',
    dark: 'rgb(15, 15, 35)', // #0F0F23
    darkPaper: 'rgb(26, 26, 46)' // #1A1A2E
  },
  
  // Text Colors
  text: {
    primary: 'rgb(33, 37, 41)', // #212529
    secondary: 'rgb(108, 117, 125)', // #6C757D
    disabled: 'rgb(173, 181, 189)', // #ADB5BD
    primaryDark: '#ffffff',
    secondaryDark: 'rgb(204, 204, 204)' // #CCCCCC
  },
  
  // Status Colors
  error: {
    main: 'rgb(220, 53, 69)', // #DC3545
    light: 'rgb(248, 215, 218)',
    dark: 'rgb(176, 42, 55)'
  },
  
  success: {
    main: 'rgb(40, 167, 69)', // #28A745
    light: 'rgb(212, 237, 218)',
    dark: 'rgb(32, 134, 55)'
  },
  
  warning: {
    main: 'rgb(255, 193, 7)', // #FFC107
    light: 'rgb(255, 243, 205)',
    dark: 'rgb(204, 154, 5)'
  },
  
  info: {
    main: 'rgb(23, 162, 184)', // #17A2B8
    light: 'rgb(209, 236, 241)',
    dark: 'rgb(18, 130, 147)'
  },
  
  // Gradient Colors
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
    success: 'linear-gradient(135deg, #00f5ff, #0099ff)',
    dark: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
  },
  
  // Border Colors
  border: {
    light: 'rgba(0, 0, 0, 0.12)',
    medium: 'rgba(0, 0, 0, 0.23)',
    dark: 'rgba(255, 255, 255, 0.12)',
    primaryLight: 'rgba(102, 126, 234, 0.2)',
    primaryDark: 'rgba(102, 126, 234, 0.3)'
  }
};

export const typography = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Monaco", "Consolas", "Courier New", monospace'
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '36px',
    '6xl': '48px'
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 2
  },
  
  letterSpacing: {
    tight: '-0.5px',
    normal: '0',
    wide: '0.5px'
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
  '7xl': '80px',
  '8xl': '96px'
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '20px',
  full: '9999px'
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Theme-specific shadows
  primaryLight: '0 4px 15px rgba(102, 126, 234, 0.3)',
  primaryDark: '0 4px 20px rgba(102, 126, 234, 0.1)',
  secondaryLight: '0 4px 15px rgba(255, 107, 107, 0.3)',
  glass: '0 8px 32px rgba(31, 38, 135, 0.37)'
};

export const transitions = {
  fast: 'all 0.15s ease',
  normal: 'all 0.2s ease',
  slow: 'all 0.3s ease',
  
  // Specific transitions
  hover: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
};

// Component-specific styles
export const components = {
  button: {
    base: {
      padding: `${spacing.md} ${spacing.xl}`,
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      transition: transitions.hover,
      cursor: 'pointer',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm
    },
    
    variants: {
      primary: {
        background: colors.gradients.primary,
        color: colors.primary.contrast,
        boxShadow: shadows.primaryLight
      },
      
      secondary: {
        background: colors.gradients.secondary,
        color: colors.secondary.contrast,
        boxShadow: shadows.secondaryLight
      },
      
      outline: {
        background: 'transparent',
        border: `1px solid ${colors.border.medium}`,
        color: colors.text.primary
      },
      
      ghost: {
        background: 'transparent',
        color: colors.text.primary
      }
    },
    
    sizes: {
      sm: {
        padding: `${spacing.sm} ${spacing.md}`,
        fontSize: typography.fontSize.xs
      },
      
      md: {
        padding: `${spacing.md} ${spacing.xl}`,
        fontSize: typography.fontSize.sm
      },
      
      lg: {
        padding: `${spacing.lg} ${spacing['2xl']}`,
        fontSize: typography.fontSize.base
      }
    }
  },
  
  card: {
    base: {
      background: colors.background.paper,
      borderRadius: borderRadius.xl,
      boxShadow: shadows.md,
      padding: spacing['2xl'],
      border: `1px solid ${colors.border.light}`
    },
    
    dark: {
      background: colors.background.darkPaper,
      border: `1px solid ${colors.border.dark}`,
      boxShadow: shadows.primaryDark
    }
  },
  
  input: {
    base: {
      padding: `${spacing.md} ${spacing.lg}`,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.border.light}`,
      fontSize: typography.fontSize.sm,
      transition: transitions.normal,
      background: colors.background.paper
    },
    
    focus: {
      borderColor: colors.primary.main,
      boxShadow: `0 0 0 3px ${colors.primary.main}20`
    }
  }
};

// Utility functions
export const getThemeColors = (isDark: boolean) => ({
  background: isDark ? colors.background.dark : colors.background.default,
  paper: isDark ? colors.background.darkPaper : colors.background.paper,
  text: {
    primary: isDark ? colors.text.primaryDark : colors.text.primary,
    secondary: isDark ? colors.text.secondaryDark : colors.text.secondary
  },
  border: isDark ? colors.border.dark : colors.border.light
});

export const glassmorphism = (isDark: boolean) => ({
  background: isDark 
    ? 'rgba(15, 15, 35, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  border: isDark 
    ? `1px solid ${colors.border.primaryLight}` 
    : `1px solid ${colors.border.light}`,
  boxShadow: isDark ? shadows.primaryDark : shadows.glass
});
