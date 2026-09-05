'use client';

import React, { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/theme';
import { useEditorStore } from '@/store/editor';
import { useRunnerStore } from '@/store/runner';
import TitleBar from '@/components/TitleBar';
import ActivityBar from '@/components/ActivityBar';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import Terminal from '@/components/Terminal';
import StatusBar from '@/components/StatusBar';
import CommandPalette from '@/components/CommandPalette';
import SimpleBrowser from '@/components/SimpleBrowser';
import { cn } from '@/lib/utils';
import { useIsMobile, useMounted } from '@/lib/hooks';

export default function IDELayout() {
  const { theme, animations } = useThemeStore();
  const {
    toggleSidebar, toggleTerminal, sidebarOpen, simpleBrowserOpen,
    openCommandPalette, closeCommandPalette, commandPaletteOpen,
    showSidebarPanel, activeFile, contentOf, previewDocument, saveFile,
  } = useEditorStore();
  const { run, stop, running } = useRunnerStore();

  const mounted = useMounted();
  const isMobile = useIsMobile();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.setAttribute('data-ide-active', 'true');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const timer = window.setTimeout(() => setBooting(false), 650);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.removeAttribute('data-ide-active');
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape' && commandPaletteOpen) {
        closeCommandPalette();
        return;
      }
      if (!mod) return;

      const key = e.key.toLowerCase();

      // Ctrl+Shift+P opens commands; Ctrl+P opens files. They used to be the same thing.
      if (e.shiftKey && key === 'p') {
        e.preventDefault();
        openCommandPalette('commands');
        return;
      }
      if (!e.shiftKey && key === 'p') {
        e.preventDefault();
        openCommandPalette('files');
        return;
      }
      if (e.shiftKey && key === 'e') { e.preventDefault(); showSidebarPanel('explorer'); return; }
      if (e.shiftKey && key === 'f') { e.preventDefault(); showSidebarPanel('search'); return; }
      if (e.shiftKey && key === 'g') { e.preventDefault(); showSidebarPanel('git'); return; }
      if (e.shiftKey && key === 'x') { e.preventDefault(); showSidebarPanel('extensions'); return; }

      if (key === 'b') { e.preventDefault(); toggleSidebar(); return; }
      if (e.key === '`') { e.preventDefault(); toggleTerminal(); return; }
      if (e.key === ',') { e.preventDefault(); showSidebarPanel('settings'); return; }

      // Ctrl+Enter runs the active file from anywhere, not just inside the textarea.
      if (e.key === 'Enter') {
        e.preventDefault();
        if (running) stop();
        else if (activeFile) {
          useEditorStore.setState({ terminalOpen: true });
          run(activeFile, contentOf(activeFile), (doc, title) => previewDocument(doc, title));
        }
        return;
      }
      if (key === 's') {
        e.preventDefault();
        if (activeFile) saveFile(activeFile);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    commandPaletteOpen, closeCommandPalette, openCommandPalette, showSidebarPanel,
    toggleSidebar, toggleTerminal, activeFile, contentOf, previewDocument, run, stop,
    running, saveFile,
  ]);

  if (!mounted) return null;

  if (booting) {
    return (
      <div
        className={cn('h-screen w-screen flex items-center justify-center', theme === 'light' && 'light')}
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-4xl mb-5" style={{ color: 'var(--accent-primary)' }}>
            <span>{'{'}</span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full loading-dot"
                  style={{ background: 'var(--accent-primary)' }}
                />
              ))}
            </span>
            <span>{'}'}</span>
          </div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            Starting the workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-screen w-screen flex flex-col overflow-hidden',
        theme === 'light' && 'light',
        animations && 'theme-transition'
      )}
      style={{ background: 'var(--bg-primary)' }}
    >
      <TitleBar />

      <main className="flex-1 flex overflow-hidden min-h-0">
        <ActivityBar />

        {sidebarOpen && (
          <>
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/50 z-30"
                style={{ top: 35, bottom: 22 }}
                onClick={toggleSidebar}
              />
            )}
            <div className={cn(isMobile && 'fixed left-12 top-[35px] bottom-[22px] z-40 shadow-2xl')}>
              <Sidebar />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 flex min-h-0 flex-col md:flex-row">
            <div className={cn('flex flex-col min-w-0 min-h-0', simpleBrowserOpen ? 'md:w-1/2 flex-1' : 'flex-1')}>
              <Editor />
            </div>
            {simpleBrowserOpen && (
              <div
                className={cn('min-h-0', isMobile ? 'h-1/2 border-t' : 'w-1/2 border-l')}
                style={{ borderColor: 'var(--border-color)' }}
              >
                <SimpleBrowser />
              </div>
            )}
          </div>
          <Terminal />
        </div>
      </main>

      <StatusBar />
      <CommandPalette />
    </div>
  );
}
