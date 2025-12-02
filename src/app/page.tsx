'use client';

import { useState, useEffect } from 'react';
import IDELayout from '@/components/IDELayout';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user has already made a choice
    const userChoice = localStorage.getItem('ide-experience');
    if (userChoice === 'ide') {
      setShowLanding(false);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  if (showLanding) {
    return <LandingPage />;
  }

  return <IDELayout />;
}
