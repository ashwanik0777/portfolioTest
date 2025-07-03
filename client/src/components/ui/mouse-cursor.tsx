import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

// A simple minimal cursor component that follows the mouse
export function MouseCursor() {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
    };
    
    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <>
      {/* Main cursor line (very thin) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div 
          className="w-1.5 h-0.5 rounded-full bg-primary/40" 
          style={{
            boxShadow: '0 0 1px 0px rgba(var(--primary), 0.2)'
          }}
        />
      </motion.div>
      
      {/* Single tiny trailing element */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: 0.2,
        }}
        transition={{
          ease: "linear",
          duration: 0.2,
          delay: 0.1,
        }}
      >
        <div 
          className="rounded-full bg-primary/30" 
          style={{
            width: 2,
            height: 0.5,
          }}
        />
      </motion.div>
    </>
  );
}