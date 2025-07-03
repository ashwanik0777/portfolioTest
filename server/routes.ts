import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupUpload } from "./upload";
import {
  insertProfileSchema,
  insertSkillSchema,
  insertProjectSchema,
  insertExperienceSchema,
  insertSocialSchema,
  insertContactSchema,
  insertFeedbackSchema,
  insertBlogPostSchema,
  insertBlogCommentSchema
} from "@shared/schema";
import { 
  generateBlogPost, 
  generateBlogSuggestions, 
  analyzeBlogContent,
  generateContentRecommendations,
  ContentRecommendation
} from "./ai";
import { processChat, ChatMessage } from "./ai-chat";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // More verbose logging for authentication debugging
  console.log("===== AUTH CHECK =====");
  console.log(`URL: ${req.method} ${req.url}`);
  console.log(`isAuthenticated: ${req.isAuthenticated?.()}`);
  console.log(`Session ID: ${req.session?.id}`);
  console.log(`User: ${JSON.stringify(req.user)}`);
  console.log(`Cookie: ${req.headers.cookie}`);
  console.log("======================");
  
  // Special admin bypass for testing (remove in production)
  if (req.query.adminBypass === 'true') {
    console.log("ADMIN BYPASS ACTIVATED - Skipping authentication check");
    return next();
  }
  
  if (req.isAuthenticated()) {
    console.log("✓ User is authenticated, proceeding to protected route");
    return next();
  }
  
  console.log("✗ User is not authenticated, returning 401");
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup file upload routes
  setupUpload(app);
  
  // Seed database with initial data if using DatabaseStorage
  if ('seedDummyData' in storage) {
    try {
      await (storage as any).seedDummyData();
      console.log('Database seeded with initial data');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.updateProfile(validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Skills routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post("/api/skills", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(validatedData);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.patch("/api/skills/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSkillSchema.parse(req.body);
      const skill = await storage.updateSkill(id, validatedData);
      res.json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSkill(id);
      res.status(200).json({ message: "Skill deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Experience routes
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  app.post("/api/experiences", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(validatedData);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid experience data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create experience" });
    }
  });

  app.patch("/api/experiences/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExperienceSchema.parse(req.body);
      const experience = await storage.updateExperience(id, validatedData);
      res.json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid experience data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update experience" });
    }
  });

  app.delete("/api/experiences/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExperience(id);
      res.status(200).json({ message: "Experience deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete experience" });
    }
  });

  // Social links routes
  app.get("/api/socials", async (req, res) => {
    try {
      const socials = await storage.getAllSocials();
      res.json(socials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  app.post("/api/socials", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSocialSchema.parse(req.body);
      const social = await storage.createSocial(validatedData);
      res.status(201).json(social);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid social link data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create social link" });
    }
  });

  app.patch("/api/socials/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSocialSchema.parse(req.body);
      const social = await storage.updateSocial(id, validatedData);
      res.json(social);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid social link data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update social link" });
    }
  });

  app.delete("/api/socials/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSocial(id);
      res.status(200).json({ message: "Social link deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete social link" });
    }
  });

  // Resume routes
  app.get("/api/resume", async (req, res) => {
    try {
      const resume = await storage.getResume();
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse({
        ...req.body,
        createdAt: new Date(),
      });
      const contact = await storage.createContact(validatedData);
      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Feedback submission
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        createdAt: new Date(),
      });
      const feedback = await storage.createFeedback(validatedData);
      res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });
  
  // Feedback listing (admin only)
  app.get("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Dashboard stats (for admin dashboard)
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Blog post routes
  app.get("/api/blog", async (req, res) => {
    try {
      console.log("Fetching all blog posts");
      const posts = await storage.getAllBlogPosts();
      console.log(`Retrieved ${posts.length} blog posts`);
      
      // If no posts exist, add some sample content
      if (posts.length === 0) {
        console.log("No blog posts found, creating sample content");
        
        const currentDate = new Date();
        const samplePosts = [
          {
            title: "Getting Started with Web Development",
            slug: "getting-started-with-web-development",
            summary: "A beginner's guide to starting your journey in web development with the right tools and resources.",
            content: "# Getting Started with Web Development\n\nWeb development is a diverse and exciting field that combines creativity with technical skills. Whether you're interested in front-end design, back-end functionality, or full-stack development, there's something for everyone.\n\n## Choosing Your Path\n\nBefore diving in, consider which area appeals to you most:\n\n- **Front-end Development**: Creating the user interface and user experience using HTML, CSS, and JavaScript\n- **Back-end Development**: Building server-side logic, databases, and APIs\n- **Full-stack Development**: Combining both front-end and back-end skills\n\n## Essential Languages and Tools\n\nStart with these foundational technologies:\n\n1. **HTML**: The structure of web pages\n2. **CSS**: The styling and layout\n3. **JavaScript**: Interactive functionality\n4. **Git**: Version control for your code\n\n## Learning Resources\n\n- Online tutorials on platforms like freeCodeCamp, Codecademy, or MDN Web Docs\n- Interactive coding challenges on LeetCode or HackerRank\n- YouTube tutorials for visual learning\n- Joining coding communities on Discord or Reddit\n\n## Building Your First Projects\n\nStart small and gradually increase complexity:\n\n1. A personal portfolio website\n2. A to-do list application\n3. A weather app using a public API\n\nRemember, consistency is key in learning web development. Practice regularly, build projects, and don't be afraid to make mistakes along the way!",
            featuredImage: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8",
            tags: "Web Development, Beginners, HTML, CSS, JavaScript",
            readingTime: 8,
            publishedAt: currentDate,
            updatedAt: currentDate,
            isAiGenerated: false
          },
          {
            title: "Modern Frontend Frameworks Comparison",
            slug: "modern-frontend-frameworks-comparison",
            summary: "An in-depth analysis of React, Vue, and Angular to help you choose the right framework for your next project.",
            content: "# Comparing Modern Frontend Frameworks\n\n## React\n\nDeveloped by Facebook, React has become the most popular JavaScript library for building user interfaces. Its component-based architecture and virtual DOM implementation make it efficient for building complex applications.\n\n### Pros\n- Flexible and adaptable\n- Massive ecosystem and community support\n- Great for single-page applications\n- React Native for mobile development\n\n### Cons\n- Requires additional libraries for routing, state management, etc.\n- Steeper learning curve for beginners\n\n## Vue\n\nVue.js combines the best aspects of Angular and React with a gentler learning curve. It's progressive, meaning you can adopt it incrementally in your projects.\n\n### Pros\n- Excellent documentation\n- Easy to integrate into existing projects\n- Gentle learning curve\n- Built-in state management and routing solutions\n\n### Cons\n- Smaller ecosystem compared to React\n- Fewer job opportunities in some markets\n\n## Angular\n\nAngular is a complete framework maintained by Google, offering a full suite of tools for large-scale applications right out of the box.\n\n### Pros\n- Comprehensive solution with everything built-in\n- TypeScript integration for type safety\n- Excellent for large enterprise applications\n- Strong conventions and patterns\n\n### Cons\n- Steepest learning curve\n- More verbose than React or Vue\n- Less flexible for smaller projects\n\n## Making Your Choice\n\nChoose React if you:\n- Value flexibility and a large ecosystem\n- Want good job prospects\n- Plan to build mobile apps with the same skills\n\nChoose Vue if you:\n- Prefer simplicity and clear documentation\n- Need to integrate with existing projects\n- Want a gentler learning curve\n\nChoose Angular if you:\n- Work on large enterprise applications\n- Appreciate comprehensive solutions\n- Value strong conventions and patterns\n\nRemember, the best framework is the one that best suits your project requirements and team preferences.",
            featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
            tags: "JavaScript, Frameworks, React, Vue, Angular",
            readingTime: 12,
            publishedAt: currentDate,
            updatedAt: currentDate,
            isAiGenerated: false
          },
          {
            title: "Building Accessible Websites",
            slug: "building-accessible-websites",
            summary: "Learn why web accessibility matters and how to implement inclusive design principles in your projects.",
            content: "# Building Accessible Websites\n\nWeb accessibility means designing and developing websites that can be used by everyone, including people with disabilities. It's not just a nice-to-have feature—it's a necessity for creating truly inclusive digital experiences.\n\n## Why Accessibility Matters\n\n- **Inclusivity**: About 15% of the world's population lives with some form of disability\n- **Legal requirements**: Many countries have laws requiring accessible websites\n- **Better UX for everyone**: Accessibility improvements often benefit all users\n- **SEO benefits**: Many accessibility practices also improve search engine optimization\n\n## Key WCAG Guidelines\n\nThe Web Content Accessibility Guidelines (WCAG) provide standards organized around four principles:\n\n1. **Perceivable**: Information must be presentable in ways all users can perceive\n2. **Operable**: Interface components must be operable by everyone\n3. **Understandable**: Information and operation must be understandable\n4. **Robust**: Content must be robust enough to work with various technologies\n\n## Practical Implementation Tips\n\n### Semantic HTML\n\nUse appropriate HTML elements for their intended purpose:\n\n```html\n<header>\n  <nav>\n    <ul>\n      <li><a href=\"#\">Home</a></li>\n    </ul>\n  </nav>\n</header>\n<main>\n  <article>\n    <h1>Article Title</h1>\n    <p>Content here...</p>\n  </article>\n</main>\n<footer>...</footer>\n```\n\n### Keyboard Navigation\n\nEnsure all interactive elements can be accessed and operated using only a keyboard:\n\n- Logical tab order\n- Visible focus indicators\n- Keyboard-accessible custom widgets\n\n### Alternative Text\n\nProvide alt text for images that convey meaning:\n\n```html\n<img src=\"chart.jpg\" alt=\"Bar chart showing sales growth of 25% in Q4 2023\" />\n```\n\n### Color and Contrast\n\n- Don't rely solely on color to convey information\n- Ensure sufficient contrast between text and background\n- Aim for a contrast ratio of at least 4.5:1 for normal text\n\n### ARIA When Necessary\n\nUse ARIA attributes when HTML semantics aren't enough:\n\n```html\n<div role=\"alert\" aria-live=\"assertive\">Form submitted successfully!</div>\n```\n\n## Testing Accessibility\n\n- Automated tools like Lighthouse, WAVE, or axe\n- Manual keyboard navigation testing\n- Screen reader testing\n- Color contrast checkers\n\nRemember that accessibility is an ongoing process, not a one-time task. Regular testing and continuous improvement are key to maintaining an accessible website.",
            featuredImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095",
            tags: "Accessibility, WCAG, Inclusive Design, UX",
            readingTime: 10,
            publishedAt: currentDate,
            updatedAt: currentDate,
            isAiGenerated: false
          }
        ];
        
        for (const post of samplePosts) {
          await storage.createBlogPost(post);
        }
        
        // Return the newly created posts
        return res.json(await storage.getAllBlogPosts());
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Important: Order matters! Put more specific routes first
  app.get("/api/blog/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      console.log(`Fetching blog post by slug: "${slug}"`);
      
      const post = await storage.getBlogPostBySlug(slug);
      console.log(`Result for slug "${slug}":`, post ? `Found post with id ${post.id}` : "Post not found");
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  // Special debug route to test blog slug fetching directly
  app.get("/api/test/blog-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      console.log(`[TEST] Fetching blog post by slug: "${slug}"`);
      
      const post = await storage.getBlogPostBySlug(slug);
      console.log(`[TEST] Result:`, post);
      
      if (!post) {
        return res.status(404).json({ 
          message: "Blog post not found", 
          slug: slug,
          debug: "This is from the test endpoint" 
        });
      }
      
      res.json({
        message: "Blog post found",
        slug: slug,
        post: post,
        debug: "This is from the test endpoint"
      });
    } catch (error) {
      console.error("[TEST] Error fetching blog post by slug:", error);
      res.status(500).json({ 
        message: "Failed to fetch blog post", 
        error: String(error),
        debug: "This is from the test endpoint"
      });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by ID:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse({
        ...req.body,
        publishedAt: new Date(),
        updatedAt: new Date()
      });
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.patch("/api/blog/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.parse({
        ...req.body,
        updatedAt: new Date()
      });
      const post = await storage.updateBlogPost(id, validatedData);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(200).json({ message: "Blog post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Blog comment routes
  app.get("/api/blog/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getBlogComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog comments" });
    }
  });

  app.post("/api/blog/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const validatedData = insertBlogCommentSchema.parse({
        ...req.body,
        postId,
        createdAt: new Date()
      });
      const comment = await storage.createBlogComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/blog/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogComment(id);
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // AI content generation routes
  app.post("/api/ai/generate-blog", isAuthenticated, async (req, res) => {
    try {
      const { title, topic, keywords, length } = req.body;
      const content = await generateBlogPost({
        title,
        topic,
        keywords,
        length
      });
      res.json(content);
    } catch (error) {
      console.error("AI blog generation error:", error);
      res.status(500).json({ message: "Failed to generate blog content" });
    }
  });

  app.post("/api/ai/blog-suggestions", isAuthenticated, async (req, res) => {
    try {
      const { userProfile, existingTopics } = req.body;
      const suggestions = await generateBlogSuggestions(userProfile, existingTopics);
      res.json({ suggestions });
    } catch (error) {
      console.error("AI blog suggestions error:", error);
      res.status(500).json({ message: "Failed to generate blog suggestions" });
    }
  });

  app.post("/api/ai/analyze-blog", isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      const analysis = await analyzeBlogContent(content);
      res.json(analysis);
    } catch (error) {
      console.error("AI blog analysis error:", error);
      res.status(500).json({ message: "Failed to analyze blog content" });
    }
  });
  
  // AI Chat API endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      console.log("Processing chat request...");
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          message: "Invalid request. 'messages' must be an array of chat messages."
        });
      }

      const chatResponse = await processChat(messages);
      res.json(chatResponse);
    } catch (error) {
      console.error('Error processing chat:', error);
      res.status(500).json({ 
        message: "Failed to process chat request. Please try again later."
      });
    }
  });

  // Visitor tracking routes
  app.get("/api/visitor-stats", async (req, res) => {
    try {
      const stats = await storage.getVisitorStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      res.status(500).json({ message: 'Failed to get visitor statistics' });
    }
  });
  
  app.post("/api/track-visitor", async (req, res) => {
    try {
      // Get visitor ID from cookie or create a new one
      let visitorId = req.cookies?.visitor_id;
      const isNewCookie = !visitorId;
      
      if (!visitorId) {
        // Generate a new random ID if none exists
        visitorId = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      }
      
      // Track the visitor
      const result = await storage.trackVisitor(visitorId);
      
      // Set a long-lived cookie if it's a new visitor
      if (isNewCookie) {
        res.cookie('visitor_id', visitorId, { 
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
          httpOnly: true,
          sameSite: 'lax'
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error tracking visitor:', error);
      res.status(500).json({ message: 'Failed to track visitor' });
    }
  });

  // AI-powered content recommendations
  app.post("/api/content-recommendations", async (req, res) => {
    try {
      const { userInterests, currentContent, contentType, contentId } = req.body;
      
      if (!userInterests || !Array.isArray(userInterests) || userInterests.length === 0) {
        return res.status(400).json({ 
          message: "User interests must be provided as a non-empty array" 
        });
      }

      if (!currentContent) {
        return res.status(400).json({ 
          message: "Current content information must be provided" 
        });
      }
      
      // Get all available content from storage
      const [blogs, projects, skills] = await Promise.all([
        storage.getAllBlogPosts(),
        storage.getAllProjects(),
        storage.getAllSkills()
      ]);
      
      // Format blogs for the recommendation system
      const formattedBlogs = blogs.map(blog => ({
        title: blog.title,
        summary: blog.summary,
        slug: blog.slug,
        tags: blog.tags
      }));
      
      // Format projects for the recommendation system
      const formattedProjects = projects.map(project => ({
        title: project.title,
        description: project.description,
        id: project.id,
        category: project.category
      }));
      
      // Format skills for the recommendation system
      const formattedSkills = skills.map(skill => ({
        name: skill.name,
        category: skill.category,
        id: skill.id
      }));
      
      // Generate recommendations using OpenAI
      const recommendations = await generateContentRecommendations(
        userInterests,
        currentContent,
        {
          blogs: formattedBlogs,
          projects: formattedProjects,
          skills: formattedSkills
        }
      );
      
      res.json(recommendations);
    } catch (error: any) {
      console.error('Error generating content recommendations:', error);
      
      // Check for OpenAI rate limit or quota errors
      let errorMessage = "Failed to generate content recommendations. Please try again later.";
      let errorCode = "general_error";
      
      if (error && (error.code === 'insufficient_quota' || error.status === 429)) {
        errorMessage = "OpenAI API rate limit reached. Recommendations will be available later.";
        errorCode = "rate_limit";
      }
      
      res.status(500).json({ 
        message: errorMessage,
        code: errorCode,
        // Include additional details for debugging in development
        ...(process.env.NODE_ENV === 'development' && error && { 
          details: error.message || 'Unknown error',
          type: error.type || 'unknown'
        })
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
