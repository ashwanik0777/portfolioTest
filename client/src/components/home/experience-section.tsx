import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { AccessibleIcon, VisuallyHidden } from "@/lib/accessibility";

export function ExperienceSection() {
  const { data: experiences = [] } = useQuery<any[]>({
    queryKey: ["/api/experiences"],
  });

  const timelineVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <section id="experience" className="py-20 bg-muted/30 dark:bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" aria-labelledby="experience-section-title">
          <h2 id="experience-section-title" className="text-3xl sm:text-4xl font-bold">
            Work <span className="text-primary">Experience</span>
          </h2>
          <div className="mt-2 h-1 w-20 bg-primary mx-auto" aria-hidden="true"></div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="timeline-container pl-10 pb-5"
            variants={timelineVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            aria-label="Work experience timeline"
            role="list"
          >
            {experiences.map((experience) => (
              <motion.div 
                key={experience.id}
                className="mb-12 relative"
                variants={itemVariants}
                role="listitem"
                aria-labelledby={`job-title-${experience.id}`}
              >
                <div className="absolute left-[-40px] flex items-center justify-center w-10 h-10 bg-primary rounded-full border-4 border-background dark:border-background" aria-hidden="true">
                  <AccessibleIcon label="Job position icon">
                    <Briefcase className="h-4 w-4 text-white" aria-hidden="true" />
                  </AccessibleIcon>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="font-mono text-xs text-muted-foreground" aria-label="Employment period">
                      <time dateTime={experience.startDate}>{formatDate(experience.startDate)}</time>
                      {" - "}
                      {experience.endDate ? 
                        <time dateTime={experience.endDate}>{formatDate(experience.endDate)}</time> : 
                        <span>Present</span>
                      }
                    </div>
                    <h3 id={`job-title-${experience.id}`} className="text-xl font-semibold mt-1">{experience.jobTitle}</h3>
                    <p className="text-primary font-medium mt-1">{experience.company}</p>
                    <p className="text-muted-foreground mt-4">
                      {experience.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Technologies used">
                      {experience.technologies.split(',').map((tech: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-primary/10 dark:bg-primary/20 text-primary"
                        >
                          {tech.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
