import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Feedback table for emoji-based feedback
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback)
  .omit({ id: true })
  .transform((data) => ({
    ...data,
    // Ensure comment is either a string or null, never undefined
    comment: data.comment === undefined ? null : data.comment
  }));
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Profile table for personal information
export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  headerImage: text("header_image").notNull(),
});

export const insertProfileSchema = createInsertSchema(profile).omit({ id: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profile.$inferSelect;

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: integer("level").notNull(),
});

export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").notNull(), // Stored as JSON string
  image: text("image").notNull(),
  demoUrl: text("demo_url"),
  githubUrl: text("github_url"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Work Experience table
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  jobTitle: text("job_title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  technologies: text("technologies").notNull(), // Stored as JSON string
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({ id: true });
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

// Social Media Links table
export const socials = pgTable("socials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(), // SVG icon as string
});

export const insertSocialSchema = createInsertSchema(socials).omit({ id: true });
export type InsertSocial = z.infer<typeof insertSocialSchema>;
export type Social = typeof socials.$inferSelect;

// Resume table
export const resume = pgTable("resume", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull(),
});

export const insertResumeSchema = createInsertSchema(resume).omit({ id: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resume.$inferSelect;

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  featuredImage: text("featured_image"),
  tags: text("tags").notNull(), // Stored as JSON string
  readingTime: integer("reading_time").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  publishedAt: timestamp("published_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Blog comments table
export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => blogPosts.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).omit({ id: true });
export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;
export type BlogComment = typeof blogComments.$inferSelect;

// Visitor counter table
export const visitorCounter = pgTable("visitor_counter", {
  id: serial("id").primaryKey(),
  totalVisitors: integer("total_visitors").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});

export const visitorLogs = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitor_id", { length: 100 }).notNull().unique(),
  firstVisit: timestamp("first_visit").defaultNow().notNull(),
  lastVisit: timestamp("last_visit").defaultNow().notNull()
});

export const insertVisitorLogSchema = createInsertSchema(visitorLogs).omit({ id: true });
export type InsertVisitorLog = z.infer<typeof insertVisitorLogSchema>;
export type VisitorLog = typeof visitorLogs.$inferSelect;
