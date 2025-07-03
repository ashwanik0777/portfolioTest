import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`Failed to fetch user: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (err) {
        console.error("Error fetching user:", err);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login attempt with:", credentials);
      try {
        // Try the login request with better error handling
        console.log("Sending login request to /api/login");
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials),
          credentials: "include"
        });
        
        console.log("Login response status:", response.status);
        
        // Handle different response statuses
        if (response.status === 401) {
          console.error("Login failed: Invalid credentials");
          throw new Error("Invalid username or password");
        } else if (response.status === 403) {
          console.error("Login failed: Access forbidden");
          throw new Error("Access denied");
        } else if (response.status === 500) {
          console.error("Login failed: Server error");
          throw new Error("Server error occurred during login");
        } else if (!response.ok) {
          let errorMessage = "Login failed";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          console.error("Login failed:", errorMessage);
          throw new Error(errorMessage);
        }
        
        // Parse successful response
        try {
          const userData = await response.json();
          console.log("Login response data:", userData);
          return userData;
        } catch (error) {
          console.error("Error parsing login response:", error);
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Login API error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful, updating user data:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      
      // Force redirect to admin dashboard
      window.location.href = "/admin";
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  // Error prevention/graceful fallback for when context is not available
  if (!context) {
    console.warn("useAuth was called outside AuthProvider, returning fallback implementation");
    
    // Return a safe fallback implementation
    return {
      user: null,
      isLoading: false,
      error: new Error("AuthProvider not found"),
      loginMutation: {
        mutate: () => console.warn("Login unavailable - Auth provider not found"),
        isPending: false,
      },
      logoutMutation: {
        mutate: () => console.warn("Logout unavailable - Auth provider not found"),
        isPending: false,
      },
      registerMutation: {
        mutate: () => console.warn("Register unavailable - Auth provider not found"),
        isPending: false,
      }
    };
  }
  
  return context;
}
