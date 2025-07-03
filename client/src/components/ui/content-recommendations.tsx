import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Skeleton } from './skeleton';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { BookOpen, Code, Briefcase, Star, ChevronRight } from 'lucide-react';

// Types for our content recommendation data
interface ContentItem {
  title: string;
  type: 'blog' | 'project' | 'skill';
  description: string;
  relevanceScore: number;
  url: string;
}

interface ContentRecommendation {
  items: ContentItem[];
  reasoning: string;
}

interface ContentRecommendationsProps {
  userInterests?: string[];
  currentContent: string;
  contentType?: 'blog' | 'project' | 'skill';
  contentId?: string | number;
  maxItems?: number;
  className?: string;
}

export function ContentRecommendations({
  userInterests = ['web development', 'technology'],
  currentContent,
  contentType,
  contentId,
  maxItems = 3,
  className = '',
}: ContentRecommendationsProps) {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<ContentRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    message: string;
    code?: string;
  } | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentContent) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/content-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInterests,
            currentContent,
            contentType,
            contentId,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw {
            status: response.status,
            message: errorData.message || `Failed to fetch recommendations: ${response.status}`,
            code: errorData.code || 'api_error',
            response
          };
        }
        
        const data = await response.json();
        setRecommendations(data);
      } catch (err: any) {
        console.error('Error fetching content recommendations:', err);
        
        // Try to parse the error response if it's a JSON
        if (err.response) {
          try {
            const errorData = await err.response.json();
            setError({
              message: errorData.message || 'Failed to load recommendations',
              code: errorData.code
            });
          } catch {
            setError({
              message: 'Failed to load recommendations',
              code: 'unknown'
            });
          }
        } else {
          setError({
            message: 'Failed to load recommendations',
            code: 'network_error'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [currentContent, contentId, contentType, userInterests]);

  // Get icon based on content type
  const getIcon = (type: 'blog' | 'project' | 'skill') => {
    switch (type) {
      case 'blog':
        return <BookOpen className="h-4 w-4" />;
      case 'project':
        return <Code className="h-4 w-4" />;
      case 'skill':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // If there's an error, show a minimized version instead of hiding completely
  if (error) {
    return (
      <Card className={`mt-6 overflow-hidden ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            {t('recommendations.title', 'You might be interested in')}
          </CardTitle>
          <CardDescription>
            {t('recommendations.error', 'We\'re preparing personalized recommendations for you. Check back later!')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`mt-6 overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          {t('recommendations.title', 'You might be interested in')}
        </CardTitle>
        <CardDescription>
          {recommendations?.reasoning || t('recommendations.loading', 'Finding personalized recommendations for you...')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-4 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations?.items.slice(0, maxItems).map((item, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <a 
                  href={item.url} 
                  className="group flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className={`
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-full 
                    ${item.type === 'blog' ? 'bg-blue-100 text-blue-600' : 
                      item.type === 'project' ? 'bg-green-100 text-green-600' : 
                      'bg-amber-100 text-amber-600'}
                  `}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium leading-none group-hover:underline">{item.title}</p>
                      <div className="flex items-center">
                        <Badge variant="outline" className="ml-2 h-6 px-2">
                          <Star className="mr-1 h-3 w-3 text-yellow-500" /> 
                          {item.relevanceScore}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center self-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </a>
              </div>
            ))}
            
            {recommendations && recommendations.items.length > 0 && (
              <div className="pt-2">
                <Button variant="link" className="px-0 text-sm" asChild>
                  <Link to="/projects">
                    {t('recommendations.viewMore', 'View more')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}