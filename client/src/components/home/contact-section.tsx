import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Send, Github, Linkedin, Twitter } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, useInView, useAnimation } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AccessibleIcon, useAnnouncement, VisuallyHidden } from "@/lib/accessibility";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { announce } = useAnnouncement();
  
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  const { data: socials } = useQuery<any[]>({
    queryKey: ["/api/socials"],
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      // Announce to screen readers that the message was sent successfully
      announce("Your message has been sent successfully. Thanks for reaching out!");
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Oops! Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
      // Announce error to screen readers
      announce("There was an error sending your message. Please try again.", true);
      setIsSubmitting(false);
    }
  });

  function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    announce("Sending your message...");
    contactMutation.mutate(data);
  }

  // Refs for 3D rotation effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Controls for staggered animations
  const controls = useAnimation();
  const contactRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contactRef, { once: false, amount: 0.3 });
  
  // Trigger animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);
  
  // Handle 3D rotation effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    setMousePosition({ x, y });
  };
  
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  
  // Calculate 3D rotation based on mouse position
  const rotateX = isHovering ? (mousePosition.y - 0.5) * 10 : 0;
  const rotateY = isHovering ? (mousePosition.x - 0.5) * -10 : 0;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden" ref={contactRef}>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16" 
          aria-labelledby="contact-section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 id="contact-section-title" className="text-4xl sm:text-5xl font-bold">
            Get In <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Touch</span>
          </h2>
          <div className="mt-3 h-1 w-24 bg-gradient-to-r from-primary to-primary/40 mx-auto rounded-full" aria-hidden="true"></div>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
            Have a project in mind or want to collaborate? Feel free to reach out through the form below or connect on social media.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: isHovering ? 'none' : 'transform 0.5s ease-out'
            }}
          >
            <Card>
              <CardContent className="p-8">
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit(onSubmit)} 
                    className="space-y-6"
                    aria-labelledby="contact-form-heading"
                    noValidate
                  >
                    <div className="sr-only" id="contact-form-heading">Contact form</div>
                    <div className="sr-only" aria-live="polite">
                      {form.formState.isSubmitting ? "Submitting form, please wait." : null}
                      {form.formState.isSubmitSuccessful ? "Form submitted successfully." : null}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              id="name"
                              placeholder="Enter your name" 
                              aria-required="true" 
                              aria-invalid={!!form.formState.errors.name}
                              aria-describedby={form.formState.errors.name ? "name-error" : undefined}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage id="name-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="email">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              id="email"
                              type="email" 
                              placeholder="Enter your email" 
                              aria-required="true"
                              aria-invalid={!!form.formState.errors.email}
                              aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage id="email-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="subject">Subject</FormLabel>
                          <FormControl>
                            <Input 
                              id="subject"
                              placeholder="Enter subject" 
                              aria-required="true"
                              aria-invalid={!!form.formState.errors.subject}
                              aria-describedby={form.formState.errors.subject ? "subject-error" : undefined}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage id="subject-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="message">Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              id="message"
                              placeholder="Type your message here..." 
                              rows={5}
                              aria-required="true"
                              aria-invalid={!!form.formState.errors.message}
                              aria-describedby={form.formState.errors.message ? "message-error" : undefined}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage id="message-error" />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span>Sending...</span>
                          <VisuallyHidden>Please wait while your message is being sent</VisuallyHidden>
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            className="flex flex-col gap-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border border-primary/10 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/40 mr-3 rounded-full"></div>
                  Contact Info
                </h3>
                
                <motion.div 
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate={controls}
                >
                  <motion.div 
                    className="group relative overflow-hidden rounded-xl border border-primary/5 p-4 hover:border-primary/20 transition-all duration-300 bg-card/90"
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { type: "spring", stiffness: 500 } }}
                    aria-labelledby="phone-contact-label"
                  >
                    {/* Decoration */}
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"></div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-shrink-0">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <AccessibleIcon label="Phone number">
                            <Phone className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" aria-hidden="true" />
                          </AccessibleIcon>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold" id="phone-contact-label">Phone</h4>
                        <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          <a 
                            href={`tel:${profile?.phone || "+15551234567"}`} 
                            className="relative inline-block overflow-hidden group-hover:text-primary transition-colors"
                          >
                            {profile?.phone || "+1 (555) 123-4567"}
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                          </a>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="group relative overflow-hidden rounded-xl border border-primary/5 p-4 hover:border-primary/20 transition-all duration-300 bg-card/90"
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { type: "spring", stiffness: 500 } }}
                    aria-labelledby="email-contact-label"
                  >
                    {/* Decoration */}
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"></div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-shrink-0">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <AccessibleIcon label="Email address">
                            <Mail className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" aria-hidden="true" />
                          </AccessibleIcon>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold" id="email-contact-label">Email</h4>
                        <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          <a 
                            href={`mailto:${profile?.email || "alex@example.com"}`} 
                            className="relative inline-block overflow-hidden group-hover:text-primary transition-colors"
                          >
                            {profile?.email || "alex@example.com"}
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                          </a>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="group relative overflow-hidden rounded-xl border border-primary/5 p-4 hover:border-primary/20 transition-all duration-300 bg-card/90"
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { type: "spring", stiffness: 500 } }}
                    aria-labelledby="location-contact-label"
                  >
                    {/* Decoration */}
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"></div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-shrink-0">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <AccessibleIcon label="Location">
                            <MapPin className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" aria-hidden="true" />
                          </AccessibleIcon>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold" id="location-contact-label">Location</h4>
                        <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {profile?.location || "San Francisco, CA, USA"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border border-primary/10 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/40 mr-3 rounded-full"></div>
                  Connect With Me
                </h3>
                
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4" 
                  role="list"
                  variants={containerVariants}
                  initial="hidden"
                  animate={controls}
                >
                  {socials?.map((social, index) => (
                    <motion.a 
                      key={social.id}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center justify-center p-4 bg-card/90 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 border border-primary/5 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 h-24"
                      aria-label={`Visit my ${social.name} profile (opens in a new tab)`}
                      role="listitem"
                      variants={itemVariants}
                      whileHover={{ 
                        y: -5, 
                        transition: { type: "spring", stiffness: 300 } 
                      }}
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                          dangerouslySetInnerHTML={{ __html: social.icon }}
                          aria-hidden="true"
                          focusable="false"
                        />
                        <VisuallyHidden>{social.name} icon</VisuallyHidden>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{social.name}</span>
                    </motion.a>
                  ))}
                  
                  {/* Fallback social icons if no socials data */}
                  {!socials || socials.length === 0 ? (
                    <>
                      <motion.a 
                        href="https://github.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center p-4 bg-card/90 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 border border-primary/5 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 h-24"
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                          <Github className="h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">GitHub</span>
                      </motion.a>
                      
                      <motion.a 
                        href="https://linkedin.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center p-4 bg-card/90 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 border border-primary/5 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 h-24"
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                          <Linkedin className="h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">LinkedIn</span>
                      </motion.a>
                      
                      <motion.a 
                        href="https://twitter.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center p-4 bg-card/90 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 border border-primary/5 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 h-24"
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                          <Twitter className="h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Twitter</span>
                      </motion.a>
                    </>
                  ) : null}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
