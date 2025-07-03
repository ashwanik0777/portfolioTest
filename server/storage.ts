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
  BlogComment
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { DatabaseStorage } from "./database-storage";

const MemoryStore = createMemoryStore(session);

// Define the storage interface
export interface IStorage {
  // User authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Profile
  getProfile(): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(profile: InsertProfile): Promise<Profile>;

  // Skills
  getAllSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: InsertSkill): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: InsertProject): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Experience
  getAllExperiences(): Promise<Experience[]>;
  getExperience(id: number): Promise<Experience | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: InsertExperience): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;

  // Social links
  getAllSocials(): Promise<Social[]>;
  getSocial(id: number): Promise<Social | undefined>;
  createSocial(social: InsertSocial): Promise<Social>;
  updateSocial(id: number, social: InsertSocial): Promise<Social>;
  deleteSocial(id: number): Promise<void>;

  // Resume
  getResume(): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(resume: InsertResume): Promise<Resume>;

  // Contact form
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;

  // Blog posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(blog: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, blog: InsertBlogPost): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  // Blog comments
  getBlogComments(postId: number): Promise<BlogComment[]>;
  createBlogComment(comment: InsertBlogComment): Promise<BlogComment>;
  deleteBlogComment(id: number): Promise<void>;

  // Visitor counter
  getVisitorStats(): Promise<{totalVisitors: number, uniqueVisitors: number}>;
  trackVisitor(visitorId: string): Promise<{isNewVisitor: boolean, totalVisitors: number, uniqueVisitors: number}>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    skillsCount: number;
    projectsCount: number;
    experiencesCount: number;
    messagesCount: number;
    feedbackCount: number;
    blogPostsCount: number;
  }>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profile: Profile | undefined;
  private skills: Map<number, Skill>;
  private projects: Map<number, Project>;
  private experiences: Map<number, Experience>;
  private socials: Map<number, Social>;
  private resume: Resume | undefined;
  private contacts: Map<number, Contact>;
  private feedback: Map<number, Feedback>;
  private blogPosts: Map<number, BlogPost>;
  private blogComments: Map<number, BlogComment>;
  private visitorStats: { totalVisitors: number, uniqueVisitors: number };
  private visitorLogs: Map<string, { firstVisit: Date, lastVisit: Date }>;
  sessionStore: session.Store;
  private currentId: {
    users: number;
    skills: number;
    projects: number;
    experiences: number;
    socials: number;
    contacts: number;
    feedback: number;
    blogPosts: number;
    blogComments: number;
  };

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.projects = new Map();
    this.experiences = new Map();
    this.socials = new Map();
    this.contacts = new Map();
    this.feedback = new Map();
    this.blogPosts = new Map();
    this.blogComments = new Map();
    this.visitorLogs = new Map();
    this.visitorStats = { totalVisitors: 0, uniqueVisitors: 0 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize ID counters
    this.currentId = {
      users: 1,
      skills: 1,
      projects: 1,
      experiences: 1,
      socials: 1,
      contacts: 1,
      feedback: 1,
      blogPosts: 1,
      blogComments: 1
    };

    // Add default admin user
    this.createUser({
      username: "admin",
      // Hashed password for "admin123" - in a real app, this would be properly hashed
      password: "5906ac361a137cdd98be7a22bf5b1a5d5aa839c15a3727387c7d357525682c13.b23d3f1375a2f26e54747745c3b947c1"
    });

    // Add dummy data
    this.populateDummyData();
  }

  // User authentication
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Profile
  async getProfile(): Promise<Profile | undefined> {
    return this.profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    this.profile = { ...profile, id: 1 };
    return this.profile;
  }

  async updateProfile(profile: InsertProfile): Promise<Profile> {
    if (this.profile) {
      this.profile = { ...profile, id: this.profile.id };
    } else {
      this.profile = { ...profile, id: 1 };
    }
    return this.profile;
  }

  // Skills
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.currentId.skills++;
    const newSkill: Skill = { ...skill, id };
    this.skills.set(id, newSkill);
    return newSkill;
  }

  async updateSkill(id: number, skill: InsertSkill): Promise<Skill> {
    const existingSkill = this.skills.get(id);
    if (!existingSkill) {
      throw new Error("Skill not found");
    }

    const updatedSkill: Skill = { ...skill, id };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<void> {
    this.skills.delete(id);
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentId.projects++;
    const newProject: Project = { 
      ...project, 
      id,
      demoUrl: project.demoUrl ?? null,
      githubUrl: project.githubUrl ?? null
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: InsertProject): Promise<Project> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    const updatedProject: Project = { 
      ...project, 
      id,
      demoUrl: project.demoUrl ?? null,
      githubUrl: project.githubUrl ?? null
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }

  // Experiences
  async getAllExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values());
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const id = this.currentId.experiences++;
    const newExperience: Experience = { 
      ...experience, 
      id,
      endDate: experience.endDate ?? null
    };
    this.experiences.set(id, newExperience);
    return newExperience;
  }

  async updateExperience(id: number, experience: InsertExperience): Promise<Experience> {
    const existingExperience = this.experiences.get(id);
    if (!existingExperience) {
      throw new Error("Experience not found");
    }

    const updatedExperience: Experience = { 
      ...experience, 
      id,
      endDate: experience.endDate ?? null 
    };
    this.experiences.set(id, updatedExperience);
    return updatedExperience;
  }

  async deleteExperience(id: number): Promise<void> {
    this.experiences.delete(id);
  }

  // Social links
  async getAllSocials(): Promise<Social[]> {
    return Array.from(this.socials.values());
  }

  async getSocial(id: number): Promise<Social | undefined> {
    return this.socials.get(id);
  }

  async createSocial(social: InsertSocial): Promise<Social> {
    const id = this.currentId.socials++;
    const newSocial: Social = { ...social, id };
    this.socials.set(id, newSocial);
    return newSocial;
  }

  async updateSocial(id: number, social: InsertSocial): Promise<Social> {
    const existingSocial = this.socials.get(id);
    if (!existingSocial) {
      throw new Error("Social link not found");
    }

    const updatedSocial: Social = { ...social, id };
    this.socials.set(id, updatedSocial);
    return updatedSocial;
  }

  async deleteSocial(id: number): Promise<void> {
    this.socials.delete(id);
  }

  // Resume
  async getResume(): Promise<Resume | undefined> {
    return this.resume;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    this.resume = { ...resume, id: 1 };
    return this.resume;
  }

  async updateResume(resume: InsertResume): Promise<Resume> {
    this.resume = { ...resume, id: 1 };
    return this.resume;
  }

  // Contact form
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentId.contacts++;
    const newContact: Contact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  // Feedback
  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentId.feedback++;
    const newFeedback: Feedback = { ...feedback, id };
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values());
  }

  // Blog posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === slug
    );
  }

  async createBlogPost(blog: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentId.blogPosts++;
    const newBlog: BlogPost = { ...blog, id };
    this.blogPosts.set(id, newBlog);
    return newBlog;
  }

  async updateBlogPost(id: number, blog: InsertBlogPost): Promise<BlogPost> {
    const existingBlog = this.blogPosts.get(id);
    if (!existingBlog) {
      throw new Error("Blog post not found");
    }

    const updatedBlog: BlogPost = { ...blog, id };
    this.blogPosts.set(id, updatedBlog);
    return updatedBlog;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  // Blog comments
  async getBlogComments(postId: number): Promise<BlogComment[]> {
    return Array.from(this.blogComments.values()).filter(
      (comment) => comment.postId === postId
    );
  }

  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const id = this.currentId.blogComments++;
    const newComment: BlogComment = { ...comment, id };
    this.blogComments.set(id, newComment);
    return newComment;
  }

  async deleteBlogComment(id: number): Promise<void> {
    this.blogComments.delete(id);
  }

  // Visitor counter
  async getVisitorStats(): Promise<{totalVisitors: number, uniqueVisitors: number}> {
    return { ...this.visitorStats };
  }
  
  async trackVisitor(visitorId: string): Promise<{isNewVisitor: boolean, totalVisitors: number, uniqueVisitors: number}> {
    const isNewVisitor = !this.visitorLogs.has(visitorId);
    
    // Update visitor log
    if (isNewVisitor) {
      this.visitorLogs.set(visitorId, {
        firstVisit: new Date(),
        lastVisit: new Date()
      });
      this.visitorStats.uniqueVisitors++;
    } else {
      const visitor = this.visitorLogs.get(visitorId)!;
      this.visitorLogs.set(visitorId, {
        ...visitor,
        lastVisit: new Date()
      });
    }
    
    // Increment total views
    this.visitorStats.totalVisitors++;
    
    return {
      isNewVisitor,
      totalVisitors: this.visitorStats.totalVisitors,
      uniqueVisitors: this.visitorStats.uniqueVisitors
    };
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
    return {
      skillsCount: this.skills.size,
      projectsCount: this.projects.size,
      experiencesCount: this.experiences.size,
      messagesCount: this.contacts.size,
      feedbackCount: this.feedback.size,
      blogPostsCount: this.blogPosts.size
    };
  }

  // Populate dummy data for development
  private populateDummyData() {
    // Dummy profile
    this.createProfile({
      fullName: "Alex Johnson",
      title: "Full Stack Developer",
      bio: "Creative and detail-oriented Full Stack Developer with 5+ years of experience in building scalable web applications. Passionate about creating elegant solutions to complex problems and staying on top of emerging technologies.",
      email: "alex@example.com",
      phone: "+1 (123) 456-7890",
      location: "San Francisco, CA",
      avatarUrl: "https://i.pravatar.cc/300",
      headerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    });

    // Dummy skills
    [
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
    ].forEach(skill => {
      this.createSkill(skill);
    });

    // Dummy projects
    [
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
    ].forEach(project => {
      this.createProject(project);
    });

    // Dummy experiences
    [
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
    ].forEach(experience => {
      this.createExperience(experience);
    });

    // Dummy social links
    [
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
    ].forEach(social => {
      this.createSocial(social);
    });

    // Dummy resume
    this.createResume({
      filename: "Alex_Johnson_Resume.pdf",
      url: "https://example.com/resume.pdf",
      uploadedAt: new Date()
    });

    // Dummy contact messages
    [
      {
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Project Inquiry",
        message: "Hi Alex, I'm interested in discussing a potential web application project for my startup. Can we schedule a call to discuss details?",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        name: "Michael Brown",
        email: "michael@example.com",
        subject: "Job Opportunity",
        message: "Hello! I saw your portfolio and I'm impressed with your work. We have a senior developer position at our company that might be a good fit for you. Please let me know if you're interested in learning more.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ].forEach(contact => {
      this.createContact(contact);
    });
  }
}

// Use the DatabaseStorage instead of MemStorage for Neon.tech database
export const storage = new DatabaseStorage();
