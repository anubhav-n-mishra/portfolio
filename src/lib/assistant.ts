// A local, deterministic answering engine for the sidebar assistant.
//
// The previous panel imported a Gemini client that needed an API key. On a static
// export there is nowhere to keep that key, so the panel shipped with a Send button
// that did nothing. This answers from portfolioData instead: no key, no network,
// no request that can fail, and it cannot invent a project that does not exist.

import { portfolioData } from '@/data/portfolio';

export interface Answer {
  text: string;
  /** Files worth opening alongside the answer. */
  files?: string[];
  links?: { label: string; url: string }[];
}

const { personal, contact, products, projects, skills, currentFocus, impact, stackLayers } =
  portfolioData;

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'what', 'which',
  'who', 'whom', 'how', 'why', 'when', 'where', 'can', 'could', 'would', 'should',
  'tell', 'me', 'about', 'your', 'you', 'his', 'him', 'he', 'they', 'their', 'of',
  'in', 'on', 'at', 'to', 'for', 'with', 'and', 'or', 'it', 'this', 'that', 'have',
  'has', 'had', 'any', 'some', 'more', 'most', 'anubhav', 'mishra', 'please',
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function bullets(items: string[], limit = 6): string {
  return items.slice(0, limit).map((i) => `• ${i}`).join('\n');
}

/* ------------------------------------------------------------------ *
 * Intent handlers, checked in order.
 * ------------------------------------------------------------------ */

interface Intent {
  match: RegExp;
  answer: () => Answer;
}

const INTENTS: Intent[] = [
  {
    match: /\b(hi|hello|hey|yo|sup)\b/,
    answer: () => ({
      text: `Hello. I answer questions about ${personal.name}'s work using only what is in this portfolio — no network calls, so nothing here is invented.\n\nTry asking about a product, a language, the operating system, or how to get in touch.`,
    }),
  },
  {
    match: /\b(who|about|yourself|bio|background|intro)\b/,
    answer: () => ({
      text: `${personal.name} — ${personal.title}, based in ${personal.location}.\n\n${personal.bio}\n\n${personal.education.degree}, ${personal.education.university} (${personal.education.status}).`,
      files: ['about.md', 'README.md'],
    }),
  },
  {
    match: /\b(product|shipped|production|live|launch|users|customers)\b/,
    answer: () => ({
      text:
        `${products.filter((p) => p.url).length} products are live in production right now:\n\n` +
        products
          .map((p) => `• ${p.name} — ${p.tagline}${p.url ? `\n  ${p.url}` : ''}`)
          .join('\n') +
        `\n\nAsk about any one of them by name for the engineering detail.`,
      files: ['products.json'],
    }),
  },
  {
    match: /\b(project|portfolio|built|build|work|repo|github)\b/,
    answer: () => ({
      text:
        `Selected engineering work:\n\n` +
        projects
          .filter((p) => p.featured)
          .map((p) => `• ${p.name} (${p.category}) — ${p.description}`)
          .join('\n\n') +
        `\n\n${portfolioData.github.repositories} public repositories in total.`,
      files: ['projects.json'],
      links: [{ label: 'GitHub', url: contact.github }],
    }),
  },
  {
    match: /\b(skill|stack|tech|language|framework|know|experience with|good at)\b/,
    answer: () => ({
      text:
        `${skills.confident.label}:\n${bullets(skills.confident.items, 12)}\n\n` +
        `${skills.shipped.label}:\n${bullets(skills.shipped.items, 17)}\n\n` +
        `${skills.learning.label}:\n${bullets(skills.learning.items, 4)}`,
      files: ['stack.md'],
    }),
  },
  {
    match: /\b(contact|email|reach|hire|hiring|available|availability|freelance|job|role)\b/,
    answer: () => ({
      text:
        `${personal.availability}.\n\n` +
        `Email     ${contact.email}\nGitHub    ${contact.github}\nLinkedIn  ${contact.linkedin}\nWeb       ${contact.website}\n\n` +
        `${personal.location} · ${personal.timezone}. ${personal.overlap}. ${personal.responseTime}.`,
      files: ['contact.ts'],
      links: [
        { label: 'Email', url: `mailto:${contact.email}` },
        { label: 'LinkedIn', url: contact.linkedin },
      ],
    }),
  },
  {
    match: /\b(education|degree|study|university|college|graduate|school)\b/,
    answer: () => ({
      text: `${personal.education.degree}\n${personal.education.university} — ${personal.education.status}\n\nThe systems work (an x86 kernel, an LLVM-backed compiler) came out of that period and is still the part of the CV that separates it from most web-only profiles.`,
    }),
  },
  {
    match: /\b(now|currently|working on|next|roadmap|focus)\b/,
    answer: () => ({
      text: `Right now:\n\n${bullets(currentFocus, 6)}`,
    }),
  },
  {
    match: /\b(run|execute|terminal|code runner|playground|ide)\b/,
    answer: () => ({
      text:
        `This IDE actually runs code.\n\n` +
        `• JavaScript and TypeScript execute in a sandboxed Web Worker, locally.\n` +
        `• Python is real CPython compiled to WebAssembly, also local.\n` +
        `• C, C++, Java, Go and Rust compile in a remote sandbox.\n` +
        `• HTML renders live in the Simple Browser.\n\n` +
        `Open anything in playground/, then press the ▶ button or Ctrl+Enter. Editing the file first works — you are running your own code, not a recording.`,
      files: ['hello.js', 'fizzbuzz.py', 'two-sum.cpp'],
    }),
  },
  {
    match: /\b(impact|numbers|metrics|scale|stats)\b/,
    answer: () => ({
      text: `Numbers that are checkable from the repositories themselves:\n\n${bullets(
        impact.map((i) => `${i.value} — ${i.label}`),
        impact.length
      )}`,
    }),
  },
  {
    match: /\b(layer|low.?level|bootloader|kernel|full.?stack|range|breadth)\b/,
    answer: () => ({
      text:
        `Six layers, bottom to top:\n\n${bullets(
          stackLayers.map((l) => `${l.layer} — ${l.detail}`),
          stackLayers.length
        )}\n\n${personal.pitch}`,
    }),
  },
];

/* ------------------------------------------------------------------ *
 * Entity lookup — a product or project named directly wins over intent.
 * ------------------------------------------------------------------ */

function findEntity(question: string): Answer | null {
  const q = question.toLowerCase();

  for (const p of products) {
    const alias = p.name.toLowerCase();
    if (q.includes(alias) || q.includes(p.id)) {
      return {
        text:
          `${p.name} — ${p.tagline}\n\n${p.description}\n\n` +
          `What makes it interesting:\n${bullets(p.highlights, p.highlights.length)}\n\n` +
          `Stack: ${p.tech.join(', ')}` +
          (p.url ? `\nLive: ${p.url}${p.note ? ` (${p.note})` : ''}` : ''),
        files: ['products.json'],
        links: p.url ? [{ label: `Open ${p.name}`, url: p.url }] : undefined,
      };
    }
  }

  for (const p of projects) {
    const alias = p.name.toLowerCase();
    if (q.includes(alias) || q.includes(p.id.replace(/-/g, ' '))) {
      return {
        text:
          `${p.name} (${p.category})\n\n${p.longDescription ?? p.description}\n\n` +
          `Highlights:\n${bullets(p.highlights, p.highlights.length)}\n\n` +
          `Stack: ${p.tech.join(', ')}${p.stars ? `\n★ ${p.stars} on GitHub` : ''}`,
        files: ['projects.json'],
        links: [{ label: 'Repository', url: p.repo }],
      };
    }
  }

  return null;
}

/* ------------------------------------------------------------------ *
 * Relevance fallback — score everything, return the best matches.
 * ------------------------------------------------------------------ */

function searchFallback(question: string): Answer {
  const words = tokens(question);

  if (words.length === 0) {
    return {
      text: `Ask me about a product, a project, the stack, how the code runner works, or how to get in touch.`,
    };
  }

  const scored: { label: string; body: string; score: number }[] = [];

  const score = (haystack: string) => {
    const hay = haystack.toLowerCase();
    return words.reduce((total, w) => total + (hay.includes(w) ? w.length : 0), 0);
  };

  for (const p of products) {
    scored.push({
      label: p.name,
      body: `${p.name} — ${p.tagline}\n${p.description}`,
      score: score(`${p.name} ${p.tagline} ${p.description} ${p.tech.join(' ')} ${p.highlights.join(' ')}`),
    });
  }
  for (const p of projects) {
    scored.push({
      label: p.name,
      body: `${p.name} — ${p.description}\nStack: ${p.tech.join(', ')}`,
      score: score(`${p.name} ${p.description} ${p.tech.join(' ')} ${p.category} ${p.highlights.join(' ')}`),
    });
  }

  const hits = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

  if (hits.length === 0) {
    return {
      text:
        `I only know what is in this portfolio, and nothing in it matches that.\n\n` +
        `Things I can answer well:\n` +
        bullets([
          'Any product by name — Terra, Hive, Yaps, Yuitility, Phexara, Pathshala, Seva Sankul',
          'Any project by name — ARGON OS, GRAN, QRiftly, XTTS Voice API, Insight Engine',
          'The stack, sorted by how confident he is in each part',
          'How this IDE runs code',
          'How to get in touch',
        ], 5),
    };
  }

  return {
    text:
      `Closest matches for that:\n\n` +
      hits.map((h) => h.body).join('\n\n') +
      `\n\nAsk about any of them by name for the full detail.`,
  };
}

/** Answers a question about the portfolio, entirely offline. */
export function ask(question: string): Answer {
  const trimmed = question.trim();
  if (!trimmed) {
    return { text: 'Ask me something about the work.' };
  }

  // A named product or project is the most specific possible match.
  const entity = findEntity(trimmed);
  if (entity) return entity;

  const lower = trimmed.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.match.test(lower)) return intent.answer();
  }

  return searchFallback(trimmed);
}

export const SUGGESTED_QUESTIONS = [
  'What is live in production?',
  'Tell me about Terra',
  'How does ARGON OS work?',
  'What is he strongest at?',
  'Can I really run code here?',
  'How do I get in touch?',
];
