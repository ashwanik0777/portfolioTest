import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerTextProps {
  text: string;
  className?: string;
  staticColor?: string;
  shimmerWidth?: number;
  shimmerOpacity?: number;
  delay?: number;
  followMouse?: boolean;
}

export function ShimmerText({
  text,
  className,
  staticColor = 'currentColor',
  shimmerWidth = 30,
  shimmerOpacity = 0.8,
  delay = 0,
  followMouse = false
}: ShimmerTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // For mouse follow shimmer effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform mouse position to shimmer position (0 to 100)
  const shimmerPositionX = useTransform(
    mouseX,
    [-100, 100],
    [0, 100]
  );
  
  // For automatic shimmer animation
  const [animationStarted, setAnimationStarted] = useState(false);
  const [shimmerPosition, setShimmerPosition] = useState(0);
  
  // Start shimmer animation after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Handle mouse movement for shimmer positioning
  useEffect(() => {
    if (!followMouse || !containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { left, width } = containerRef.current!.getBoundingClientRect();
      const relativeX = e.clientX - left;
      
      // Normalize position
      mouseX.set(relativeX - width / 2);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followMouse, mouseX]);
  
  // Automatic shimmer animation
  useEffect(() => {
    if (!animationStarted || followMouse) return;
    
    let animationFrame: number;
    let position = 0;
    
    function frame() {
      position += 0.5;
      if (position > 100 + shimmerWidth) {
        position = -shimmerWidth;
      }
      setShimmerPosition(position);
      animationFrame = requestAnimationFrame(frame);
    }
    
    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, [animationStarted, followMouse, shimmerWidth]);
  
  // Get the current shimmer position
  const currentPosition = followMouse ? shimmerPositionX.get() : shimmerPosition;
  
  return (
    <span 
      ref={containerRef} 
      className={cn("relative inline-block", className)}
      style={{
        color: staticColor,
      }}
    >
      {/* Base text (always visible) */}
      <span className="relative z-10">{text}</span>
      
      {/* Shimmer overlay */}
      <span 
        className="absolute inset-0 overflow-hidden z-20 pointer-events-none"
        aria-hidden="true"
      >
        {/* Shimmer text (just for masking) */}
        <span className="text-transparent absolute inset-0">{text}</span>
        
        {/* Actual shimmer effect */}
        <span 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(
              90deg, 
              transparent 0%, 
              transparent ${currentPosition - shimmerWidth}%, 
              rgba(var(--primary), ${shimmerOpacity}) ${currentPosition}%,
              transparent ${currentPosition + shimmerWidth}%, 
              transparent 100%
            )`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {text}
        </span>
      </span>
    </span>
  );
}