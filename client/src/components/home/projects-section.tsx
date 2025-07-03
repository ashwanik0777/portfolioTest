import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, CornerRightDown, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { TransitionSection } from "@/components/ui/motion";
import { AccessibleIcon, useAnnouncement, VisuallyHidden } from "@/lib/accessibility";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { MagneticEffect } from "@/components/ui/magnetic-effect";

// 3D Tilt Card Component
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

function TiltCard({ children, className }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for the tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  // Add spring physics for smoother animation
  const springConfig = { damping: 20, stiffness: 200 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Handle mouse move on card
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to card center
    const xValue = e.clientX - rect.left - width / 2;
    const yValue = e.clientY - rect.top - height / 2;
    
    // Update motion values
    x.set(xValue);
    y.set(yValue);
  }

  // Reset card position on mouse leave
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }
  
  return (
    <motion.div
      ref={cardRef}
      className={cn("relative perspective-1000 cursor-pointer", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: "perspective(1000px)",
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

// Interactive Particle Effect Component
function ParticleEffect() {
  const particleRef = useRef<HTMLDivElement>(null);
  
  // Create a sparkle effect when visible
  useEffect(() => {
    if (!particleRef.current) return;
    
    // Random delay for staggered animation
    const delay = Math.random() * 1000;
    
    // Animate after delay
    const timer = setTimeout(() => {
      if (particleRef.current) {
        particleRef.current.style.opacity = '1';
        particleRef.current.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      ref={particleRef}
      className="w-1 h-1 rounded-full bg-primary absolute opacity-0 transition-all duration-1000"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        boxShadow: '0 0 8px 2px rgba(var(--primary), 0.6)',
      }}
    />
  );
}

export function ProjectsSection() {
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const [activeFilter, setActiveFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const { announce } = useAnnouncement();
  
  // State for the project in focus (used for detail view)
  const [focusedProject, setFocusedProject] = useState<number | null>(null);

  useEffect(() => {
    // Extract unique categories
    if (projects.length) {
      const allCategories = projects.map((project) => project.category);
      // Fix the Set issue by using a different approach for uniqueness
      const uniqueCategories = allCategories.filter((category, index) => 
        allCategories.indexOf(category) === index
      );
      setCategories(uniqueCategories);
    }
  }, [projects]);
  
  // Announce when filter changes, for screen readers
  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
    const projectCount = category === 'all' 
      ? projects.length 
      : projects.filter(p => p.category === category).length;
    
    announce(`Showing ${projectCount} ${category} projects`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <TransitionSection id="projects" className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-10"></div>
        <div className="absolute -top-64 -right-64 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-64 -left-64 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 py-1.5 px-4 rounded-full">
            My Work
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Featured <span className="text-primary">Projects</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Explore some of my recent work, from web applications to design projects.
            Each project represents unique challenges and solutions.
          </p>
        </motion.div>
        
        <motion.div 
          className="mb-10 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            className={cn(
              "rounded-full px-6 transition-all duration-300",
              activeFilter === "all" ? "bg-primary shadow-lg shadow-primary/20" : ""
            )}
            onClick={() => handleFilterChange("all")}
            aria-pressed={activeFilter === "all"}
            aria-label="Show all projects"
          >
            All Projects
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              className={cn(
                "rounded-full px-6 transition-all duration-300",
                activeFilter === category ? "bg-primary shadow-lg shadow-primary/20" : ""
              )}
              onClick={() => handleFilterChange(category)}
              aria-pressed={activeFilter === category}
              aria-label={`Show ${category} projects`}
            >
              {category}
            </Button>
          ))}
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {projects.map((project, index) => (
            <motion.div 
              key={project.id}
              className={cn(
                "enhanced-card",
                activeFilter !== "all" && project.category !== activeFilter && "hidden"
              )}
              variants={item}
              custom={index}
              onHoverStart={() => setFocusedProject(project.id)}
              onHoverEnd={() => setFocusedProject(null)}
            >
              <InteractiveCard className="h-full" depth={15} glare={true}>
                <Card className="h-full overflow-hidden border border-border/50 group relative" 
                  role="article" 
                  aria-labelledby={`project-title-${project.id}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Interactive particle effects */}
                  {focusedProject === project.id && (
                    <>
                      {[...Array(10)].map((_, i) => (
                        <ParticleEffect key={i} />
                      ))}
                    </>
                  )}
                  
                  <div className="relative overflow-hidden h-52">
                    <img 
                      src={project.image} 
                      alt={`Screenshot of ${project.title} project`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    
                    {/* Glowing border effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 border-2 border-primary/40 rounded-t-md"></div>
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Reveal action buttons on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: focusedProject === project.id ? 1 : 0, y: focusedProject === project.id ? 0 : 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-2"
                      >
                        {project.demoUrl && (
                          <Button size="sm" variant="secondary" asChild className="rounded-full shadow-lg shadow-primary/20">
                            <a 
                              href={project.demoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              aria-label={`View live demo of ${project.title}`}
                            >
                              <AccessibleIcon label="External link">
                                <ExternalLink className="h-4 w-4 mr-1" aria-hidden="true" />
                              </AccessibleIcon>
                              <span>Demo</span>
                            </a>
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button size="sm" variant="outline" asChild className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                            <a 
                              href={project.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              aria-label={`View source code of ${project.title} on GitHub`}
                            >
                              <AccessibleIcon label="GitHub repository">
                                <Github className="h-4 w-4 mr-1" aria-hidden="true" />
                              </AccessibleIcon>
                              <span>Code</span>
                            </a>
                          </Button>
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Category badge with enhanced styling */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "bg-primary/90 text-white border-none shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20",
                          project.category === "Mobile Application" && "bg-secondary/90 group-hover:shadow-secondary/20",
                          project.category === "UI/UX Design" && "bg-accent/90 group-hover:shadow-accent/20"
                        )}
                      >
                        {project.category}
                      </Badge>
                    </div>
                    
                    {/* Enhance corner decoration with animation */}
                    <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
                      <motion.div 
                        className="absolute -top-1 -left-1 w-8 h-8 bg-primary/30 rounded-full blur-md" 
                        animate={{ 
                          scale: focusedProject === project.id ? [1, 1.2, 1] : 1
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: focusedProject === project.id ? Infinity : 0,
                          repeatType: "reverse"
                        }}
                      />
                    </div>
                  </div>
                  
                  <CardContent className="p-6 relative">
                    {/* Animated info icon with tooltip */}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <motion.button
                          className="absolute -top-4 right-6 text-primary bg-background rounded-full p-1 shadow-md cursor-help focus:outline-none focus:ring-2 focus:ring-primary"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Project information"
                        >
                          <Info className="h-4 w-4" />
                        </motion.button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 text-sm bg-card p-4 shadow-lg border border-border/50 rounded-md">
                        <p>{project.description}</p>
                        <div className="mt-2 pt-2 border-t border-border/30">
                          <span className="text-xs text-primary font-medium">Key technologies used</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.tags.split(',').map((tag: string, tagIndex: number) => (
                              <span key={tagIndex} className="text-xs text-muted-foreground">{tag.trim()}{tagIndex < project.tags.split(',').length - 1 ? ',' : ''}</span>
                            ))}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    
                    {/* Project title with animated highlight effect */}
                    <h3 
                      id={`project-title-${project.id}`} 
                      className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors relative inline-block"
                    >
                      {project.title}
                      {focusedProject === project.id && (
                        <motion.div 
                          className="absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        />
                      )}
                    </h3>
                    
                    {/* Description with slightly enhanced visibility on hover */}
                    <p className={cn(
                      "text-muted-foreground text-sm mb-4 line-clamp-2 transition-colors duration-300",
                      focusedProject === project.id && "text-foreground"
                    )}>
                      {project.description}
                    </p>
                    
                    {/* Technology tags with hover effect */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.split(',').map((tag: string, tagIndex: number) => (
                        <motion.div key={tagIndex} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 group-hover:shadow-sm"
                          >
                            {tag.trim()}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1">
                        <Sparkles className={cn(
                          "h-3 w-3 transition-all duration-300",
                          focusedProject === project.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="text-xs text-muted-foreground">
                          {new Date().getFullYear()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {project.demoUrl && (
                          <motion.a 
                            href={project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            aria-label={`View live demo of ${project.title}`}
                          >
                            <span>View Live</span>
                            <AccessibleIcon label="External link">
                              <ExternalLink className="h-4 w-4 ml-1" aria-hidden="true" />
                            </AccessibleIcon>
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </InteractiveCard>
            </motion.div>
          ))}
        </motion.div>
        
        {/* View all projects button */}
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="outline" 
            className="rounded-full px-8 py-6 group relative overflow-hidden border-primary/20"
            aria-label="View all projects in portfolio"
          >
            <span className="relative z-10 flex items-center gap-2">
              View All Projects
              <AccessibleIcon label="Right arrow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </AccessibleIcon>
            </span>
            <span className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"></span>
          </Button>
        </motion.div>
      </div>
    </TransitionSection>
  );
}
