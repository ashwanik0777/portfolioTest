import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Admin bypass parameter for development testing
const ADMIN_BYPASS_ENABLED = true;

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [authState, setAuthState] = useState<{ 
    user: any | null, 
    isAuthenticated: boolean,
    isLoading: boolean
  }>({ 
    user: null, 
    isAuthenticated: false,
    isLoading: true
  });
  
  const [bypassMode, setBypassMode] = useState(false);

  // Check if we're in a development environment
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('replit');

  useEffect(() => {
    // Check if bypass was previously enabled
    const savedBypass = localStorage.getItem('adminBypassEnabled');
    if (savedBypass === 'true') {
      setBypassMode(true);
    }
  }, []);

  // Enable bypass mode for this session
  const enableBypass = () => {
    setBypassMode(true);
    localStorage.setItem('adminBypassEnabled', 'true');
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setAuthState({ 
            user: userData, 
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setAuthState({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    };
    
    checkAuth();
  }, []);

  if (authState.isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">Loading authentication status...</div>
        </div>
      </Route>
    );
  }

  // Allow admin bypass for development/testing
  if (!authState.user && bypassMode && isDev && ADMIN_BYPASS_ENABLED) {
    console.log("Using admin bypass mode to access protected route");
    return <Route path={path} component={Component} />;  // Bypass enabled
  }

  if (!authState.user) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-center max-w-md">
            You need to log in to access this page. Please use the login form to continue.
          </p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => window.location.href = "/auth"}>
              Go to Login
            </Button>
            
            {isDev && ADMIN_BYPASS_ENABLED && (
              <Button variant="outline" onClick={enableBypass}>
                Enable Admin Bypass
              </Button>
            )}
          </div>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
