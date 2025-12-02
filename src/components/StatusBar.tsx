'use client';

import React from 'react';
import { useEditorStore } from '@/store/editor';
import { getFileLanguage } from '@/data/files';
import {
  GitBranch,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Bell,
  Check,
  Radio,
  Wifi,
  Braces,
} from 'lucide-react';

export default function StatusBar() {
  const { activeFile } = useEditorStore();
  const language = activeFile ? getFileLanguage(activeFile) : 'Plain Text';

  return (
    <footer className="flex items-center justify-between h-[22px] bg-[var(--bg-statusbar)] text-[11px] sm:text-[12px] text-white select-none flex-shrink-0 overflow-hidden">
      {/* Left Side */}
      <div className="flex items-center h-full shrink-0">
        {/* Remote Indicator */}
        <div className="flex items-center gap-1 px-1.5 sm:px-2 h-full bg-[#16825d] hover:bg-[#1a9e6e] cursor-pointer transition-colors">
          <Radio size={14} />
        </div>
        
        {/* Git Branch */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 h-full hover:bg-white/10 cursor-pointer transition-colors">
          <GitBranch size={14} />
          <span className="hidden sm:inline">main</span>
          <RefreshCw size={12} className="hidden sm:block opacity-70" />
        </div>
        
        {/* Problems - Hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 px-2 h-full hover:bg-white/10 cursor-pointer transition-colors">
          <div className="flex items-center gap-1">
            <XCircle size={14} />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle size={14} />
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center h-full overflow-hidden">
        {/* Line & Column */}
        <div className="hidden md:flex px-2 h-full items-center hover:bg-white/10 cursor-pointer transition-colors whitespace-nowrap">
          Ln 1, Col 1
        </div>
        
        {/* Spaces - Hidden on mobile */}
        <div className="hidden lg:flex px-2 h-full items-center hover:bg-white/10 cursor-pointer transition-colors">
          Spaces: 2
        </div>
        
        {/* Encoding - Hidden on mobile */}
        <div className="hidden lg:flex px-2 h-full items-center hover:bg-white/10 cursor-pointer transition-colors">
          UTF-8
        </div>
        
        {/* Line Ending - Hidden on mobile */}
        <div className="hidden xl:flex px-2 h-full items-center hover:bg-white/10 cursor-pointer transition-colors">
          CRLF
        </div>
        
        {/* Language */}
        <div className="px-1.5 sm:px-2 h-full flex items-center gap-1 sm:gap-1.5 hover:bg-white/10 cursor-pointer transition-colors">
          <Braces size={14} />
          <span className="truncate max-w-[60px] sm:max-w-none">{language}</span>
        </div>
        
        {/* Copilot indicator - Hidden on mobile */}
        <div className="hidden sm:flex px-2 h-full items-center gap-1.5 hover:bg-white/10 cursor-pointer transition-colors">
          <Check size={14} />
          <span className="hidden md:inline">Copilot</span>
        </div>
        
        {/* Notifications */}
        <div className="px-1.5 sm:px-2 h-full flex items-center hover:bg-white/10 cursor-pointer transition-colors">
          <Bell size={14} />
        </div>
      </div>
    </footer>
  );
}
