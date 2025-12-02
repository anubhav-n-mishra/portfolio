'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Monitor, Smartphone, ArrowRight, Sparkles, Terminal, FolderTree, Palette, Layout, Zap } from 'lucide-react';

interface LandingPageProps {
  onSelectIDE?: () => void;
}

export default function LandingPage({ onSelectIDE }: LandingPageProps) {
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
    
    // Show content after a brief delay
    setTimeout(() => setShowContent(true), 300);
  }, [router]);

  const handleChoice = (choice: 'ide' | 'simple') => {
    localStorage.setItem('ide-experience', choice);
    if (choice === 'ide') {
      // Use the callback if provided, otherwise reload
      if (onSelectIDE) {
        onSelectIDE();
      } else {
        window.location.reload();
      }
    } else {
      router.push('/portfolio');
    }
  };

  if (!mounted) return null;

  // Mobile loading screen
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center px-6">
          <Smartphone className="w-16 h-16 text-[#58a6ff] mx-auto mb-6 animate-bounce" />
          <h1 className="text-2xl font-bold text-white mb-3">Mobile Detected</h1>
          <p className="text-[#8b949e] mb-6">Redirecting you to the mobile-optimized portfolio...</p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center overflow-hidden relative">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#58a6ff]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a371f7]/10 rounded-full blur-3xl" />
      
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>

      <div className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center">
          <div className="p-3 bg-[#21262d] rounded-xl border border-[#30363d]">
            <Code2 className="w-10 h-10 text-[#58a6ff]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
          <span className="text-white">Anubhav </span>
          <span className="text-[#58a6ff]">Mishra</span>
        </h1>
        <p className="text-lg text-[#8b949e] mb-10">Full-Stack Developer & Systems Engineer</p>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-medium text-[#c9d1d9]">
            How would you like to explore my portfolio?
          </h2>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* IDE Experience Option */}
          <button
            onClick={() => handleChoice('ide')}
            onMouseEnter={() => setHoveredOption('ide')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`group relative p-6 rounded-xl border transition-all duration-300 text-left ${
              hoveredOption === 'ide' 
                ? 'border-[#58a6ff] bg-[#58a6ff]/10 scale-[1.02] shadow-lg shadow-[#58a6ff]/20' 
                : 'border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg transition-colors ${hoveredOption === 'ide' ? 'bg-[#58a6ff]/20' : 'bg-[#21262d]'}`}>
                <Monitor className="w-6 h-6 text-[#58a6ff]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">VS Code Experience</h3>
                  <ArrowRight className={`w-4 h-4 text-[#58a6ff] transition-transform duration-300 ${hoveredOption === 'ide' ? 'translate-x-1' : 'opacity-0'}`} />
                </div>
                <p className="text-sm text-[#8b949e] mb-4">
                  Interactive IDE with terminal, file explorer, and code editor.
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#7ee787]">
                    <Terminal size={12} />
                    Terminal
                  </span>
                  <span className="flex items-center gap-1.5 text-[#a371f7]">
                    <FolderTree size={12} />
                    Explorer
                  </span>
                  <span className="flex items-center gap-1.5 text-[#58a6ff]">
                    <Zap size={12} />
                    Extensions
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Simple Portfolio Option */}
          <button
            onClick={() => handleChoice('simple')}
            onMouseEnter={() => setHoveredOption('simple')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`group relative p-6 rounded-xl border transition-all duration-300 text-left ${
              hoveredOption === 'simple' 
                ? 'border-[#a371f7] bg-[#a371f7]/10 scale-[1.02] shadow-lg shadow-[#a371f7]/20' 
                : 'border-[#30363d] bg-[#161b22] hover:border-[#a371f7]/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg transition-colors ${hoveredOption === 'simple' ? 'bg-[#a371f7]/20' : 'bg-[#21262d]'}`}>
                <Layout className="w-6 h-6 text-[#a371f7]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">Classic Portfolio</h3>
                  <ArrowRight className={`w-4 h-4 text-[#a371f7] transition-transform duration-300 ${hoveredOption === 'simple' ? 'translate-x-1' : 'opacity-0'}`} />
                </div>
                <p className="text-sm text-[#8b949e] mb-4">
                  Beautiful animated portfolio with smooth scrolling sections.
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#f778ba]">
                    <Sparkles size={12} />
                    Animations
                  </span>
                  <span className="flex items-center gap-1.5 text-[#ffa657]">
                    <Palette size={12} />
                    Modern UI
                  </span>
                  <span className="flex items-center gap-1.5 text-[#79c0ff]">
                    <Smartphone size={12} />
                    Responsive
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-xs text-[#484f58]">
          You can switch between views anytime
        </p>
      </div>
    </div>
  );
}
