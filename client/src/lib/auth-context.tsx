import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type UserData = { 
  id: number;
  username: string;
} | null;

type AuthContextType = {
  user: UserData;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: UserData;
    isLoading: boolean;
    isAuthenticated: boolean;
  }>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials),
        credentials: "include"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Login failed: " + errorText);
      }

      const userData = await response.json();
      setAuthState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });
      
      // Update the cache
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Login successful",
        description: `Welcome, ${userData.username}!`,
      });
      
      return;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Clear user from cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isLoading: authState.isLoading,
        isAuthenticated: authState.isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    console.warn("useSimpleAuth was called outside AuthContextProvider, returning fallback");
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => {
        console.warn("Login unavailable - AuthContextProvider not found");
        toast({
          title: "Authentication error",
          description: "Login service is not available",
          variant: "destructive",
        });
      },
      logout: async () => {
        console.warn("Logout unavailable - AuthContextProvider not found");
      }
    };
  }
  
  return context;
}