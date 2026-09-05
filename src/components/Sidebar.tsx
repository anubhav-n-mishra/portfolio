'use client';

import React from 'react';
import {
  useEditorStore, type TreeNode, EXTENSIONS, installExtension, uninstallExtension,
} from '@/store/editor';
import { useThemeStore } from '@/store/theme';
import { useRunnerStore } from '@/store/runner';
import { portfolioData } from '@/data/portfolio';
import { ask, SUGGESTED_QUESTIONS, type Answer } from '@/lib/assistant';
import { languageFor } from '@/lib/runtime';
import { cn } from '@/lib/utils';
import FileIcon from './FileIcon';
import { useIsMobile } from '@/lib/hooks';
import { pickFiles } from '@/lib/pickFiles';
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, FilePlus, FolderPlus, RefreshCw,
  FoldVertical, Search, GitBranch, Github, Linkedin, Mail, Globe, Play, Send,
  Ellipsis, Check, Trash2, ExternalLink, Star, Bot, MapPin,
} from 'lucide-react';

/* ================================================================== *
 * Explorer
 * ================================================================== */

const TreeItem: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
  const { openFile, toggleFolder, activeFile } = useEditorStore();
  const isActive = node.type === 'file' && node.name === activeFile;
  const spec = node.type === 'file' ? languageFor(node.name) : null;

  return (
    <div>
      <div
        onClick={() => (node.type === 'folder' ? toggleFolder(node.path) : openFile(node.name))}
        className="flex items-center gap-1 py-[3px] cursor-pointer text-[13px] group"
        style={{
          paddingLeft: `${depth * 10 + 8}px`,
          background: isActive ? 'var(--bg-selected)' : undefined,
          color: 'var(--text-primary)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = '';
        }}
      >
        {node.type === 'folder' ? (
          <>
            {node.isOpen ? <ChevronDown size={15} className="shrink-0" /> : <ChevronRight size={15} className="shrink-0" />}
            {node.isOpen ? (
              <FolderOpen size={15} className="shrink-0 mr-1" style={{ color: 'var(--folder-color)' }} />
            ) : (
              <Folder size={15} className="shrink-0 mr-1" style={{ color: 'var(--folder-color)' }} />
            )}
          </>
        ) : (
          <>
            <span className="w-[15px] shrink-0" />
            <FileIcon filename={node.name} size={15} className="shrink-0 mr-1" />
          </>
        )}
        <span className="truncate">{node.name}</span>
        {spec && (
          <Play
            size={10}
            className="ml-auto mr-2 shrink-0 opacity-0 group-hover:opacity-70"
            style={{ color: 'var(--success)' }}
          />
        )}
      </div>
      {node.type === 'folder' &&
        node.isOpen &&
        node.children?.map((child) => <TreeItem key={child.id} node={child} depth={depth + 1} />)}
    </div>
  );
};

const PanelHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div
    className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-wide shrink-0"
    style={{ color: 'var(--text-secondary)' }}
  >
    <span>{title}</span>
    <div className="flex gap-0.5">{children}</div>
  </div>
);

const IconButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({
  title, onClick, children,
}) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={title}
    className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-[var(--bg-hover)]"
  >
    {children}
  </button>
);

const ExplorerPanel: React.FC = () => {
  const { fileTree, createFile, createFolder, openFile, collapseAllFolders } = useEditorStore();
  const [creating, setCreating] = React.useState<'file' | 'folder' | null>(null);
  const [draft, setDraft] = React.useState('');
  const [spin, setSpin] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = draft.trim();
    if (!name) {
      setCreating(null);
      return;
    }
    if (creating === 'file') {
      createFile('/playground', name);
      openFile(name);
    } else {
      createFolder('/playground', name);
    }
    setDraft('');
    setCreating(null);
  };

  const upload = async () => {
    const loaded = await pickFiles();
    loaded.forEach(({ name, content }) => createFile('/playground', name, content));
    if (loaded[0]) openFile(loaded[0].name);
  };

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--text-primary)' }}>
      <PanelHeader title="Explorer">
        <IconButton title="New file" onClick={() => { setCreating('file'); setDraft(''); }}>
          <FilePlus size={15} />
        </IconButton>
        <IconButton title="New folder" onClick={() => { setCreating('folder'); setDraft(''); }}>
          <FolderPlus size={15} />
        </IconButton>
        <IconButton title="Open a file from your computer" onClick={upload}>
          <Ellipsis size={15} />
        </IconButton>
        <IconButton
          title="Refresh"
          onClick={() => {
            setSpin(true);
            window.setTimeout(() => setSpin(false), 500);
          }}
        >
          <RefreshCw size={15} className={spin ? 'animate-spin' : ''} />
        </IconButton>
        <IconButton title="Collapse folders" onClick={collapseAllFolders}>
          <FoldVertical size={15} />
        </IconButton>
      </PanelHeader>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div
          className="px-2 py-[5px] text-[11px] font-semibold uppercase tracking-wide sticky top-0 z-10"
          style={{ background: 'var(--bg-sidebar)' }}
        >
          anubhav-portfolio
        </div>

        {creating && (
          <form onSubmit={submit} className="px-6 py-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => e.key === 'Escape' && setCreating(null)}
              placeholder={creating === 'file' ? 'solution.py' : 'folder-name'}
              className="w-full px-2 py-1 text-[13px] rounded outline-none"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--accent-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </form>
        )}

        {fileTree[0]?.children?.map((node) => <TreeItem key={node.id} node={node} depth={0} />)}

        <div className="px-4 py-4 mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Files in <span style={{ color: 'var(--text-secondary)' }}>playground/</span> run for real.
          Open one and press <kbd>Ctrl</kbd>+<kbd>Enter</kbd>. You can add your own too.
        </div>
      </div>
    </div>
  );
};

/* ================================================================== *
 * Search — actually searches
 * ================================================================== */

interface Hit {
  file: string;
  line: number;
  text: string;
}

const SearchPanel: React.FC = () => {
  const { allFilenames, contentOf, openFile } = useEditorStore();
  const [query, setQuery] = React.useState('');
  const [caseSensitive, setCaseSensitive] = React.useState(false);

  const hits = React.useMemo<Hit[]>(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const needle = caseSensitive ? q : q.toLowerCase();
    const found: Hit[] = [];

    for (const file of allFilenames()) {
      const lines = contentOf(file).split('\n');
      for (let i = 0; i < lines.length; i++) {
        const hay = caseSensitive ? lines[i] : lines[i].toLowerCase();
        if (hay.includes(needle)) {
          found.push({ file, line: i + 1, text: lines[i].trim().slice(0, 160) });
          if (found.length >= 120) return found;
        }
      }
    }
    return found;
  }, [query, caseSensitive, allFilenames, contentOf]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const hit of hits) {
      const list = map.get(hit.file) ?? [];
      list.push(hit);
      map.set(hit.file, list);
    }
    return [...map.entries()];
  }, [hits]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <PanelHeader title="Search" />
      <div className="px-3 pb-2 shrink-0">
        <div
          className="flex items-center gap-2 rounded px-2 py-1.5"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
        >
          <Search size={13} style={{ color: 'var(--text-muted)' }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all files"
            className="flex-1 bg-transparent outline-none text-[13px] min-w-0"
            style={{ color: 'var(--text-primary)' }}
            spellCheck={false}
          />
          <button
            onClick={() => setCaseSensitive((c) => !c)}
            title="Match case"
            className="text-[11px] px-1 rounded font-mono shrink-0"
            style={{
              background: caseSensitive ? 'var(--bg-selected)' : 'transparent',
              color: caseSensitive ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            Aa
          </button>
        </div>
        {query.trim().length >= 2 && (
          <p className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {hits.length === 0
              ? 'No results'
              : `${hits.length} result${hits.length === 1 ? '' : 's'} in ${grouped.length} file${grouped.length === 1 ? '' : 's'}`}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto text-[12px]">
        {grouped.map(([file, fileHits]) => (
          <div key={file} className="mb-1">
            <div
              className="flex items-center gap-1.5 px-3 py-1 sticky top-0"
              style={{ background: 'var(--bg-sidebar)', color: 'var(--text-secondary)' }}
            >
              <FileIcon filename={file} size={13} />
              <span className="truncate">{file}</span>
              <span className="ml-auto opacity-60">{fileHits.length}</span>
            </div>
            {fileHits.slice(0, 20).map((hit, i) => (
              <button
                key={i}
                onClick={() => openFile(hit.file)}
                className="w-full text-left px-3 pl-8 py-1 truncate hover:bg-[var(--bg-hover)] font-mono"
                style={{ color: 'var(--text-muted)' }}
                title={hit.text}
              >
                <span className="opacity-50 mr-2">{hit.line}</span>
                {hit.text}
              </button>
            ))}
          </div>
        ))}

        {query.trim().length < 2 && (
          <p className="px-4 py-3 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Searches every file in the workspace, including ones you have edited.
            Try <span style={{ color: 'var(--text-secondary)' }}>row-level</span>,{' '}
            <span style={{ color: 'var(--text-secondary)' }}>WebRTC</span> or{' '}
            <span style={{ color: 'var(--text-secondary)' }}>scheduler</span>.
          </p>
        )}
      </div>
    </div>
  );
};

/* ================================================================== *
 * Source control
 * ================================================================== */

const GitPanel: React.FC = () => {
  const { tabs, openFile } = useEditorStore();
  const { github, projects, contact } = portfolioData;
  const dirty = tabs.filter((t) => t.isDirty);

  return (
    <div className="flex flex-col h-full min-h-0">
      <PanelHeader title="Source Control" />
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        <div>
          <h4 className="text-[11px] font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Changes ({dirty.length})
          </h4>
          {dirty.length === 0 ? (
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              No local changes. Edit a file in the editor and it shows up here.
            </p>
          ) : (
            dirty.map((tab) => (
              <button
                key={tab.id}
                onClick={() => openFile(tab.name)}
                className="w-full flex items-center gap-2 px-2 py-1 rounded text-[13px] hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <FileIcon filename={tab.name} size={14} />
                <span className="truncate">{tab.name}</span>
                <span className="ml-auto font-mono text-[11px]" style={{ color: 'var(--warning)' }}>M</span>
              </button>
            ))
          )}
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Repositories
          </h4>
          <div className="flex items-center gap-2 text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
            <GitBranch size={14} style={{ color: 'var(--accent-tertiary)' }} />
            {github.repositories} public repositories
          </div>
          <div className="space-y-1">
            {projects
              .filter((p) => p.featured)
              .map((p) => (
                <a
                  key={p.id}
                  href={p.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-[12px] hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Github size={13} className="shrink-0" />
                  <span className="truncate">{p.name}</span>
                  {p.stars ? (
                    <span className="ml-auto flex items-center gap-0.5 shrink-0" style={{ color: 'var(--warning)' }}>
                      <Star size={11} fill="currentColor" />
                      {p.stars}
                    </span>
                  ) : (
                    <ExternalLink size={11} className="ml-auto shrink-0 opacity-50" />
                  )}
                </a>
              ))}
          </div>
        </div>

        <a
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded text-[13px] transition-colors"
          style={{ background: 'var(--accent-primary)', color: '#fff' }}
        >
          <Github size={15} />
          View GitHub profile
        </a>
      </div>
    </div>
  );
};

/* ================================================================== *
 * Extensions
 * ================================================================== */

const ExtensionsPanel: React.FC = () => {
  const installed = useEditorStore((s) => s.installedExtensions);
  const [installing, setInstalling] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [filter, setFilter] = React.useState('');

  // Install state lives in the store now — it used to be component state, so it
  // reset every time you switched sidebar panels and the `resume` command broke.
  const install = (id: string) => {
    if (installing) return;
    setInstalling(id);
    setProgress(0);
    const tick = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(tick);
          installExtension(id);
          setInstalling(null);
          return 0;
        }
        return p + 18;
      });
    }, 90);
  };

  const visible = EXTENSIONS.filter(
    (e) =>
      e.name.toLowerCase().includes(filter.toLowerCase()) ||
      e.description.toLowerCase().includes(filter.toLowerCase())
  );
  const isOn = (id: string) => installed.includes(id);

  const row = (ext: (typeof EXTENSIONS)[number]) => (
    <div key={ext.id} className="flex items-start gap-3 p-2 rounded mb-1 hover:bg-[var(--bg-hover)]">
      <span className="text-lg leading-none mt-0.5">{ext.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {ext.name}
        </div>
        <div className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
          {ext.description}
        </div>
        <div className="text-[10px] mt-0.5 opacity-60" style={{ color: 'var(--text-muted)' }}>
          {ext.publisher}
        </div>
        {installing === ext.id && (
          <div className="mt-1.5">
            <div className="w-full h-1 rounded overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div
                className="h-full transition-all duration-100"
                style={{ width: `${Math.min(progress, 100)}%`, background: 'var(--accent-primary)' }}
              />
            </div>
          </div>
        )}
      </div>
      {installing !== ext.id &&
        (isOn(ext.id) ? (
          <button
            onClick={() => uninstallExtension(ext.id)}
            className="shrink-0 text-[11px] px-2 py-1 rounded flex items-center gap-1"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
            title="Uninstall"
          >
            <Trash2 size={11} />
          </button>
        ) : (
          <button
            onClick={() => install(ext.id)}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded"
            style={{ background: 'var(--accent-primary)', color: '#fff' }}
          >
            Install
          </button>
        ))}
      {isOn(ext.id) && installing !== ext.id && (
        <Check size={13} className="shrink-0 mt-1.5" style={{ color: 'var(--success)' }} />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <PanelHeader title="Extensions" />
      <div className="px-3 pb-2 shrink-0">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search extensions"
          className="w-full rounded px-2 py-1.5 text-[13px] outline-none"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <h4 className="px-2 py-1 text-[11px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
          Installed ({visible.filter((e) => isOn(e.id)).length})
        </h4>
        {visible.filter((e) => isOn(e.id)).map(row)}

        {visible.some((e) => !isOn(e.id)) && (
          <>
            <h4 className="px-2 py-1 mt-2 text-[11px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Available
            </h4>
            {visible.filter((e) => !isOn(e.id)).map(row)}
          </>
        )}
      </div>
    </div>
  );
};

/* ================================================================== *
 * Assistant — offline
 * ================================================================== */

interface ChatMessage {
  role: 'user' | 'assistant';
  answer: Answer;
}

const AssistantPanel: React.FC = () => {
  const { openFile } = useEditorStore();
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'assistant',
      answer: {
        text:
          "I answer from this portfolio's own data — no API key, no network call, so I can't invent a project that doesn't exist or fail because a service is down.\n\nAsk me anything about the work.",
      },
    },
  ]);
  const [input, setInput] = React.useState('');
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const send = (text: string) => {
    const question = text.trim();
    if (!question) return;
    setMessages((m) => [
      ...m,
      { role: 'user', answer: { text: question } },
      { role: 'assistant', answer: ask(question) },
    ]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          Assistant
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--success)' }}
          title="Runs entirely in your browser"
        >
          offline
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
            <div
              className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-[11px]"
              style={{
                background: msg.role === 'assistant' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: msg.role === 'assistant' ? '#fff' : 'var(--text-primary)',
              }}
            >
              {msg.role === 'assistant' ? <Bot size={13} /> : 'You'.charAt(0)}
            </div>
            <div
              className="max-w-[85%] px-3 py-2 rounded-lg text-[12px] leading-relaxed whitespace-pre-wrap break-words"
              style={{
                background: msg.role === 'assistant' ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                color: msg.role === 'assistant' ? 'var(--text-primary)' : '#fff',
              }}
            >
              {msg.answer.text}

              {msg.answer.files && msg.answer.files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.answer.files.map((f) => (
                    <button
                      key={f}
                      onClick={() => openFile(f)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px]"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--accent-secondary)' }}
                    >
                      <FileIcon filename={f} size={11} />
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {msg.answer.links && msg.answer.links.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.answer.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px]"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--accent-secondary)' }}
                    >
                      <ExternalLink size={10} />
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 mb-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the work..."
            className="flex-1 rounded px-2 py-1.5 text-[12px] outline-none min-w-0"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-2.5 rounded disabled:opacity-40"
            style={{ background: 'var(--accent-primary)', color: '#fff' }}
            aria-label="Send"
          >
            <Send size={14} />
          </button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-[11px] px-2 py-1 rounded hover:brightness-125"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================================================================== *
 * Account
 * ================================================================== */

const AccountPanel: React.FC = () => {
  const { personal, contact, impact } = portfolioData;

  return (
    <div className="flex flex-col h-full min-h-0">
      <PanelHeader title="Account" />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="text-center mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={personal.avatar}
            alt=""
            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
            style={{ border: '2px solid var(--accent-primary)' }}
          />
          <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {personal.name}
          </h3>
          <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            {personal.title}
          </p>
          <p
            className="text-[11px] mt-1 flex items-center justify-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <MapPin size={11} />
            {personal.location} · {personal.timezone}
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-5">
          {[
            { href: contact.github, icon: Github, label: 'GitHub' },
            { href: contact.linkedin, icon: Linkedin, label: 'LinkedIn' },
            { href: `mailto:${contact.email}`, icon: Mail, label: 'Email' },
            { href: contact.website, icon: Globe, label: 'Website' },
          ].map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              aria-label={label}
              className="p-2 rounded-full hover:bg-[var(--bg-hover)]"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              <Icon size={16} />
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {impact.slice(0, 4).map((stat) => (
            <div key={stat.label} className="p-2 rounded text-center" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="text-[16px] font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                {stat.value}
              </div>
              <div className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>{personal.education.degree}</p>
          <p style={{ color: 'var(--text-muted)' }}>
            {personal.education.university} — {personal.education.status}
          </p>
          <p className="mt-3" style={{ color: 'var(--success)' }}>
            {personal.availability}
          </p>
        </div>

        <a
          href={contact.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 w-full py-2 rounded text-[13px]"
          style={{ background: 'var(--accent-primary)', color: '#fff' }}
        >
          Download resume
        </a>
      </div>
    </div>
  );
};

/* ================================================================== *
 * Settings — the gear used to do nothing
 * ================================================================== */

// Defined at module scope: a component created inside another component's render is a
// brand new type on every render, so React unmounts and remounts its whole subtree.
const SettingToggle: React.FC<{
  label: string;
  hint?: string;
  on: boolean;
  onChange: () => void;
}> = ({ label, hint, on, onChange }) => (
  <button onClick={onChange} className="w-full flex items-start gap-3 px-1 py-2 text-left">
    <span
      className="mt-0.5 w-8 h-[18px] rounded-full shrink-0 relative transition-colors"
      style={{ background: on ? 'var(--accent-primary)' : 'var(--bg-tertiary)' }}
    >
      <span
        className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all"
        style={{ left: on ? '16px' : '2px' }}
      />
    </span>
    <span className="min-w-0">
      <span className="block text-[13px]" style={{ color: 'var(--text-primary)' }}>{label}</span>
      {hint && <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
    </span>
  </button>
);

const SettingsPanel: React.FC = () => {
  const {
    theme, setTheme, fontSize, setFontSize, showMinimap, toggleMinimap,
    showLineNumbers, toggleLineNumbers, animations, toggleAnimations,
  } = useThemeStore();
  const { stdin, setStdin } = useRunnerStore();

  return (
    <div className="flex flex-col h-full min-h-0">
      <PanelHeader title="Settings" />
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-4">
        <div>
          <h4 className="text-[11px] font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Appearance
          </h4>
          <div className="flex gap-2 mb-3">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="flex-1 py-1.5 rounded text-[12px] capitalize"
                style={{
                  background: theme === t ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: theme === t ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="block text-[12px] mb-1" style={{ color: 'var(--text-secondary)' }}>
            Editor font size — {fontSize}px
          </label>
          <input
            type="range"
            min={10}
            max={22}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-[var(--accent-primary)]"
          />
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
            Editor
          </h4>
          <SettingToggle label="Line numbers" on={showLineNumbers} onChange={toggleLineNumbers} />
          <SettingToggle label="Minimap" on={showMinimap} onChange={toggleMinimap} />
          <SettingToggle
            label="Animations"
            hint="Turn off to reduce motion"
            on={animations}
            onChange={toggleAnimations}
          />
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
            Code runner
          </h4>
          <label className="block text-[12px] mb-1" style={{ color: 'var(--text-secondary)' }}>
            Default stdin
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="Piped into the next program you run"
            className="w-full rounded px-2 py-1.5 text-[12px] font-mono outline-none resize-y"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            JavaScript, TypeScript and Python execute in this browser tab. C, C++, Java, Go
            and Rust are compiled in a public remote sandbox, so those need a connection.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== *
 * Shell
 * ================================================================== */

export default function Sidebar() {
  const { sidebarPanel, sidebarOpen } = useEditorStore();
  const [width, setWidth] = React.useState(280);
  const [dragging, setDragging] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => setWidth(Math.max(200, Math.min(520, e.clientX - 48)));
    const onUp = () => setDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging]);

  if (!sidebarOpen) return null;

  return (
    <aside
      className="flex flex-col overflow-hidden relative h-full shrink-0"
      style={{
        width: isMobile ? '284px' : `${width}px`,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {sidebarPanel === 'explorer' && <ExplorerPanel />}
      {sidebarPanel === 'search' && <SearchPanel />}
      {sidebarPanel === 'git' && <GitPanel />}
      {sidebarPanel === 'extensions' && <ExtensionsPanel />}
      {sidebarPanel === 'ai' && <AssistantPanel />}
      {sidebarPanel === 'account' && <AccountPanel />}
      {sidebarPanel === 'settings' && <SettingsPanel />}

      {!isMobile && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[var(--accent-primary)] z-10"
          onMouseDown={() => setDragging(true)}
        />
      )}
    </aside>
  );
}
