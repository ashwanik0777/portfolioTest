import React, { useEffect, useState } from 'react';

/**
 * Hook to check if the user is navigating with a keyboard 
 * This helps apply focus styles only when needed
 */
export const useKeyboardNavigation = () => {
  const [isNavigatingWithKeyboard, setIsNavigatingWithKeyboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsNavigatingWithKeyboard(true);
      }
    };

    const handleMouseDown = () => {
      setIsNavigatingWithKeyboard(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isNavigatingWithKeyboard;
};

/**
 * Component to provide a "Skip to main content" link for keyboard users
 */
export const SkipToContent: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.tabIndex = -1;
      mainContent.focus();
      // Reset tabIndex after a delay to avoid DOM warnings
      setTimeout(() => {
        mainContent.removeAttribute('tabIndex');
      }, 1000);
    }
  };

  return (
    <a
      href="#main-content"
      className={`fixed z-[100] top-4 left-4 p-3 bg-primary text-primary-foreground font-medium rounded shadow focus:outline-none transition-opacity ${
        isFocused ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
};

/**
 * Announce important messages to screen readers
 */
export const LiveRegion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div
    {...props}
    ref={ref}
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  />
));
LiveRegion.displayName = "LiveRegion";

/**
 * Context for managing announcements to screen readers
 */
interface AnnouncementContextType {
  announce: (message: string, assertive?: boolean) => void;
}

const AnnouncementContext = React.createContext<AnnouncementContextType | undefined>(undefined);

export const AnnouncementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = (message: string, assertive = false) => {
    if (assertive) {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 50);
    }
  };

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = (): AnnouncementContextType => {
  const context = React.useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
};

/**
 * Visually hide content while keeping it accessible to screen readers
 */
export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span 
    className="sr-only"
  >
    {children}
  </span>
);

/**
 * Add accessible description to elements with icons
 */
export const AccessibleIcon: React.FC<{ 
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <span role="img" aria-label={label}>
    {children}
  </span>
);