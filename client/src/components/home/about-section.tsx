import { Card } from "@/components/ui/card";
import { Briefcase, GraduationCap, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export function AboutSection() {
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            About <span className="text-primary">Me</span>
          </h2>
          <div className="mt-2 h-1 w-20 bg-primary mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-xl -z-10 blur-3xl transform scale-110"></div>
            <img 
              src={profile?.aboutImage || "https://images.unsplash.com/photo-1552058544-f2b08422138a?fit=crop&w=800&h=600"} 
              alt="About Me" 
              className="rounded-xl shadow-xl w-full h-auto object-cover"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">
              {profile?.title || "Full Stack Developer & UI/UX Enthusiast"}
            </h3>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
              <p>{profile?.bio || "With over 5 years of experience, I specialize in building modern web applications using cutting-edge technologies. My passion is creating intuitive, performant experiences that solve real-world problems."}</p>
              <p>{profile?.currentWork || "I'm currently working as a Senior Developer at TechNova, where I lead frontend development for our flagship SaaS product. I'm constantly exploring new technologies and methodologies to enhance my skills."}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <Card className="p-4 flex items-center">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-muted-foreground">{profile?.experience || "5+ Years"}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Education</h4>
                  <p className="text-muted-foreground">{profile?.education || "M.S. Computer Science"}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-3">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-muted-foreground">{profile?.phone || "+1 (555) 123-4567"}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-muted-foreground">{profile?.email || "alex@example.com"}</p>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
