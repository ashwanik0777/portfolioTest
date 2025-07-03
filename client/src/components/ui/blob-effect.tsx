import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function BlobEffect() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Apply spring physics for smooth, delayed blob movement
  const springConfig = { damping: 30, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Slower following springs for trailing blobs 
  const slowConfig = { damping: 50, stiffness: 50 };
  const slowerX = useSpring(mouseX, slowConfig);
  const slowerY = useSpring(mouseY, slowConfig);
  
  // Even slower following for the third blob
  const slowestConfig = { damping: 70, stiffness: 20 };
  const slowestX = useSpring(mouseX, slowestConfig);
  const slowestY = useSpring(mouseY, slowestConfig);
  
  // Animation properties for blob pulsing
  const scale = useMotionValue(1);
  const scaleSpring = useSpring(scale, {
    damping: 20,
    stiffness: 200,
  });
  
  // Rotation for the blobs
  const rotate = useMotionValue(0);
  const rotateSpring = useSpring(rotate, {
    damping: 30,
    stiffness: 50,
  });
  
  useEffect(() => {
    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      // Start rotation and scaling on movement
      rotate.set(rotate.get() + 2);
      
      // Pulse effect on mouse movement
      scale.set(1.1);
      setTimeout(() => scale.set(1), 200);
      
      if (!isVisible) setIsVisible(true);
      
      // Reset inactivity timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide blobs after inactivity
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };
    
    // Initial rotation
    rotateSpring.set(0);
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mouseX, mouseY, isVisible, rotate, scale, rotateSpring]);
  
  // Keep rotation going continuously
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isVisible) {
      // Continuously rotate the blobs when visible
      interval = setInterval(() => {
        rotate.set(rotate.get() + 0.5);
      }, 50);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVisible, rotate]);
  
  // Dynamic opacity based on visibility
  const opacityVariants = {
    visible: { opacity: 0.15 },
    hidden: { opacity: 0 }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Main blob */}
      <motion.div
        className="absolute rounded-full bg-primary filter blur-xl"
        style={{
          width: 180,
          height: 180,
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          rotate: rotateSpring,
          scale: scaleSpring,
        }}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={opacityVariants}
        transition={{ duration: 0.8 }}
      />
      
      {/* Secondary blob */}
      <motion.div
        className="absolute rounded-full bg-primary filter blur-2xl"
        style={{
          width: 240,
          height: 240,
          x: slowerX,
          y: slowerY,
          translateX: "-50%",
          translateY: "-50%",
          rotate: useTransform(rotateSpring, value => -value * 0.8),
          scale: useTransform(scaleSpring, value => value * 0.9),
        }}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={opacityVariants}
        transition={{ duration: 1.2 }}
      />
      
      {/* Third blob */}
      <motion.div
        className="absolute rounded-full bg-secondary filter blur-3xl"
        style={{
          width: 320,
          height: 320,
          x: slowestX,
          y: slowestY,
          translateX: "-50%",
          translateY: "-50%",
          rotate: useTransform(rotateSpring, value => value * 0.4),
          scale: useTransform(scaleSpring, value => value * 0.85),
        }}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={{
          visible: { opacity: 0.08 },
          hidden: { opacity: 0 }
        }}
        transition={{ duration: 1.5 }}
      />
    </div>
  );
}