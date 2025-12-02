'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/editor';
import { 
  X, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Globe,
  ExternalLink,
  Home,
} from 'lucide-react';

export default function SimpleBrowser() {
  const { simpleBrowserOpen, simpleBrowserUrl, closeSimpleBrowser, openSimpleBrowser } = useEditorStore();
  const [inputUrl, setInputUrl] = useState(simpleBrowserUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!simpleBrowserOpen) return null;

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    openSimpleBrowser(inputUrl);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 500);
  };
  
  // Get the actual URL to display
  const displayUrl = simpleBrowserUrl.startsWith('/') 
    ? `http://localhost:3000${simpleBrowserUrl}` 
    : simpleBrowserUrl;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-editor)] md:border-l border-[var(--border-color)]">
      {/* Browser Header */}
      <div className="flex items-center gap-0.5 sm:gap-1 h-[35px] px-1 sm:px-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
        {/* Navigation */}
        <button className="p-1 sm:p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]" title="Go Back">
          <ArrowLeft size={14} />
        </button>
        <button className="hidden sm:block p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]" title="Go Forward">
          <ArrowRight size={14} />
        </button>
        <button 
          onClick={handleRefresh}
          className="p-1 sm:p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]" 
          title="Refresh"
        >
          <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button 
          onClick={() => openSimpleBrowser('/portfolio')}
          className="hidden sm:block p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]" 
          title="Home"
        >
          <Home size={14} />
        </button>

        {/* URL Bar */}
        <form onSubmit={handleNavigate} className="flex-1 mx-1 sm:mx-2 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 bg-[var(--bg-tertiary)] rounded px-2 py-1 border border-[var(--border-color)] focus-within:border-[var(--accent-primary)]">
            <Globe size={14} className="text-[var(--text-muted)] shrink-0 hidden sm:block" />
            <input
              type="text"
              value={displayUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter URL..."
              className="flex-1 bg-transparent outline-none text-[12px] sm:text-[13px] text-[var(--text-primary)] min-w-0"
            />
          </div>
        </form>

        {/* Open External */}
        <button 
          onClick={() => window.open(simpleBrowserUrl, '_blank')}
          className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]" 
          title="Open in External Browser"
        >
          <ExternalLink size={14} />
        </button>
        
        {/* Close */}
        <button 
          onClick={closeSimpleBrowser}
          className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]" 
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white overflow-hidden">
        <iframe
          key={iframeKey + simpleBrowserUrl}
          src={displayUrl}
          className="w-full h-full border-0"
          title="Simple Browser"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
