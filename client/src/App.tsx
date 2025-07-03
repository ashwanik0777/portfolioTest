import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BlogPage from "@/pages/blog-page";
import BlogDetailPage from "@/pages/blog-detail-page";
import { ProtectedRoute } from "./lib/protected-route";
import AdminDashboard from "./pages/admin/dashboard";
import AdminAbout from "./pages/admin/about";
import AdminSkills from "./pages/admin/skills";
import AdminProjects from "./pages/admin/projects";
import AdminExperience from "./pages/admin/experience";
import AdminSocials from "./pages/admin/socials";
import AdminResume from "./pages/admin/resume";
import AdminBlogManagement from "./pages/admin/blog-management";
import { LanguageSwitcher } from "./components/ui/language-switcher";
import { EmojiFeedback } from "./components/ui/emoji-feedback";
import { ChatBot } from "./components/ui/chat-bot";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { StatusIndicator } from "./components/ui/status-indicator";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { I18nDebugger } from "./components/ui/i18n-debugger";
import { SkipToContent, AnnouncementProvider } from "./lib/accessibility";
import { MouseTracker } from "./components/ui/mouse-tracker";
import { ParticleEffect } from "./components/ui/particle-effect";
import { BlobEffect } from "./components/ui/blob-effect";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogDetailPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/about" component={AdminAbout} />
      <ProtectedRoute path="/admin/skills" component={AdminSkills} />
      <ProtectedRoute path="/admin/projects" component={AdminProjects} />
      <ProtectedRoute path="/admin/experience" component={AdminExperience} />
      <ProtectedRoute path="/admin/socials" component={AdminSocials} />
      <ProtectedRoute path="/admin/resume" component={AdminResume} />
      <ProtectedRoute path="/admin/blog" component={AdminBlogManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { i18n } = useTranslation();
  
  // Update document language when i18n language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    
    // Add additional accessibility meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Alex Morgan personal portfolio - Full Stack Developer and UI/UX Designer showcasing skills, projects, and experience';
      document.head.appendChild(meta);
    }
  }, [i18n.language]);
  
  // State to control which effect to display
  const [currentEffect, setCurrentEffect] = useState<'mouse' | 'particle' | 'blob' | 'none'>('blob');
  
  // Enable/disable mouse effects based on user's reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentEffect('none');
    }
  }, []);
  
  const toggleEffect = () => {
    // Cycle through available effects
    if (currentEffect === 'mouse') setCurrentEffect('particle');
    else if (currentEffect === 'particle') setCurrentEffect('blob');
    else if (currentEffect === 'blob') setCurrentEffect('none');
    else setCurrentEffect('mouse');
  };

  return (
    <AnnouncementProvider>
      {/* Skip to content link - only visible when focused */}
      <SkipToContent />
      
      {/* Fixed position language switcher and theme toggle in the top-right corner */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      
      {/* Mouse cursor effects toggle button */}
      <div className="fixed top-6 left-6 z-50">
        <button 
          onClick={toggleEffect}
          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          aria-label="Toggle mouse effects"
          title="Toggle mouse effects"
        >
          <span className="text-xs sr-only">Toggle effects</span>
          <span className="text-lg" aria-hidden="true">✨</span>
        </button>
      </div>
      
      {/* Mouse cursor effects - conditionally rendered based on current effect */}
      {currentEffect === 'mouse' && <MouseTracker />}
      {currentEffect === 'particle' && <ParticleEffect />}
      {currentEffect === 'blob' && <BlobEffect />}
      
      {/* Live Status Indicator */}
      <StatusIndicator position="bottom-left" />
      
      {/* Utility components with proper positioning */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
        {/* Feedback button above chatbot */}
        <EmojiFeedback 
          placement="custom" 
        />
        
        {/* Chat bot component */}
        <ChatBot />
      </div>
      
      <Router />
      <I18nDebugger />
    </AnnouncementProvider>
  );
}

export default App;
