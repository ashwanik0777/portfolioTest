import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Trash, Edit, Eye, Search, ArrowUpDown, Calendar, Clock, 
  BookOpen, Tag, Filter, RefreshCw, PenTool, Sparkles, Bookmark, 
  SortAsc, SortDesc, FileText, Share2, CheckCircle, XCircle, Rss
} from 'lucide-react';
import BlogForm from '@/components/admin/blog-form';
import { apiRequest } from '@/lib/queryClient';

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

export function BlogManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState<'publishedAt' | 'title'>('publishedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const {
    data: blogPosts = [] as BlogPost[],
    isLoading,
    error
  } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/blog/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t('admin.blog.postDeleted'),
        description: t('admin.blog.postDeletedMessage'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
    },
    onError: (error) => {
      toast({
        title: t('admin.blog.deleteError'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  });

  useEffect(() => {
    if (error) {
      toast({
        title: t('admin.blog.loadError'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }, [error, toast, t]);

  const handleSort = (column: 'publishedAt' | 'title') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedPosts = [...blogPosts].sort((a, b) => {
    if (sortBy === 'publishedAt') {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });

  const filteredPosts = sortedPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Blog Management</CardTitle>
        <CardDescription>Create, edit and manage your blog posts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="create">Create Post</TabsTrigger>
            {editingPost && (
              <TabsTrigger value="edit">Edit Post</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="posts">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" title="Toggle sort order" onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                    {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                  <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    <span>New Post</span>
                  </Button>
                </div>
              </div>

              {/* Blog Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                      <p className="text-2xl font-semibold">{blogPosts.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AI Generated</p>
                      <p className="text-2xl font-semibold">
                        {blogPosts.filter(post => post.isAiGenerated).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Reading Time</p>
                      <p className="text-2xl font-semibold">
                        {blogPosts.length ? 
                          Math.round(blogPosts.reduce((sum, post) => sum + post.readingTime, 0) / blogPosts.length) 
                          : 0} min
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="aspect-video">
                        <Skeleton className="h-full w-full rounded-none" />
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-4 w-1/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* List/Grid View Toggle */}
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/blog'] })}
                        title="Refresh posts"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-md text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        {searchTerm ? 'No search results found' : 'No posts yet'}
                      </h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        {searchTerm ? 
                          'Try using different keywords or clear your search' : 
                          'Create your first blog post to get started'}
                      </p>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Post
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPosts.map((post) => (
                        <Card key={post.id} className="overflow-hidden flex flex-col">
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            {post.featuredImage ? (
                              <img 
                                src={post.featuredImage} 
                                alt={post.title} 
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-muted">
                                <FileText className="h-12 w-12 text-muted-foreground/50" />
                              </div>
                            )}
                            {post.isAiGenerated && (
                              <Badge className="absolute top-2 right-2 bg-purple-500" title="AI Generated">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          
                          <CardContent className="p-4 flex-grow">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.summary}</p>
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(post.publishedAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {post.readingTime} min read
                              </div>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap gap-1">
                              {post.tags.split(',').map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          
                          <CardFooter className="p-4 pt-0 flex justify-between border-t mt-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                              className="h-8"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingPost(post)}
                                className="h-8"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-500 h-8"
                                  >
                                    <Trash className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Delete</DialogTitle>
                                    <DialogDescription>
                                      This action cannot be undone. This will permanently delete this blog post.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="border rounded-md p-4 mt-2 bg-muted/20">
                                    <p className="font-medium">{post.title}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{post.summary}</p>
                                  </div>
                                  <DialogFooter className="mt-4">
                                    <Button variant="outline">Cancel</Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => deleteMutation.mutate(post.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      {deleteMutation.isPending ? (
                                        <>
                                          <div className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <>
                                          <Trash className="h-4 w-4 mr-1" /> 
                                          Delete
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Create New Blog Post</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="gap-1">
                    <PenTool className="h-3 w-3" />
                    <span>Manual</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Assisted</span>
                  </Badge>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <BlogForm />
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Publishing Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <p>Use descriptive titles that are SEO friendly</p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <p>Include relevant keywords in your summary</p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <p>Add tags related to the content topic</p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <p>Use high-quality featured images</p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <p>Format content with headings and lists</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">AI Assistant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        Use AI to help generate content, summaries, or get topic suggestions
                      </p>
                      <Button variant="outline" className="w-full flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        Try AI Content Generation
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href="#" className="text-primary flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Markdown cheat sheet
                        </a>
                      </Button>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href="#" className="text-primary flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          SEO best practices
                        </a>
                      </Button>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href="#" className="text-primary flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Image optimization tips
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {editingPost && (
            <TabsContent value="edit">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Edit Blog Post</h2>
                  <Button variant="outline" size="sm" onClick={() => setEditingPost(null)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <BlogForm blogPost={editingPost} />
                  </div>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Post Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Created</span>
                          <span className="text-sm font-medium">
                            {new Date(editingPost.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last updated</span>
                          <span className="text-sm font-medium">
                            {new Date(editingPost.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Reading time</span>
                          <span className="text-sm font-medium">{editingPost.readingTime} minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Content type</span>
                          <Badge variant={editingPost.isAiGenerated ? "secondary" : "outline"}>
                            {editingPost.isAiGenerated ? (
                              <><Sparkles className="h-3 w-3 mr-1" /> AI Generated</>
                            ) : (
                              <><PenTool className="h-3 w-3 mr-1" /> Manual</>
                            )}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`/blog/${editingPost.slug}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Published Post
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Post
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-red-500">
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Post
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('admin.blog.confirmDelete')}</DialogTitle>
                              <DialogDescription>
                                {t('admin.blog.deleteWarning')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="border rounded-md p-4 mt-2 bg-muted/20">
                              <p className="font-medium">{editingPost.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{editingPost.summary}</p>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  deleteMutation.mutate(editingPost.id);
                                  setEditingPost(null);
                                }}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? (
                                  <>
                                    <div className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash className="h-4 w-4 mr-1" /> 
                                    Delete
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {/* Create Post Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
            <DialogDescription>
              Create a new blog post to share with your audience
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)]">
            <div className="p-4">
              <BlogForm />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>
                Make changes to your blog post
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-140px)]">
              <div className="p-4">
                <BlogForm blogPost={editingPost} />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

export default BlogManagement;