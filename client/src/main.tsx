import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ui/theme-provider";
// Import i18n configuration
import './i18n/i18n';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthContextProvider } from "./lib/auth-context";
import { Toaster } from "./components/ui/toaster";
import { MouseCursor } from "./components/ui/mouse-cursor";
import { ChatBot } from "./components/ui/chat-bot";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
        <App />
        <Toaster />
        <MouseCursor />
        {/* <ChatBot /> */}
      </ThemeProvider>
    </AuthContextProvider>
  </QueryClientProvider>
);
