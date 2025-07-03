import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Maximize2, 
  Minimize2,
  Bot,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

// Chat message interface
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useMobile();

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Add initial message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'नमस्ते! मैं आपके पोर्टफोलियो में मौजूद AI सहायक हूं। मैं वेब डेवलपमेंट, प्रोग्रामिंग, या किसी भी प्रोफेशनल विषय के बारे में आपके सवालों के जवाब दे सकता हूं। मुझसे कुछ पूछें!',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // If minimized, expand it so user can see the response
    if (isMinimized) {
      setIsMinimized(false);
    }

    try {
      // Call AI chat API
      const chatMessages = [...messages, userMessage]
        .filter(msg => msg.role !== 'system') // Remove system messages if any
        .map(({ role, content }) => ({ role, content })); // Strip timestamp

      // Make API request to chat endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
        credentials: 'include'
      }).then(res => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      });

      // Add AI response to chat
      if (response && response.message) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Chat Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive'
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'क्षमा करें, मुझे आपके संदेश का जवाब देने में समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false); // Reset minimized state when closing
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setIsMinimized(false); // Reset minimized state when expanding
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);
  
  // Close chat if clicking outside on mobile
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      // @ts-ignore - target may not have matches method in some browsers
      const isClickInsideChat = e.target && (e.target as Element).closest('[data-chat-container="true"]');
      if (!isClickInsideChat) {
        setIsOpen(false);
      }
    };
    
    // Add delayed listener to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  return (
    <>
      {/* Chat trigger button */}
      {!isOpen && (
        <motion.div
          className="relative"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.button
            className="rounded-full bg-primary text-primary-foreground p-3 shadow-lg h-12 w-12 flex items-center justify-center"
            onClick={toggleChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MessageSquare size={22} />
          </motion.button>
          
          {/* Label that appears on hover with animation */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm whitespace-nowrap z-10"
              >
                AI Assistant
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-chat-container="true"
            className={cn(
              "fixed z-50 bg-background border border-border rounded-lg shadow-xl flex flex-col",
              isExpanded 
                ? "inset-4 sm:inset-10" 
                : isMobile 
                  ? "bottom-0 left-0 right-0 rounded-b-none w-full h-[90vh] max-h-[550px]" 
                  : "bottom-6 right-6 w-80 sm:w-96 h-[450px]",
              isMinimized && "h-auto"
            )}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2" onClick={toggleMinimize}>
                <Bot size={20} className="text-primary" />
                <h3 className="font-medium">AI Assistant</h3>
                <button className="md:hidden">
                  {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              <div className="flex items-center space-x-1">
                {!isMobile && (
                  <button 
                    onClick={toggleExpand} 
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                )}
                <button 
                  onClick={toggleChat} 
                  className="p-1.5 hover:bg-muted rounded-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Collapsible content */}
            <AnimatePresence initial={false}>
              {!isMinimized && (
                <motion.div
                  className="flex flex-col flex-1"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex flex-col",
                          message.role === 'user' ? "items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%] p-3 rounded-lg",
                          message.role === 'user' 
                            ? "bg-primary text-primary-foreground rounded-br-none" 
                            : "bg-muted rounded-bl-none"
                        )}>
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        </div>
                        {message.timestamp && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {formatTime(message.timestamp)}
                          </span>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start">
                        <div className="bg-muted p-3 rounded-lg rounded-bl-none inline-flex items-center space-x-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input */}
                  <div className="p-3 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="min-h-[60px] resize-none"
                        disabled={isLoading}
                      />
                      <Button 
                        size="icon" 
                        className="h-[60px] w-[60px] shrink-0"
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      AI Assistant powered by OpenAI
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}