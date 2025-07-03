import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { Typewriter, CreativeTypewriter } from "@/components/ui/typewriter";
import { FadeIn, SlideUp, SlideRight, SlideLeft } from "@/components/ui/motion";
import { Particles } from "@/components/ui/particles";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";
import { AccessibleIcon, useAnnouncement } from "@/lib/accessibility";

// Define skills that will rotate in the typewriter effect
const SKILLS = [
  "Full Stack Developer",
  "Frontend Specialist",
  "React Expert",
  "UI/UX Designer",
  "Node.js Developer",
  "TypeScript Pro",
  "Web Architect",
  "Mobile App Developer"
];

export function HeroSection() {
  const { t } = useTranslation();
  const { announce } = useAnnouncement();
  
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  const { data: socials } = useQuery<any[]>({
    queryKey: ["/api/socials"],
  });

  const { data: resume } = useQuery<any>({
    queryKey: ["/api/resume"],
  });

  // Animation states
  const [nameTyped, setNameTyped] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');

  // Trigger reveal animation after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle name typing completion
  const handleNameTyped = () => {
    setNameTyped(true);
    // Announce full name for screen readers
    announce(`${profile?.fullName || "Alex Johnson"}, ${profile?.title || "Full Stack Developer"}`, false);
    
    const timer = setTimeout(() => {
      setShowSkills(true);
    }, 300);
    return () => clearTimeout(timer);
  };
  
  // Extract first name for the animation
  const firstName = profile?.fullName?.split(' ')[0] || "Alex";
  
  // Track and announce skill changes for screen readers
  const handleSkillChange = (skill: string) => {
    if (skill !== currentSkill) {
      setCurrentSkill(skill);
      announce(`Skill: ${skill}`, false);
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center pt-16 relative overflow-hidden">
      {/* Particle background effect */}
      <Particles />
      
      {/* Gradient blob effects */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      
      {/* Theme toggle and Language switcher moved to navbar */}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <SlideRight className="order-2 lg:order-1">
            {/* Creative name typing animation */}
            <div className="overflow-hidden">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">
                <div className="flex items-end flex-wrap gap-x-3">
                  <span className="text-muted-foreground/70">{t('hero.greeting')}</span>
                  {/* Name with typing effect */}
                  {isRevealed ? (
                    <CreativeTypewriter
                      text={firstName}
                      speed={100}
                      typingStyles="scramble"
                      className="text-gradient-animated"
                      onComplete={handleNameTyped}
                      ariaLabel={`${firstName}, typing animation`}
                    />
                  ) : null}
                </div>
              </div>
              
              {/* Full name and title reveal */}
              <AnimatePresence>
                {nameTyped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-2">
                      {profile?.fullName || "Alex Johnson"}
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Role/skills typewriter effect */}
            <div className="h-8 mt-4">
              <AnimatePresence>
                {showSkills && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-full"
                  >
                    <span className="text-lg sm:text-xl text-muted-foreground font-medium mr-2">{t('hero.intro')}</span>
                    <Typewriter
                      words={SKILLS}
                      typingSpeed={80}
                      deletingSpeed={60}
                      delayBetweenWords={1500}
                      className="text-lg sm:text-xl font-bold text-primary"
                      cursorClassName="text-primary"
                      onWordChange={handleSkillChange}
                      ariaLabel="Animated skills showcase"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <SlideUp delay={0.1}>
              <motion.p 
                className="mt-6 text-lg text-muted-foreground max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                {profile?.bio || "I craft exceptional digital experiences with modern technologies, focusing on creating responsive, accessible and performant applications."}
              </motion.p>
            </SlideUp>
            
            <SlideUp delay={0.2}>
              <motion.div 
                className="mt-8 flex flex-wrap gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105">
                  <Link href="#contact">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('hero.contactButton')}
                    </span>
                  </Link>
                </Button>
                {resume?.url && (
                  <Button asChild variant="outline" size="lg" className="transition-all duration-300 hover:scale-105 group">
                    <a href={resume.url} target="_blank" rel="noopener noreferrer">
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('hero.downloadResume')}
                      </span>
                    </a>
                  </Button>
                )}
              </motion.div>
            </SlideUp>
            
            <FadeIn delay={0.4}>
              <div className="mt-8 flex items-center space-x-6">
                {socials?.map((social, index) => (
                  <motion.a 
                    key={social.id}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 p-3 hover:bg-primary/10 rounded-full relative group"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + (index * 0.1) }}
                    aria-label={`${social.name} profile`}
                  >
                    {/* Tooltip */}
                    <span 
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                      aria-hidden="true"
                    >
                      {social.name}
                    </span>
                    
                    {/* Icon wrapper for accessibility */}
                    <AccessibleIcon label={social.name}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                        dangerouslySetInnerHTML={{ __html: social.icon }}
                        aria-hidden="true"
                        focusable="false"
                      />
                    </AccessibleIcon>
                  </motion.a>
                ))}
              </div>
            </FadeIn>
            
            <SlideUp delay={0.6}>
              <div className="mt-12 flex items-center text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border"></div>
                <span className="px-3">{t('hero.scrollDown')}</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <div className="flex justify-center mt-2">
                <motion.a
                  href="#projects"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-primary/70 hover:text-primary transition-colors"
                >
                  <svg 
                    className="w-6 h-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.a>
              </div>
            </SlideUp>
          </SlideRight>
          
          <SlideLeft className="order-1 lg:order-2 flex justify-center">
            <motion.div 
              className="relative w-72 h-72 sm:w-96 sm:h-96"
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
            >
              {/* Glowing blob behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 dark:from-primary/20 dark:to-secondary/20 rounded-full -z-10 blur-3xl transform scale-110"></div>
              
              {/* Profile image with border glow */}
              <div className="relative w-full h-full rounded-full border-4 border-white/80 dark:border-white/20 p-2 shadow-2xl shadow-primary/20 overflow-hidden">
                <img 
                  src={profile?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=800&h=800"} 
                  alt={profile?.fullName || "Profile"} 
                  className="rounded-full w-full h-full object-cover"
                />
                
                {/* Shimmering overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full shimmer"></div>
              </div>
              
              {/* Orbiting skill bubbles */}
              {SKILLS.slice(0, 6).map((skill, i) => {
                const angle = (i * (360 / 6)) * (Math.PI / 180);
                const radius = 160; // Distance from center
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const delay = i * 0.2;
                
                // Define animation for orbital movement
                const orbit = {
                  x: [x, x + 10, x - 5, x],
                  y: [y, y - 5, y + 10, y],
                  transition: {
                    repeat: Infinity,
                    duration: 6 + i,
                    ease: "easeInOut",
                  }
                };
                
                return (
                  <motion.div
                    key={skill}
                    className="absolute flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-medium px-3 py-1.5 shadow-lg backdrop-blur-sm z-10"
                    style={{ 
                      originX: '50%', 
                      originY: '50%',
                      boxShadow: '0 0 15px rgba(var(--primary), 0.3)'
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      ...orbit
                    }}
                    whileHover={{
                      scale: 1.2,
                      boxShadow: '0 0 20px rgba(var(--primary), 0.5)'
                    }}
                    transition={{
                      type: 'spring',
                      delay: delay + 1, // Add base delay
                      duration: 1
                    }}
                  >
                    {/* Use a more elegant display of skills */}
                    <span className="font-semibold">{skill.split(' ')[0]}</span>
                    <motion.span 
                      className="inline-block ml-1 opacity-0"
                      whileHover={{ opacity: 1 }}
                    >
                      <svg className="w-3 h-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.span>
                  </motion.div>
                )
              })}
              
              {/* Decorative icons around the image */}
              <motion.div 
                className="absolute -bottom-2 -right-2 bg-secondary text-white p-4 rounded-full shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  duration: 5 
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </motion.div>
              
              <motion.div 
                className="absolute -top-2 -left-2 bg-primary text-white p-4 rounded-full shadow-lg"
                whileHover={{ scale: 1.1, rotate: -5 }}
                animate={{ 
                  rotate: [0, -5, 0, 5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  duration: 6,
                  delay: 1
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  />
                </svg>
              </motion.div>
            </motion.div>
          </SlideLeft>
        </div>
        
        {/* Admin Dashboard Access Link */}
        <motion.div 
          className="absolute bottom-8 left-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground hover:text-primary"
          >
            <Link href="/auth">{t('auth.adminPanel')}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
