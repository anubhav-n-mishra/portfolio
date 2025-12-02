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

      <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <div className="p-4 bg-[#21262d] rounded-2xl border border-[#30363d]">
            <Code2 className="w-12 h-12 text-[#58a6ff]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
          <span className="text-white">Anubhav </span>
          <span className="text-[#58a6ff]">Mishra</span>
        </h1>
        <p className="text-xl text-[#8b949e] mb-16">Full-Stack Developer & Systems Engineer</p>

        {/* Question */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-medium text-[#c9d1d9]">
            How would you like to explore my portfolio?
          </h2>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* IDE Experience Option */}
          <button
            onClick={() => handleChoice('ide')}
            onMouseEnter={() => setHoveredOption('ide')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
              hoveredOption === 'ide' 
                ? 'border-[#58a6ff] bg-[#58a6ff]/5 scale-[1.02] shadow-xl shadow-[#58a6ff]/10' 
                : 'border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff]/50 hover:bg-[#161b22]'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${hoveredOption === 'ide' ? 'bg-[#58a6ff]/20' : 'bg-[#21262d]'}`}>
              <Monitor className="w-7 h-7 text-[#58a6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">VS Code Experience</h3>
            <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
              Interactive IDE with terminal, file explorer, and code editor. Best for developers.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#7ee787]/10 text-[#7ee787] border border-[#7ee787]/20">
                <Terminal size={12} />
                Terminal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#a371f7]/10 text-[#a371f7] border border-[#a371f7]/20">
                <FolderTree size={12} />
                Explorer
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20">
                <Zap size={12} />
                Extensions
              </span>
            </div>
            <div className={`absolute bottom-8 right-8 transition-all duration-300 ${hoveredOption === 'ide' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
              <ArrowRight className="w-5 h-5 text-[#58a6ff]" />
            </div>
          </button>

          {/* Simple Portfolio Option */}
          <button
            onClick={() => handleChoice('simple')}
            onMouseEnter={() => setHoveredOption('simple')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
              hoveredOption === 'simple' 
                ? 'border-[#a371f7] bg-[#a371f7]/5 scale-[1.02] shadow-xl shadow-[#a371f7]/10' 
                : 'border-[#30363d] bg-[#0d1117] hover:border-[#a371f7]/50 hover:bg-[#161b22]'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${hoveredOption === 'simple' ? 'bg-[#a371f7]/20' : 'bg-[#21262d]'}`}>
              <Layout className="w-7 h-7 text-[#a371f7]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Classic Portfolio</h3>
            <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
              Beautiful animated portfolio with smooth scrolling. Great for everyone.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#f778ba]/10 text-[#f778ba] border border-[#f778ba]/20">
                <Sparkles size={12} />
                Animations
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#ffa657]/10 text-[#ffa657] border border-[#ffa657]/20">
                <Palette size={12} />
                Modern UI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#79c0ff]/10 text-[#79c0ff] border border-[#79c0ff]/20">
                <Smartphone size={12} />
                Responsive
              </span>
            </div>
            <div className={`absolute bottom-8 right-8 transition-all duration-300 ${hoveredOption === 'simple' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
              <ArrowRight className="w-5 h-5 text-[#a371f7]" />
            </div>
          </button>
        </div>

        {/* Footer text */}
        <p className="mt-10 text-sm text-[#484f58]">
          You can switch between views anytime
        </p>
      </div>
    </div>
  );
}
