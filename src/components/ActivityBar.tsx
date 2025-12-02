'use client';

import React from 'react';
import { useEditorStore } from '@/store/editor';
import { cn } from '@/lib/utils';
import {
  Files,
  Search,
  GitBranch,
  Puzzle,
  Bot,
  User,
  Settings,
} from 'lucide-react';

const activityItems = [
  { id: 'explorer', icon: Files, label: 'Explorer (Ctrl+Shift+E)', badge: null },
  { id: 'search', icon: Search, label: 'Search (Ctrl+Shift+F)', badge: null },
  { id: 'git', icon: GitBranch, label: 'Source Control (Ctrl+Shift+G)', badge: '3' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions (Ctrl+Shift+X)', badge: '1' },
  { id: 'ai', icon: Bot, label: 'AI Assistant', badge: null },
] as const;

const bottomItems = [
  { id: 'account', icon: User, label: 'Account' },
  { id: 'settings', icon: Settings, label: 'Manage' },
] as const;

export default function ActivityBar() {
  const { sidebarPanel, setSidebarPanel } = useEditorStore();

  return (
    <aside className="w-12 bg-[var(--bg-activitybar)] flex flex-col justify-between border-r border-[var(--border-color)] shrink-0">
      {/* Top Icons */}
      <div className="flex flex-col items-center">
        {activityItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSidebarPanel(item.id as any)}
            className={cn(
              "w-12 h-12 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative",
              sidebarPanel === item.id && "text-[var(--text-primary)]"
            )}
            title={item.label}
          >
            {sidebarPanel === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[var(--text-primary)]" />
            )}
            <div className="relative">
              <item.icon size={24} strokeWidth={1.5} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[var(--accent-primary)] text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => item.id === 'account' && setSidebarPanel('account')}
            className={cn(
              "w-12 h-12 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative",
              sidebarPanel === item.id && "text-[var(--text-primary)]"
            )}
            title={item.label}
          >
            {sidebarPanel === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[var(--text-primary)]" />
            )}
            <item.icon size={24} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </aside>
  );
}
