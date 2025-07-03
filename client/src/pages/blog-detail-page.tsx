import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentRecommendations } from '@/components/ui/content-recommendations';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { 
  ArrowLeft, MessageSquare, Calendar, Clock, Share2, Bookmark, 
  Heart, Award, ThumbsUp, Eye, Copy, Twitter, Facebook, Linkedin,
  BookOpen, ChevronUp, Coffee, Send, Tag, XCircle, Timer, AlertTriangle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  featuredImage: string | null;
  tags: string;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  isAiGenerated: boolean | null;
}

interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  comment: string;
  createdAt: string;
}

export function BlogDetailPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State for user interactions and gamification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 50) + 5);
  const [hasLiked, setHasLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [actualReadingTime, setActualReadingTime] = useState(0);
  const [expectedReadingTime, setExpectedReadingTime] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('content');
  const [readerLevel, setReaderLevel] = useState('Bronze Reader');
  const [readPoints, setReadPoints] = useState(0);
  const [viewsCount, setViewsCount] = useState(Math.floor(Math.random() * 500) + 100);
  const [hasViewCounted, setHasViewCounted] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<Record<string, boolean>>({});
  
  // Animation properties for the reading progress
  const { scrollYProgress } = useScroll({ 
    target: contentRef,
    offset: ["start start", "end end"],
    layoutEffect: false // Fix for hydration warning
  });
  
  // Smooth progress animation
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Queries for blog post and comments
  const { data: post, isLoading: isPostLoading, error: postError } = useQuery<BlogPost>({
    queryKey: [`/api/blog/slug/${slug}`],
    enabled: !!slug,
    retry: 3
  });

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery<Comment[]>({
    queryKey: [`/api/blog/${post?.id}/comments`],
    enabled: !!post?.id
  });

  // Mutation for adding comments
  const commentMutation = useMutation({
    mutationFn: (commentData: { name: string; email: string; comment: string }) => {
      return apiRequest(
        'POST',
        `/api/blog/${post?.id}/comments`,
        commentData
      );
    },
    onSuccess: () => {
      toast({
        title: t('blog.commentSubmitted'),
        description: t('blog.commentAddedMessage'),
      });
      setName('');
      setEmail('');
      setComment('');
      
      // Award points for commenting (only once per post)
      if (!pointsAwarded['comment']) {
        handleAwardPoints(10, 'comment');
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/blog/${post?.id}/comments`] });
    },
    onError: (error) => {
      toast({
        title: t('blog.commentError'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  });

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Share functionality
  const handleShare = (platform: string) => {
    let shareUrl = '';
    const postUrl = window.location.href;
    const postTitle = post?.title || '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        toast({
          title: t('blog.linkCopied'),
          description: t('blog.linkCopiedDescription'),
        });
        
        // Award share points once
        if (!pointsAwarded['share']) {
          handleAwardPoints(5, 'share');
        }
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
      
      // Award share points once
      if (!pointsAwarded['share']) {
        handleAwardPoints(5, 'share');
      }
    }
    
    setIsShareOpen(false);
  };
  
  // Like functionality with gamification (only once per post)
  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
      localStorage.setItem(`blog_${slug}_liked`, 'true');
      
      // Award points only once per post
      if (!pointsAwarded['like']) {
        handleAwardPoints(5, 'like');
        
        toast({
          title: t('blog.postLiked'),
          description: t('blog.earnedPoints', { points: 5 }),
        });
      }
    } else {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
      localStorage.removeItem(`blog_${slug}_liked`);
    }
  };
  
  // Bookmark functionality (points only once per post)
  const handleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    if (newBookmarkState) {
      localStorage.setItem(`blog_${slug}_bookmarked`, 'true');
      
      // Award points only once per post
      if (!pointsAwarded['bookmark']) {
        handleAwardPoints(8, 'bookmark');
        
        toast({
          title: t('blog.postBookmarked'),
          description: t('blog.postSavedForLater'),
        });
      }
    } else {
      localStorage.removeItem(`blog_${slug}_bookmarked`);
    }
  };
  
  // Gamification - award points and update level (only once per action type per post)
  const handleAwardPoints = (points: number, actionType: string) => {
    // Skip if this action has already been awarded for this post
    if (pointsAwarded[actionType]) {
      return;
    }
    
    // Update awarded actions
    setPointsAwarded(prev => ({
      ...prev,
      [actionType]: true
    }));
    
    // Store in localStorage to persist across sessions
    try {
      // Save the action type as awarded
      localStorage.setItem(`blog_${slug}_${actionType}_awarded`, 'true');
      
      // Update total points
      const savedPoints = localStorage.getItem('blogReadPoints') || '0';
      const currentPoints = parseInt(savedPoints);
      const newTotalPoints = currentPoints + points;
      localStorage.setItem('blogReadPoints', newTotalPoints.toString());
      
      // Update state
      setReadPoints(newTotalPoints);
      
      // Update reader level based on points
      if (newTotalPoints >= 100) {
        setReaderLevel('Platinum Reader');
      } else if (newTotalPoints >= 50) {
        setReaderLevel('Gold Reader');
      } else if (newTotalPoints >= 20) {
        setReaderLevel('Silver Reader');
      }
    } catch (error) {
      // Ignore storage errors
    }
  };
  
  // Form submission handler
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !comment.trim()) {
      toast({
        title: t('blog.validationError'),
        description: t('blog.allFieldsRequired'),
        variant: 'destructive',
      });
      return;
    }
    commentMutation.mutate({ name, email, comment });
  };
  
  // Handle copy code blocks (for code snippets)
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: t('blog.codeCopied'),
      description: t('blog.codeCopiedDescription'),
    });
    
    // Award points for technical engagement (only once per post)
    if (!pointsAwarded['code_copy']) {
      handleAwardPoints(3, 'code_copy');
    }
  };
  
  // Load view count from localStorage or increment if first visit
  const incrementViewCount = () => {
    if (!hasViewCounted && slug) {
      const viewCountKey = `blog_${slug}_viewed`;
      const hasViewed = localStorage.getItem(viewCountKey);
      
      if (!hasViewed) {
        // This is a new unique view
        localStorage.setItem(viewCountKey, 'true');
        setHasViewCounted(true);
        
        // In a real application, we'd call an API to increment the view count in the database
        // For now, we'll just update the state
        setViewsCount(prev => prev + 1);
      } else {
        // User has already viewed this post
        setHasViewCounted(true);
      }
    }
  };
  
  // Start tracking reading time
  const startReadingTimer = () => {
    if (!readingStartTime) {
      setReadingStartTime(Date.now());
    }
  };
  
  // Calculate actual reading time
  const updateReadingTime = () => {
    if (readingStartTime) {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - readingStartTime) / 1000);
      setActualReadingTime(elapsedSeconds);
      
      // Award reading time points when appropriate (only once per post)
      const readingTimeMinutes = Math.floor(elapsedSeconds / 60);
      
      if (readingTimeMinutes >= 2 && !pointsAwarded['reading_2min']) {
        handleAwardPoints(5, 'reading_2min');
        toast({
          title: t('blog.readerMilestone'),
          description: t('blog.minutesRead', { minutes: 2 }),
        });
      }
      
      if (readingTimeMinutes >= 5 && !pointsAwarded['reading_5min']) {
        handleAwardPoints(10, 'reading_5min');
        toast({
          title: t('blog.readerMilestone'),
          description: t('blog.minutesRead', { minutes: 5 }),
        });
      }
      
      if (post && readingTimeMinutes >= post.readingTime && !pointsAwarded['completed_reading']) {
        handleAwardPoints(15, 'completed_reading');
        toast({
          title: t('blog.articleFinished'),
          description: t('blog.earnedPoints', { points: 15 }),
        });
      }
    }
  };

  // Load saved points and other state on initial load
  useEffect(() => {
    try {
      // Load total points
      const savedPoints = localStorage.getItem('blogReadPoints') || '0';
      const points = parseInt(savedPoints);
      setReadPoints(points);
      
      // Set reader level based on points
      if (points >= 100) {
        setReaderLevel('Platinum Reader');
      } else if (points >= 50) {
        setReaderLevel('Gold Reader');
      } else if (points >= 20) {
        setReaderLevel('Silver Reader');
      }
      
      // Check if user already liked this post
      if (slug) {
        const hasLikedPost = localStorage.getItem(`blog_${slug}_liked`) === 'true';
        setHasLiked(hasLikedPost);
        
        // Check if user already bookmarked this post
        const hasBookmarkedPost = localStorage.getItem(`blog_${slug}_bookmarked`) === 'true';
        setIsBookmarked(hasBookmarkedPost);
        
        // Load previously awarded points for this post
        const awarded: Record<string, boolean> = {};
        const actionTypes = ['like', 'bookmark', 'comment', 'share', 'code_copy', 
                           'reading_2min', 'reading_5min', 'completed_reading'];
        
        actionTypes.forEach(action => {
          awarded[action] = localStorage.getItem(`blog_${slug}_${action}_awarded`) === 'true';
        });
        
        setPointsAwarded(awarded);
      }
      
      // Increment view count
      incrementViewCount();
      
    } catch (error) {
      // Ignore storage errors
    }
  }, [slug]);
  
  // Set the expected reading time when post loads
  useEffect(() => {
    if (post) {
      setExpectedReadingTime(post.readingTime || 5); // Default to 5 minutes if not provided
    }
  }, [post]);
  
  // Start reading timer when content is visible and post is loaded
  useEffect(() => {
    if (post && !isPostLoading) {
      startReadingTimer();
      
      // Update reading time every second
      const timerInterval = setInterval(updateReadingTime, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [post, isPostLoading]);

  // Track scroll for reading progress and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Update progress for visualization (not for time tracking)
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.body.offsetHeight;
      const totalScrollableDistance = docHeight - windowHeight;
      const progress = Math.min(Math.max(scrollPosition / totalScrollableDistance, 0), 1) * 100;
      
      setReadingProgress(progress);
      
      // Show scroll-to-top when we're past 300px
      setShowScrollTop(scrollPosition > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Error handling
  useEffect(() => {
    if (postError) {
      toast({
        title: t('blog.errorLoading'),
        description: (postError as Error).message,
        variant: 'destructive',
      });
    }
  }, [postError, toast, t]);

  const formattedContent = post?.content || '';

  return (
    <div className="container px-4 py-12 mx-auto">
      {/* Fixed reading progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
        style={{ scaleX, transformOrigin: "0%" }}
      />
      
      {/* Back button and badge showing reading level */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <Link href="/blog">
          <Button variant="ghost" className="group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            {t('blog.backToBlog')}
          </Button>
        </Link>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground border-transparent">
                <Award className="w-3.5 h-3.5" />
                <span>{readerLevel}</span>
                <span className="text-xs opacity-75">({readPoints} pts)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs">Points are awarded once per action per post</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isPostLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <div className="flex items-center justify-center space-x-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-72 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : post ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Blog Header Section */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="mb-6 text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" />
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {post.readingTime} {t('blog.minRead')}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center cursor-help">
                      <Eye className="w-4 h-4 mr-1.5" />
                      {viewsCount} views
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">View count is tracked uniquely per user</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {post.isAiGenerated && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200">
                  AI Generated
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Featured Image with animation */}
          {post.featuredImage && (
            <motion.div 
              className="relative mb-10 overflow-hidden rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="object-cover w-full h-auto max-h-[500px]"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/80 to-transparent" />
            </motion.div>
          )}
          
          {/* Interactive Tools Panel */}
          <div className="sticky top-4 z-40 flex justify-end max-w-3xl mx-auto -mb-4">
            <motion.div 
              className="flex items-center gap-2 p-2 bg-card/80 backdrop-blur-sm rounded-full shadow-lg border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full ${hasLiked ? 'text-rose-500 hover:text-rose-600' : 'hover:text-rose-500'}`} 
                      onClick={handleLike}
                    >
                      <Heart className={`w-5 h-5 ${hasLiked ? 'fill-rose-500' : ''}`} />
                      <span className="sr-only">Like</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{hasLiked ? t('blog.unlike') : t('blog.like')} ({likesCount})</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full ${isBookmarked ? 'text-primary hover:text-primary/80' : 'hover:text-primary'}`} 
                      onClick={handleBookmark}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-primary' : ''}`} />
                      <span className="sr-only">Bookmark</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isBookmarked ? t('blog.removeBookmark') : t('blog.bookmark')}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:text-primary"
                      onClick={() => setIsShareOpen(!isShareOpen)}
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('blog.share')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </div>
          
          {/* Share dropdown */}
          <AnimatePresence>
            {isShareOpen && (
              <motion.div 
                className="fixed top-20 right-4 z-50 p-3 bg-card rounded-xl shadow-lg border"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h4 className="mb-2 text-sm font-medium">{t('blog.sharePost')}</h4>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => handleShare('twitter')}>
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => handleShare('facebook')}>
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => handleShare('linkedin')}>
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => handleShare('copy')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content and comments tabs */}
          <div className="max-w-3xl mx-auto mt-8">
            <Tabs 
              defaultValue="content" 
              value={currentTab} 
              onValueChange={setCurrentTab}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <TabsList>
                  <TabsTrigger value="content" className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {t('blog.content')}
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {t('blog.comments')} ({comments.length})
                  </TabsTrigger>
                </TabsList>
                
                {/* Reading stats with actual time tracking */}
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <div className="flex items-center">
                          <Timer className="w-3.5 h-3.5 mr-1 text-primary animate-pulse" />
                          <span>
                            {actualReadingTime < 60 
                              ? `${actualReadingTime} sec read` 
                              : `${Math.floor(actualReadingTime / 60)}:${String(actualReadingTime % 60).padStart(2, '0')} time spent`
                            }
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">Reading timer active</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Progress value={readingProgress} className="w-24 h-2" />
                  <span>{Math.round(readingProgress)}%</span>
                </div>
              </div>
              
              <TabsContent value="content" className="mt-0">
                <motion.div 
                  ref={contentRef}
                  className="prose dark:prose-invert lg:prose-lg max-w-none mb-8 pb-8 border-b"
                >
                  <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
                </motion.div>
                
                {/* Tags section */}
                <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {post.tags.split(',').map((tag) => (
                    <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag.trim())}`}>
                      <Badge variant="outline" className="hover:bg-secondary transition-colors">
                        {tag.trim()}
                      </Badge>
                    </Link>
                  ))}
                </div>
                
                {/* Engagement section */}
                <motion.div 
                  className="p-6 my-8 rounded-xl border bg-card/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="mb-4 text-xl font-bold">{t('blog.enjoyedArticle')}</h3>
                  <p className="mb-4 text-muted-foreground">{t('blog.supportMessage')}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleLike} 
                      variant={hasLiked ? "default" : "outline"}
                      className={hasLiked ? "gap-2" : "gap-2"}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {hasLiked ? t('blog.liked') : t('blog.likeThis')}
                      {hasLiked && <Badge variant="outline" className="ml-1 bg-background">{likesCount}</Badge>}
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleBookmark}>
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? t('blog.bookmarked') : t('blog.bookmarkForLater')}
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setIsShareOpen(true)}>
                      <Share2 className="w-4 h-4" />
                      {t('blog.sharePost')}
                    </Button>
                  </div>
                </motion.div>
                
                {/* AI-powered content recommendations */}
                {post && (
                  <ContentRecommendations
                    userInterests={post.tags ? post.tags.split(',').map(tag => tag.trim()) : ['web development']}
                    currentContent={post.content || post.summary}
                    contentType="blog"
                    contentId={post.id}
                    maxItems={3}
                    className="my-8"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="mt-0">
                {isCommentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((item) => (
                      <Card key={item}>
                        <CardHeader>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16 mt-1" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-16" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      <motion.div 
                        className="space-y-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: { transition: { staggerChildren: 0.1 } }
                        }}
                      >
                        {comments.map((comment: Comment) => (
                          <motion.div 
                            key={comment.id}
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 }
                            }}
                          >
                            <Card className="border-l-4 border-l-primary overflow-hidden transition-all hover:shadow-md">
                              <CardHeader className="pb-2">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="border-2 border-primary/20">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {comment.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <CardTitle className="text-base font-medium">{comment.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{comment.comment}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <Card className="border-dashed bg-card/50">
                        <CardContent className="pt-6 text-center">
                          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-muted-foreground">{t('blog.noComments')}</p>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div className="mt-8 pt-4 border-t">
                      <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        {t('blog.leaveComment')}
                      </h3>
                      <form onSubmit={handleSubmitComment} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                              {t('blog.name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                              {t('blog.email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="comment" className="text-sm font-medium">
                            {t('blog.comment')} <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            className="w-full bg-background resize-none"
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto"
                          disabled={commentMutation.isPending}
                        >
                          {commentMutation.isPending ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                              {t('blog.submitting')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-4 h-4" />
                              {t('blog.submitComment')}
                            </span>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Scroll to top button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.div
                className="fixed bottom-8 right-8 z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        className="rounded-full shadow-lg"
                        onClick={scrollToTop}
                      >
                        <ChevronUp className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{t('blog.scrollToTop')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          className="p-12 text-center rounded-lg border bg-card/50 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-full h-full bg-primary/10 rounded-full">
              <XCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-medium">{t('blog.postNotFound')}</h3>
          <p className="mb-6 text-muted-foreground">
            {t('blog.postMayBeRemoved')}
          </p>
          <Link href="/blog">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('blog.browsePosts')}
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

export default BlogDetailPage;