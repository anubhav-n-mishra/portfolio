// A small, safe syntax highlighter.
//
// The previous implementation built an HTML string and handed it to
// dangerouslySetInnerHTML, which meant any '<' in a file was parsed as markup —
// so every .tsx sample rendered as live elements instead of code, and file
// content became an injection vector. This tokenises instead: the output is
// plain text plus a class name, and React does the escaping.

export interface Token {
  text: string;
  cls?: string;
}

export type Line = Token[];

const KEYWORDS: Record<string, string[]> = {
  js: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'class', 'extends', 'new', 'this', 'super',
    'import', 'from', 'export', 'default', 'async', 'await', 'try', 'catch', 'finally',
    'throw', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'yield', 'static',
    'get', 'set', 'null', 'undefined', 'true', 'false',
  ],
  ts: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'class', 'extends', 'implements', 'new',
    'this', 'super', 'import', 'from', 'export', 'default', 'async', 'await', 'try',
    'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void',
    'yield', 'static', 'get', 'set', 'null', 'undefined', 'true', 'false',
    'interface', 'type', 'enum', 'namespace', 'declare', 'readonly', 'private',
    'public', 'protected', 'abstract', 'as', 'satisfies', 'keyof', 'infer', 'is',
  ],
  py: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue',
    'class', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with',
    'lambda', 'yield', 'global', 'nonlocal', 'pass', 'assert', 'del', 'and', 'or',
    'not', 'in', 'is', 'None', 'True', 'False', 'async', 'await', 'self',
  ],
  c: [
    'int', 'char', 'void', 'float', 'double', 'long', 'short', 'signed', 'unsigned',
    'struct', 'union', 'enum', 'typedef', 'static', 'const', 'volatile', 'extern',
    'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
    'break', 'continue', 'goto', 'sizeof', 'inline', 'register',
  ],
  cpp: [
    'int', 'char', 'void', 'float', 'double', 'long', 'short', 'signed', 'unsigned',
    'bool', 'auto', 'struct', 'union', 'enum', 'typedef', 'static', 'const',
    'constexpr', 'volatile', 'extern', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'default', 'break', 'continue', 'goto', 'sizeof', 'class',
    'public', 'private', 'protected', 'virtual', 'override', 'template', 'typename',
    'namespace', 'using', 'new', 'delete', 'this', 'nullptr', 'true', 'false',
    'try', 'catch', 'throw', 'operator', 'friend', 'explicit', 'inline', 'static_cast',
  ],
  java: [
    'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements',
    'static', 'final', 'void', 'int', 'long', 'double', 'float', 'boolean', 'char',
    'new', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package',
    'this', 'super', 'null', 'true', 'false', 'abstract', 'synchronized',
  ],
  go: [
    'func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'map',
    'chan', 'go', 'defer', 'return', 'if', 'else', 'for', 'range', 'switch', 'case',
    'default', 'break', 'continue', 'nil', 'true', 'false', 'make', 'new',
  ],
  rs: [
    'fn', 'let', 'mut', 'const', 'static', 'struct', 'enum', 'impl', 'trait', 'pub',
    'use', 'mod', 'match', 'if', 'else', 'for', 'while', 'loop', 'return', 'break',
    'continue', 'self', 'Self', 'where', 'as', 'ref', 'move', 'dyn', 'async', 'await',
    'true', 'false', 'None', 'Some', 'Ok', 'Err',
  ],
};

type Family = 'js' | 'ts' | 'py' | 'c' | 'cpp' | 'java' | 'go' | 'rs' | 'json' | 'md' | 'css' | 'html' | 'plain';

export function familyFor(filename: string): Family {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'js': case 'jsx': case 'mjs': case 'cjs': return 'js';
    case 'ts': case 'tsx': return 'ts';
    case 'py': return 'py';
    case 'c': case 'h': return 'c';
    case 'cpp': case 'cc': case 'cxx': case 'hpp': return 'cpp';
    case 'java': return 'java';
    case 'go': return 'go';
    case 'rs': return 'rs';
    case 'json': return 'json';
    case 'md': return 'md';
    case 'css': return 'css';
    case 'html': case 'htm': return 'html';
    default: return 'plain';
  }
}

const LINE_COMMENT: Partial<Record<Family, string>> = {
  js: '//', ts: '//', c: '//', cpp: '//', java: '//', go: '//', rs: '//', py: '#', css: '',
};

/** Languages that use /* ... *\/ block comments. */
const BLOCK_COMMENT: Family[] = ['js', 'ts', 'c', 'cpp', 'java', 'go', 'rs', 'css'];

interface ScanState {
  inBlock: boolean;
}

function scanCode(line: string, family: Family, state: ScanState): Line {
  const tokens: Line = [];
  const keywords = new Set(KEYWORDS[family] ?? []);
  const lineComment = LINE_COMMENT[family];
  const supportsBlock = BLOCK_COMMENT.includes(family);
  let i = 0;
  let plain = '';

  const flush = () => {
    if (plain) {
      tokens.push({ text: plain });
      plain = '';
    }
  };
  const push = (text: string, cls: string) => {
    flush();
    tokens.push({ text, cls });
  };

  while (i < line.length) {
    // Inside a block comment that opened on an earlier line.
    if (state.inBlock) {
      const end = line.indexOf('*/', i);
      if (end === -1) {
        push(line.slice(i), 'tok-comment');
        return tokens;
      }
      push(line.slice(i, end + 2), 'tok-comment');
      state.inBlock = false;
      i = end + 2;
      continue;
    }

    const rest = line.slice(i);

    if (supportsBlock && rest.startsWith('/*')) {
      const end = line.indexOf('*/', i + 2);
      if (end === -1) {
        push(rest, 'tok-comment');
        state.inBlock = true;
        return tokens;
      }
      push(line.slice(i, end + 2), 'tok-comment');
      i = end + 2;
      continue;
    }

    if (lineComment && rest.startsWith(lineComment)) {
      push(rest, 'tok-comment');
      return tokens;
    }

    // Python docstrings / triple-quoted blocks, treated as one-line spans.
    const ch = line[i];

    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === ch) { j++; break; }
        j++;
      }
      push(line.slice(i, j), 'tok-string');
      i = j;
      continue;
    }

    // Preprocessor / attribute lines.
    if (ch === '#' && (family === 'c' || family === 'cpp') && line.slice(0, i).trim() === '') {
      const spaceIdx = line.indexOf(' ', i);
      const end = spaceIdx === -1 ? line.length : spaceIdx;
      push(line.slice(i, end), 'tok-keyword');
      i = end;
      continue;
    }

    if (/[0-9]/.test(ch) && !/[A-Za-z_$]/.test(line[i - 1] ?? '')) {
      const match = /^[0-9][0-9_]*(\.[0-9]+)?([eE][+-]?[0-9]+)?[a-zA-Z]*/.exec(rest);
      if (match) {
        push(match[0], 'tok-number');
        i += match[0].length;
        continue;
      }
    }

    if (/[A-Za-z_$]/.test(ch)) {
      const match = /^[A-Za-z_$][\w$]*/.exec(rest)!;
      const word = match[0];
      const after = line.slice(i + word.length);
      if (keywords.has(word)) {
        push(word, 'tok-keyword');
      } else if (/^\s*\(/.test(after)) {
        push(word, 'tok-function');
      } else if (/^[A-Z]/.test(word)) {
        push(word, 'tok-type');
      } else {
        plain += word;
      }
      i += word.length;
      continue;
    }

    plain += ch;
    i++;
  }

  flush();
  return tokens;
}

function scanJson(line: string): Line {
  const tokens: Line = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push({ text: line.slice(last, m.index) });
    if (m[1]) {
      // A string followed by a colon is a key, not a value.
      tokens.push({ text: m[1], cls: m[2] ? 'tok-property' : 'tok-string' });
      if (m[2]) tokens.push({ text: m[2] });
    } else if (m[3]) {
      tokens.push({ text: m[3], cls: 'tok-number' });
    } else if (m[4]) {
      tokens.push({ text: m[4], cls: 'tok-keyword' });
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
}

function scanMarkdown(line: string, state: ScanState): Line {
  if (line.trimStart().startsWith('```')) {
    state.inBlock = !state.inBlock;
    return [{ text: line, cls: 'tok-comment' }];
  }
  if (state.inBlock) return [{ text: line, cls: 'tok-string' }];

  const heading = /^(#{1,6})\s+(.*)$/.exec(line);
  if (heading) {
    return [
      { text: heading[1] + ' ', cls: 'tok-keyword' },
      { text: heading[2], cls: 'tok-heading' },
    ];
  }
  if (/^\s*>/.test(line)) return [{ text: line, cls: 'tok-comment' }];
  if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
    const m = /^(\s*(?:[-*]|\d+\.)\s+)(.*)$/.exec(line)!;
    return [{ text: m[1], cls: 'tok-keyword' }, ...scanInlineMarkdown(m[2])];
  }
  if (/^\s*\|/.test(line)) return [{ text: line, cls: 'tok-property' }];
  if (/^-{3,}$/.test(line.trim())) return [{ text: line, cls: 'tok-comment' }];
  return scanInlineMarkdown(line);
}

function scanInlineMarkdown(text: string): Line {
  const tokens: Line = [];
  const re = /(\*\*[^*]+\*\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(https?:\/\/\S+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ text: text.slice(last, m.index) });
    if (m[1]) tokens.push({ text: m[1], cls: 'tok-strong' });
    else if (m[2]) tokens.push({ text: m[2], cls: 'tok-function' });
    else if (m[3]) tokens.push({ text: m[3], cls: 'tok-string' });
    else if (m[4]) tokens.push({ text: m[4], cls: 'tok-link' });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last) });
  return tokens;
}

function scanHtml(line: string): Line {
  const tokens: Line = [];
  const re = /(<\/?[A-Za-z][\w-]*)|(\/?>)|([A-Za-z-]+)(=)("[^"]*"|'[^']*')|(<!--.*?-->)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push({ text: line.slice(last, m.index) });
    if (m[1]) tokens.push({ text: m[1], cls: 'tok-keyword' });
    else if (m[2]) tokens.push({ text: m[2], cls: 'tok-keyword' });
    else if (m[3]) {
      tokens.push({ text: m[3], cls: 'tok-property' });
      tokens.push({ text: m[4] });
      tokens.push({ text: m[5], cls: 'tok-string' });
    } else if (m[6]) tokens.push({ text: m[6], cls: 'tok-comment' });
    last = m.index + m[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
}

function scanCss(line: string, state: ScanState): Line {
  if (state.inBlock) {
    const end = line.indexOf('*/');
    if (end === -1) return [{ text: line, cls: 'tok-comment' }];
    state.inBlock = false;
    return [
      { text: line.slice(0, end + 2), cls: 'tok-comment' },
      ...scanCss(line.slice(end + 2), state),
    ];
  }
  const open = line.indexOf('/*');
  if (open !== -1 && line.indexOf('*/', open) === -1) {
    state.inBlock = true;
    return [{ text: line.slice(0, open) }, { text: line.slice(open), cls: 'tok-comment' }];
  }

  const decl = /^(\s*)([-\w]+)(\s*:\s*)(.+?)(;?)$/.exec(line);
  if (decl) {
    return [
      { text: decl[1] },
      { text: decl[2], cls: 'tok-property' },
      { text: decl[3] },
      { text: decl[4], cls: 'tok-string' },
      { text: decl[5] },
    ];
  }
  if (/[{}]/.test(line)) return [{ text: line, cls: 'tok-type' }];
  return [{ text: line }];
}

/** Splits source into per-line token arrays, carrying block state across lines. */
export function highlight(code: string, filename: string): Line[] {
  const family = familyFor(filename);
  const state: ScanState = { inBlock: false };

  return code.split('\n').map((line) => {
    if (line === '') return [];
    switch (family) {
      case 'json': return scanJson(line);
      case 'md': return scanMarkdown(line, state);
      case 'html': return scanHtml(line);
      case 'css': return scanCss(line, state);
      case 'plain': return [{ text: line }];
      default: return scanCode(line, family, state);
    }
  });
}
