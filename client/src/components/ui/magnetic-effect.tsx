import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticEffectProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
  transition?: {
    duration?: number;
    ease?: number[];
  };
}

export function MagneticEffect({
  children,
  className,
  strength = 20,
  radius = 150,
  transition = {
    duration: 0.3,
    ease: [0.17, 0.67, 0.83, 0.67],
  },
}: MagneticEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Use springs for smooth movement
  const springConfig = { 
    damping: 15, 
    stiffness: 150, 
    mass: 0.1 
  };
  
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  // Handle mouse enter - activate the effect
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  // Handle mouse move - update position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isHovered) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from mouse to center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    // If within magnetic radius, apply pull effect
    if (distance < radius) {
      // Scale effect based on distance from center (closer = stronger)
      const pull = (1 - distance / radius) * strength;
      x.set(distanceX * pull / 10);
      y.set(distanceY * pull / 10);
    } else {
      // Outside of radius, reset position
      x.set(0);
      y.set(0);
    }
  };
  
  // Handle mouse leave - reset position
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };
  
  return (
    <motion.div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      transition={{
        type: 'spring',
        duration: transition.duration,
        ease: transition.ease,
      }}
    >
      {children}
    </motion.div>
  );
}