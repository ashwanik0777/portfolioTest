import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  User, 
  Lightbulb, 
  FolderKanban, 
  Briefcase, 
  Share, 
  File,
  LogOut,
  BookOpen,
  Menu,
  X,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Close sidebar when changing route on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);
  
  const navItems = [
    { href: "/", label: "Go to Home", icon: Home },
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/about", label: "About", icon: User },
    { href: "/admin/skills", label: "Skills", icon: Lightbulb },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/experience", label: "Experience", icon: Briefcase },
    { href: "/admin/socials", label: "Socials", icon: Share },
    { href: "/admin/resume", label: "Resume", icon: File },
    { href: "/admin/blog", label: "Blog", icon: BookOpen },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/40 z-30 md:hidden pointer-events-auto"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Header */}
      <div className="sticky top-0 z-20 h-16 bg-background border-b border-border flex items-center justify-between px-4 md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(true)}
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        
        <Link href="/" className="text-lg font-bold">
          Alex<span className="text-primary">Morgan</span>
        </Link>
        
        <ThemeToggle />
      </div>
      
      {/* Sidebar - Desktop (fixed) / Mobile (animated) */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 bg-sidebar dark:bg-sidebar border-r border-sidebar-border overflow-y-auto flex flex-col",
          "md:sticky md:top-0 md:z-0 md:w-72 md:translate-x-0"
        )}
        initial={isMobile ? "closed" : "open"}
        animate={sidebarOpen || !isMobile ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {/* Sidebar Header */}
        <div className="p-4 h-16 flex items-center justify-between border-b border-sidebar-border sticky top-0 bg-sidebar dark:bg-sidebar z-10">
          <Link href="/" className="text-lg font-bold text-sidebar-foreground">
            Alex<span className="text-sidebar-primary">Morgan</span>
          </Link>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(false)}
              className="h-9 w-9 md:hidden"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          )}
        </div>
        
        {/* Sidebar Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    "hover:bg-sidebar-accent/10 hover:translate-x-1 active:translate-x-0",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                      : "text-sidebar-foreground/80 hover:text-sidebar-accent"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground ml-auto"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">{user?.username || 'Admin User'}</p>
              <p className="text-xs text-sidebar-foreground/70">Admin</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center flex-1 md:flex-none"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.aside>
      
      {/* Main content */}
      <main className="flex-1 min-h-screen bg-background pt-0 md:pt-0">
        <div className="container mx-auto py-6 px-4 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
