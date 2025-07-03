import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  className?: string;
  cursorClassName?: string;
  infinite?: boolean;
  onWordChange?: (word: string) => void;
  ariaLabel?: string;
}

export function Typewriter({
  words = [],
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 1500,
  className = '',
  cursorClassName = '',
  infinite = true,
  onWordChange,
  ariaLabel = 'Animated text showing different skills'
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBlinking, setIsBlinking] = useState(true);
  const [prevWord, setPrevWord] = useState('');

  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[currentWordIndex];
    
    // Notify when we show a complete word (for screen readers)
    if (currentText === currentWord && currentWord !== prevWord) {
      setPrevWord(currentWord);
      if (onWordChange) {
        onWordChange(currentWord);
      }
    }
    
    const timeout = setTimeout(() => {
      // Typing
      if (!isDeleting && currentText !== currentWord) {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
        setIsBlinking(false);
      } 
      // Delay after typed full word
      else if (!isDeleting && currentText === currentWord) {
        setIsBlinking(true);
        setTimeout(() => {
          setIsDeleting(true);
          setIsBlinking(false);
        }, delayBetweenWords);
      }
      // Deleting
      else if (isDeleting && currentText !== '') {
        setCurrentText(currentText.substring(0, currentText.length - 1));
        setIsBlinking(false);
      }
      // Move to next word
      else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setIsBlinking(true);
        setCurrentWordIndex((prevIndex) => {
          if (prevIndex === words.length - 1) {
            return infinite ? 0 : prevIndex;
          }
          return prevIndex + 1;
        });
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, currentWordIndex, isDeleting, words, typingSpeed, deletingSpeed, delayBetweenWords, infinite, onWordChange, prevWord]);

  return (
    <div className={`inline-flex items-center ${className}`} role="text" aria-label={ariaLabel}>
      {/* Hidden text for screen readers that shows all words */}
      <span className="sr-only">
        Skills including: {words.join(', ')}
      </span>
      
      {/* Visual animated text for sighted users */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentText}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.5 }}
          transition={{ duration: 0.15 }}
          aria-hidden="true"
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
      
      <span 
        className={`${cursorClassName} ${isBlinking ? 'animate-blink' : ''}`}
        aria-hidden="true"
      >|</span>
    </div>
  );
}

// More advanced version with different typing styles
export function CreativeTypewriter({
  text,
  speed = 50,
  className = '',
  onComplete,
  typingStyles = 'normal',
  delay = 0,
  ariaLabel
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  typingStyles?: 'normal' | 'scramble' | 'fadeIn';
  delay?: number;
  ariaLabel?: string;
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  // Add initial delay before starting
  useEffect(() => {
    if (delay > 0 && !isStarted) {
      const timer = setTimeout(() => {
        setIsStarted(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsStarted(true);
    }
  }, [delay, isStarted]);
  
  // Scramble effect - create randomized text that gradually becomes the actual text
  useEffect(() => {
    if (!isStarted) return;
    
    if (currentIndex >= text.length) {
      if (!isComplete) {
        setIsComplete(true);
        if (onComplete) onComplete();
      }
      return;
    }
    
    const timeout = setTimeout(() => {
      if (typingStyles === 'scramble') {
        // Scramble effect
        let result = '';
        for (let i = 0; i < text.length; i++) {
          if (i <= currentIndex) {
            result += text[i];
          } else if (i < currentIndex + 3) {
            // Random character for next few positions
            const randomChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
              Math.floor(Math.random() * 62)
            ];
            result += randomChar;
          }
        }
        setDisplayText(result.substring(0, currentIndex + 3));
      } else if (typingStyles === 'fadeIn') {
        // Normal typing but characters will fade in via CSS
        setDisplayText(text.substring(0, currentIndex + 1));
      } else {
        // Normal typing
        setDisplayText(text.substring(0, currentIndex + 1));
      }
      
      setCurrentIndex(currentIndex + 1);
    }, speed);
    
    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, typingStyles, isComplete, onComplete, isStarted]);
  
  // Determine the aria properties to use
  const accessibilityProps = {
    role: "text",
    "aria-label": ariaLabel || text,
  };
  
  if (typingStyles === 'fadeIn') {
    return (
      <div className={className} {...accessibilityProps}>
        {/* Hidden text for screen readers */}
        <span className="sr-only">{text}</span>
        
        {/* Visual animated text */}
        <span aria-hidden="true">
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: index < currentIndex ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      </div>
    );
  }
  
  return (
    <div className={className} {...accessibilityProps}>
      {/* Hidden text for screen readers */}
      <span className="sr-only">{text}</span>
      
      {/* Visual animated text */}
      <span aria-hidden="true">{displayText}</span>
    </div>
  );
}