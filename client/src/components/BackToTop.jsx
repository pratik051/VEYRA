import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white shadow-xl border border-neutral-200 dark:border-[#1b2559] hover:bg-neutral-950 dark:hover:bg-amber-400 hover:text-white dark:hover:text-neutral-950 transition-all hover:scale-110 active:scale-95"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
