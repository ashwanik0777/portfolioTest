import { useState, useEffect } from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Clock, 
  MapPin, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Calendar
} from "lucide-react";

type StatusType = 'online' | 'busy' | 'away' | 'offline';

interface StatusIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

// Function to get a random status for demo purposes
const getRandomStatus = (): StatusType => {
  const statuses: StatusType[] = ['online', 'busy', 'away', 'offline'];
  return statuses[Math.floor(Math.random() * 4)];
};

// Function to get the current local time string
const getCurrentTimeString = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Function to format date for availability
const formatAvailabilityDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export function StatusIndicator({ position = 'bottom-right', className = '' }: StatusIndicatorProps) {
  const [status, setStatus] = useState<StatusType>('online');
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [location, setLocation] = useState<string>('New York, USA');
  const [nextAvailable, setNextAvailable] = useState<string>(formatAvailabilityDate(3));
  const [responseTime, setResponseTime] = useState<string>('Usually within 24 hours');
  
  // Simulate status changes for demo purposes
  useEffect(() => {
    const statusInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to change status
        setStatus(getRandomStatus());
      }
    }, 30000); // Every 30 seconds
    
    const timeInterval = setInterval(() => {
      setTime(getCurrentTimeString());
    }, 60000); // Update time every minute
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(timeInterval);
    };
  }, []);
  
  // Status configuration
  const statusConfig = {
    'online': {
      color: 'bg-green-500',
      pulse: true,
      icon: CheckCircle2,
      text: 'Online - Available for work'
    },
    'busy': {
      color: 'bg-yellow-500',
      pulse: false,
      icon: Clock,
      text: 'Busy - Working on projects'
    },
    'away': {
      color: 'bg-orange-400',
      pulse: false,
      icon: AlertCircle,
      text: 'Away - Will be back soon'
    },
    'offline': {
      color: 'bg-gray-400',
      pulse: false,
      icon: AlertCircle,
      text: 'Offline - Not available'
    }
  };
  
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={`fixed ${positionClasses[position]} z-50 cursor-pointer ${className}`}>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg border border-border hover:border-primary/50 transition-all">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${currentStatus.color}`}>
                  {currentStatus.pulse && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-green-500"></span>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium">Status</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="w-64 p-0 overflow-hidden rounded-lg border-none">
          <div className="bg-card shadow-lg rounded-lg overflow-hidden">
            <div className={`p-3 ${status === 'online' ? 'bg-green-500/10' : status === 'busy' ? 'bg-yellow-500/10' : status === 'away' ? 'bg-orange-400/10' : 'bg-gray-400/10'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentStatus.color}`}>
                  {currentStatus.pulse && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-green-500"></span>
                  )}
                </div>
                <span className="font-semibold">{currentStatus.text}</span>
              </div>
            </div>
            
            <div className="p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Local time: <span className="font-medium">{time}</span></span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Location: <span className="font-medium">{location}</span></span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Next availability: <span className="font-medium">{nextAvailable}</span></span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Response time: <span className="font-medium">{responseTime}</span></span>
              </div>
            </div>
            
            <div className="border-t p-2 bg-muted/30">
              <p className="text-xs text-center text-muted-foreground">
                Click to send a message
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}