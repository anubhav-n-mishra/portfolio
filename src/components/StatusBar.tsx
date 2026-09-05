'use client';

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/editor';
import { useThemeStore } from '@/store/theme';
import { useRunnerStore } from '@/store/runner';
import { getFileLanguage } from '@/data/files';
import { languageFor } from '@/lib/runtime';
import { GitBranch, Bell, Check, CircleDot, Play, Loader2, Radio } from 'lucide-react';

export default function StatusBar() {
  const { activeFile, tabs, toggleTerminal, openCommandPalette, contentOf, previewDocument } = useEditorStore();
  const { theme } = useThemeStore();
  const { running, runningFile, lastResult, run } = useRunnerStore();

  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  // The editor reports the caret through a window event, so typing does not
  // re-render the whole layout on every keystroke.
  useEffect(() => {
    const onCursor = (e: Event) => {
      const detail = (e as CustomEvent).detail as { line: number; col: number };
      setCursor({ line: detail.line, col: detail.col });
    };
    window.addEventListener('editor:cursor', onCursor);
    return () => window.removeEventListener('editor:cursor', onCursor);
  }, []);

  const language = activeFile ? getFileLanguage(activeFile) : 'Plain Text';
  const spec = activeFile ? languageFor(activeFile) : null;
  const dirtyCount = tabs.filter((t) => t.isDirty).length;

  const item =
    'flex items-center gap-1.5 px-2 h-full hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap';

  return (
    <footer
      className="h-[22px] flex items-center justify-between text-[12px] shrink-0 select-none"
      style={{ background: 'var(--bg-statusbar)', color: '#ffffff' }}
    >
      <div className="flex items-center h-full min-w-0">
        <button className={item} onClick={() => useEditorStore.getState().showSidebarPanel('git')}>
          <GitBranch size={13} />
          <span className="hidden sm:inline">main</span>
          {dirtyCount > 0 && <span className="opacity-90">{dirtyCount}*</span>}
        </button>

        <button className={item} onClick={toggleTerminal} title="Toggle terminal (Ctrl+`)">
          {running ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          <span className="hidden md:inline">
            {running ? `Running ${runningFile}` : lastResult ? `Exit ${lastResult.exitCode}` : 'Ready'}
          </span>
        </button>

        {spec && !running && (
          <button
            className={item}
            title={`Run ${activeFile} — ${spec.runHint}`}
            onClick={() => {
              if (!activeFile) return;
              useEditorStore.setState({ terminalOpen: true });
              run(activeFile, contentOf(activeFile), (doc, title) => previewDocument(doc, title));
            }}
          >
            <Play size={12} fill="currentColor" />
            <span className="hidden lg:inline">Run</span>
          </button>
        )}

        {spec?.remote && (
          <span className={`${item} cursor-default opacity-80 hidden lg:flex`} title="This language compiles in a remote sandbox">
            <Radio size={12} />
            remote toolchain
          </span>
        )}
      </div>

      <div className="flex items-center h-full">
        <button className={`${item} hidden sm:flex`} onClick={() => openCommandPalette('commands')}>
          Ln {cursor.line}, Col {cursor.col}
        </button>
        <span className={`${item} cursor-default hidden md:flex`}>Spaces: 2</span>
        <span className={`${item} cursor-default hidden lg:flex`}>UTF-8</span>
        <button className={item} onClick={() => openCommandPalette('commands')}>
          {language}
        </button>
        <span className={`${item} cursor-default hidden sm:flex`} title={`${theme} theme`}>
          <CircleDot size={12} />
        </span>
        <span className={`${item} cursor-default`}>
          <Bell size={13} />
        </span>
      </div>
    </footer>
  );
}
