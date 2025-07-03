import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { MessageCircle, X } from "lucide-react";

interface Emoji {
  value: number;
  icon: string;
  label: string;
}

interface EmojiFeedbackProps {
  title?: string;
  subtitle?: string;
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
  onFeedbackSubmit?: (rating: number, comment: string) => void;
}

export function EmojiFeedback({
  title,
  subtitle,
  placement = 'bottom-right',
  onFeedbackSubmit
}: EmojiFeedbackProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isMobile = useMobile();
  
  // Emoji rating options
  const emojis: Emoji[] = [
    { value: 1, icon: "😞", label: t('feedback.veryUnsatisfied', 'Very Unsatisfied') },
    { value: 2, icon: "😕", label: t('feedback.unsatisfied', 'Unsatisfied') },
    { value: 3, icon: "😐", label: t('feedback.neutral', 'Neutral') },
    { value: 4, icon: "🙂", label: t('feedback.satisfied', 'Satisfied') },
    { value: 5, icon: "😄", label: t('feedback.verySatisfied', 'Very Satisfied') }
  ];
  
  // Handle feedback submission
  const handleSubmit = async () => {
    if (selectedEmoji === null) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the feedback API
      await apiRequest(
        'POST',
        '/api/feedback', 
        {
          rating: selectedEmoji,
          comment: comment.trim() || null
        }
      );
      
      // Invalidate any related queries
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      
      // Call the callback if provided
      if (onFeedbackSubmit) {
        onFeedbackSubmit(selectedEmoji, comment);
      }
      
      // Show success state
      setIsSubmitted(true);
      toast({
        title: t('feedback.thankYou', 'Thank you for your feedback!'),
        description: t('feedback.feedbackReceived', 'Your feedback has been received.'),
        variant: "default",
      });
      
      // Reset after some time
      setTimeout(() => {
        setIsOpen(false);
        // Reset the form after closing
        setTimeout(() => {
          setSelectedEmoji(null);
          setComment("");
          setIsSubmitted(false);
        }, 300);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: t('feedback.error', 'Error'),
        description: t('feedback.errorSubmitting', 'There was a problem submitting your feedback.'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Placement styles
  const placementStyles: Record<string, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'custom': '' // Empty for custom placement from parent
  };
  
  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);
  
  // Close modal when clicking outside (on mobile)
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      // @ts-ignore - target may not have closest method in some browsers
      const isClickInsideModal = e.target && (e.target as Element).closest('[data-feedback-modal="true"]');
      const isClickOnBackdrop = e.target === document.querySelector('.feedback-backdrop');
      
      if (isClickOnBackdrop || !isClickInsideModal) {
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
      {/* Button to trigger feedback form */}
      <div className={placement !== 'custom' ? `fixed ${placementStyles[placement]} z-40` : ''}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative"
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="rounded-full shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 p-3 h-12 w-12 flex items-center justify-center"
          >
            <MessageCircle size={22} />
          </Button>
          
          {/* Label that appears on hover with animation */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm whitespace-nowrap z-10"
              >
                {t('feedback.giveFeedback', 'Feedback')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 feedback-backdrop"
            />
            
            {/* Modal Content */}
            <motion.div
              data-feedback-modal="true"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`fixed z-50 bg-card shadow-xl rounded-xl border border-border ${
                isMobile 
                  ? 'bottom-0 left-0 right-0 w-full max-h-[90vh] overflow-y-auto rounded-b-none p-5' 
                  : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md p-6'
              }`}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground rounded-full p-2"
              >
                <X size={18} />
              </button>
              
              {/* Content */}
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="bg-primary/10 rounded-full p-4"
                    >
                      <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">
                    {t('feedback.thankYou', 'Thank you for your feedback!')}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {t('feedback.feedbackReceived', 'Your feedback has been received.')}
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2 pr-8">
                    {title || t('feedback.shareExperience', 'Share your experience')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {subtitle || t('feedback.howWasBrowsing', 'How was your experience with this portfolio?')}
                  </p>
                  
                  {/* Emoji Rating */}
                  <div className="flex justify-between mb-6">
                    {emojis.map((emoji) => (
                      <motion.button
                        key={emoji.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                          selectedEmoji === emoji.value ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedEmoji(emoji.value)}
                      >
                        <span className="text-2xl mb-1">{emoji.icon}</span>
                        <span className="text-xs text-muted-foreground">{emoji.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Comment Section - Shown only when an emoji is selected */}
                  <AnimatePresence>
                    {selectedEmoji !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        <label htmlFor="feedback-comment" className="block text-sm font-medium mb-2">
                          {t('feedback.additionalComments', 'Additional comments (optional)')}
                        </label>
                        <textarea
                          id="feedback-comment"
                          rows={3}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                          placeholder={t('feedback.tellUsMore', 'Tell us more about your experience...')}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedEmoji === null || isSubmitting}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('feedback.submitting', 'Submitting...')}
                        </>
                      ) : (
                        t('feedback.submit', 'Submit Feedback')
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}