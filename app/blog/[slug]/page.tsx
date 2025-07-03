import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/client/src/components/ui/button";

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
  author?: {
    name: string;
    avatar?: string;
  };
}

interface Props {
  params: {
    slug: string;
  };
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blogPost = await getBlogPost(params.slug);
  
  if (!blogPost) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found."
    };
  }
  
  return {
    title: `${blogPost.title} - Personal Portfolio`,
    description: blogPost.summary,
    openGraph: {
      title: blogPost.title,
      description: blogPost.summary,
      images: blogPost.coverImage ? [{ url: blogPost.coverImage }] : [],
      type: 'article',
      publishedTime: blogPost.publishedAt,
      modifiedTime: blogPost.updatedAt,
      tags: blogPost.tags,
    },
  };
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blog/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch blog post');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export default async function BlogPostPage({ params }: Props) {
  const blogPost = await getBlogPost(params.slug);
  
  if (!blogPost) {
    notFound();
  }

  const formattedDate = new Date(blogPost.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Simple processing for content to convert new lines to paragraphs
  // In a real implementation, you would have a rich text renderer
  const formattedContent = blogPost.content
    .split('\n\n')
    .filter(paragraph => paragraph.trim() !== '')
    .map((paragraph, index) => (
      <p key={index} className="mb-6">{paragraph}</p>
    ));

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-primary hover:underline mb-6"
          aria-label="Back to blog"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to blog
        </Link>
        
        <h1 className="text-4xl font-bold mb-6">{blogPost.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
          {blogPost.author && (
            <div className="flex items-center" aria-label="Author">
              <User className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>{blogPost.author.name}</span>
            </div>
          )}
          
          <div className="flex items-center" aria-label="Published date">
            <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
            <time dateTime={new Date(blogPost.publishedAt).toISOString()}>
              {formattedDate}
            </time>
          </div>
          
          <div className="flex items-center" aria-label="Reading time">
            <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>{blogPost.readingTime} min read</span>
          </div>
        </div>
        
        {blogPost.tags && blogPost.tags.length > 0 && (
          <div className="mb-8">
            <p className="sr-only">Tags:</p>
            <div className="flex flex-wrap gap-2" aria-label="Article tags">
              {blogPost.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {blogPost.coverImage && (
        <figure className="relative aspect-video w-full mb-12 overflow-hidden rounded-lg">
          <Image
            src={blogPost.coverImage}
            alt={`Cover image for ${blogPost.title}`}
            className="object-cover"
            fill
            priority
          />
        </figure>
      )}
      
      <article className="prose prose-lg max-w-none dark:prose-invert">
        {formattedContent}
      </article>
      
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-4">Share this article</h2>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              if (typeof navigator !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            aria-label="Copy link to clipboard"
          >
            Copy Link
          </Button>
          {/* Social share buttons would go here */}
        </div>
      </div>
    </main>
  );
}