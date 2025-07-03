import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  text: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    position: "Technical Director",
    company: "Global Software Inc.",
    text: "Working with Alex has been an excellent experience. Their technical skills and problem-solving abilities are unique. They successfully completed our project on time and with high quality.",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Priya Patel",
    position: "Product Manager",
    company: "Innovate Technologies",
    text: "Alex completely transformed our user interface. Their creativity and design sense gave our app new life. We've received excellent feedback from customers as well.",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "Amit Singh",
    position: "CEO",
    company: "Digital Solutions",
    text: "Alex is an exceptional developer who not only codes but also understands business needs. Their skill and professional approach were the main reasons behind the success of our project.",
    image: "https://randomuser.me/api/portraits/men/46.jpg"
  }
];

export function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [direction, setDirection] = useState(0);
  const testimonialWrapperRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextTestimonial = () => {
    setDirection(1);
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-rotate testimonials
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextTestimonial();
    }, 10000); // Change every 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset interval when user navigates manually
  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        nextTestimonial();
      }, 10000);
    }
  };

  // Handle manual navigation with interval reset
  const handlePrev = () => {
    prevTestimonial();
    resetInterval();
  };

  const handleNext = () => {
    nextTestimonial();
    resetInterval();
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section id="testimonials" className="py-16 bg-muted/50 w-full">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Client Testimonials
          </h2>
          <p className="text-muted-foreground max-w-[600px]">
            Read what clients I've worked with have to say about my services and work style.
          </p>
        </div>

        <div className="relative mx-auto">
          <div 
            ref={testimonialWrapperRef}
            className="overflow-hidden relative h-[400px] md:h-[300px] rounded-xl shadow-lg"
          >
            <motion.div
              key={activeTestimonial}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 flex flex-col md:flex-row items-center justify-center p-8 bg-card/90 backdrop-blur-sm shadow-md rounded-xl border border-primary/10"
            >
              <div className="mb-6 md:mb-0 md:mr-10 flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src={testimonials[activeTestimonial].image} 
                    alt={testimonials[activeTestimonial].name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <Quote className="w-12 h-12 text-primary/30 mb-4 mx-auto md:mx-0 animate-pulse" />
                <p className="text-lg md:text-xl mb-6 italic leading-relaxed">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="border-t border-primary/10 pt-4 mt-2">
                  <p className="font-bold text-lg">{testimonials[activeTestimonial].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[activeTestimonial].position}, <span className="font-medium">{testimonials[activeTestimonial].company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation buttons and indicators in a single row */}
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrev}
              className="rounded-full hover:bg-primary/10 transition-all duration-300 border-primary/20"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            
            {/* Indicators - now in the middle */}
            <div className="flex justify-center space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? "w-10 bg-primary shadow-md" 
                      : "w-3 bg-primary/30 hover:bg-primary/50"
                  }`}
                  onClick={() => {
                    setDirection(index > activeTestimonial ? 1 : -1);
                    setActiveTestimonial(index);
                    resetInterval();
                  }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext}
              className="rounded-full hover:bg-primary/10 transition-all duration-300 border-primary/20"
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}