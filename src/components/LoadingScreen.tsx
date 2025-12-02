'use client';

import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsComplete(true), 300);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  if (isComplete) return null;

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="flex items-center justify-center gap-2 text-4xl text-[var(--accent-primary)] mb-6">
          <span className="animate-pulse">{`{`}</span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full loading-dot" />
            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full loading-dot" />
            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full loading-dot" />
          </div>
          <span className="animate-pulse">{`}`}</span>
        </div>

        {/* Loading Text */}
        <p className="text-[var(--text-secondary)] mb-4 font-mono text-sm">
          Initializing Anubhav's IDE...
        </p>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Loading Status */}
        <p className="text-xs text-[var(--text-muted)] mt-3 font-mono">
          {progress < 30 && 'Loading components...'}
          {progress >= 30 && progress < 60 && 'Fetching portfolio data...'}
          {progress >= 60 && progress < 90 && 'Initializing editor...'}
          {progress >= 90 && 'Ready!'}
        </p>
      </div>
    </div>
  );
}
