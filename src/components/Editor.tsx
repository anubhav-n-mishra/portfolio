'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorStore } from '@/store/editor';
import { useThemeStore } from '@/store/theme';
import { useRunnerStore } from '@/store/runner';
import { getFileLanguage } from '@/data/files';
import { languageFor } from '@/lib/runtime';
import { highlight } from '@/lib/highlight';
import { cn } from '@/lib/utils';
import FileIcon from './FileIcon';
import { X, ChevronRight, Play, Square, Save, SplitSquareHorizontal, Circle } from 'lucide-react';

const LINE_HEIGHT = 1.5; // em; shared by the textarea and the highlight layer

export default function Editor() {
  const {
    tabs, activeFile, closeFile, setActiveFile, contentOf,
    updateFileContent, saveFile, previewDocument,
  } = useEditorStore();
  const { showLineNumbers, showMinimap, fontSize } = useThemeStore();
  const { run, stop, running, runningFile } = useRunnerStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  const content = activeFile ? contentOf(activeFile) : '';
  const language = activeFile ? getFileLanguage(activeFile) : 'Plain Text';
  const spec = activeFile ? languageFor(activeFile) : null;
  const activeTab = tabs.find((t) => t.name === activeFile);

  const lines = useMemo(() => highlight(content, activeFile ?? ''), [content, activeFile]);
  const lineCount = lines.length;

  // The textarea is the scroll container; the highlight layer and gutter follow it.
  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  }, []);

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const upto = ta.value.slice(0, ta.selectionStart);
    const split = upto.split('\n');
    setCursor({ line: split.length, col: split[split.length - 1].length + 1 });
  }, []);

  useEffect(() => {
    syncScroll();
    updateCursor();
  }, [activeFile, syncScroll, updateCursor]);

  const doRun = useCallback(() => {
    if (!activeFile) return;
    if (running) {
      stop();
      return;
    }
    useEditorStore.setState({ terminalOpen: true });
    run(activeFile, contentOf(activeFile), (doc, title) => previewDocument(doc, title));
  }, [activeFile, running, run, stop, contentOf, previewDocument]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter and Ctrl+S are handled once, on the window, by IDELayout. Handling
    // them here as well meant one keypress ran the file and then immediately stopped
    // it, because the second handler saw a run already in progress.

    // Tab inserts two spaces instead of moving focus out of the editor.
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: start, selectionEnd: end, value } = ta;
      const next = `${value.slice(0, start)}  ${value.slice(end)}`;
      if (activeFile) updateFileContent(activeFile, next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-editor)' }}>
        <div className="text-center px-6" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-6 opacity-25">{'{ }'}</div>
          <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            No editor is open
          </h2>
          <p className="text-sm mb-6">Pick a file in the Explorer, or open the playground and run something.</p>
          <div className="space-y-2 text-sm">
            {[
              ['Ctrl+P', 'Go to file'],
              ['Ctrl+Shift+P', 'Command palette'],
              ['Ctrl+Enter', 'Run the open file'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-center gap-3">
                <kbd
                  className="px-2 py-1 rounded text-xs"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  {key}
                </kbd>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isRunningThis = running && runningFile === activeFile;

  return (
    <section className="flex-1 flex flex-col min-w-0 min-h-0" style={{ background: 'var(--bg-editor)' }}>
      {/* Tab bar */}
      <div className="flex items-center h-[35px] shrink-0" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex-1 flex overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveFile(tab.name)}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  e.preventDefault();
                  closeFile(tab.name);
                }
              }}
              className={cn(
                'group flex items-center gap-2 px-3 h-[35px] cursor-pointer min-w-max text-[13px] border-t-2 shrink-0',
                tab.isActive ? 'border-t-[var(--accent-primary)]' : 'border-t-transparent'
              )}
              style={{
                background: tab.isActive ? 'var(--bg-editor)' : 'var(--bg-tertiary)',
                color: tab.isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <FileIcon filename={tab.name} size={14} />
              <span className="max-w-[150px] truncate">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(tab.name);
                }}
                aria-label={`Close ${tab.name}`}
                className={cn(
                  'p-0.5 rounded ml-1 hover:bg-[var(--bg-hover)]',
                  tab.isDirty ? 'opacity-100' : tab.isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60'
                )}
              >
                {tab.isDirty ? <Circle size={9} fill="currentColor" /> : <X size={14} />}
              </button>
            </div>
          ))}
        </div>

        {/* Tab actions */}
        <div
          className="flex items-center px-1 gap-0.5 h-full shrink-0"
          style={{ borderLeft: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          {spec && (
            <button
              onClick={doRun}
              title={isRunningThis ? 'Stop (Ctrl+Enter)' : `Run ${activeFile} — ${spec.runHint} (Ctrl+Enter)`}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                color: isRunningThis ? 'var(--error)' : 'var(--success)',
                background: 'transparent',
              }}
            >
              {isRunningThis ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
              <span className="hidden sm:inline">{isRunningThis ? 'Stop' : 'Run'}</span>
            </button>
          )}
          {activeTab?.isDirty && (
            <button
              onClick={() => activeFile && saveFile(activeFile)}
              title="Save (Ctrl+S)"
              className="p-1.5 rounded hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <Save size={14} />
            </button>
          )}
          <button
            className="hidden md:flex p-1.5 rounded hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
            title="Split editor"
            onClick={() => useEditorStore.getState().previewDocument(
              `<pre style="font:13px ui-monospace,monospace;padding:16px;white-space:pre-wrap">${
                content.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
              }</pre>`,
              activeFile ?? 'preview'
            )}
          >
            <SplitSquareHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div
        className="hidden sm:flex items-center gap-1 px-4 py-1 text-[12px] shrink-0 overflow-x-auto scrollbar-none"
        style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}
      >
        {activeTab?.path
          .split('/')
          .filter(Boolean)
          .slice(0, -1)
          .map((part, idx) => (
            <React.Fragment key={idx}>
              <span className="whitespace-nowrap">{part}</span>
              <ChevronRight size={13} className="opacity-50 shrink-0" />
            </React.Fragment>
          ))}
        {activeFile && (
          <span className="flex items-center gap-1.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
            <FileIcon filename={activeFile} size={13} />
            {activeFile}
          </span>
        )}
        {spec && (
          <span className="ml-auto pl-4 hidden lg:inline whitespace-nowrap opacity-70">{spec.runHint}</span>
        )}
      </div>

      {/* Code surface: a transparent textarea sits exactly on top of the highlighted
          layer, so the file stays editable without losing colouring. */}
      <div className="flex-1 flex min-h-0 relative">
        {showLineNumbers && (
          <div
            ref={gutterRef}
            className="hidden sm:block shrink-0 overflow-hidden select-none text-right pr-3 pl-4 pt-2"
            style={{
              background: 'var(--bg-editor)',
              color: 'var(--text-line-number)',
              fontSize: `${fontSize}px`,
              lineHeight: LINE_HEIGHT,
              fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
              minWidth: `${String(lineCount).length + 2}ch`,
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} style={{ color: i + 1 === cursor.line ? 'var(--text-primary)' : undefined }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 relative min-w-0">
          <pre
            ref={highlightRef}
            aria-hidden
            className="absolute inset-0 overflow-hidden pointer-events-none m-0 pt-2 pl-2 pr-4"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: LINE_HEIGHT,
              fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
              whiteSpace: 'pre',
              tabSize: 2,
            }}
          >
            <code>
              {lines.map((tokens, i) => (
                <div key={i} style={{ minHeight: `${LINE_HEIGHT}em` }}>
                  {tokens.length === 0
                    ? ' '
                    : tokens.map((t, j) => (
                        <span key={j} className={t.cls}>
                          {t.text}
                        </span>
                      ))}
                </div>
              ))}
            </code>
          </pre>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => activeFile && updateFileContent(activeFile, e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursor}
            onClick={updateCursor}
            onSelect={updateCursor}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label={`Editing ${activeFile ?? 'file'}`}
            className="absolute inset-0 w-full h-full resize-none outline-none bg-transparent pt-2 pl-2 pr-4 overflow-auto"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: LINE_HEIGHT,
              fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
              color: 'transparent',
              caretColor: 'var(--text-primary)',
              whiteSpace: 'pre',
              tabSize: 2,
            }}
          />
        </div>

        {showMinimap && (
          <div
            className="hidden lg:block w-[80px] shrink-0 overflow-hidden pointer-events-none pt-2"
            style={{ background: 'var(--bg-editor)', borderLeft: '1px solid var(--border-color)' }}
          >
            <div className="px-1" style={{ fontSize: '2px', lineHeight: '3px', fontFamily: 'monospace' }}>
              {lines.slice(0, 220).map((tokens, i) => (
                <div key={i} className="truncate h-[3px]" style={{ color: 'var(--text-muted)' }}>
                  {tokens.map((t) => t.text).join('').slice(0, 90) || ' '}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cursor position is reported to the status bar through the store-free window event
          the StatusBar listens for; keeping it local avoids a re-render of the whole tree. */}
      <CursorReporter line={cursor.line} col={cursor.col} language={language} />
    </section>
  );
}

function CursorReporter({ line, col, language }: { line: number; col: number; language: string }) {
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('editor:cursor', { detail: { line, col, language } })
    );
  }, [line, col, language]);
  return null;
}
