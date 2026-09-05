'use client';

import React from 'react';
import {
  FileText, FileJson, FileCode, FileType, Database, FileTerminal, Braces, Globe,
} from 'lucide-react';

// One icon map, shared by the explorer, the tab bar and the quick-open list —
// these used to be three separate copies that drifted apart.
const ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  md: { icon: FileText, color: '#519aba' },
  json: { icon: FileJson, color: '#cbcb41' },
  ts: { icon: FileCode, color: '#3178c6' },
  tsx: { icon: FileCode, color: '#3178c6' },
  js: { icon: FileCode, color: '#f7df1e' },
  jsx: { icon: FileCode, color: '#61dafb' },
  py: { icon: FileCode, color: '#3572a5' },
  c: { icon: FileCode, color: '#a8b9cc' },
  h: { icon: FileCode, color: '#a8b9cc' },
  cpp: { icon: FileCode, color: '#f34b7d' },
  java: { icon: FileCode, color: '#e76f00' },
  go: { icon: FileCode, color: '#00add8' },
  rs: { icon: FileCode, color: '#dea584' },
  html: { icon: Globe, color: '#e34c26' },
  css: { icon: Braces, color: '#563d7c' },
  sql: { icon: Database, color: '#e48e00' },
  sh: { icon: FileTerminal, color: '#89e051' },
  yaml: { icon: FileType, color: '#cb171e' },
  yml: { icon: FileType, color: '#cb171e' },
  gitignore: { icon: FileText, color: '#6d8086' },
};

export default function FileIcon({
  filename,
  size = 16,
  className,
}: {
  filename: string;
  size?: number;
  className?: string;
}) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const { icon: Icon, color } = ICONS[ext] ?? { icon: FileText, color: '#8b949e' };
  return <Icon size={size} className={className} style={{ color }} aria-hidden />;
}
