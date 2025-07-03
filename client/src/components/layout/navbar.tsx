import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAnnouncement } from "@/lib/accessibility";
import { motion, useScroll, useSpring } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useTranslation();
  const { announce } = useAnnouncement();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableElementRef = useRef<HTMLAnchorElement>(null);
  const lastFocusableElementRef = useRef<HTMLAnchorElement>(null);
  
  // Scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const navLinks = [
    { href: "#home", label: t('nav.home', 'Home') },
    { href: "#about", label: t('nav.about', 'About') },
    { href: "#skills", label: t('nav.skills', 'Skills') },
    { href: "#projects", label: t('nav.projects', 'Projects') },
    { href: "#experience", label: t('nav.experience', 'Experience') },
    { href: "#contact", label: t('nav.contact', 'Contact') },
    { href: "/blog", label: t('nav.blog', 'Blog') }
  ];

  // Announce when mobile menu opens/closes
  useEffect(() => {
    announce(isOpen ? "Mobile menu opened" : "Mobile menu closed", false);
  }, [isOpen, announce]);

  // Trap focus within the mobile menu when it's open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !mobileMenuRef.current) return;
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
      
      // Trap focus in modal
      if (e.key === 'Tab') {
        if (!firstFocusableElementRef.current || !lastFocusableElementRef.current) return;
        
        // If shift + tab and on first element, move to last element
        if (e.shiftKey && document.activeElement === firstFocusableElementRef.current) {
          e.preventDefault();
          lastFocusableElementRef.current.focus();
        } 
        // If tab and on last element, cycle back to first element
        else if (!e.shiftKey && document.activeElement === lastFocusableElementRef.current) {
          e.preventDefault();
          firstFocusableElementRef.current.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus first element when menu opens
  useEffect(() => {
    if (isOpen && firstFocusableElementRef.current) {
      // Small delay to ensure the menu is rendered
      setTimeout(() => {
        firstFocusableElementRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);
  
  // Add sparkle effect to progress bar when scrolling
  useEffect(() => {
    // Store the previous scroll value to detect direction
    let prevScrollY = window.scrollY;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
      }
      
      // Clear previous timeout
      clearTimeout(scrollTimeout);
      
      // Set a timeout to detect when scrolling stops
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
      
      // Only create sparkles when scrolling up or down significantly
      if (Math.abs(window.scrollY - prevScrollY) > 50) {
        createScrollSparkle();
        prevScrollY = window.scrollY;
      }
    };
    
    // Create a sparkle element on the progress bar
    const createScrollSparkle = () => {
      const progressBar = document.querySelector('.scroll-progress-indicator');
      if (!progressBar) return;
      
      // Calculate position based on scroll progress
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle');
      
      // Position sparkle at current progress position
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const position = Math.min(Math.max(scrollProgress * 100, 0), 100);
      
      sparkle.style.right = `${100 - position}%`;
      sparkle.style.top = `${Math.random() * 3 - 1}px`; // Random vertical offset for variety
      
      progressBar.appendChild(sparkle);
      
      // Clean up sparkle after animation completes
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 700);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Close mobile menu and handle smooth scroll
  const handleClick = (href: string) => {
    setIsOpen(false);
    
    if (href.startsWith("#") && location === "/") {
      const element = document.querySelector(href);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
        
        // Announce that we've navigated to a section
        const sectionName = navLinks.find(link => link.href === href)?.label || '';
        if (sectionName) {
          announce(`Navigated to ${sectionName} section`, false);
        }
        
        // Make section focusable and focus it
        if (element instanceof HTMLElement) {
          element.setAttribute('tabindex', '-1');
          element.focus({ preventScroll: true });
          // Remove tabindex after focus to avoid polluting the DOM
          setTimeout(() => element.removeAttribute('tabindex'), 1000);
        }
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 dark:bg-background/80 backdrop-blur-md z-50 transition-colors duration-300" role="banner">
      {/* Scroll Progress Indicator */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 scroll-progress-indicator origin-left z-50"
        style={{ scaleX }}
        aria-hidden="true"
      >
        {/* Animated glow effect */}
        <div className="progress-glow"></div>
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold" aria-label="Alex Morgan home">
            Alex<span className="text-primary">Morgan</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex space-x-4 lg:space-x-6" aria-label="Main navigation">
              {navLinks.map(link => (
                <a 
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-foreground/70 hover:text-primary transition-colors text-sm lg:text-base",
                    location === "/" && "cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1 -mx-2 -my-1"
                  )}
                  onClick={() => handleClick(link.href)}
                  aria-current={link.href === `#${location.split('#')[1] || 'home'}` ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          
          {/* Language & Theme Toggle - visible on all devices */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-border/70" aria-hidden="true"></div>
            <ThemeToggle />
            
            {/* Mobile Menu Button - only visible on mobile */}
            <Button 
              ref={menuButtonRef}
              variant="ghost" 
              size="icon" 
              className="ml-2 md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div 
        ref={mobileMenuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Mobile navigation"
        className={cn(
          "md:hidden bg-background dark:bg-card border-t border-border transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 text-center">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              ref={i === 0 ? firstFocusableElementRef : i === navLinks.length - 1 ? lastFocusableElementRef : null}
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-muted",
                location === "/" && "cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              )}
              onClick={() => handleClick(link.href)}
              aria-current={link.href === `#${location.split('#')[1] || 'home'}` ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
