import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface SkillComparisonProps {
  skills: any[];
  compareCategories?: string[];
}

export function SkillsComparison({ skills, compareCategories = [] }: SkillComparisonProps) {
  // If no specific categories to compare, get the top 2 categories
  const categoriesToCompare = compareCategories.length 
    ? compareCategories 
    : getTopCategories(skills, 2);
  
  // Get skills grouped by the categories to compare
  const groupedSkills = categoriesToCompare.reduce((acc, category) => {
    acc[category] = skills.filter(skill => skill.category === category);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Get a list of common skills (skills that have same name across categories)
  // or unique skills in each category to make a fair comparison
  const commonSkills = getCommonSkillNames(groupedSkills, categoriesToCompare);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      }
    }
  };
  
  // Calculate colors for categories
  const categoryColors = {
    'Frontend': 'bg-blue-600/80',
    'Backend': 'bg-green-600/80',
    'Database': 'bg-yellow-600/80',
    'DevOps': 'bg-purple-600/80',
    'Mobile': 'bg-red-600/80',
    'Design': 'bg-pink-600/80',
    'Tools': 'bg-cyan-600/80',
    'Other': 'bg-gray-600/80',
    // Add more mappings as needed
  };
  
  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || 'bg-primary/80';
  };
  
  const getCategoryTextColor = (category: string) => {
    const baseColor = getCategoryColor(category).replace('bg-', 'text-').replace('/80', '');
    return baseColor;
  };

  return (
    <Card className="overflow-hidden border border-primary/10 bg-card/95 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/40 mr-3 rounded-full"></div>
          Skills Comparison
        </h3>
        
        {categoriesToCompare.length === 2 ? (
          <>
            {/* Category Headers */}
            <div className="flex mb-6">
              <div className="w-1/3"></div>
              {categoriesToCompare.map(category => (
                <div key={category} className="w-1/3 text-center">
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${getCategoryTextColor(category)}`}>
                    {category}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Skills Comparison */}
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {commonSkills.map(skillName => (
                <motion.div 
                  key={skillName} 
                  className="flex items-center"
                  variants={itemVariants}
                >
                  <div className="w-1/3 font-medium text-sm">{skillName}</div>
                  
                  {categoriesToCompare.map(category => {
                    const skill = groupedSkills[category]?.find(s => s.name === skillName);
                    const level = skill ? skill.level : 0;
                    
                    return (
                      <div key={`${category}-${skillName}`} className="w-1/3 px-2">
                        <div className="w-full bg-muted/50 h-3 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full ${getCategoryColor(category)}`}
                            style={{ width: `${level}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{level}%</span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">Not enough categories to compare.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get top categories by count
function getTopCategories(skills: any[], count: number): string[] {
  // Count skills per category
  const categoryCounts = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort categories by count
  return Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([category]) => category);
}

// Helper function to get common skill names between categories
function getCommonSkillNames(groupedSkills: Record<string, any[]>, categories: string[]): string[] {
  if (categories.length < 2) return [];
  
  // Get all skill names from all categories
  const allSkillNames = categories.flatMap(category => 
    groupedSkills[category]?.map(skill => skill.name) || []
  );
  
  // Get unique skill names
  const uniqueSkillNames = Array.from(new Set(allSkillNames));
  
  // Sort by the number of categories that have this skill
  return uniqueSkillNames.sort((a, b) => {
    const aCount = categories.filter(category => 
      groupedSkills[category]?.some(skill => skill.name === a)
    ).length;
    
    const bCount = categories.filter(category => 
      groupedSkills[category]?.some(skill => skill.name === b)
    ).length;
    
    // First prioritize skills that exist in most categories
    if (aCount !== bCount) return bCount - aCount;
    
    // Then sort alphabetically
    return a.localeCompare(b);
  }).slice(0, 8); // Limit to 8 skills for comparison
}