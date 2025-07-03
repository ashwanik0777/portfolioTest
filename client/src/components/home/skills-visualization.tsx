import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'framer-motion';

type Skill = {
  id: number;
  name: string;
  level: number;
  category: string;
  icon?: string;
};

interface SkillsVisualizationProps {
  skills: Skill[];
  maxSkills?: number;
}

export function SkillsVisualization({ skills = [], maxSkills = 12 }: SkillsVisualizationProps) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter and sort skills
  useEffect(() => {
    let filtered = [...skills];
    
    if (selectedCategory) {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }
    
    // Sort by level (high to low)
    filtered = filtered.sort((a, b) => b.level - a.level);
    
    // Limit to maxSkills
    filtered = filtered.slice(0, maxSkills);
    
    setFilteredSkills(filtered);
  }, [skills, selectedCategory, maxSkills]);

  // Trigger animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Get unique categories from skills
  const categories = skills.length ? 
    ['All', ...Array.from(new Set(skills.map(skill => skill.category)))] : 
    ['Frontend', 'Backend', 'DevOps', 'Mobile'];

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === 'All' ? null : category);
  };

  // Calculate random positions for skills in 3D space
  const getRandomPosition = (index: number) => {
    const radius = 300; // Adjust based on your container size
    const phiSpan = Math.PI / 2; 
    const thetaSpan = (Math.PI * 2);
    
    // Ensure even distribution
    const phi = phiSpan * Math.random();
    const theta = thetaSpan * index / filteredSkills.length;
    
    // Convert spherical coordinates to Cartesian
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    return { x, y, z };
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const skillVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.2,
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 60,
        damping: 15,
        delay: i * 0.08
      }
    })
  };

  // Color mapping for skill categories
  const categoryColors: Record<string, string> = {
    'Frontend': 'bg-blue-600/80',
    'Backend': 'bg-green-600/80',
    'Database': 'bg-yellow-600/80',
    'DevOps': 'bg-purple-600/80',
    'Mobile': 'bg-red-600/80',
    'Design': 'bg-pink-600/80',
    'Tools': 'bg-cyan-600/80',
    'Other': 'bg-gray-600/80',
  };

  // Default color for categories not in the map
  const getColorForCategory = (category: string) => {
    return categoryColors[category] || 'bg-primary/80';
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden mt-12"
      aria-label="Interactive 3D skills visualization"
    >
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${selectedCategory === (category === 'All' ? null : category) 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-primary/10 hover:bg-primary/20'}
            `}
            aria-pressed={selectedCategory === (category === 'All' ? null : category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 3D skills visualization */}
      <motion.div 
        className="relative w-full h-full perspective-[1000px]"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        style={{ 
          transformStyle: 'preserve-3d',
        }}
      >
        {filteredSkills.map((skill, index) => {
          const { x, y, z } = getRandomPosition(index);
          const scale = 0.6 + (skill.level / 100) * 0.4; // Scale based on skill level
          const zIndex = Math.round(100 - (z + 300));
          
          return (
            <motion.div
              key={skill.id}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              custom={index}
              variants={skillVariants}
              whileHover={{ scale: scale * 1.2, transition: { type: "spring", stiffness: 300 } }}
              style={{
                zIndex,
                transform: `translate3d(${x}px, ${y}px, ${z}px) translateZ(0)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div 
                className={`
                  flex items-center justify-center
                  ${getColorForCategory(skill.category)}
                  rounded-full w-20 h-20 shadow-lg cursor-pointer
                  hover:shadow-xl transition-shadow duration-300
                  text-white font-medium text-center px-1
                  border-2 border-white/10
                `}
                title={`${skill.name} - ${skill.level}%`}
              >
                {skill.icon ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: skill.icon }} 
                    className="w-8 h-8"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="text-xs">{skill.name}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Visual decoration: subtle grid background */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '30px 30px' 
        }}
        aria-hidden="true"
      />

      {/* Visual decoration: glowing orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-primary/10 filter blur-3xl mix-blend-overlay animate-pulse-slow pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-1/3 right-1/3 w-32 h-32 rounded-full bg-primary/5 filter blur-3xl mix-blend-overlay animate-pulse-slow pointer-events-none" 
        style={{ animationDelay: '1s' }}
        aria-hidden="true"
      />
    </div>
  );
}