import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Save, X, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const blogFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  slug: z.string().min(5, { message: "Slug must be at least 5 characters" }),
  summary: z.string().min(10, { message: "Summary must be at least 10 characters" }),
  content: z.string().min(50, { message: "Content must be at least 50 characters" }),
  featuredImage: z.string().nullable().optional(),
  tags: z.string().min(3, { message: "Please add at least one tag" }),
  readingTime: z.number().min(1, { message: "Reading time must be at least 1 minute" }),
  isAiGenerated: z.boolean().optional()
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface AIGenerationParams {
  title?: string;
  topic?: string;
  keywords?: string[];
  length: 'short' | 'medium' | 'long';
}

interface GeneratedContent {
  title: string;
  content: string;
  summary: string;
  imagePrompt: string;
  tags: string[];
  readingTime: number;
}

export function BlogForm({ blogPost }: { blogPost?: any }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [previewContent, setPreviewContent] = useState('');

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: blogPost ? {
      ...blogPost,
      tags: blogPost.tags
    } : {
      title: '',
      slug: '',
      summary: '',
      content: '',
      featuredImage: null,
      tags: '',
      readingTime: 3,
      isAiGenerated: false
    }
  });

  const watchTitle = form.watch('title');
  const watchContent = form.watch('content');

  // Auto-generate slug when title changes
  React.useEffect(() => {
    if (!blogPost && watchTitle) {
      form.setValue('slug', slugify(watchTitle));
    }
  }, [watchTitle, form, blogPost]);

  // Update preview
  React.useEffect(() => {
    setPreviewContent(watchContent);
  }, [watchContent]);

  // Calculate reading time
  React.useEffect(() => {
    if (watchContent) {
      const wordCount = watchContent.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Assume 200 words per minute
      form.setValue('readingTime', readingTime);
    }
  }, [watchContent, form]);

  const saveMutation = useMutation({
    mutationFn: (data: BlogFormValues) => {
      return apiRequest(
        blogPost ? 'PATCH' : 'POST',
        blogPost ? `/api/blog/${blogPost.id}` : '/api/blog',
        {
          ...data,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    },
    onSuccess: () => {
      toast({
        title: blogPost ? "Blog post updated" : "Blog post created",
        description: blogPost ? "Your changes have been saved" : "Your new blog post has been published",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      if (!blogPost) {
        form.reset({
          title: '',
          slug: '',
          summary: '',
          content: '',
          featuredImage: null,
          tags: '',
          readingTime: 3,
          isAiGenerated: false
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  const generateAiContent = async () => {
    if (!aiTopic && !watchTitle) {
      toast({
        title: "Missing information",
        description: "Please provide a title or topic for AI generation",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const params: AIGenerationParams = {
        length: aiLength
      };
      
      if (watchTitle) params.title = watchTitle;
      if (aiTopic) params.topic = aiTopic;
      if (aiKeywords) params.keywords = aiKeywords.split(',').map(k => k.trim());

      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const generatedContent: GeneratedContent = await response.json();

      // Update form with generated content
      form.setValue('title', generatedContent.title);
      form.setValue('slug', slugify(generatedContent.title));
      form.setValue('content', generatedContent.content);
      form.setValue('summary', generatedContent.summary);
      form.setValue('tags', generatedContent.tags.join(', '));
      form.setValue('readingTime', generatedContent.readingTime);
      form.setValue('isAiGenerated', true);

      toast({
        title: "Content generated",
        description: "AI has generated content for your blog post. Feel free to edit it.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: BlogFormValues) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{blogPost ? t('admin.blog.editPost') : t('admin.blog.createPost')}</CardTitle>
          <CardDescription>{t('admin.blog.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="manual">
                <FileText className="w-4 h-4 mr-2" />
                {t('admin.blog.manualCreation')}
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('admin.blog.aiAssisted')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.blog.title')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.blog.slug')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('admin.blog.slugDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.blog.summary')}</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.blog.content')}</FormLabel>
                        <FormControl>
                          <Textarea rows={15} {...field} className="font-mono" />
                        </FormControl>
                        <FormDescription>
                          {t('admin.blog.htmlSupported')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.blog.featuredImage')}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ''} 
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('admin.blog.imageUrlDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.blog.tags')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('admin.blog.tagsDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="readingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.blog.readingTime')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                            />
                          </FormControl>
                          <FormDescription>
                            {t('admin.blog.minutesToRead')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isAiGenerated"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>{t('admin.blog.aiGenerated')}</FormLabel>
                            <FormDescription>
                              {t('admin.blog.aiGeneratedDescription')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => form.reset()}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('admin.reset')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {blogPost ? t('admin.update') : t('admin.publish')}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="ai">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('admin.blog.aiOptions')}</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('admin.blog.topic')}</label>
                      <Input 
                        value={aiTopic} 
                        onChange={(e) => setAiTopic(e.target.value)} 
                        placeholder={t('admin.blog.topicPlaceholder')}
                      />
                      <p className="text-xs text-gray-500">{t('admin.blog.topicDescription')}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('admin.blog.keywords')}</label>
                      <Input 
                        value={aiKeywords} 
                        onChange={(e) => setAiKeywords(e.target.value)} 
                        placeholder={t('admin.blog.keywordsPlaceholder')}
                      />
                      <p className="text-xs text-gray-500">{t('admin.blog.keywordsDescription')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('admin.blog.contentLength')}</label>
                    <Select value={aiLength} onValueChange={(value) => setAiLength(value as 'short' | 'medium' | 'long')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">{t('admin.blog.short')} (~300 {t('admin.blog.words')})</SelectItem>
                        <SelectItem value="medium">{t('admin.blog.medium')} (~800 {t('admin.blog.words')})</SelectItem>
                        <SelectItem value="long">{t('admin.blog.long')} (~1500 {t('admin.blog.words')})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={generateAiContent} 
                    disabled={isGenerating || (!aiTopic && !watchTitle)}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? t('admin.blog.generating') : t('admin.blog.generateContent')}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t('admin.blog.generatedContent')}</h3>
                  <p className="text-sm text-gray-500">{t('admin.blog.generatedContentDescription')}</p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      form.setValue('content', watchContent);
                      setPreviewContent(watchContent);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('admin.blog.refreshPreview')}
                  </Button>
                  
                  <div className="p-4 mt-4 border rounded-md prose dark:prose-invert max-w-none">
                    {previewContent ? (
                      <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                    ) : (
                      <p className="text-gray-500 italic">{t('admin.blog.noContentYet')}</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default BlogForm;