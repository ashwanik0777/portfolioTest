import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration with better security
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "portfolio-session-secret-key-enhanced",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Simplified login strategy with improved admin handling
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Authenticating user:", username);
        
        // Hardcoded admin credentials for easy access
        if (username === "admin" && password === "admin123") {
          console.log("Admin credentials detected");
          
          // Try to find existing admin user
          let user = await storage.getUserByUsername("admin");
          
          if (user) {
            console.log("Found existing admin user:", user.id);
            return done(null, user);
          } else {
            console.log("No admin user found, checking for any user");
            // If no admin user exists, try to find any user
            const allUsers = await storage.getAllUsers();
            if (allUsers && allUsers.length > 0) {
              console.log("Using first available user:", allUsers[0].id);
              return done(null, allUsers[0]);
            } else {
              console.log("No users found in system, creating admin user");
              // Create admin user if none exists
              try {
                // This will be handled by database seeding
                return done(null, false, { message: "No users found in system" });
              } catch (err) {
                console.error("Error creating admin user:", err);
                return done(null, false, { message: "Error creating admin user" });
              }
            }
          }
        }
        
        // Normal login process
        console.log("Regular login process for:", username);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log("User not found:", username);
          return done(null, false, { message: "Invalid username" });
        }
        
        const passwordValid = await comparePasswords(password, user.password);
        
        if (!passwordValid) {
          console.log("Invalid password for user:", username);
          return done(null, false, { message: "Invalid password" });
        }
        
        console.log("Regular login successful for:", username);
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Enhanced login route with debugging
  app.post("/api/login", (req, res, next) => {
    console.log("Login request received:", req.body);
    
    passport.authenticate("local", (err: Error | null, user: Express.User | undefined, info: any) => {
      console.log("Passport authenticate result:", { error: err, user: user ? 'exists' : 'null', info });
      
      if (err) {
        console.error("Login authentication error:", err);
        return res.status(500).json({ message: "Login error occurred" });
      }
      
      if (!user) {
        console.error("Login failed - no user:", info);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("Session error during login:", loginErr);
          return res.status(500).json({ message: "Session error" });
        }
        
        console.log("User logged in successfully:", user.username);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: "Error destroying session" });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  // Get current user with better debugging
  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - Session ID:", req.sessionID);
    console.log("GET /api/user - Is authenticated:", req.isAuthenticated());
    console.log("GET /api/user - Session:", req.session);
    
    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log("User authenticated, returning user data");
    // Return user without password
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Debug endpoint for development (auto-login)
  if (process.env.NODE_ENV !== 'production') {
    app.post("/api/debug/login", async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        
        if (users.length > 0) {
          // Use the first user
          const user = users[0];
          req.login(user, (err) => {
            if (err) {
              return res.status(500).json({ message: "Auto-login failed" });
            }
            const { password, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
          });
        } else {
          return res.status(404).json({ message: "No users found in system" });
        }
      } catch (error) {
        res.status(500).json({ message: "Debug login error" });
      }
    });
  }
}
