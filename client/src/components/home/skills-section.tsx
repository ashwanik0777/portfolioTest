import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAnnouncement, VisuallyHidden } from "@/lib/accessibility";
import { SkillsComparison } from "./skills-comparison";

export function SkillsSection() {
  const { data: skills = [] } = useQuery<any[]>({
    queryKey: ["/api/skills"],
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [groupedSkills, setGroupedSkills] = useState<Record<string, any[]>>({});
  const { announce } = useAnnouncement();

  useEffect(() => {
    // Extract unique categories
    if (skills.length) {
      const allCategories = skills.map((skill) => skill.category);
      
      // Manual approach to get unique categories
      const uniqueCategories: string[] = [];
      allCategories.forEach(category => {
        if (!uniqueCategories.includes(category)) {
          uniqueCategories.push(category);
        }
      });
      
      setCategories(uniqueCategories);

      // Group skills by category
      const grouped = uniqueCategories.reduce((acc, category) => {
        acc[category] = skills.filter((skill) => skill.category === category);
        return acc;
      }, {} as Record<string, any[]>);
      
      setGroupedSkills(grouped);
    }
  }, [skills]);

  // Calculate skill stats for visualization
  const getSkillStats = useCallback(() => {
    if (!skills.length) return {};
    
    // Find top skills (highest level)
    const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 5);
    
    // Calculate category distribution
    const categoryDistribution = categories.reduce((acc, category) => {
      if (category === 'all') return acc;
      const count = skills.filter(skill => skill.category === category).length;
      return { ...acc, [category]: count };
    }, {} as Record<string, number>);
    
    // Calculate average level by category
    const categoryAverages = categories.reduce((acc, category) => {
      if (category === 'all') return acc;
      
      const categorySkills = skills.filter(skill => skill.category === category);
      if (!categorySkills.length) return acc;
      
      const avg = Math.round(
        categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length
      );
      
      return { ...acc, [category]: avg };
    }, {} as Record<string, number>);
    
    return { topSkills, categoryDistribution, categoryAverages };
  }, [skills, categories]);

  // Animate progress bars when they appear in the viewport
  useEffect(() => {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });

    progressBars.forEach(bar => {
      observer.observe(bar);
    });

    return () => {
      progressBars.forEach(bar => {
        observer.unobserve(bar);
      });
    };
  }, [activeCategory, groupedSkills]);

  return (
    <section id="skills" className="py-20 bg-muted/30 dark:bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" aria-labelledby="skills-section-title">
          <h2 id="skills-section-title" className="text-3xl sm:text-4xl font-bold">
            My <span className="text-primary">Skills</span>
          </h2>
          <div className="mt-2 h-1 w-20 bg-primary mx-auto" aria-hidden="true"></div>
          <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
            Professional skills developed through years of work experience and continuous learning
          </p>
        </div>
        
        <div 
          className="mb-10 flex flex-wrap justify-center gap-3"
          role="tablist"
          aria-label="Skill categories"
        >
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            className={activeCategory === "all" ? "bg-primary" : ""}
            onClick={() => {
              setActiveCategory("all");
              announce("Showing all skill categories");
            }}
            role="tab"
            aria-selected={activeCategory === "all"}
            aria-controls="all-skills-panel"
            id="all-skills-tab"
          >
            All Skills
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={activeCategory === category ? "bg-primary" : ""}
              onClick={() => {
                setActiveCategory(category);
                announce(`Showing ${category} skills`);
              }}
              role="tab"
              aria-selected={activeCategory === category}
              aria-controls={`${category.toLowerCase()}-skills-panel`}
              id={`${category.toLowerCase()}-skills-tab`}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Skills Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border border-primary/10 bg-card/95 backdrop-blur-sm shadow-lg h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/40 mr-3 rounded-full"></div>
                  Skills Overview
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category, index) => {
                    // Calculate how many skills in this category
                    const categorySkills = category === "all" 
                      ? skills 
                      : skills.filter(skill => skill.category === category);
                    
                    // Calculate average proficiency level
                    const avgLevel = categorySkills.length 
                      ? Math.round(categorySkills.reduce((acc, skill) => acc + skill.level, 0) / categorySkills.length) 
                      : 0;
                    
                    return category !== "all" ? (
                      <div 
                        key={category}
                        className="bg-card/80 border border-primary/5 rounded-xl p-4 hover:shadow-md transition-all hover:border-primary/20"
                      >
                        <div className="text-sm text-muted-foreground mb-1">{category}</div>
                        <div className="text-2xl font-bold mb-2">{categorySkills.length}</div>
                        <div className="flex items-center">
                          <div className="w-full bg-muted/50 h-1.5 rounded-full">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                              style={{ width: `${avgLevel}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium">{avgLevel}%</span>
                        </div>
                      </div>
                    ) : null;
                  }).filter(Boolean)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border border-primary/10 bg-card/95 backdrop-blur-sm shadow-lg h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/40 mr-3 rounded-full"></div>
                  Top Skills
                </h3>
                
                <div className="space-y-5">
                  {[...skills]
                    .sort((a, b) => b.level - a.level)
                    .slice(0, 5)
                    .map((skill, index) => (
                      <div key={skill.id} className="relative">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-primary mr-2">{index + 1}</span>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <span className="bg-primary/10 px-2 py-0.5 rounded-full text-xs font-semibold text-primary">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-muted/50 h-3 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full progress-bar"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full"></div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      
        {/* Skills Comparison */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <SkillsComparison skills={skills} />
        </motion.div>
        
        {/* Category-wise Skills Lists with Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(activeCategory === "all" ? categories : [activeCategory]).map((category) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={cn(
                activeCategory !== "all" && activeCategory !== category && "hidden"
              )}
              role="tabpanel"
              id={activeCategory === "all" ? "all-skills-panel" : `${category.toLowerCase()}-skills-panel`}
              aria-labelledby={activeCategory === "all" ? "all-skills-tab" : `${category.toLowerCase()}-skills-tab`}
            >
              <Card className="border-primary/10 bg-card/90 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-6">
                  <h3 id={`${category.toLowerCase()}-technologies`} className="text-xl font-bold mb-6 flex items-center">
                    <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/40 mr-3 rounded-full"></div>
                    {category} Technologies
                  </h3>
                  
                  <div role="list" aria-labelledby={`${category.toLowerCase()}-technologies`}>
                    {groupedSkills[category]?.map((skill) => (
                      <motion.div 
                        className="mb-6" 
                        key={skill.id} 
                        role="listitem"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-medium" id={`skill-name-${skill.id}`}>{skill.name}</span>
                          <span 
                            aria-live="polite" 
                            className="bg-primary/10 px-2 py-0.5 rounded-full text-xs font-semibold text-primary"
                          >
                            {skill.level}%
                          </span>
                        </div>
                        <div 
                          className="relative h-3 bg-muted/50 dark:bg-muted/30 rounded-full overflow-hidden shadow-inner"
                          aria-labelledby={`skill-name-${skill.id}`}
                          role="progressbar"
                          aria-valuenow={skill.level}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div 
                            className="progress-bar h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" 
                            style={{ width: `${skill.level}%` }}
                            aria-hidden="true"
                          ></div>
                        </div>
                        <VisuallyHidden>
                          {skill.name} proficiency level: {skill.level} percent
                        </VisuallyHidden>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
