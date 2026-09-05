'use client';

import React from 'react';
import { useEditorStore, type SidebarPanel } from '@/store/editor';
import { portfolioData } from '@/data/portfolio';
import { Files, Search, GitBranch, Puzzle, Bot, User, Settings } from 'lucide-react';

export default function ActivityBar() {
  const { sidebarPanel, setSidebarPanel, tabs, installedExtensions } = useEditorStore();

  const dirtyCount = tabs.filter((t) => t.isDirty).length;
  const availableExtensions = 6 - installedExtensions.length;

  // Badges reflect real state instead of hardcoded numbers.
  const top: Array<{ id: SidebarPanel; icon: React.ElementType; label: string; badge?: number }> = [
    { id: 'explorer', icon: Files, label: 'Explorer (Ctrl+Shift+E)' },
    { id: 'search', icon: Search, label: 'Search (Ctrl+Shift+F)' },
    { id: 'git', icon: GitBranch, label: 'Source Control (Ctrl+Shift+G)', badge: dirtyCount || undefined },
    { id: 'extensions', icon: Puzzle, label: 'Extensions (Ctrl+Shift+X)', badge: availableExtensions || undefined },
    { id: 'ai', icon: Bot, label: `Ask about ${portfolioData.personal.name.split(' ')[0]}'s work` },
  ];

  const bottom: Array<{ id: SidebarPanel; icon: React.ElementType; label: string }> = [
    { id: 'account', icon: User, label: 'Account' },
    { id: 'settings', icon: Settings, label: 'Settings (Ctrl+,)' },
  ];

  const button = (
    { id, icon: Icon, label, badge }: { id: SidebarPanel; icon: React.ElementType; label: string; badge?: number }
  ) => {
    const active = sidebarPanel === id;
    return (
      <button
        key={id}
        onClick={() => setSidebarPanel(id)}
        title={label}
        aria-label={label}
        aria-pressed={active}
        className="w-12 h-12 flex items-center justify-center relative transition-colors"
        style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6"
            style={{ background: 'var(--text-primary)' }}
          />
        )}
        <span className="relative">
          <Icon size={24} strokeWidth={1.5} />
          {badge !== undefined && badge > 0 && (
            <span
              className="absolute -top-1.5 -right-2 min-w-[16px] h-4 text-[10px] font-medium rounded-full flex items-center justify-center px-1"
              style={{ background: 'var(--accent-primary)', color: '#fff' }}
            >
              {badge}
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <aside
      className="w-12 flex flex-col justify-between shrink-0"
      style={{ background: 'var(--bg-activitybar)', borderRight: '1px solid var(--border-color)' }}
    >
      <div className="flex flex-col items-center">{top.map(button)}</div>
      <div className="flex flex-col items-center">{bottom.map(button)}</div>
    </aside>
  );
}
