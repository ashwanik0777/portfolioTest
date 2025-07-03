import {
  User,
  InsertUser,
  InsertProfile,
  Profile,
  InsertSkill,
  Skill,
  InsertProject,
  Project,
  InsertExperience,
  Experience,
  InsertSocial,
  Social,
  InsertResume,
  Resume,
  InsertContact,
  Contact,
  InsertFeedback,
  Feedback,
  InsertBlogPost,
  BlogPost,
  InsertBlogComment,
  BlogComment,
  InsertVisitorLog,
  VisitorLog,
  users,
  profile as profileTable,
  skills as skillsTable,
  projects as projectsTable,
  experiences as experiencesTable,
  socials as socialsTable,
  resume as resumeTable,
  contacts as contactsTable,
  feedback as feedbackTable,
  blogPosts as blogPostsTable,
  blogComments as blogCommentsTable,
  visitorCounter as visitorCounterTable,
  visitorLogs as visitorLogsTable
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { IStorage } from "./storage";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      pruneSessionInterval: 60, // Prune expired sessions every minute
      tableName: 'session', // Use a more explicit table name
      errorLog: console.error // Log session store errors
    });
    
    console.log("DatabaseStorage: PostgreSQL session store initialized with enhanced options");
  }

  // User authentication
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Profile
  async getProfile(): Promise<Profile | undefined> {
    const profiles = await db.select().from(profileTable);
    return profiles[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [result] = await db.insert(profileTable).values(profile).returning();
    return result;
  }

  async updateProfile(profile: InsertProfile): Promise<Profile> {
    const existingProfile = await this.getProfile();
    
    if (existingProfile) {
      const [result] = await db
        .update(profileTable)
        .set(profile)
        .where(eq(profileTable.id, existingProfile.id))
        .returning();
      return result;
    } else {
      return this.createProfile(profile);
    }
  }

  // Skills
  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skillsTable);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.id, id));
    return skill;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [result] = await db.insert(skillsTable).values(skill).returning();
    return result;
  }

  async updateSkill(id: number, skill: InsertSkill): Promise<Skill> {
    const [result] = await db
      .update(skillsTable)
      .set(skill)
      .where(eq(skillsTable.id, id))
      .returning();
    
    if (!result) {
      throw new Error("Skill not found");
    }
    
    return result;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skillsTable).where(eq(skillsTable.id, id));
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projectsTable);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [result] = await db.insert(projectsTable).values(project).returning();
    return result;
  }

  async updateProject(id: number, project: InsertProject): Promise<Project> {
    const [result] = await db
      .update(projectsTable)
      .set(project)
      .where(eq(projectsTable.id, id))
      .returning();
    
    if (!result) {
      throw new Error("Project not found");
    }
    
    return result;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
  }

  // Experiences
  async getAllExperiences(): Promise<Experience[]> {
    return db.select().from(experiencesTable);
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    const [experience] = await db.select().from(experiencesTable).where(eq(experiencesTable.id, id));
    return experience;
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const [result] = await db.insert(experiencesTable).values(experience).returning();
    return result;
  }

  async updateExperience(id: number, experience: InsertExperience): Promise<Experience> {
    const [result] = await db
      .update(experiencesTable)
      .set(experience)
      .where(eq(experiencesTable.id, id))
      .returning();
    
    if (!result) {
      throw new Error("Experience not found");
    }
    
    return result;
  }

  async deleteExperience(id: number): Promise<void> {
    await db.delete(experiencesTable).where(eq(experiencesTable.id, id));
  }

  // Social links
  async getAllSocials(): Promise<Social[]> {
    return db.select().from(socialsTable);
  }

  async getSocial(id: number): Promise<Social | undefined> {
    const [social] = await db.select().from(socialsTable).where(eq(socialsTable.id, id));
    return social;
  }

  async createSocial(social: InsertSocial): Promise<Social> {
    const [result] = await db.insert(socialsTable).values(social).returning();
    return result;
  }

  async updateSocial(id: number, social: InsertSocial): Promise<Social> {
    const [result] = await db
      .update(socialsTable)
      .set(social)
      .where(eq(socialsTable.id, id))
      .returning();
    
    if (!result) {
      throw new Error("Social link not found");
    }
    
    return result;
  }

  async deleteSocial(id: number): Promise<void> {
    await db.delete(socialsTable).where(eq(socialsTable.id, id));
  }

  // Resume
  async getResume(): Promise<Resume | undefined> {
    const resumes = await db.select().from(resumeTable);
    return resumes[0];
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [result] = await db.insert(resumeTable).values(resume).returning();
    return result;
  }

  async updateResume(resume: InsertResume): Promise<Resume> {
    const existingResume = await this.getResume();
    
    if (existingResume) {
      const [result] = await db
        .update(resumeTable)
        .set(resume)
        .where(eq(resumeTable.id, existingResume.id))
        .returning();
      return result;
    } else {
      return this.createResume(resume);
    }
  }

  // Contact form
  async createContact(contact: InsertContact): Promise<Contact> {
    const [result] = await db.insert(contactsTable).values(contact).returning();
    return result;
  }

  async getAllContacts(): Promise<Contact[]> {
    return db.select().from(contactsTable);
  }

  // Feedback
  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [result] = await db.insert(feedbackTable).values(feedback).returning();
    return result;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return db.select().from(feedbackTable);
  }

  // Blog posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPostsTable);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
    return post;
  }

  async createBlogPost(blog: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db.insert(blogPostsTable).values(blog).returning();
    return result;
  }

  async updateBlogPost(id: number, blog: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db
      .update(blogPostsTable)
      .set(blog)
      .where(eq(blogPostsTable.id, id))
      .returning();
    
    if (!result) {
      throw new Error("Blog post not found");
    }
    
    return result;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  }

  // Blog comments
  async getBlogComments(postId: number): Promise<BlogComment[]> {
    return db.select().from(blogCommentsTable).where(eq(blogCommentsTable.postId, postId));
  }

  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const [result] = await db.insert(blogCommentsTable).values(comment).returning();
    return result;
  }

  async deleteBlogComment(id: number): Promise<void> {
    await db.delete(blogCommentsTable).where(eq(blogCommentsTable.id, id));
  }

  // Visitor counter 
  async getVisitorStats(): Promise<{totalVisitors: number, uniqueVisitors: number}> {
    try {
      // Check if we have a counter record
      const counters = await db.select().from(visitorCounterTable);
      
      if (counters.length === 0) {
        // Create initial counter if none exists
        const [counter] = await db.insert(visitorCounterTable)
          .values({
            totalVisitors: 0,
            uniqueVisitors: 0,
            lastUpdated: new Date()
          })
          .returning();
        
        return {
          totalVisitors: counter.totalVisitors,
          uniqueVisitors: counter.uniqueVisitors
        };
      }
      
      return {
        totalVisitors: counters[0].totalVisitors,
        uniqueVisitors: counters[0].uniqueVisitors
      };
    } catch (error) {
      console.error("Error getting visitor stats:", error);
      return { totalVisitors: 0, uniqueVisitors: 0 };
    }
  }
  
  async trackVisitor(visitorId: string): Promise<{isNewVisitor: boolean, totalVisitors: number, uniqueVisitors: number}> {
    try {
      // Check if this visitor has been seen before
      const existingVisitors = await db.select().from(visitorLogsTable)
        .where(eq(visitorLogsTable.visitorId, visitorId));
      
      const isNewVisitor = existingVisitors.length === 0;
      
      // Get current counter
      let counters = await db.select().from(visitorCounterTable);
      let counter = counters[0];
      
      if (!counter) {
        // Create counter if it doesn't exist
        const [newCounter] = await db.insert(visitorCounterTable)
          .values({
            totalVisitors: 1,
            uniqueVisitors: 1,
            lastUpdated: new Date()
          })
          .returning();
        counter = newCounter;
      } else {
        // Update counter based on whether this is a new visitor
        counter = (await db.update(visitorCounterTable)
          .set({
            totalVisitors: counter.totalVisitors + 1,
            uniqueVisitors: isNewVisitor ? counter.uniqueVisitors + 1 : counter.uniqueVisitors,
            lastUpdated: new Date()
          })
          .where(eq(visitorCounterTable.id, counter.id))
          .returning())[0];
      }
      
      if (isNewVisitor) {
        // Record new visitor
        await db.insert(visitorLogsTable)
          .values({
            visitorId,
            firstVisit: new Date(),
            lastVisit: new Date()
          });
      } else {
        // Update last visit time
        await db.update(visitorLogsTable)
          .set({ lastVisit: new Date() })
          .where(eq(visitorLogsTable.visitorId, visitorId));
      }
      
      return {
        isNewVisitor,
        totalVisitors: counter.totalVisitors,
        uniqueVisitors: counter.uniqueVisitors
      };
    } catch (error) {
      console.error("Error tracking visitor:", error);
      return { isNewVisitor: false, totalVisitors: 0, uniqueVisitors: 0 };
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    skillsCount: number;
    projectsCount: number;
    experiencesCount: number;
    messagesCount: number;
    feedbackCount: number;
    blogPostsCount: number;
  }> {
    const [skillsCount] = await db.select({ count: skillsTable.id }).from(skillsTable);
    const [projectsCount] = await db.select({ count: projectsTable.id }).from(projectsTable);
    const [experiencesCount] = await db.select({ count: experiencesTable.id }).from(experiencesTable);
    const [messagesCount] = await db.select({ count: contactsTable.id }).from(contactsTable);
    const [feedbackCount] = await db.select({ count: feedbackTable.id }).from(feedbackTable);
    const [blogPostsCount] = await db.select({ count: blogPostsTable.id }).from(blogPostsTable);

    return {
      skillsCount: Number(skillsCount?.count) || 0,
      projectsCount: Number(projectsCount?.count) || 0,
      experiencesCount: Number(experiencesCount?.count) || 0,
      messagesCount: Number(messagesCount?.count) || 0,
      feedbackCount: Number(feedbackCount?.count) || 0,
      blogPostsCount: Number(blogPostsCount?.count) || 0
    };
  }

  // Seed initial data for development
  async seedDummyData() {
    // Add default admin user if it doesn't exist
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      await this.createUser({
        username: "admin",
        // Hashed password for "admin123"
        password: "5906ac361a137cdd98be7a22bf5b1a5d5aa839c15a3727387c7d357525682c13.b23d3f1375a2f26e54747745c3b947c1"
      });
    }
    
    // Add dummy profile if none exists
    const existingProfile = await this.getProfile();
    if (!existingProfile) {
      await this.createProfile({
        fullName: "Alex Johnson",
        title: "Full Stack Developer",
        bio: "Creative and detail-oriented Full Stack Developer with 5+ years of experience in building scalable web applications. Passionate about creating elegant solutions to complex problems and staying on top of emerging technologies.",
        email: "alex@example.com",
        phone: "+1 (123) 456-7890",
        location: "San Francisco, CA",
        avatarUrl: "https://i.pravatar.cc/300",
        headerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      });
    }

    // Add dummy skills if none exist
    const existingSkills = await this.getAllSkills();
    if (existingSkills.length === 0) {
      const skillsToAdd = [
        { name: "JavaScript", level: 90, category: "Frontend" },
        { name: "React", level: 85, category: "Frontend" },
        { name: "TypeScript", level: 80, category: "Frontend" },
        { name: "HTML/CSS", level: 95, category: "Frontend" },
        { name: "Node.js", level: 85, category: "Backend" },
        { name: "Express", level: 80, category: "Backend" },
        { name: "MongoDB", level: 75, category: "Backend" },
        { name: "PostgreSQL", level: 70, category: "Backend" },
        { name: "AWS", level: 65, category: "DevOps" },
        { name: "Docker", level: 70, category: "DevOps" },
        { name: "Git", level: 90, category: "Tools" },
        { name: "Jest", level: 75, category: "Testing" }
      ];
      
      for (const skill of skillsToAdd) {
        await this.createSkill(skill);
      }
    }

    // Add dummy projects if none exist
    const existingProjects = await this.getAllProjects();
    if (existingProjects.length === 0) {
      const projectsToAdd = [
        {
          title: "E-Commerce Platform",
          description: "A full-featured e-commerce platform with payment processing, inventory management, and user authentication.",
          image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
          category: "Web Application",
          tags: "React,Node.js,MongoDB,Stripe",
          demoUrl: "https://ecommerce-demo.example.com",
          githubUrl: "https://github.com/example/ecommerce"
        },
        {
          title: "Task Management App",
          description: "A collaborative task management application with real-time updates, task assignments, and progress tracking.",
          image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
          category: "Web Application",
          tags: "React,Express,Socket.io,PostgreSQL",
          demoUrl: "https://taskapp.example.com",
          githubUrl: "https://github.com/example/taskapp"
        },
        {
          title: "Fitness Tracker",
          description: "A mobile-responsive fitness tracking application that monitors workouts, nutrition, and progress over time.",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
          category: "Mobile Application",
          tags: "React Native,Firebase,Charts.js",
          demoUrl: "https://fitnessapp.example.com",
          githubUrl: "https://github.com/example/fitness"
        },
        {
          title: "Weather Dashboard",
          description: "A real-time weather dashboard that provides detailed forecasts, historical data, and visualizations.",
          image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
          category: "Web Application",
          tags: "JavaScript,OpenWeatherAPI,D3.js",
          demoUrl: "https://weather.example.com",
          githubUrl: "https://github.com/example/weather"
        }
      ];
      
      for (const project of projectsToAdd) {
        await this.createProject(project);
      }
    }

    // Add dummy experiences if none exist
    const existingExperiences = await this.getAllExperiences();
    if (existingExperiences.length === 0) {
      const experiencesToAdd = [
        {
          company: "Tech Innovations Inc.",
          jobTitle: "Senior Full Stack Developer",
          startDate: new Date("2020-06-01"),
          endDate: null,
          technologies: "React, Node.js, TypeScript, AWS",
          description: "Leading development of the company's flagship SaaS product. Architected and implemented major features that increased user engagement by 40%. Mentored junior developers and established best practices for the engineering team."
        },
        {
          company: "WebSolutions Co.",
          jobTitle: "Full Stack Developer",
          startDate: new Date("2018-03-15"),
          endDate: new Date("2020-05-30"),
          technologies: "React, Express, MongoDB, Redux",
          description: "Developed and maintained multiple client projects. Built custom e-commerce solutions and implemented CI/CD pipelines that reduced deployment time by 50%. Collaborated closely with design and product teams."
        },
        {
          company: "Digital Creatives",
          jobTitle: "Frontend Developer",
          startDate: new Date("2016-07-10"),
          endDate: new Date("2018-03-01"),
          technologies: "JavaScript, HTML, CSS, jQuery",
          description: "Created responsive web designs and interactive UI components for client websites. Optimized web performance and implemented analytics tracking that improved conversion rates by 25%."
        }
      ];
      
      for (const experience of experiencesToAdd) {
        await this.createExperience(experience);
      }
    }

    // Add dummy social links if none exist
    const existingSocials = await this.getAllSocials();
    if (existingSocials.length === 0) {
      const socialsToAdd = [
        {
          name: "GitHub",
          url: "https://github.com/alexjohnson",
          icon: '<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>'
        },
        {
          name: "LinkedIn",
          url: "https://linkedin.com/in/alexjohnson",
          icon: '<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>'
        },
        {
          name: "Twitter",
          url: "https://twitter.com/alexjohnson",
          icon: '<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>'
        }
      ];
      
      for (const social of socialsToAdd) {
        await this.createSocial(social);
      }
    }

    // Add dummy resume if none exists
    const existingResume = await this.getResume();
    if (!existingResume) {
      await this.createResume({
        filename: "Alex_Johnson_Resume.pdf",
        url: "https://example.com/resume.pdf",
        uploadedAt: new Date()
      });
    }
  }
}