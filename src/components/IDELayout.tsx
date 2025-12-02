'use client';

import React, { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/theme';
import { useEditorStore } from '@/store/editor';
import TitleBar from '@/components/TitleBar';
import ActivityBar from '@/components/ActivityBar';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import Terminal from '@/components/Terminal';
import StatusBar from '@/components/StatusBar';
import CommandPalette from '@/components/CommandPalette';
import SimpleBrowser from '@/components/SimpleBrowser';
import { cn } from '@/lib/utils';

export default function IDELayout() {
  const { theme, antiGravity, animations, toggleTheme } = useThemeStore();
  const { toggleSidebar, toggleTerminal, sidebarOpen, simpleBrowserOpen } = useEditorStore();
  const [mounted, setMounted] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check screen size
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    // Quick loading simulation
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl+Shift+P or Ctrl+P
      if ((e.ctrlKey && e.shiftKey && e.key === 'P') || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Toggle Theme: Ctrl+K
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggleTheme();
      }
      // Toggle Sidebar: Ctrl+B
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Toggle Terminal: Ctrl+`
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }
      // Close Command Palette: Escape
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, toggleSidebar, toggleTerminal]);

  if (!mounted) {
    return null;
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className={cn("h-screen w-screen flex items-center justify-center", theme === 'light' && 'light')} style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-4xl mb-6" style={{ color: 'var(--accent-primary)' }}>
            <span className="animate-pulse">{`{`}</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full loading-dot" style={{ background: 'var(--accent-primary)' }} />
              <span className="w-2 h-2 rounded-full loading-dot" style={{ background: 'var(--accent-primary)' }} />
              <span className="w-2 h-2 rounded-full loading-dot" style={{ background: 'var(--accent-primary)' }} />
            </div>
            <span className="animate-pulse">{`}`}</span>
          </div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>Initializing Anubhav&apos;s IDE...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "h-screen w-screen flex flex-col overflow-hidden",
        theme === 'light' && 'light',
        antiGravity && 'antigravity-enabled',
        animations && 'theme-transition'
      )}
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Title Bar */}
      <TitleBar />
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Activity Bar */}
        <ActivityBar />
        
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            {isMobile && (
              <div 
                className="fixed inset-0 bg-black/50 z-30"
                style={{ top: '35px', bottom: '22px' }}
                onClick={toggleSidebar}
              />
            )}
            <div className={cn(
              isMobile && "fixed left-12 top-[35px] bottom-[22px] z-40 shadow-xl"
            )}>
              <Sidebar />
            </div>
          </>
        )}
        
        {/* Editor + Terminal Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 flex min-h-0 flex-col md:flex-row">
            <div className={cn(
              "flex-1 flex flex-col min-w-0", 
              simpleBrowserOpen && !isMobile && "md:w-1/2"
            )}>
              <Editor />
            </div>
            {simpleBrowserOpen && (
              <div className={cn(
                "border-t md:border-t-0 md:border-l",
                isMobile ? "h-1/2" : "w-1/2"
              )} style={{ borderColor: 'var(--border-primary)' }}>
                <SimpleBrowser />
              </div>
            )}
          </div>
          <Terminal />
        </div>
      </main>
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Command Palette Modal */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </div>
  );
}
