'use client';

import React, { useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editor';
import { useThemeStore } from '@/store/theme';
import { getFileContent, getFileLanguage, fileContents } from '@/data/files';
import { cn } from '@/lib/utils';
import {
  X,
  ChevronRight,
  FileText,
  FileJson,
  FileCode,
  Database,
  FileType,
  Ellipsis,
  SplitSquareHorizontal,
  Play,
  Save,
  Circle,
} from 'lucide-react';

const FileIcon: React.FC<{ filename: string; className?: string }> = ({ filename, className }) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    'md': { icon: FileText, color: '#519aba' },
    'json': { icon: FileJson, color: '#cbcb41' },
    'ts': { icon: FileCode, color: '#3178c6' },
    'tsx': { icon: FileCode, color: '#61dafb' },
    'js': { icon: FileCode, color: '#f7df1e' },
    'jsx': { icon: FileCode, color: '#61dafb' },
    'yaml': { icon: FileType, color: '#cb171e' },
    'yml': { icon: FileType, color: '#cb171e' },
    'sql': { icon: Database, color: '#e48e00' },
    'css': { icon: FileCode, color: '#563d7c' },
    'gitignore': { icon: FileText, color: '#6d8086' },
    'env': { icon: FileText, color: '#f7df1e' },
  };

  const iconInfo = iconMap[ext || ''] || { icon: FileText, color: '#6d8086' };
  const Icon = iconInfo.icon;
  
  return <Icon size={14} className={className} style={{ color: iconInfo.color }} />;
};

// Simple syntax highlighter
const highlightSyntax = (content: string, filename: string): React.ReactNode[] => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const lines = content.split('\n');
  
  return lines.map((line, idx) => {
    let highlighted = line;
    
    // Basic syntax highlighting patterns
    if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) {
      // Keywords
      highlighted = highlighted.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|interface|type|export|import|from|default|async|await|new|this|extends|implements)\b/g,
        '<span class="token-keyword">$1</span>'
      );
      // Strings
      highlighted = highlighted.replace(
        /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
        '<span class="token-string">$&</span>'
      );
      // Comments
      highlighted = highlighted.replace(
        /(\/\/.*$)/gm,
        '<span class="token-comment">$1</span>'
      );
      // Numbers
      highlighted = highlighted.replace(
        /\b(\d+)\b/g,
        '<span class="token-number">$1</span>'
      );
      // Functions
      highlighted = highlighted.replace(
        /\b([a-zA-Z_]\w*)\s*(?=\()/g,
        '<span class="token-function">$1</span>'
      );
    } else if (ext === 'json') {
      // JSON keys
      highlighted = highlighted.replace(
        /"([^"]+)":/g,
        '"<span class="token-property">$1</span>":'
      );
      // JSON strings
      highlighted = highlighted.replace(
        /:\s*"([^"]*)"/g,
        ': "<span class="token-string">$1</span>"'
      );
      // Numbers
      highlighted = highlighted.replace(
        /:\s*(\d+)/g,
        ': <span class="token-number">$1</span>'
      );
      // Booleans
      highlighted = highlighted.replace(
        /:\s*(true|false)/g,
        ': <span class="token-keyword">$1</span>'
      );
    } else if (['yaml', 'yml'].includes(ext || '')) {
      // YAML keys
      highlighted = highlighted.replace(
        /^(\s*)([a-zA-Z_-]+):/gm,
        '$1<span class="token-property">$2</span>:'
      );
      // Strings
      highlighted = highlighted.replace(
        /:\s*["']([^"']*)["']/g,
        ': "<span class="token-string">$1</span>"'
      );
      // Comments
      highlighted = highlighted.replace(
        /(#.*$)/gm,
        '<span class="token-comment">$1</span>'
      );
    } else if (ext === 'sql') {
      // SQL keywords
      highlighted = highlighted.replace(
        /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|NOT|NULL|DEFAULT|AND|OR|ORDER|BY|GROUP|HAVING|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|SERIAL|VARCHAR|INTEGER|TEXT|DATE|TIMESTAMP|ARRAY)\b/gi,
        '<span class="token-keyword">$1</span>'
      );
      // Comments
      highlighted = highlighted.replace(
        /(--.*$)/gm,
        '<span class="token-comment">$1</span>'
      );
      // Strings
      highlighted = highlighted.replace(
        /'([^']*)'/g,
        "'<span class=\"token-string\">$1</span>'"
      );
    } else if (ext === 'md') {
      // Markdown headings
      highlighted = highlighted.replace(
        /^(#{1,6})\s+(.*)$/gm,
        '<span class="token-keyword">$1</span> <span class="font-bold">$2</span>'
      );
      // Bold
      highlighted = highlighted.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong>$1</strong>'
      );
      // Italic
      highlighted = highlighted.replace(
        /\*([^*]+)\*/g,
        '<em>$1</em>'
      );
      // Links
      highlighted = highlighted.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '[<span class="token-string">$1</span>](<span class="token-variable">$2</span>)'
      );
      // Code blocks
      highlighted = highlighted.replace(
        /`([^`]+)`/g,
        '<span class="token-function">$1</span>'
      );
    }

    return (
      <div 
        key={idx} 
        className="code-line flex hover:bg-[var(--bg-hover)]"
        dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }}
      />
    );
  });
};

export default function Editor() {
  const { tabs, activeFile, closeFile, setActiveFile, userFiles, updateFileContent } = useEditorStore();
  const { showLineNumbers, showMinimap, fontSize } = useThemeStore();
  
  // Get content - check user files first, then default files
  const getContent = useCallback((filename: string | null) => {
    if (!filename) return '';
    if (userFiles[filename] !== undefined) return userFiles[filename];
    return getFileContent(filename);
  }, [userFiles]);
  
  const content = getContent(activeFile);
  const language = activeFile ? getFileLanguage(activeFile) : 'Plain Text';
  const lineCount = Math.max(content.split('\n').length, 20);
  
  const [editableContent, setEditableContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  
  // Update editable content when active file changes
  React.useEffect(() => {
    setEditableContent(getContent(activeFile));
  }, [activeFile, getContent]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
    if (activeFile) {
      updateFileContent(activeFile, e.target.value);
    }
  };
  
  const isUserFile = activeFile ? userFiles[activeFile] !== undefined : false;
  const isDirty = tabs.find(t => t.name === activeFile)?.isDirty || false;

  // Get breadcrumb path from active file
  const getBreadcrumbPath = (filename: string) => {
    const pathMap: Record<string, string[]> = {
      'README.md': ['anubhav-portfolio'],
      'package.json': ['anubhav-portfolio'],
      '.gitignore': ['anubhav-portfolio'],
      'tsconfig.json': ['anubhav-portfolio'],
      '.env.example': ['anubhav-portfolio'],
      'next.config.js': ['anubhav-portfolio'],
      'about.tsx': ['anubhav-portfolio', 'src', 'pages'],
      'projects.tsx': ['anubhav-portfolio', 'src', 'pages'],
      'skills.yaml': ['anubhav-portfolio', 'src', 'data'],
      'resume.json': ['anubhav-portfolio', 'src', 'data'],
      'experience.sql': ['anubhav-portfolio', 'src', 'data'],
      'contact.ts': ['anubhav-portfolio', 'src', 'api'],
    };
    return pathMap[filename] || ['anubhav-portfolio', 'src'];
  };

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-editor)]">
        <div className="text-center text-[var(--text-muted)]">
          <div className="text-6xl mb-6 opacity-30">📝</div>
          <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">No Editor is Open</h2>
          <p className="text-sm mb-6">Open a file from the Explorer to start editing</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-3">
              <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] rounded border border-[var(--border-color)] text-xs">Ctrl+P</kbd>
              <span className="text-[var(--text-secondary)]">Go to File...</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] rounded border border-[var(--border-color)] text-xs">Ctrl+Shift+E</kbd>
              <span className="text-[var(--text-secondary)]">Show Explorer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-[var(--bg-editor)] min-w-0 min-h-0">
      {/* Tab Bar */}
      <div className="flex items-center bg-[var(--bg-secondary)] h-[35px] shrink-0">
        {/* Tabs */}
        <div className="flex-1 flex overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveFile(tab.name)}
              className={cn(
                "group flex items-center gap-2 px-3 h-[35px] cursor-pointer min-w-max text-[13px] border-t-2 shrink-0",
                tab.isActive 
                  ? "bg-[var(--bg-editor)] text-[var(--text-primary)] border-t-[var(--accent-primary)]" 
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border-t-transparent"
              )}
            >
              <FileIcon filename={tab.name} />
              <span className="max-w-[140px] truncate">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(tab.name);
                }}
                className={cn(
                  "p-0.5 rounded hover:bg-[var(--bg-tertiary)] ml-1",
                  tab.isActive ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                )}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Tab Actions */}
        <div className="flex items-center px-1 gap-0.5 h-full border-l border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <button className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]" title="Split Editor Right">
            <SplitSquareHorizontal size={14} />
          </button>
          <button className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]" title="More Actions">
            <Ellipsis size={14} />
          </button>
        </div>
      </div>

      {/* Breadcrumb - Hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-1 px-4 py-1 text-[13px] text-[var(--text-muted)] bg-[var(--bg-editor)] border-b border-[var(--border-color)] shrink-0 overflow-x-auto">
        {activeFile && getBreadcrumbPath(activeFile).map((part, idx, arr) => (
          <React.Fragment key={idx}>
            <span className="hover:text-[var(--text-primary)] cursor-pointer hover:underline whitespace-nowrap">{part}</span>
            {idx < arr.length - 1 && <ChevronRight size={14} className="opacity-50 shrink-0" />}
          </React.Fragment>
        ))}
        {activeFile && (
          <>
            <ChevronRight size={14} className="opacity-50 shrink-0" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <FileIcon filename={activeFile} />
              <span className="text-[var(--text-primary)]">{activeFile}</span>
            </div>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto relative" style={{ fontSize: `${fontSize}px` }}>
        <div className="flex min-h-full font-mono">
          {/* Line Numbers - Hidden on mobile */}
          {showLineNumbers && (
            <div className="hidden sm:block sticky left-0 bg-[var(--bg-editor)] text-[var(--text-line-number)] text-right pr-4 pl-4 select-none min-w-[60px] z-10">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="leading-6 h-6">{i + 1}</div>
              ))}
            </div>
          )}
          
          {/* Code Content - Editable */}
          <div className="flex-1 relative min-h-full">
            {isEditing || isUserFile ? (
              <textarea
                value={editableContent}
                onChange={handleContentChange}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                className="absolute inset-0 w-full h-full bg-transparent text-[var(--text-primary)] resize-none outline-none p-0 pl-2 leading-6 font-mono"
                style={{ fontSize: `${fontSize}px` }}
                spellCheck={false}
              />
            ) : (
              <div 
                className="py-0 pl-2 leading-6 overflow-x-auto cursor-text min-h-full"
                onClick={() => setIsEditing(true)}
              >
                <pre className="whitespace-pre-wrap break-words">
                  {highlightSyntax(content, activeFile || '')}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Minimap - Hidden on mobile */}
        {showMinimap && (
          <div className="hidden md:block absolute right-0 top-0 w-[100px] h-full bg-[var(--bg-editor)] border-l border-[var(--border-color)] overflow-hidden pointer-events-none">
            <div 
              className="text-[2px] leading-[3px] p-2 opacity-60"
              style={{ fontFamily: 'monospace' }}
            >
              {(editableContent || content).split('\n').slice(0, 100).map((line, idx) => (
                <div key={idx} className="truncate h-[3px]">
                  <span className="text-[var(--text-muted)]">{line.slice(0, 80)}</span>
                </div>
              ))}
            </div>
            {/* Viewport indicator */}
            <div 
              className="absolute right-1 top-0 w-[90px] h-[30px] bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-sm"
            />
          </div>
        )}
      </div>
    </section>
  );
}
