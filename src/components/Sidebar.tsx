'use client';

import React from 'react';
import { useEditorStore, TreeNode } from '@/store/editor';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileJson,
  FileCode,
  Database,
  FileType,
  Plus,
  FoldVertical,
  RefreshCw,
  Search,
  GitBranch,
  GitCommit,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Mail,
  MoreHorizontal,
  Ellipsis,
} from 'lucide-react';
import { portfolioData } from '@/data/portfolio';

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
  };

  const iconInfo = iconMap[ext || ''] || { icon: FileText, color: '#6d8086' };
  const Icon = iconInfo.icon;
  
  return <Icon size={16} className={className} style={{ color: iconInfo.color }} />;
};

const TreeItemComponent: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const { openFile, toggleFolder, activeFile } = useEditorStore();
  const isActive = node.type === 'file' && node.name === activeFile;

  const handleClick = () => {
    if (node.type === 'folder') {
      toggleFolder(node.path);
    } else {
      openFile(node.name);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1 py-[2px] cursor-pointer hover:bg-[var(--bg-hover)] text-[13px] text-[var(--text-primary)]",
          isActive && "bg-[var(--bg-selected)]"
        )}
        style={{ paddingLeft: `${depth * 8 + 8}px` }}
      >
        {node.type === 'folder' ? (
          <>
            {node.isOpen ? (
              <ChevronDown size={16} className="text-[var(--text-muted)] shrink-0" />
            ) : (
              <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
            )}
            {node.isOpen ? (
              <FolderOpen size={16} className="shrink-0 mr-1" style={{ color: '#dcb67a' }} />
            ) : (
              <Folder size={16} className="shrink-0 mr-1" style={{ color: '#dcb67a' }} />
            )}
          </>
        ) : (
          <>
            <span className="w-4 shrink-0" />
            <FileIcon filename={node.name} className="shrink-0 mr-1" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {node.type === 'folder' && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItemComponent key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Explorer Panel - VS Code style
const ExplorerPanel: React.FC = () => {
  const { fileTree, createFile, createFolder, openFile } = useEditorStore();
  const [isProjectOpen, setIsProjectOpen] = React.useState(true);
  const [isOutlineOpen, setIsOutlineOpen] = React.useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = React.useState(false);
  const [showNewFileInput, setShowNewFileInput] = React.useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState('');
  const [newFolderName, setNewFolderName] = React.useState('');
  const newFileInputRef = React.useRef<HTMLInputElement>(null);
  const newFolderInputRef = React.useRef<HTMLInputElement>(null);
  const fileUploadRef = React.useRef<HTMLInputElement>(null);
  const folderUploadRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (showNewFileInput && newFileInputRef.current) {
      newFileInputRef.current.focus();
    }
    if (showNewFolderInput && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [showNewFileInput, showNewFolderInput]);

  const handleNewFile = () => {
    setShowNewFileInput(true);
    setShowNewFolderInput(false);
  };

  const handleNewFolder = () => {
    setShowNewFolderInput(true);
    setShowNewFileInput(false);
  };

  const handleNewFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      createFile('/src', newFileName.trim());
      openFile(newFileName.trim());
      setNewFileName('');
      setShowNewFileInput(false);
    }
  };

  const handleNewFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder('/src', newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          createFile('/src', file.name);
          setTimeout(() => {
            useEditorStore.getState().updateFileContent(file.name, content);
            openFile(file.name);
          }, 100);
        };
        reader.readAsText(file);
      });
    }
    if (fileUploadRef.current) fileUploadRef.current.value = '';
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Get folder name from first file path
      const firstPath = files[0].webkitRelativePath;
      const folderName = firstPath.split('/')[0];
      createFolder('/src', folderName);
      
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          createFile(`/src/${folderName}`, file.name);
          setTimeout(() => {
            useEditorStore.getState().updateFileContent(file.name, content);
          }, 100);
        };
        reader.readAsText(file);
      });
      openFile(files[0].name);
    }
    if (folderUploadRef.current) folderUploadRef.current.value = '';
  };

  const handleNewFileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowNewFileInput(false);
      setNewFileName('');
    }
  };

  const handleNewFolderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowNewFolderInput(false);
      setNewFolderName('');
    }
  };

  const collapseAll = () => {
    const collapseInTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.type === 'folder' && node.name !== 'anubhav-portfolio') {
          return { ...node, isOpen: false, children: node.children ? collapseInTree(node.children) : undefined };
        }
        if (node.children) {
          return { ...node, children: collapseInTree(node.children) };
        }
        return node;
      });
    };
    useEditorStore.setState((state) => ({ fileTree: collapseInTree(state.fileTree) }));
  };

  const refreshTree = () => {
    // Simulate refresh - just toggle to show feedback
    setIsProjectOpen(false);
    setTimeout(() => setIsProjectOpen(true), 100);
  };

  return (
    <div className="flex flex-col h-full text-[var(--text-primary)]">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] shrink-0">
        <span>Explorer</span>
        <button className="p-0.5 hover:bg-[var(--bg-hover)] rounded opacity-60 hover:opacity-100">
          <Ellipsis size={16} />
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Project Section Header */}
        <div 
          className="flex items-center justify-between px-2 py-[5px] cursor-pointer hover:bg-[var(--bg-hover)] select-none sticky top-0 bg-[var(--bg-sidebar)] z-10"
          onClick={() => setIsProjectOpen(!isProjectOpen)}
        >
          <div className="flex items-center gap-0.5 min-w-0">
            {isProjectOpen ? <ChevronDown size={18} className="shrink-0" /> : <ChevronRight size={18} className="shrink-0" />}
            <span className="text-[11px] font-semibold uppercase tracking-wide truncate">ANUBHAV-PORTFOLIO</span>
          </div>
          {isProjectOpen && (
            <div className="flex gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button 
                onClick={handleNewFile}
                className="p-0.5 hover:bg-[var(--bg-tertiary)] rounded opacity-60 hover:opacity-100" 
                title="New File"
              >
                <Plus size={16} />
              </button>
              <button 
                onClick={handleNewFolder}
                className="p-0.5 hover:bg-[var(--bg-tertiary)] rounded opacity-60 hover:opacity-100" 
                title="New Folder"
              >
                <FoldVertical size={16} />
              </button>
              <button 
                onClick={refreshTree}
                className="p-0.5 hover:bg-[var(--bg-tertiary)] rounded opacity-60 hover:opacity-100" 
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
              <button 
                onClick={collapseAll}
                className="p-0.5 hover:bg-[var(--bg-tertiary)] rounded opacity-60 hover:opacity-100" 
                title="Collapse All"
              >
                <FoldVertical size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* File Tree */}
        {isProjectOpen && (
          <div className="text-[13px]">
            {/* Hidden File Inputs */}
            <input 
              type="file" 
              ref={fileUploadRef} 
              className="hidden" 
              onChange={handleFileUpload}
              multiple
              accept=".js,.jsx,.ts,.tsx,.json,.md,.css,.html,.py,.sql,.yaml,.yml,.txt"
            />
            <input 
              type="file" 
              ref={folderUploadRef} 
              className="hidden" 
              onChange={handleFolderUpload}
              multiple
            />
            
            {/* New File Input */}
            {showNewFileInput && (
              <form onSubmit={handleNewFileSubmit} className="px-6 py-1">
                <input
                  ref={newFileInputRef}
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={handleNewFileKeyDown}
                  onBlur={() => {
                    if (!newFileName.trim()) {
                      setShowNewFileInput(false);
                    }
                  }}
                  placeholder="filename.js"
                  className="w-full px-2 py-1 text-[13px] bg-[var(--bg-tertiary)] border border-[var(--accent-primary)] rounded outline-none text-[var(--text-primary)]"
                />
              </form>
            )}
            
            {/* New Folder Input */}
            {showNewFolderInput && (
              <form onSubmit={handleNewFolderSubmit} className="px-6 py-1">
                <input
                  ref={newFolderInputRef}
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleNewFolderKeyDown}
                  onBlur={() => {
                    if (!newFolderName.trim()) {
                      setShowNewFolderInput(false);
                    }
                  }}
                  placeholder="folder-name"
                  className="w-full px-2 py-1 text-[13px] bg-[var(--bg-tertiary)] border border-[var(--accent-primary)] rounded outline-none text-[var(--text-primary)]"
                />
              </form>
            )}
            
            {fileTree[0]?.children?.map((node) => (
              <TreeItemComponent key={node.id} node={node} depth={0} />
            ))}
          </div>
        )}

        {/* Outline Section */}
        <div 
          className="flex items-center gap-0.5 px-2 py-[5px] cursor-pointer hover:bg-[var(--bg-hover)] select-none sticky top-0 bg-[var(--bg-sidebar)] z-10 mt-1"
          onClick={() => setIsOutlineOpen(!isOutlineOpen)}
        >
          {isOutlineOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="text-[11px] font-semibold uppercase tracking-wide">OUTLINE</span>
        </div>
        {isOutlineOpen && (
          <div className="px-6 py-2 text-[var(--text-muted)] text-[12px]">
            No symbols found in &apos;README.md&apos;
          </div>
        )}

        {/* Timeline Section */}
        <div 
          className="flex items-center gap-0.5 px-2 py-[5px] cursor-pointer hover:bg-[var(--bg-hover)] select-none sticky top-0 bg-[var(--bg-sidebar)] z-10"
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
        >
          {isTimelineOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="text-[11px] font-semibold uppercase tracking-wide">TIMELINE</span>
        </div>
        {isTimelineOpen && (
          <div className="px-6 py-2 text-[var(--text-muted)] text-[12px]">
            Timeline: README.md
          </div>
        )}
      </div>
    </div>
  );
};

// Search Panel
const SearchPanel: React.FC = () => {
  const [query, setQuery] = React.useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider">SEARCH</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded px-3 py-2 border border-[var(--border-color)] focus-within:border-[var(--accent-primary)]">
          <Search size={14} className="text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search portfolio..."
            className="flex-1 bg-transparent outline-none text-sm text-[var(--text-primary)]"
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3 px-1">
          Try searching for "projects", "skills", or ask a question!
        </p>
      </div>
    </div>
  );
};

// Git Panel
const GitPanel: React.FC = () => {
  const { github, recentActivity } = portfolioData;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider">SOURCE CONTROL</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <GitCommit size={16} className="text-[var(--accent-tertiary)]" />
            <span>{github.contributions} contributions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GitBranch size={16} className="text-[var(--accent-tertiary)]" />
            <span>{github.repositories} repos</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] mb-2">Recent Activity</h4>
          <div className="space-y-2">
            {recentActivity.slice(0, 4).map((activity, idx) => (
              <div key={idx} className="text-xs text-[var(--text-secondary)] p-2 bg-[var(--bg-tertiary)] rounded">
                {activity.type === 'commits' ? (
                  <span>{activity.count} commits to <span className="text-[var(--accent-primary)]">{activity.repo}</span></span>
                ) : (
                  <span>PR: {activity.title}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <a 
          href={portfolioData.contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--accent-primary)] text-white rounded hover:bg-[var(--accent-secondary)] transition-colors text-sm"
        >
          <Github size={16} />
          View GitHub Profile
        </a>
      </div>
    </div>
  );
};

// Extensions Panel
const ExtensionsPanel: React.FC = () => {
  const extensions = [
    { id: 'resume', name: 'Resume Download', description: 'Download PDF resume', installed: true, icon: '📄' },
    { id: 'github', name: 'GitHub Integration', description: 'View GitHub activity', installed: true, icon: '🐙' },
    { id: 'theme', name: 'Theme Switcher', description: 'Dark/Light mode', installed: true, icon: '🎨' },
    { id: 'ai', name: 'AI Assistant', description: 'Powered by Gemini', installed: true, icon: '🤖' },
    { id: 'contact', name: 'Contact Form', description: 'Send direct messages', installed: false, icon: '✉️' },
    { id: 'analytics', name: 'Analytics', description: 'View portfolio stats', installed: false, icon: '📊' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider">EXTENSIONS</span>
      </div>
      <div className="p-3">
        <input
          type="text"
          placeholder="Search extensions..."
          className="w-full bg-[var(--bg-tertiary)] rounded px-3 py-2 border border-[var(--border-color)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] mb-2">INSTALLED</h4>
          {extensions.filter(e => e.installed).map((ext) => (
            <div key={ext.id} className="flex items-start gap-3 p-2 hover:bg-[var(--bg-hover)] rounded cursor-pointer mb-1">
              <span className="text-xl">{ext.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)]">{ext.name}</div>
                <div className="text-xs text-[var(--text-muted)] truncate">{ext.description}</div>
              </div>
              <span className="text-xs text-[var(--accent-tertiary)]">✓</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] mb-2">RECOMMENDED</h4>
          {extensions.filter(e => !e.installed).map((ext) => (
            <div key={ext.id} className="flex items-start gap-3 p-2 hover:bg-[var(--bg-hover)] rounded cursor-pointer mb-1">
              <span className="text-xl">{ext.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)]">{ext.name}</div>
                <div className="text-xs text-[var(--text-muted)] truncate">{ext.description}</div>
              </div>
              <button className="text-xs bg-[var(--accent-primary)] text-white px-2 py-1 rounded hover:bg-[var(--accent-secondary)]">
                Install
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AI Panel
const AIPanel: React.FC = () => {
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: "Hi! I'm your AI assistant powered by Gemini. Ask me anything about Anubhav's portfolio, skills, or projects!" }
  ]);
  const [input, setInput] = React.useState('');

  const suggestions = [
    "What are Anubhav's skills?",
    "Tell me about ARGON OS",
    "What projects has he built?",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider">AI ASSISTANT</span>
        <span className="text-xs bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded animate-pulse-glow">Gemini</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn(
            "flex gap-3",
            msg.role === 'user' && "flex-row-reverse"
          )}>
            <div className={cn(
              "w-8 h-8 rounded flex items-center justify-center flex-shrink-0",
              msg.role === 'assistant' ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-tertiary)]"
            )}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className={cn(
              "max-w-[80%] p-3 rounded-lg text-sm",
              msg.role === 'assistant' ? "bg-[var(--bg-tertiary)]" : "bg-[var(--accent-primary)] text-white"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex gap-2 mb-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Anubhav's experience..."
            className="flex-1 bg-[var(--bg-tertiary)] rounded px-3 py-2 border border-[var(--border-color)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-none"
            rows={2}
          />
          <button className="px-4 bg-[var(--accent-primary)] text-white rounded hover:bg-[var(--accent-secondary)] transition-colors">
            Send
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setInput(s)}
              className="text-xs px-2 py-1 bg-[var(--bg-tertiary)] rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Account Panel
const AccountPanel: React.FC = () => {
  const { personal, contact } = portfolioData;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider">ACCOUNT</span>
      </div>
      <div className="p-4">
        <div className="text-center mb-6">
          <img
            src={personal.avatar}
            alt={personal.name}
            className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-[var(--accent-primary)] animate-float-subtle"
          />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{personal.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{personal.title.split('|')[0].trim()}</p>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <a href={contact.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--bg-tertiary)] rounded-full hover:bg-[var(--bg-hover)] transition-colors">
            <Github size={20} className="text-[var(--text-primary)]" />
          </a>
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--bg-tertiary)] rounded-full hover:bg-[var(--bg-hover)] transition-colors">
            <Linkedin size={20} className="text-[#0077b5]" />
          </a>
          <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--bg-tertiary)] rounded-full hover:bg-[var(--bg-hover)] transition-colors">
            <Twitter size={20} className="text-[#1da1f2]" />
          </a>
          <a href={`mailto:${contact.email}`} className="p-2 bg-[var(--bg-tertiary)] rounded-full hover:bg-[var(--bg-hover)] transition-colors">
            <Mail size={20} className="text-[var(--text-primary)]" />
          </a>
        </div>
        <div className="text-center text-sm text-[var(--text-secondary)]">
          <p>{personal.education.degree} @ {personal.education.university}</p>
          <p className="text-[var(--accent-tertiary)]">{personal.education.status}</p>
        </div>
      </div>
    </div>
  );
};

// Main Sidebar Component
export default function Sidebar() {
  const { sidebarPanel, sidebarOpen } = useEditorStore();
  const [width, setWidth] = React.useState(260);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = e.clientX - 48; // 48 is activity bar width
      setWidth(Math.max(180, Math.min(500, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!sidebarOpen) return null;

  return (
    <aside 
      className="bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col overflow-hidden relative h-full"
      style={{ 
        width: isMobile ? '280px' : `${width}px`, 
        minWidth: isMobile ? '280px' : '180px', 
        maxWidth: isMobile ? '85vw' : '500px' 
      }}
    >
      {sidebarPanel === 'explorer' && <ExplorerPanel />}
      {sidebarPanel === 'search' && <SearchPanel />}
      {sidebarPanel === 'git' && <GitPanel />}
      {sidebarPanel === 'extensions' && <ExtensionsPanel />}
      {sidebarPanel === 'ai' && <AIPanel />}
      {sidebarPanel === 'account' && <AccountPanel />}
      
      {/* Resize Handle - Hidden on mobile */}
      {!isMobile && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[var(--accent-primary)] transition-colors z-10"
          onMouseDown={() => setIsDragging(true)}
        />
      )}
    </aside>
  );
}
