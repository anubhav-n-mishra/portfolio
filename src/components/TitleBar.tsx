'use client';

import React, { useCallback, useState } from 'react';
import { useThemeStore } from '@/store/theme';
import { useEditorStore } from '@/store/editor';
import { useRunnerStore } from '@/store/runner';
import { portfolioData } from '@/data/portfolio';
import { playgroundFiles } from '@/data/files';
import { pickFiles } from '@/lib/pickFiles';
import {
  Sun, Moon, Code2, Search, PanelLeft, PanelBottom, Menu, X, Play,
} from 'lucide-react';

interface MenuEntry {
  label?: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
}

interface MenuDef {
  label: string;
  items: MenuEntry[];
}

const MenuButton: React.FC<{
  menu: MenuDef;
  openMenu: string | null;
  setOpenMenu: (label: string | null) => void;
}> = ({ menu, openMenu, setOpenMenu }) => {
  const isOpen = openMenu === menu.label;

  return (
    <div
      className="relative h-full flex items-center"
      // Hovering moves between menus only once one is already open, like a real menu bar.
      onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
    >
      <button
        onClick={() => setOpenMenu(isOpen ? null : menu.label)}
        className="h-full px-2 text-[13px] hover:bg-white/10"
        style={{
          color: 'var(--text-primary)',
          background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
        }}
      >
        {menu.label}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setOpenMenu(null)} />
          <div
            className="absolute top-full left-0 min-w-[240px] py-1 rounded-b shadow-2xl z-[200]"
            style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-color)' }}
          >
            {menu.items.map((item, i) =>
              item.divider ? (
                <div key={i} className="h-px my-1 mx-2" style={{ background: 'var(--border-color)' }} />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.action?.();
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-left hover:bg-white/10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[11px] ml-8" style={{ color: 'var(--text-muted)' }}>
                      {item.shortcut}
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default function TitleBar() {
  const { theme, toggleTheme } = useThemeStore();
  const {
    toggleSidebar, toggleTerminal, openCommandPalette, createFile, openFile,
    openSimpleBrowser, showSidebarPanel, activeFile, contentOf, previewDocument,
    closeFile, closeAllFiles, saveFile,
  } = useEditorStore();
  const { run, stop, running } = useRunnerStore();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { contact } = portfolioData;

  const openUploadDialog = useCallback(async () => {
    const loaded = await pickFiles();
    loaded.forEach(({ name, content }) => createFile('/playground', name, content));
    if (loaded[0]) openFile(loaded[0].name);
  }, [createFile, openFile]);

  const runActive = () => {
    if (running) {
      stop();
      return;
    }
    if (!activeFile) return;
    useEditorStore.setState({ terminalOpen: true });
    run(activeFile, contentOf(activeFile), (doc, title) => previewDocument(doc, title));
  };

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        {
          label: 'New file...',
          shortcut: 'Ctrl+N',
          action: () => {
            const name = window.prompt('File name (the extension decides the language)', 'solution.py');
            if (name?.trim()) {
              createFile('/playground', name.trim());
              openFile(name.trim());
            }
          },
        },
        { label: 'Open from your computer...', shortcut: 'Ctrl+O', action: openUploadDialog },
        { divider: true },
        { label: 'Go to file...', shortcut: 'Ctrl+P', action: () => openCommandPalette('files') },
        { divider: true },
        { label: 'Save', shortcut: 'Ctrl+S', action: () => activeFile && saveFile(activeFile) },
        { divider: true },
        { label: 'Download resume', action: () => window.open(contact.resume, '_blank', 'noopener,noreferrer') },
        { divider: true },
        { label: 'Close editor', shortcut: 'Ctrl+W', action: () => activeFile && closeFile(activeFile) },
        { label: 'Close all editors', action: closeAllFiles },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Command palette...', shortcut: 'Ctrl+Shift+P', action: () => openCommandPalette('commands') },
        { divider: true },
        { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: () => showSidebarPanel('explorer') },
        { label: 'Search', shortcut: 'Ctrl+Shift+F', action: () => showSidebarPanel('search') },
        { label: 'Source Control', shortcut: 'Ctrl+Shift+G', action: () => showSidebarPanel('git') },
        { label: 'Extensions', shortcut: 'Ctrl+Shift+X', action: () => showSidebarPanel('extensions') },
        { label: 'Assistant', action: () => showSidebarPanel('ai') },
        { divider: true },
        { label: 'Toggle sidebar', shortcut: 'Ctrl+B', action: toggleSidebar },
        { label: 'Toggle terminal', shortcut: 'Ctrl+`', action: toggleTerminal },
        { divider: true },
        { label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`, action: toggleTheme },
        { label: 'Settings', shortcut: 'Ctrl+,', action: () => showSidebarPanel('settings') },
      ],
    },
    {
      label: 'Run',
      items: [
        { label: running ? 'Stop' : 'Run active file', shortcut: 'Ctrl+Enter', action: runActive },
        { divider: true },
        ...playgroundFiles.map((f) => ({
          label: `Run ${f}`,
          action: () => {
            openFile(f);
            useEditorStore.setState({ terminalOpen: true });
            run(f, contentOf(f), (doc, title) => previewDocument(doc, title));
          },
        })),
      ],
    },
    {
      label: 'Go',
      items: [
        { label: 'README.md', action: () => openFile('README.md') },
        { label: 'about.md', action: () => openFile('about.md') },
        { label: 'stack.md', action: () => openFile('stack.md') },
        { label: 'products.json', action: () => openFile('products.json') },
        { label: 'projects.json', action: () => openFile('projects.json') },
        { label: 'contact.ts', action: () => openFile('contact.ts') },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Open the classic portfolio', action: () => openSimpleBrowser('/portfolio') },
        { label: 'Ask the assistant', action: () => showSidebarPanel('ai') },
        { divider: true },
        { label: 'GitHub profile', action: () => window.open(contact.github, '_blank', 'noopener,noreferrer') },
        { label: 'LinkedIn profile', action: () => window.open(contact.linkedin, '_blank', 'noopener,noreferrer') },
        { label: 'Email me', action: () => window.open(`mailto:${contact.email}`) },
      ],
    },
  ];

  return (
    <>
      <header
        className="flex items-center h-[35px] select-none relative shrink-0"
        style={{ background: 'var(--bg-titlebar)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="w-12 h-full flex items-center justify-center shrink-0" style={{ color: 'var(--accent-primary)' }}>
          <Code2 size={18} />
        </div>

        <button
          className="md:hidden p-2 rounded hover:bg-white/10"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={16} style={{ color: 'var(--text-primary)' }} /> : <Menu size={16} style={{ color: 'var(--text-primary)' }} />}
        </button>

        <nav className="hidden md:flex items-center h-full">
          {menus.map((menu) => (
            <MenuButton key={menu.label} menu={menu} openMenu={openMenu} setOpenMenu={setOpenMenu} />
          ))}
        </nav>

        <div className="flex-1 flex justify-center px-2 sm:px-4 min-w-0">
          <button
            onClick={() => openCommandPalette('files')}
            className="flex items-center justify-center w-full max-w-[420px] h-[26px] px-3 rounded hover:brightness-125 min-w-0"
            style={{ background: 'var(--bg-tertiary)' }}
            title="Search files (Ctrl+P)"
          >
            <Search size={13} className="mr-2 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="text-[13px] truncate" style={{ color: 'var(--text-muted)' }}>
              anubhav-portfolio
            </span>
          </button>
        </div>

        <div className="flex items-center h-full ml-auto shrink-0 pr-1">
          <button
            onClick={runActive}
            title={running ? 'Stop' : 'Run active file (Ctrl+Enter)'}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
            style={{ color: running ? 'var(--error)' : 'var(--success)' }}
          >
            <Play size={15} fill="currentColor" />
          </button>
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button
            onClick={toggleSidebar}
            title="Toggle sidebar (Ctrl+B)"
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <PanelLeft size={15} />
          </button>
          <button
            onClick={toggleTerminal}
            title="Toggle terminal (Ctrl+`)"
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <PanelBottom size={15} />
          </button>
        </div>

        {mobileOpen && (
          <div
            className="absolute top-full left-0 right-0 shadow-xl z-[200] md:hidden max-h-[70vh] overflow-y-auto"
            style={{ background: 'var(--bg-dropdown)', borderBottom: '1px solid var(--border-color)' }}
          >
            {menus.map((menu) => (
              <div key={menu.label} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div
                  className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  {menu.label}
                </div>
                {menu.items
                  .filter((i) => !i.divider)
                  .map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action?.();
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-[13px] hover:bg-white/10"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
