'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useEditorStore } from '@/store/editor';
import { useThemeStore } from '@/store/theme';
import { useRunnerStore } from '@/store/runner';
import { portfolioData } from '@/data/portfolio';
import { languageFor } from '@/lib/runtime';
import FileIcon from './FileIcon';
import {
  Search, Settings, Moon, Sun, TerminalIcon, PanelLeft, User, Github, Linkedin,
  Mail, Download, FolderOpen, Bot, Puzzle, Play, GitBranch, Type, Map,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  detail?: string;
  icon: React.ElementType;
  shortcut?: string;
  category: string;
  action: () => void;
}

export default function CommandPalette() {
  const {
    commandPaletteOpen, commandPaletteMode, closeCommandPalette,
    openFile, toggleSidebar, toggleTerminal, showSidebarPanel,
    allFilenames, contentOf, previewDocument, openSimpleBrowser,
  } = useEditorStore();
  const { toggleTheme, theme, toggleMinimap, toggleLineNumbers, setFontSize, fontSize } = useThemeStore();
  const { run } = useRunnerStore();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  // Tracks the open/mode pair the query was last seeded from, so the palette can be
  // reset during render instead of in an effect that would cost a second pass.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mode is derived from the query alone, exactly like VS Code: quick-open by default,
  // and a leading '>' turns it into a command search. commandPaletteMode only decides
  // which of those the palette is seeded with when it opens.
  const isFileMode = !query.startsWith('>');
  const term = (query.startsWith('>') ? query.slice(1) : query).trim().toLowerCase();

  const commands: Command[] = useMemo(() => {
    const { contact } = portfolioData;
    return [
      {
        id: 'run-active', label: 'Run: Run active file', icon: Play, shortcut: 'Ctrl+Enter', category: 'Run',
        action: () => {
          const { activeFile } = useEditorStore.getState();
          if (!activeFile) return;
          useEditorStore.setState({ terminalOpen: true });
          run(activeFile, contentOf(activeFile), (doc, title) => previewDocument(doc, title));
        },
      },
      { id: 'theme', label: `Preferences: Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`, icon: theme === 'dark' ? Sun : Moon, shortcut: 'Ctrl+K', category: 'Preferences', action: toggleTheme },
      { id: 'minimap', label: 'View: Toggle minimap', icon: Map, category: 'View', action: toggleMinimap },
      { id: 'linenumbers', label: 'View: Toggle line numbers', icon: Type, category: 'View', action: toggleLineNumbers },
      { id: 'font-up', label: 'View: Increase font size', icon: Type, category: 'View', action: () => setFontSize(Math.min(24, fontSize + 1)) },
      { id: 'font-down', label: 'View: Decrease font size', icon: Type, category: 'View', action: () => setFontSize(Math.max(10, fontSize - 1)) },
      { id: 'sidebar', label: 'View: Toggle sidebar', icon: PanelLeft, shortcut: 'Ctrl+B', category: 'View', action: toggleSidebar },
      { id: 'terminal', label: 'View: Toggle terminal', icon: TerminalIcon, shortcut: 'Ctrl+`', category: 'View', action: toggleTerminal },
      { id: 'explorer', label: 'View: Show Explorer', icon: FolderOpen, shortcut: 'Ctrl+Shift+E', category: 'View', action: () => showSidebarPanel('explorer') },
      { id: 'search', label: 'View: Show Search', icon: Search, shortcut: 'Ctrl+Shift+F', category: 'View', action: () => showSidebarPanel('search') },
      { id: 'scm', label: 'View: Show Source Control', icon: GitBranch, shortcut: 'Ctrl+Shift+G', category: 'View', action: () => showSidebarPanel('git') },
      { id: 'ext', label: 'View: Show Extensions', icon: Puzzle, shortcut: 'Ctrl+Shift+X', category: 'View', action: () => showSidebarPanel('extensions') },
      { id: 'assistant', label: 'View: Show Assistant', icon: Bot, category: 'View', action: () => showSidebarPanel('ai') },
      { id: 'account', label: 'View: Show Account', icon: User, category: 'View', action: () => showSidebarPanel('account') },
      { id: 'settings', label: 'Preferences: Open settings', icon: Settings, shortcut: 'Ctrl+,', category: 'Preferences', action: () => showSidebarPanel('settings') },
      { id: 'preview', label: 'Portfolio: Open the classic portfolio', icon: FolderOpen, category: 'Portfolio', action: () => openSimpleBrowser('/portfolio') },
      { id: 'gh', label: 'Open: GitHub profile', detail: contact.githubUser, icon: Github, category: 'Links', action: () => window.open(contact.github, '_blank', 'noopener,noreferrer') },
      { id: 'li', label: 'Open: LinkedIn profile', icon: Linkedin, category: 'Links', action: () => window.open(contact.linkedin, '_blank', 'noopener,noreferrer') },
      { id: 'mail', label: 'Open: Send an email', detail: contact.email, icon: Mail, category: 'Links', action: () => window.open(`mailto:${contact.email}`) },
      { id: 'cv', label: 'Open: Download resume', icon: Download, category: 'Links', action: () => window.open(contact.resume, '_blank', 'noopener,noreferrer') },
    ];
  }, [
    theme, fontSize, toggleTheme, toggleMinimap, toggleLineNumbers, setFontSize,
    toggleSidebar, toggleTerminal, showSidebarPanel, openSimpleBrowser, run, contentOf, previewDocument,
  ]);

  const files = useMemo(() => allFilenames(), [allFilenames]);

  const results = useMemo(() => {
    if (isFileMode) {
      const matches = term ? files.filter((f) => f.toLowerCase().includes(term)) : files;
      return matches.map<Command>((name) => {
        const spec = languageFor(name);
        return {
          id: `file-${name}`,
          label: name,
          detail: spec ? `runnable · ${spec.label}` : undefined,
          icon: Search,
          category: 'Files',
          action: () => openFile(name),
        };
      });
    }
    return term
      ? commands.filter(
          (c) => c.label.toLowerCase().includes(term) || c.category.toLowerCase().includes(term)
        )
      : commands;
  }, [isFileMode, term, files, commands, openFile]);

  const seedKey = commandPaletteOpen ? commandPaletteMode : null;
  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setQuery(seedKey === 'commands' ? '>' : '');
    setSelected(0);
  }

  useEffect(() => {
    // Focus after paint so the caret lands past any '>' prefix.
    if (commandPaletteOpen) inputRef.current?.focus();
  }, [commandPaletteOpen, seededFor]);

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!commandPaletteOpen) return null;

  const commit = (cmd: Command) => {
    cmd.action();
    closeCommandPalette();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selected]) commit(results[selected]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/40"
      onClick={closeCommandPalette}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-[620px] max-w-[92vw] rounded-md shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={onKeyDown}
            placeholder={isFileMode ? 'Search files by name' : 'Type a command'}
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: 'var(--text-primary)' }}
            spellCheck={false}
          />
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            {isFileMode ? 'files' : 'commands'}
          </span>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
              No matching {isFileMode ? 'files' : 'commands'}
            </div>
          )}

          {results.map((cmd, idx) => {
            const active = idx === selected;
            return (
              <div
                key={cmd.id}
                data-selected={active}
                onClick={() => commit(cmd)}
                onMouseEnter={() => setSelected(idx)}
                className="flex items-center gap-3 px-3 py-1.5 cursor-pointer text-[13px]"
                style={{
                  background: active ? 'var(--bg-selected)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {isFileMode ? (
                  <FileIcon filename={cmd.label} size={15} />
                ) : (
                  <cmd.icon size={15} style={{ color: 'var(--text-muted)' }} />
                )}
                <span className="flex-1 truncate">{cmd.label}</span>
                {cmd.detail && (
                  <span className="text-[11px] truncate max-w-[40%]" style={{ color: 'var(--text-muted)' }}>
                    {cmd.detail}
                  </span>
                )}
                {cmd.shortcut && (
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                  >
                    {cmd.shortcut}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="px-3 py-1.5 text-[11px] flex gap-4"
          style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
        >
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> dismiss</span>
          <span className="ml-auto hidden sm:inline">Type <kbd>&gt;</kbd> for commands</span>
        </div>
      </div>
    </div>
  );
}
