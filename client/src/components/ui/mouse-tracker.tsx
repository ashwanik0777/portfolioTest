import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MouseTracker() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Mouse position values with spring physics for smooth movement
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Apply spring physics for smoother, slightly delayed following
  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Update cursor position based on mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };
    
    // Hide cursor when mouse leaves window
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    // Show cursor when mouse enters window
    const handleMouseEnter = () => {
      setIsVisible(true);
    };
    
    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full mix-blend-difference pointer-events-none z-50"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "hsl(var(--primary))",
          opacity: isVisible ? 0.5 : 0,
          boxShadow: "0 0 20px 5px hsl(var(--primary) / 0.3)"
        }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Cursor trail effect */}
      <motion.div
        className="fixed top-0 left-0 w-24 h-24 rounded-full mix-blend-difference pointer-events-none z-40 opacity-20"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "transparent",
          border: "2px solid hsl(var(--primary))",
          opacity: isVisible ? 0.2 : 0, 
        }}
        transition={{ duration: 0.5 }}
      />
    </>
  );
}