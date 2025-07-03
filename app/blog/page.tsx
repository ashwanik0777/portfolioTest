import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/client/src/components/ui/card";
import { Button } from "@/client/src/components/ui/button";
import { cn } from "@/client/src/lib/utils";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - Personal Portfolio",
  description: "Read the latest articles about web development, design, and technology",
};

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  coverImage: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blog`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch blog posts');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  // Sort posts by date (most recent first)
  const sortedPosts = [...blogPosts].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Thoughts, ideas, and insights about web development, design, and technology
        </p>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="text-center py-12" aria-live="polite">
          <h2 className="text-xl font-medium mb-2">No blog posts yet</h2>
          <p className="text-muted-foreground mb-6">Check back later for new content</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative overflow-hidden">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={`Cover image for ${post.title}`}
            className="object-cover"
            fill
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4" />
          <time dateTime={new Date(post.publishedAt).toISOString()}>
            {formattedDate}
          </time>
          <span aria-hidden="true">•</span>
          <Clock className="h-4 w-4" />
          <span>{post.readingTime} min read</span>
        </div>
        <CardTitle className="line-clamp-2">
          <Link 
            href={`/blog/${post.slug}`}
            className="hover:underline focus:outline-none focus:underline"
          >
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {post.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="flex flex-wrap gap-2">
          {post.tags && post.tags.slice(0, 3).map((tag, i) => (
            <span 
              key={i} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" size="sm" className="w-full justify-between">
          <Link href={`/blog/${post.slug}`}>
            Read article
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}