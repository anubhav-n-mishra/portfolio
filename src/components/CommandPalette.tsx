'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editor';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
import {
  Search,
  File,
  Settings,
  Moon,
  Sun,
  Terminal,
  PanelLeft,
  User,
  Github,
  Linkedin,
  Mail,
  Download,
  FolderOpen,
  Bot,
  Puzzle,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { openFile, toggleSidebar, toggleTerminal, setSidebarPanel } = useEditorStore();
  const { toggleTheme, theme } = useThemeStore();

  const commands: Command[] = [
    // File commands
    { id: 'open-about', label: 'Open about.md', icon: File, category: 'Files', action: () => openFile('about.md') },
    { id: 'open-projects', label: 'Open projects.json', icon: File, category: 'Files', action: () => openFile('projects.json') },
    { id: 'open-skills', label: 'Open skills.ts', icon: File, category: 'Files', action: () => openFile('skills.ts') },
    { id: 'open-experience', label: 'Open experience.yaml', icon: File, category: 'Files', action: () => openFile('experience.yaml') },
    { id: 'open-contact', label: 'Open contact.jsx', icon: File, category: 'Files', action: () => openFile('contact.jsx') },
    { id: 'open-readme', label: 'Open README.md', icon: File, category: 'Files', action: () => openFile('README.md') },
    
    // View commands
    { id: 'toggle-theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`, icon: theme === 'dark' ? Sun : Moon, shortcut: 'Ctrl+K', category: 'View', action: toggleTheme },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', icon: PanelLeft, shortcut: 'Ctrl+B', category: 'View', action: toggleSidebar },
    { id: 'toggle-terminal', label: 'Toggle Terminal', icon: Terminal, shortcut: 'Ctrl+`', category: 'View', action: toggleTerminal },
    
    // Panel commands
    { id: 'show-explorer', label: 'Show Explorer', icon: FolderOpen, category: 'Panels', action: () => setSidebarPanel('explorer') },
    { id: 'show-search', label: 'Show Search', icon: Search, category: 'Panels', action: () => setSidebarPanel('search') },
    { id: 'show-extensions', label: 'Show Extensions', icon: Puzzle, category: 'Panels', action: () => setSidebarPanel('extensions') },
    { id: 'show-ai', label: 'Show AI Assistant', icon: Bot, category: 'Panels', action: () => setSidebarPanel('ai') },
    { id: 'show-account', label: 'Show Account', icon: User, category: 'Panels', action: () => setSidebarPanel('account') },
    
    // External links
    { id: 'open-github', label: 'Open GitHub Profile', icon: Github, category: 'Links', action: () => window.open('https://github.com/anubhav-n-mishra', '_blank') },
    { id: 'open-linkedin', label: 'Open LinkedIn Profile', icon: Linkedin, category: 'Links', action: () => window.open('https://linkedin.com/in/anubhav-mishra0', '_blank') },
    { id: 'send-email', label: 'Send Email', icon: Mail, category: 'Links', action: () => window.open('mailto:anubhav09.work@gmail.com', '_blank') },
    
    // Actions
    { id: 'download-resume', label: 'Download Resume', icon: Download, category: 'Actions', action: () => window.open('/Anubhav_Mishra.pdf', '_blank') },
  ];

  const filteredCommands = query
    ? commands.filter(cmd => 
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div 
        className="w-[600px] max-w-[90vw] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl overflow-hidden animate-slide-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
          <Search size={18} className="text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        {/* Command List */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">
                {category}
              </div>
              {cmds.map((cmd, idx) => {
                const globalIdx = filteredCommands.indexOf(cmd);
                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                      globalIdx === selectedIndex 
                        ? "bg-[var(--bg-selected)] text-[var(--text-primary)]" 
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    )}
                  >
                    <cmd.icon size={16} className="text-[var(--text-muted)]" />
                    <span className="flex-1">{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-[var(--text-muted)]">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
