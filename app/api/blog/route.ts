import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertBlogPostSchema } from "@/shared/schema";

export async function GET() {
  try {
    const blogPosts = await storage.getAllBlogPosts();
    return NextResponse.json(blogPosts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = insertBlogPostSchema.parse(body);
    
    // Create the blog post
    const blogPost = await storage.createBlogPost(validatedData);
    
    return NextResponse.json(blogPost, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { message: "Failed to create blog post" },
      { status: 400 }
    );
  }
}