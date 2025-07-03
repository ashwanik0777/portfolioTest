import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // After mounting, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  const handleClick = () => {
    // Set animation flag
    setIsAnimating(true);
    // Toggle theme
    toggleTheme();
    // Reset animation flag after animation completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  const isDark = resolvedTheme === "dark";

  return (
    <motion.div
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isAnimating}
        className="h-10 w-10 rounded-full bg-background border border-input hover:bg-muted/80 transition-colors"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDark ? "moon" : "sun"}
            initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
          </motion.div>
        </AnimatePresence>
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Label that appears on hover with animation */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm whitespace-nowrap"
          >
            {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}