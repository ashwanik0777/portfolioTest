import { useEffect } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

type ScrollAnimationProps = {
  threshold?: number;
  once?: boolean;
  rootMargin?: number;
  className: string;
  animateClassName: string;
};

export function useScrollAnimation({
  threshold = 0.2,
  once = true,
  rootMargin = 0,
  className,
  animateClassName
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: rootMargin
  });

  useEffect(() => {
    if (!ref.current) return;

    if (isInView) {
      ref.current.classList.add(animateClassName);
    } else if (!once) {
      ref.current.classList.remove(animateClassName);
    }
  }, [isInView, animateClassName, once]);

  return { ref };
}

export function setupScrollAnimations() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-active');
          // Optional: Unobserve after animation
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);
}