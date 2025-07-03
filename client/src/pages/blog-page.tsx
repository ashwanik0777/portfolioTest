import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Search, Calendar, Clock, Tag, TrendingUp } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string | null;
  tags: string;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  isAiGenerated: boolean | null;
}

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
  show: { opacity: 1, y: 0 }
};

// 3D tilt card effect component
function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for the tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smoother animation with springs
  const xSpring = useSpring(x);
  const ySpring = useSpring(y);
  
  // Transform the motion values to rotation values (limit tilt to 10 degrees)
  const rotateX = useTransform(ySpring, [-100, 100], [10, -10]);
  const rotateY = useTransform(xSpring, [-100, 100], [-10, 10]);
  
  // Handle mouse movement to update tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to card center (in -1 to 1 range)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Update motion values
    x.set(mouseX);
    y.set(mouseY);
  };
  
  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full cursor-pointer"
    >
      <div style={{ transform: "translateZ(20px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
}

// Blog card particles effect component
function ParticlesEffect({ active }: { active: boolean }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-10 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {active && (
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary"
              initial={{ 
                x: "50%", 
                y: "50%", 
                opacity: 0 
              }}
              animate={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`, 
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Blog card component with tilt and particle effects
function BlogCard({ post }: { post: BlogPost }) {
  const [isHovering, setIsHovering] = useState(false);
  const { t } = useTranslation();
  
  // Format date for display
  const formattedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ParticlesEffect active={isHovering} />
      
      <TiltCard>
        <Card className="h-full overflow-hidden border-2 transition-all duration-300 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.25)]">
          {post.featuredImage && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="object-cover w-full h-full transition-transform duration-500 ease-out"
                style={{
                  transform: isHovering ? "scale(1.1)" : "scale(1)"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="transition-colors duration-300 hover:text-primary line-clamp-2">
              {post.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3 h-3" />
              <span>{post.readingTime} {t('blog.minRead')}</span>
              
              {post.isAiGenerated && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/30 dark:text-purple-200">
                  AI
                </span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow">
            <p className="text-muted-foreground line-clamp-3">
              {post.summary}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.split(',').slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.trim()}
                </span>
              ))}
              {post.tags.split(',').length > 3 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                  +{post.tags.split(',').length - 3}
                </span>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Link href={`/blog/${post.slug}`} className="w-full">
              <Button 
                variant="outline" 
                className="w-full transition-colors group hover:bg-primary hover:text-primary-foreground"
              >
                <span>{t('blog.readMore')}</span>
                <motion.span
                  initial={{ x: 0 }}
                  animate={isHovering ? { x: 5 } : { x: 0 }}
                  className="ml-2"
                >
                  →
                </motion.span>
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </TiltCard>
    </div>
  );
}

export function BlogPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState('all');

  // Get blog posts from API
  const { data: blogPosts = [], isLoading, error } = useQuery({
    queryKey: ['/api/blog'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter posts based on search term and tab
  const filteredPosts = React.useMemo(() => {
    let posts = blogPosts as BlogPost[];
    
    // Apply search filter
    if (searchTerm) {
      posts = posts.filter((post: BlogPost) => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (tabValue === 'recent') {
      return [...posts].sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ).slice(0, 6);
    } else if (tabValue === 'popular') {
      // As a simple proxy for popularity, we'll use reading time
      // In a real app, this would be based on view count or similar metrics
      return [...posts].sort((a, b) => b.readingTime - a.readingTime).slice(0, 6);
    }
    
    return posts;
  }, [blogPosts, searchTerm, tabValue]);

  useEffect(() => {
    if (error) {
      toast({
        title: t('blog.errorLoading'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }, [error, toast, t]);

  return (
    <div className="container px-4 py-12 mx-auto">
      {/* Hero section with glow effect */}
      <div className="mb-16 text-center relative">
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] opacity-50" />
        </div>
        
        <motion.h1 
          className="mb-4 text-5xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('blog.title')}
        </motion.h1>
        
        <motion.p 
          className="max-w-2xl mx-auto text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t('blog.description')}
        </motion.p>
      </div>

      {/* Search and filters */}
      <motion.div 
        className="mb-12 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('blog.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={tabValue} 
          onValueChange={setTabValue}
          className="w-fit mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3" style={{ maxWidth: "400px" }}>
            <TabsTrigger value="all">
              {t('blog.allPosts')}
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {t('blog.recentPosts')}
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {t('blog.popularTags')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Blog posts */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="overflow-hidden h-full">
              <Skeleton className="h-48 rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredPosts?.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredPosts.map((post: BlogPost) => (
                <motion.div key={post.id} variants={item}>
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="p-12 text-center rounded-lg border bg-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="mb-2 text-xl font-medium">{t('blog.noPostsFound')}</h3>
              <p className="text-muted-foreground">{t('blog.tryDifferentSearch')}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setTabValue('all');
                }}
              >
                {t('blog.clearSearch')}
              </Button>
            </motion.div>
          )}
          
          {/* Load more button - shown only when we have more than 6 posts and we're on the 'all' tab */}
          {filteredPosts.length > 6 && tabValue === 'all' && (
            <div className="flex justify-center mt-12">
              <Button variant="outline" className="gap-2">
                {t('blog.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlogPage;