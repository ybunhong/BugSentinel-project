// Accessibility utilities for BugSentinel

export const a11y = {
  // Generate unique IDs for form elements
  generateId: (prefix: string = 'element'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Keyboard navigation helpers
  keyboard: {
    // Handle keyboard navigation for lists
    handleListNavigation: (
      event: KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
      onSelect?: (index: number) => void
    ): number => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect?.(currentIndex);
          return currentIndex;
        case 'Escape':
          event.preventDefault();
          // Blur current element
          (document.activeElement as HTMLElement)?.blur();
          return currentIndex;
      }

      // Focus the new item
      if (newIndex !== currentIndex && items[newIndex]) {
        items[newIndex].focus();
      }

      return newIndex;
    },

    // Handle modal keyboard navigation
    handleModalNavigation: (
      event: KeyboardEvent,
      onClose: () => void,
      modalElement: HTMLElement
    ): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }
  },

  // Focus management
  focus: {
    // Trap focus within an element
    trapFocus: (element: HTMLElement): (() => void) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      element.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      // Return cleanup function
      return () => {
        element.removeEventListener('keydown', handleTabKey);
      };
    },

    // Save and restore focus
    saveFocus: (): (() => void) => {
      const activeElement = document.activeElement as HTMLElement;
      return () => {
        activeElement?.focus();
      };
    }
  },

  // ARIA helpers
  aria: {
    // Announce to screen readers
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';

      document.body.appendChild(announcer);
      announcer.textContent = message;

      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    },

    // Set expanded state for collapsible elements
    setExpanded: (element: HTMLElement, expanded: boolean): void => {
      element.setAttribute('aria-expanded', expanded.toString());
    },

    // Set selected state for selectable elements
    setSelected: (element: HTMLElement, selected: boolean): void => {
      element.setAttribute('aria-selected', selected.toString());
    },

    // Set pressed state for toggle buttons
    setPressed: (element: HTMLElement, pressed: boolean): void => {
      element.setAttribute('aria-pressed', pressed.toString());
    }
  },

  // Color contrast utilities
  contrast: {
    // Calculate relative luminance
    getLuminance: (color: string): number => {
      const rgb = a11y.contrast.hexToRgb(color);
      if (!rgb) return 0;

      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    // Convert hex to RGB
    hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // Calculate contrast ratio
    getContrastRatio: (color1: string, color2: string): number => {
      const lum1 = a11y.contrast.getLuminance(color1);
      const lum2 = a11y.contrast.getLuminance(color2);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    },

    // Check if contrast meets WCAG standards
    meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
      const ratio = a11y.contrast.getContrastRatio(color1, color2);
      return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
    }
  },

  // Screen reader utilities
  screenReader: {
    // Hide element from screen readers
    hide: (element: HTMLElement): void => {
      element.setAttribute('aria-hidden', 'true');
    },

    // Show element to screen readers
    show: (element: HTMLElement): void => {
      element.removeAttribute('aria-hidden');
    },

    // Make element screen reader only (visually hidden)
    onlyText: (text: string): HTMLSpanElement => {
      const span = document.createElement('span');
      span.textContent = text;
      span.style.position = 'absolute';
      span.style.left = '-10000px';
      span.style.width = '1px';
      span.style.height = '1px';
      span.style.overflow = 'hidden';
      span.className = 'sr-only';
      return span;
    }
  },

  // Validation helpers
  validation: {
    // Check if element has accessible name
    hasAccessibleName: (element: HTMLElement): boolean => {
      return !!(
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        element.textContent?.trim() ||
        (element as HTMLInputElement).labels?.length
      );
    },

    // Check if interactive element is keyboard accessible
    isKeyboardAccessible: (element: HTMLElement): boolean => {
      const tabIndex = element.getAttribute('tabindex');
      return (
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA' ||
        (tabIndex !== null && parseInt(tabIndex) >= 0)
      );
    }
  }
};

// CSS classes for accessibility
export const a11yStyles = `
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .focus-visible {
    outline: 2px solid #667eea !important;
    outline-offset: 2px !important;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (prefers-color-scheme: dark) {
    .auto-dark {
      color-scheme: dark;
    }
  }
`;

// Hook for managing focus
export const useFocusManagement = () => {
  const trapFocus = (element: HTMLElement) => a11y.focus.trapFocus(element);
  const saveFocus = () => a11y.focus.saveFocus();
  const announce = (message: string, priority?: 'polite' | 'assertive') => 
    a11y.aria.announce(message, priority);

  return {
    trapFocus,
    saveFocus,
    announce
  };
};
