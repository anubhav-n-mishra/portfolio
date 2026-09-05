'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/editor';
import { X, RotateCw, Globe, ExternalLink, Home, ShieldCheck } from 'lucide-react';

export default function SimpleBrowser() {
  const {
    simpleBrowserOpen, simpleBrowserUrl, simpleBrowserDoc, simpleBrowserTitle,
    closeSimpleBrowser, openSimpleBrowser,
  } = useEditorStore();

  const [draftUrl, setDraftUrl] = useState(simpleBrowserUrl);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isDocPreview = simpleBrowserDoc !== null;

  const absoluteUrl =
    simpleBrowserUrl.startsWith('/') && typeof window !== 'undefined'
      ? `${window.location.origin}${simpleBrowserUrl}`
      : simpleBrowserUrl;

  // The address bar used to render the resolved URL while writing keystrokes to a
  // different piece of state, so typing in it did nothing. It is a normal controlled
  // input now, resynced during render when the browser navigates somewhere new —
  // which avoids the extra render pass an effect-plus-setState would cost.
  const target = isDocPreview ? simpleBrowserTitle : absoluteUrl;
  if (target !== lastSynced) {
    setLastSynced(target);
    setDraftUrl(target);
  }

  if (!simpleBrowserOpen) return null;

  const navigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDocPreview) return;
    const trimmed = draftUrl.trim();
    if (!trimmed) return;
    const target = /^(https?:\/\/|\/)/.test(trimmed) ? trimmed : `https://${trimmed}`;
    setIsLoading(true);
    openSimpleBrowser(target);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ background: 'var(--bg-editor)' }}>
      <div
        className="flex items-center gap-1 h-[35px] px-1 sm:px-2 shrink-0"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
      >
        <button
          onClick={reload}
          className="p-1.5 rounded hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-muted)' }}
          title="Reload"
        >
          <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={() => openSimpleBrowser('/portfolio')}
          className="hidden sm:block p-1.5 rounded hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-muted)' }}
          title="Open the classic portfolio"
        >
          <Home size={14} />
        </button>

        <form onSubmit={navigate} className="flex-1 mx-1 sm:mx-2 min-w-0">
          <div
            className="flex items-center gap-2 rounded px-2 py-1"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
          >
            {isDocPreview ? (
              <ShieldCheck size={13} className="shrink-0" style={{ color: 'var(--success)' }} />
            ) : (
              <Globe size={13} className="shrink-0 hidden sm:block" style={{ color: 'var(--text-muted)' }} />
            )}
            <input
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              readOnly={isDocPreview}
              placeholder="Enter a URL"
              aria-label="Address bar"
              className="flex-1 bg-transparent outline-none text-[12px] sm:text-[13px] min-w-0"
              style={{ color: 'var(--text-primary)' }}
              spellCheck={false}
            />
            {isDocPreview && (
              <span className="text-[10px] shrink-0 hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
                local preview
              </span>
            )}
          </div>
        </form>

        {!isDocPreview && (
          <button
            onClick={() => window.open(absoluteUrl, '_blank', 'noopener,noreferrer')}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
            title="Open in a real browser tab"
          >
            <ExternalLink size={14} />
          </button>
        )}
        <button
          onClick={closeSimpleBrowser}
          className="p-1.5 rounded hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-muted)' }}
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 bg-white overflow-hidden min-h-0">
        {isDocPreview ? (
          <iframe
            key={`doc-${reloadKey}-${simpleBrowserTitle}`}
            srcDoc={simpleBrowserDoc ?? ''}
            className="w-full h-full border-0"
            title={simpleBrowserTitle || 'Preview'}
            onLoad={() => setIsLoading(false)}
            // Editor-authored markup runs with scripts, but in an opaque origin —
            // no same-origin access back to the IDE, no top-level navigation.
            sandbox="allow-scripts allow-popups allow-forms allow-modals"
          />
        ) : (
          <iframe
            key={`url-${reloadKey}-${simpleBrowserUrl}`}
            src={absoluteUrl}
            className="w-full h-full border-0"
            title={simpleBrowserTitle || 'Simple Browser'}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  );
}
