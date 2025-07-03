import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Award, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
}

interface TrackVisitorResponse extends VisitorStats {
  isNewVisitor: boolean;
}

// Milestone definitions
interface Milestone {
  count: number;
  icon: React.ReactNode;
  label: string;
  color: string;
  description: string;
}

export function VisitorCounter() {
  // Define milestones
  const milestones: Milestone[] = [
    { 
      count: 10, 
      icon: <Star className="h-4 w-4" />, 
      label: 'Bronze', 
      color: 'rgb(176, 141, 87)', 
      description: 'This portfolio has reached 10 unique visitors!'
    },
    { 
      count: 25, 
      icon: <Award className="h-4 w-4" />, 
      label: 'Silver', 
      color: 'rgb(192, 192, 192)', 
      description: 'This portfolio has reached 25 unique visitors!'
    },
    { 
      count: 50, 
      icon: <Trophy className="h-4 w-4" />, 
      label: 'Gold', 
      color: 'rgb(255, 215, 0)', 
      description: 'This portfolio has reached 50 unique visitors!'
    },
    { 
      count: 100, 
      icon: <Star className="h-4 w-4" />, 
      label: 'Platinum', 
      color: '#e5e4e2', 
      description: 'This portfolio has reached 100 unique visitors! Wow!'
    },
  ];
  
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [counting, setCounting] = useState(false);
  const [countedTo, setCountedTo] = useState({ total: 0, unique: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showSpecialEffect, setShowSpecialEffect] = useState(false);
  
  // Get visitor stats
  const { data, isLoading, isError } = useQuery<VisitorStats>({
    queryKey: ['/api/visitor-stats'],
    refetchOnWindowFocus: false,
  });
  
  // Track visitor mutation
  const trackVisitorMutation = useMutation({
    mutationFn: async (): Promise<TrackVisitorResponse> => {
      const response = await fetch('/api/track-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to track visitor');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/visitor-stats'] });
      
      // If this is a new visitor, show welcoming toast
      if (data.isNewVisitor) {
        toast({
          title: "Welcome!",
          description: "You're visitor #" + data.uniqueVisitors + " to this portfolio!",
          duration: 5000,
        });
        
        // Check if we've just reached a milestone
        const uniqueVisitors = data.uniqueVisitors;
        const justReachedMilestone = milestones.find(m => m.count === uniqueVisitors);
        
        if (justReachedMilestone) {
          // Show milestone achievement toast
          setTimeout(() => {
            toast({
              title: `${justReachedMilestone.label} Badge Unlocked!`,
              description: justReachedMilestone.description,
              duration: 7000,
            });
          }, 1000); // Delay the milestone toast to appear after the welcome toast
        }
      }
      
      // Animate counter
      setCounting(true);
    },
    onError: () => {
      // Silently fail, not showing an error to the user for visitor tracking
      console.error("Failed to track visitor");
    }
  });

  // Track visitor on component mount
  useEffect(() => {
    trackVisitorMutation.mutate();
  }, []);
  
  // Set up counter animation when data changes
  useEffect(() => {
    if (data && !counting) {
      setCountedTo({ total: data.totalVisitors, unique: data.uniqueVisitors });
      
      // Check if we've reached any milestones
      const uniqueVisitors = data.uniqueVisitors;
      
      // Find the highest milestone reached
      const reachedMilestones = milestones.filter(m => m.count <= uniqueVisitors);
      
      if (reachedMilestones.length > 0) {
        // Get the highest reached milestone
        const highestMilestone = reachedMilestones.reduce((prev, current) => 
          (prev.count > current.count) ? prev : current
        );
        
        // Store the current milestone but don't show the popup badge
        if (!currentMilestone || currentMilestone.count !== highestMilestone.count) {
          setCurrentMilestone(highestMilestone);
          // Removed: setShowMilestone(true) to prevent badge from showing in header
        }
      }
    }
  }, [data, counting]);
  
  // Handle the special effect display based on click count
  useEffect(() => {
    if (clickCount >= 5) {
      setShowSpecialEffect(true);
      
      // Reset after 3 seconds
      const timer = setTimeout(() => {
        setShowSpecialEffect(false);
        setClickCount(0);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [clickCount]);
  
  // Handle click on the counter
  const handleCounterClick = () => {
    // Play a subtle click sound (optional)
    setClickCount(prev => prev + 1);
    
    // After 5 clicks, we'll show a special effect
    if (clickCount === 4) {
      toast({
        title: "You found a secret!",
        description: "Thanks for your curiosity! You're awesome! 🎉",
        duration: 5000,
      });
    }
  };
  
  // Animated counter effect
  useEffect(() => {
    if (!data || !counting) return;
    
    let startTimestamp: number;
    const duration = 2000; // 2 seconds animation
    const startTotal = countedTo.total;
    const startUnique = countedTo.unique;
    const targetTotal = data.totalVisitors;
    const targetUnique = data.uniqueVisitors;
    
    // Only animate if there's a difference
    if (startTotal === targetTotal && startUnique === targetUnique) {
      setCounting(false);
      return;
    }
    
    // Animation function
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const newTotal = Math.floor(startTotal + (targetTotal - startTotal) * easeOutQuart);
      const newUnique = Math.floor(startUnique + (targetUnique - startUnique) * easeOutQuart);
      
      setCountedTo({
        total: newTotal,
        unique: newUnique
      });
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCounting(false);
      }
    };
    
    requestAnimationFrame(step);
  }, [data, counting, countedTo.total, countedTo.unique]);
  
  if (isLoading) {
    return (
      <motion.div 
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full shadow-lg border border-gray-700/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          boxShadow: ["0 4px 10px rgba(0,0,0,0.2)", "0 4px 20px rgba(var(--primary-rgb), 0.3)", "0 4px 10px rgba(0,0,0,0.2)"],
        }}
        transition={{ 
          y: { type: "spring", stiffness: 300, damping: 20 },
          opacity: { duration: 0.2 },
          boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }}
      >
        <motion.div 
          className="relative"
          animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></div>
          <Users className="h-5 w-5 text-primary" />
        </motion.div>
        <div className="flex items-center">
          <motion.span 
            className="text-gray-300 text-sm flex items-center"
            animate={{ color: ["rgb(209, 213, 219)", "#4ac6ff", "rgb(209, 213, 219)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              className="flex gap-1.5 mr-2"
              animate={{ 
                gap: ["6px", "3px", "6px"]
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.span 
                className="inline-block h-2 w-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span 
                className="inline-block h-2 w-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <motion.span 
                className="inline-block h-2 w-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
            </motion.span>
            Counting visitors
          </motion.span>
        </div>
      </motion.div>
    );
  }
  
  if (isError) {
    return null; // Don't show anything on error
  }
  
  return (
    <div className="relative">
      {/* Milestone badge */}
      <AnimatePresence>
        {showMilestone && currentMilestone && (
          <motion.div
            className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-700 z-20 flex flex-col items-center justify-center text-center w-48"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              boxShadow: [
                "0 10px 25px rgba(0,0,0,0.2)",
                `0 10px 25px ${currentMilestone.color}40`,
                "0 10px 25px rgba(0,0,0,0.2)"
              ]
            }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ 
              duration: 0.3,
              boxShadow: { repeat: Infinity, duration: 2 }
            }}
          >
            <motion.div 
              className="relative mb-2"
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 10
              }}
            >
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: `${currentMilestone.color}40` }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ color: currentMilestone.color }}
                >
                  {currentMilestone.icon}
                </motion.div>
              </div>
              <motion.div 
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
                style={{ backgroundColor: currentMilestone.color }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-bold text-white mb-1" style={{ color: currentMilestone.color }}>
                {currentMilestone.label} Badge Unlocked!
              </h4>
              <p className="text-xs text-gray-300">{currentMilestone.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="relative inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full shadow-lg border border-gray-700/50 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCounterClick}
        whileHover={{ 
          boxShadow: "0 0 15px 2px rgba(var(--primary-rgb), 0.3)",
          scale: 1.05
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {showSpecialEffect && (
          <motion.div 
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Particle effects */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  opacity: 0,
                  scale: [1, 1.5, 0]
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
        <motion.div 
          className="relative"
          animate={isHovered ? { rotate: [0, 15, -15, 10, -10, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></div>
          <Users className="h-5 w-5 text-primary" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={countedTo.unique}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15
            }}
            className="flex items-center font-medium"
          >
            <motion.span 
              className="text-white mr-1"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                color: isHovered ? "#4ac6ff" : "#ffffff"  
              }}
              transition={{ delay: 0.1 }}
            >
              {countedTo.unique.toLocaleString()}
            </motion.span>
            <motion.span 
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              unique visitors
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}