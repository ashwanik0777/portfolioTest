import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

function getSystemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const systemTheme = getSystemTheme();
      setTheme("system");
      setResolvedTheme(systemTheme);
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first to ensure clean state
    root.classList.remove("light", "dark");
    
    let newResolvedTheme: "dark" | "light";
    
    if (theme === "system") {
      newResolvedTheme = getSystemTheme();
    } else {
      newResolvedTheme = theme as "dark" | "light";
    }
    
    // Apply the new theme class
    root.classList.add(newResolvedTheme);
    setResolvedTheme(newResolvedTheme);
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      const newSystemTheme = getSystemTheme();
      const root = window.document.documentElement;
      
      root.classList.remove("light", "dark");
      root.classList.add(newSystemTheme);
      setResolvedTheme(newSystemTheme);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === "dark") return "light";
      if (prevTheme === "light") return "dark";
      // If system, use the opposite of resolved theme
      return resolvedTheme === "dark" ? "light" : "dark";
    });
  };

  return { theme, resolvedTheme, setTheme, toggleTheme };
}