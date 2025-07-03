import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MagneticEffect } from '@/components/ui/magnetic-effect';
import { ShimmerText } from '@/components/ui/shimmer-text';

// Line-shaped interactive particle that follows cursor
const InteractiveParticle = ({ 
  mouseX, 
  mouseY, 
  width = 2, 
  height = 0.5,
  color = 'primary',
  delay = 0,
  speed = 1,
  opacity = 0.3
}: { 
  mouseX: any; 
  mouseY: any;
  width?: number;
  height?: number;
  color?: string;
  delay?: number;
  speed?: number;
  opacity?: number;
}) => {
  // Apply delay before creating springs
  const [delayedMouseX, setDelayedMouseX] = useState(0);
  const [delayedMouseY, setDelayedMouseY] = useState(0);
  
  useEffect(() => {
    // Apply delay to mouse position values
    const timer = setTimeout(() => {
      setDelayedMouseX(mouseX.get());
      setDelayedMouseY(mouseY.get());
    }, delay);
    
    return () => clearTimeout(timer);
  }, [mouseX, mouseY, delay]);
  
  const x = useSpring(delayedMouseX, { 
    damping: 15 * speed, 
    stiffness: 150 * speed,
    restDelta: 0.001,
    mass: 1 + Math.random() * 2
  });
  const y = useSpring(delayedMouseY, { 
    damping: 15 * speed, 
    stiffness: 150 * speed,
    restDelta: 0.001,
    mass: 1 + Math.random() * 2
  });

  return (
    <motion.div
      className={cn(
        'absolute rounded-sm pointer-events-none',
        color === 'primary' ? 'bg-primary/30' : 
        color === 'secondary' ? 'bg-secondary/30' : 
        color === 'accent' ? 'bg-accent/30' : 'bg-primary/30'
      )}
      style={{
        x,
        y,
        width,
        height,
        opacity,
        translateX: '-50%',
        translateY: '-50%',
        zIndex: 20
      }}
    />
  );
};

// Floating element that follows mouse but with resistance
const FloatingElement = ({
  mouseX,
  mouseY,
  resistance = 10,
  children,
  className = '',
}: {
  mouseX: any;
  mouseY: any;
  resistance?: number;
  children: React.ReactNode;
  className?: string;
}) => {
  const x = useSpring(useMotionValue(0), { 
    damping: 50, 
    stiffness: 200,
  });
  const y = useSpring(useMotionValue(0), { 
    damping: 50, 
    stiffness: 200,
  });

  useEffect(() => {
    const unsubscribeX = mouseX.on("change", (latest: number) => {
      x.set(latest / resistance);
    });
    const unsubscribeY = mouseY.on("change", (latest: number) => {
      y.set(latest / resistance);
    });

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, x, y, resistance]);

  return (
    <motion.div
      className={cn("absolute transform will-change-transform", className)}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
};

export function InteractiveMouseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isInView, setIsInView] = useState(false);

  // Handle mouse movements
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    
    const { clientX, clientY } = e;
    const rect = sectionRef.current.getBoundingClientRect();
    
    // Get mouse coordinates relative to the section
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);

    if (!isHovering) {
      setIsHovering(true);
    }
  };

  // Check if element is in view for animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    setCursorText('');
  };

  // Update cursor text based on hover targets
  const updateCursorText = (text: string) => {
    setCursorText(text);
  };

  return (
    <div 
      className="py-24 relative overflow-hidden bg-muted/30 backdrop-blur-sm" 
      id="interactive"
    >
      {/* Container for mouse interactions */}
      <div 
        ref={sectionRef}
        className="container mx-auto px-4 min-h-[500px] flex flex-col items-center justify-center relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 relative z-10"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 py-1.5 px-4 rounded-full">
            Interactive
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span className="relative inline-block mr-2">
              <ShimmerText text="Mouse" followMouse={true} />
              <motion.div
                className="absolute -bottom-1 left-0 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />
            </span>
            <ShimmerText text="Effects" followMouse={true} delay={300} />
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Interact with the elements below using your mouse. Move around to see various effects in action.
          </p>
        </motion.div>

        {/* Interactive elements playground */}
        <div className="relative w-full max-w-4xl h-[400px] rounded-xl border border-border/50 backdrop-blur-sm bg-card/20 overflow-hidden">
          {/* Mouse particles trail */}
          <AnimatePresence>
            {isHovering && (
              <>
                {/* Instead of multiple particles, just use one thin line-like particle */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    x: mouseX,
                    y: mouseY,
                    width: 2, 
                    height: 0.5,
                    backgroundColor: 'rgba(var(--primary), 0.3)',
                    borderRadius: '1px',
                    translateX: '-50%',
                    translateY: '-50%',
                    zIndex: 20
                  }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Floating interactive elements */}
          <FloatingElement mouseX={mouseX} mouseY={mouseY} resistance={20} className="top-1/4 left-1/4">
            <MagneticEffect strength={30} radius={100}>
              <motion.div 
                className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(var(--primary), 0.2)' }}
                onMouseEnter={() => updateCursorText('Drag me')}
                onMouseLeave={() => updateCursorText('')}
                drag
                dragConstraints={sectionRef}
              >
                <span className="text-primary font-medium">Drag me</span>
              </motion.div>
            </MagneticEffect>
          </FloatingElement>

          <FloatingElement mouseX={mouseX} mouseY={mouseY} resistance={-15} className="bottom-1/4 right-1/4">
            <MagneticEffect strength={25} radius={120}>
              <motion.div 
                className="h-20 w-20 rounded-full bg-secondary/20 flex items-center justify-center shadow-lg cursor-pointer"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--secondary), 0.3)' }}
                onMouseEnter={() => updateCursorText('Click me')}
                onMouseLeave={() => updateCursorText('')}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-secondary-foreground font-medium">Click</span>
              </motion.div>
            </MagneticEffect>
          </FloatingElement>

          <FloatingElement mouseX={mouseX} mouseY={mouseY} resistance={30} className="top-1/3 right-1/3">
            <MagneticEffect strength={35} radius={150}>
              <motion.div 
                className="h-28 w-28 rounded-xl rotate-45 bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center shadow-lg cursor-pointer overflow-hidden"
                whileHover={{ 
                  rotate: 0,
                  scale: 1.1,
                  background: 'linear-gradient(45deg, rgba(var(--primary), 0.3), rgba(var(--secondary), 0.3))'
                }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => updateCursorText('Hover me')}
                onMouseLeave={() => updateCursorText('')}
              >
                <span className="text-foreground font-medium -rotate-45 group-hover:rotate-0 transition-transform duration-300">Hover</span>
              </motion.div>
            </MagneticEffect>
          </FloatingElement>

          {/* Cursor follow text */}
          <AnimatePresence>
            {cursorText && (
              <motion.div
                className="absolute text-sm font-medium bg-primary text-primary-foreground px-2 py-1 rounded-md pointer-events-none z-30"
                style={{ 
                  x: mouseX, 
                  y: mouseY, 
                  translateX: '-50%', 
                  translateY: '-130%'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                {cursorText}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-muted-foreground text-sm">Move your mouse around to interact with the elements</p>
          </div>
        </div>
      </div>
    </div>
  );
}