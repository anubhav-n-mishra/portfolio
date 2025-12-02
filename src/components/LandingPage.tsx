'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Monitor, Smartphone, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      // Auto-redirect mobile users to portfolio
      if (mobile) {
        setTimeout(() => {
          router.push('/portfolio');
        }, 1500);
      }
    };
    
    checkMobile();
    
    // Check if user has already made a choice
    const userChoice = localStorage.getItem('ide-experience');
    if (userChoice === 'ide') {
      router.push('/');
      return;
    } else if (userChoice === 'simple') {
      router.push('/portfolio');
      return;
    }
    
    // Show content after a brief delay
    setTimeout(() => setShowContent(true), 300);
  }, [router]);

  const handleChoice = (choice: 'ide' | 'simple') => {
    localStorage.setItem('ide-experience', choice);
    if (choice === 'ide') {
      // Stay on this page but show IDE
      window.location.reload();
    } else {
      router.push('/portfolio');
    }
  };

  if (!mounted) return null;

  // Mobile loading screen
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center px-6">
          <Smartphone className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-2xl font-bold text-white mb-3">Mobile Detected</h1>
          <p className="text-gray-400 mb-6">Redirecting you to the mobile-optimized portfolio...</p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="p-4 bg-blue-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/30">
            <Code2 className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Anubhav Mishra
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-12">Full-Stack Developer & Systems Engineer</p>

        {/* Question */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Choose your experience</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Have you used an IDE before?
          </h2>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* IDE Experience Option */}
          <button
            onClick={() => handleChoice('ide')}
            onMouseEnter={() => setHoveredOption('ide')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
              hoveredOption === 'ide' 
                ? 'border-blue-500 bg-blue-500/10 scale-105' 
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Monitor className="w-8 h-8 text-blue-400" />
                </div>
                <ArrowRight className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${hoveredOption === 'ide' ? 'translate-x-2' : ''}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Yes, I have!</h3>
              <p className="text-gray-400 text-sm">
                Experience my portfolio as a VS Code-style IDE with terminal, file explorer, and interactive features.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">Terminal</span>
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">Extensions</span>
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">File Explorer</span>
              </div>
            </div>
          </button>

          {/* Simple Portfolio Option */}
          <button
            onClick={() => handleChoice('simple')}
            onMouseEnter={() => setHoveredOption('simple')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
              hoveredOption === 'simple' 
                ? 'border-purple-500 bg-purple-500/10 scale-105' 
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <ArrowRight className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${hoveredOption === 'simple' ? 'translate-x-2' : ''}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No, show me simple view</h3>
              <p className="text-gray-400 text-sm">
                View a beautiful, animated portfolio with smooth scrolling and modern design.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">Animations</span>
                <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded">Easy Navigation</span>
                <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded">Mobile Friendly</span>
              </div>
            </div>
          </button>
        </div>

        {/* Skip text */}
        <p className="mt-8 text-sm text-gray-500">
          Your choice will be remembered for future visits
        </p>
      </div>
    </div>
  );
}
