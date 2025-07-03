import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  rotation: number;
}

export function ParticleEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const particleCount = useRef(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const throttleRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate HSL colors based on primary color with variations
  const generateColor = () => {
    // Primary color from theme with slight variations for each particle
    const hueVariation = Math.random() * 20 - 10; // ±10 from primary hue
    const saturationBias = Math.random() * 10 + 90; // 90-100% saturation
    const lightnessBias = Math.random() * 10 + 50; // 50-60% lightness
    return `hsl(calc(var(--primary-hue) + ${hueVariation}), ${saturationBias}%, ${lightnessBias}%)`;
  };

  useEffect(() => {
    // Extract primary color hue and add it to the document for reference
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();
    
    // Extract hue from HSL format
    const hueMatch = primaryColor.match(/(\d+)deg/);
    if (hueMatch && hueMatch[1]) {
      document.documentElement.style.setProperty('--primary-hue', `${hueMatch[1]}deg`);
    } else {
      // Default hue if can't extract
      document.documentElement.style.setProperty('--primary-hue', '260deg');
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      if (!isActive) setIsActive(true);
      
      // Throttle particle creation for performance
      if (!throttleRef.current) {
        throttleRef.current = true;
        
        // Create new particles
        const newParticle: Particle = {
          id: particleCount.current++,
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 10 + 5, // 5-15px
          color: generateColor(),
          duration: Math.random() * 1 + 1, // 1-2s
          rotation: Math.random() * 360, // random rotation
        };
        
        setParticles(prev => [...prev, newParticle]);
        
        // Remove oldest particles if too many
        if (particles.length > 50) {
          setParticles(prev => prev.slice(1));
        }
        
        // Reset throttle after delay
        setTimeout(() => {
          throttleRef.current = false;
        }, 40); // 40ms throttle (25 particles per second max)
      }
      
      // Reset inactivity timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set inactive after 2 seconds of no movement
      timeoutRef.current = setTimeout(() => {
        setIsActive(false);
      }, 2000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [particles.length, mouseX, mouseY, isActive]);

  // Remove particles after they finish animating
  useEffect(() => {
    if (particles.length === 0) return;
    
    const timeout = setTimeout(() => {
      setParticles(prev => prev.slice(1));
    }, particles[0].duration * 1000);
    
    return () => clearTimeout(timeout);
  }, [particles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 8px ${particle.color}`,
            x: "-50%",
            y: "-50%",
          }}
          initial={{ opacity: 0.8, scale: 1, rotate: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: ["-50%", `${(Math.random() - 0.5) * 100}px`],
            y: ["-50%", `${(Math.random() - 0.5) * 100 - 50}px`], // bias upwards
            rotate: particle.rotation,
          }}
          transition={{
            duration: particle.duration,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}