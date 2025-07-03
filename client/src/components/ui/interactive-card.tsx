import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  glare?: boolean;
}

export function InteractiveCard({ 
  children, 
  className = '', 
  depth = 20,
  glare = true
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for card rotation
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Card spring animations for smooth movement
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  
  // Glare effect positioning
  const glareOpacity = useMotionValue(0);
  const glareOpacitySpring = useSpring(glareOpacity, springConfig);
  
  // Glare position values
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  
  // Generate particles on hover
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);
  const particleCount = useRef(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to card center (from -0.5 to 0.5)
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    // Apply rotation based on cursor position
    rotateX.set(-y * depth); // Invert Y for natural tilt
    rotateY.set(x * depth);
    
    // Update glare effect position
    setGlarePosition({
      x: (x + 0.5) * 100,
      y: (y + 0.5) * 100
    });
    glareOpacity.set(0.1); // Subtler glare effect
    
    // Create particles very rarely (much smaller chance for very few particles)
    if (Math.random() > 0.985 && isHovered) {
      const newParticle = {
        id: particleCount.current++,
        x: clientX - left,
        y: clientY - top
      };
      
      setParticles(prev => [...prev, newParticle]);
      
      // Remove particle after animation (shorter lifetime)
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 700);
    }
    
    if (!isHovered) setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    // Reset card position on mouse leave
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
    setIsHovered(false);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-lg overflow-hidden", 
        "transform-gpu perspective-1200 cursor-pointer",
        "transition-transform duration-200",
        isHovered ? "z-10" : "z-0",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Line-shaped particles effect */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute bg-primary/30"
          style={{ 
            left: particle.x, 
            top: particle.y,
            zIndex: 10,
            width: '2px',
            height: '0.5px',
            borderRadius: '1px',
          }}
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{ 
            opacity: 0,
            scale: 0,
            x: (Math.random() - 0.5) * 10, // Extremely small movement range
            y: (Math.random() - 0.5) * 10,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }} // Even faster animation
        />
      ))}
      
      {/* Glare effect overlay */}
      {glare && (
        <motion.div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
          style={{
            opacity: glareOpacitySpring,
            backgroundPosition: `${glarePosition.x}% ${glarePosition.y}%`
          }}
        />
      )}
      
      {/* Content with 3D effect */}
      <div 
        className="relative transform-gpu" 
        style={{ 
          transform: `translateZ(${depth/2}px)`,
          transformStyle: "preserve-3d"
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}