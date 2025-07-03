import { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/client/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/src/components/ui/table";

export const metadata: Metadata = {
  title: "Manage Blog Posts - Admin Dashboard",
  description: "Create, edit, and manage blog posts",
};

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  tags: string[];
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

export default async function AdminBlogPage() {
  const blogPosts = await getBlogPosts();

  // Sort by date (newest first)
  const sortedPosts = [...blogPosts].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">
            Manage your blog content
          </p>
        </div>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Post
        </Button>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="p-12 text-center bg-muted/40 rounded-md" aria-live="polite">
          <h3 className="text-xl font-medium mb-3">No blog posts yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first blog post to get started
          </p>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create First Post
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Reading Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className="hover:underline"
                      target="_blank"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {post.tags && post.tags.length > 0 
                      ? post.tags.slice(0, 2).join(', ') + (post.tags.length > 2 ? '...' : '')
                      : 'No tags'
                    }
                  </TableCell>
                  <TableCell>{post.readingTime} min</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${post.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}