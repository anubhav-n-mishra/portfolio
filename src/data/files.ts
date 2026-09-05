// The virtual filesystem shown in the IDE.
//
// Two kinds of file live here:
//   - content files, generated from portfolioData so they can never drift out of sync
//   - playground files, which are real programs the visitor can actually execute
//
import { portfolioData } from './portfolio';

const { personal, contact, products, projects, skills, currentFocus, impact, stackLayers } =
  portfolioData;

/* ------------------------------------------------------------------ *
 * Generated content files
 * ------------------------------------------------------------------ */

const readme = `# ${personal.name}

**${personal.title}** — ${personal.subtitle}
${personal.location} · ${personal.timezone}

${personal.tagline}

## At a glance

${impact.map((i) => `- **${i.value}** — ${i.label}`).join('\n')}

## Live in production

Things you can go and look at right now — not demos, not screenshots.

${products
  .filter((p) => p.url)
  .map((p) => `- **${p.name}** — ${p.tagline}\n  ${p.url}${p.note ? ` _(${p.note})_` : ''}`)
  .join('\n')}

## Where I actually work

${stackLayers.map((l) => `- **${l.layer}** — ${l.detail}`).join('\n')}

> ${personal.pitch.replace(/\n/g, '\n> ')}

## Right now

${currentFocus.map((f) => `- ${f}`).join('\n')}

## Reach me

- Email: ${contact.email}
- GitHub: ${contact.githubUser}
- LinkedIn: linkedin.com/in/anubhav-mishra0
- Web: ${contact.website}

---

_${personal.availability}. ${personal.overlap}. ${personal.responseTime}._
`;

const about = `# About

${personal.bio}

## Education

${personal.education.degree}
${personal.education.university} — ${personal.education.status}

## What I like working on

${portfolioData.interests.map((i) => `- ${i}`).join('\n')}

## How I work

I care about the layer where correctness is actually enforced. A permission that lives
in a React component is a suggestion; the same rule as a row-level-security policy is a
guarantee. Most of the interesting decisions in the products below come from taking that
seriously — and from being honest in the repo about what is built and what is not.
`;

const stack = `# Stack, sorted honestly

## ${skills.confident.label}

${skills.confident.items.map((s) => `- ${s}`).join('\n')}

## ${skills.shipped.label}

${skills.shipped.items.map((s) => `- ${s}`).join('\n')}

## ${skills.learning.label}

${skills.learning.items.map((s) => `- ${s}`).join('\n')}
`;

const productsJson = JSON.stringify(
  products.map((p) => ({
    name: p.name,
    tagline: p.tagline,
    status: p.status,
    url: p.url ?? null,
    tech: p.tech,
    highlights: p.highlights,
  })),
  null,
  2
);

const projectsJson = JSON.stringify(
  projects.map((p) => ({
    name: p.name,
    category: p.category,
    description: p.description,
    tech: p.tech,
    repo: p.repo,
    stars: p.stars ?? 0,
    featured: p.featured,
  })),
  null,
  2
);

const contactTs = `// Every way to reach me, in one object.

export const contact = {
  email: ${JSON.stringify(contact.email)},
  github: ${JSON.stringify(contact.github)},
  linkedin: ${JSON.stringify(contact.linkedin)},
  website: ${JSON.stringify(contact.website)},
  leetcode: ${JSON.stringify(contact.leetcode)},
  location: ${JSON.stringify(personal.location)},
  timezone: ${JSON.stringify(personal.timezone)},
} as const;

export const availability = {
  status: ${JSON.stringify(personal.availability)},
  overlap: ${JSON.stringify(personal.overlap)},
  responseTime: ${JSON.stringify(personal.responseTime)},
} as const;

// Tip: this file runs. Hit the play button, or press Ctrl+Enter.
console.log('Email:  ' + contact.email);
console.log('GitHub: ' + contact.github);
console.log('Status: ' + availability.status);
`;

/* ------------------------------------------------------------------ *
 * Playground — real programs, meant to be executed
 * ------------------------------------------------------------------ */

const helloJs = `// Everything in playground/ actually runs.
// Press the play button in the tab bar, or Ctrl+Enter.

const stack = ['bootloader', 'compiler', 'desktop', 'API', 'database', 'product'];

console.log('Six layers, bottom to top:');
stack.forEach((layer, i) => {
  console.log('  ' + String(i + 1).padStart(2) + '. ' + layer);
});

// Objects print properly here — this is a real console, not a string dump.
console.log({
  name: 'Anubhav Mishra',
  role: 'Product Engineer',
  shipped: stack.length,
  live: true,
});

// Top-level await works too.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(150);
console.log('...and async/await works, because this is a real JS engine.');
`;

const rateLimiterTs = `// A token-bucket rate limiter — the shape used to tier the XTTS voice API.
// TypeScript is transformed in the browser, then executed for real.

interface Tier {
  name: string;
  capacity: number;      // burst size
  refillPerSecond: number;
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private readonly tier: Tier) {
    this.tokens = tier.capacity;
    this.lastRefill = 0;
  }

  /** Returns true when the request is allowed at time \`now\` (seconds). */
  tryConsume(now: number, cost = 1): boolean {
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(
      this.tier.capacity,
      this.tokens + elapsed * this.tier.refillPerSecond
    );
    this.lastRefill = now;

    if (this.tokens < cost) return false;
    this.tokens -= cost;
    return true;
  }

  get remaining(): number {
    return Math.floor(this.tokens);
  }
}

const free: Tier = { name: 'free', capacity: 5, refillPerSecond: 0.5 };
const bucket = new TokenBucket(free);

// Ten requests fired back to back at t=0, then one more a full second later.
const timeline: Array<[number, string]> = [];
for (let i = 0; i < 10; i++) {
  timeline.push([0, bucket.tryConsume(0) ? 'allowed' : 'THROTTLED']);
}
timeline.push([2, bucket.tryConsume(2) ? 'allowed' : 'THROTTLED']);

timeline.forEach(([t, verdict], i) => {
  console.log('req ' + String(i + 1).padStart(2) + '  t=' + t + 's  ' + verdict);
});

console.log('');
console.log('Tokens left:', bucket.remaining);
console.log('Burst of ' + free.capacity + ' absorbed, the rest shed. Refills at ' +
  free.refillPerSecond + '/s.');
`;

const fizzbuzzPy = `# Real CPython, compiled to WebAssembly, running in your browser tab.
# The first run downloads the interpreter; after that it is instant.

import sys
from collections import Counter


def classify(n: int) -> str:
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)


results = [classify(n) for n in range(1, 31)]

# Print in rows of ten so it stays readable.
for row in range(0, len(results), 10):
    print("  ".join(value.ljust(9) for value in results[row:row + 10]))

print()
print("Distribution:", dict(Counter(r for r in results if not r.isdigit())))
print("Python", sys.version.split()[0], "— the real thing, not a simulation.")
`;

const analysisPy = `# The standard library is genuinely available. No install step, no server.

import json
import statistics
from dataclasses import dataclass, asdict


@dataclass
class Deploy:
    service: str
    duration_s: float
    rolled_back: bool


deploys = [
    Deploy("terra", 412.0, False),
    Deploy("terra", 388.5, False),
    Deploy("hive", 96.2, False),
    Deploy("hive", 104.8, True),
    Deploy("yaps", 41.0, False),
    Deploy("yuitility", 63.7, False),
    Deploy("yuitility", 58.1, False),
    Deploy("pathshala", 121.4, True),
]

by_service: dict[str, list[float]] = {}
for d in deploys:
    by_service.setdefault(d.service, []).append(d.duration_s)

print(f"{'service':<12}{'runs':>5}{'median':>10}{'spread':>10}")
print("-" * 37)
for service, times in sorted(by_service.items(), key=lambda kv: -statistics.median(kv[1])):
    spread = max(times) - min(times)
    print(f"{service:<12}{len(times):>5}{statistics.median(times):>10.1f}{spread:>10.1f}")

rollbacks = [d for d in deploys if d.rolled_back]
print()
print(f"Rollback rate: {len(rollbacks) / len(deploys):.1%}")
print(json.dumps([asdict(d) for d in rollbacks], indent=2))
`;

const twoSumCpp = `// C++ is compiled with a real g++ in a remote sandbox and the binary is run.
// Compiler errors come back exactly as the compiler wrote them.

#include <iostream>
#include <unordered_map>
#include <vector>

// Classic two-sum: one pass, hash map of complements. O(n) time, O(n) space.
std::vector<int> two_sum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) {
            return {it->second, i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    std::vector<int> nums{2, 7, 11, 15, 3, 6};
    for (int target : {9, 26, 9999}) {
        auto result = two_sum(nums, target);
        std::cout << "target " << target << " -> ";
        if (result.empty()) {
            std::cout << "no pair\\n";
        } else {
            std::cout << "indices [" << result[0] << ", " << result[1] << "]  ("
                      << nums[result[0]] << " + " << nums[result[1]] << ")\\n";
        }
    }
    return 0;
}
`;

const schedulerC = `/*
 * Round-robin scheduler, reduced to the part that matters.
 *
 * This is the same shape as the scheduler in ARGON OS, minus the context switch:
 * there, picking the next task is followed by swapping the stack pointer and
 * restoring registers in assembly. Here it just prints who runs next.
 */
#include <stdio.h>

#define MAX_TASKS 4
#define QUANTUM   2

typedef enum { READY, RUNNING, FINISHED } state_t;

typedef struct {
    const char *name;
    int         burst;      /* ticks of work remaining */
    state_t     state;
} task_t;

static task_t tasks[MAX_TASKS] = {
    {"init",    3, READY},
    {"shell",   5, READY},
    {"logger",  2, READY},
    {"idle",    4, READY},
};

static int current = -1;

/* Next READY task after the current one, wrapping around. */
static int next_ready(void) {
    for (int i = 1; i <= MAX_TASKS; ++i) {
        int candidate = (current + i) % MAX_TASKS;
        if (tasks[candidate].state == READY) return candidate;
    }
    return -1;
}

int main(void) {
    int tick = 0;

    for (;;) {
        int next = next_ready();
        if (next < 0) break;

        current = next;
        task_t *t = &tasks[current];
        t->state = RUNNING;

        int slice = t->burst < QUANTUM ? t->burst : QUANTUM;
        printf("t=%-3d %-8s runs %d tick(s)", tick, t->name, slice);

        tick    += slice;
        t->burst -= slice;

        if (t->burst == 0) {
            t->state = FINISHED;
            printf("  [done]\\n");
        } else {
            t->state = READY;
            printf("  [preempted, %d left]\\n", t->burst);
        }
    }

    printf("\\nAll tasks finished at t=%d.\\n", tick);
    return 0;
}
`;

const demoHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Rendered from the editor</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: radial-gradient(circle at 30% 20%, #12263a, #05070a 60%);
      color: #e6edf3;
    }
    .card {
      padding: 2.5rem 3rem;
      border: 1px solid #23303d;
      border-radius: 16px;
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(8px);
      text-align: center;
      max-width: 30rem;
    }
    h1 { margin: 0 0 .5rem; font-size: 1.6rem; letter-spacing: -0.02em; }
    p  { margin: 0 0 1.25rem; color: #93a4b5; line-height: 1.6; }
    button {
      font: inherit; cursor: pointer;
      padding: .6rem 1.2rem; border-radius: 8px;
      border: 1px solid #2f81f7; background: #1f6feb; color: white;
    }
    button:hover { background: #388bfd; }
    #count { font-variant-numeric: tabular-nums; }
  </style>
</head>
<body>
  <div class="card">
    <h1>This page is live</h1>
    <p>
      Editing the HTML and running it again re-renders this pane.
      The script below is executing right now.
    </p>
    <button id="go">Clicked <span id="count">0</span> times</button>
  </div>
  <script>
    let n = 0;
    const label = document.getElementById('count');
    document.getElementById('go').addEventListener('click', () => {
      label.textContent = String(++n);
    });
  </script>
</body>
</html>
`;

/* ------------------------------------------------------------------ *
 * The filesystem
 * ------------------------------------------------------------------ */

export const fileContents: Record<string, string> = {
  'README.md': readme,
  'about.md': about,
  'stack.md': stack,
  'products.json': productsJson,
  'projects.json': projectsJson,
  'contact.ts': contactTs,

  'hello.js': helloJs,
  'rate-limiter.ts': rateLimiterTs,
  'fizzbuzz.py': fizzbuzzPy,
  'analysis.py': analysisPy,
  'two-sum.cpp': twoSumCpp,
  'scheduler.c': schedulerC,
  'demo.html': demoHtml,
};

/** Files under playground/, in tree order. These are the runnable ones. */
export const playgroundFiles = [
  'hello.js',
  'rate-limiter.ts',
  'fizzbuzz.py',
  'analysis.py',
  'two-sum.cpp',
  'scheduler.c',
  'demo.html',
];

export const getFileContent = (filename: string): string =>
  fileContents[filename] ?? `// ${filename}\n// This file has no contents yet.\n`;

export const fileExists = (filename: string): boolean =>
  Object.prototype.hasOwnProperty.call(fileContents, filename);

const LANGUAGE_LABELS: Record<string, string> = {
  md: 'Markdown',
  json: 'JSON',
  ts: 'TypeScript',
  tsx: 'TypeScript React',
  js: 'JavaScript',
  jsx: 'JavaScript React',
  css: 'CSS',
  html: 'HTML',
  py: 'Python',
  c: 'C',
  h: 'C Header',
  cpp: 'C++',
  java: 'Java',
  go: 'Go',
  rs: 'Rust',
  sql: 'SQL',
  sh: 'Shell',
  yaml: 'YAML',
  yml: 'YAML',
  gitignore: 'Git Ignore',
  txt: 'Plain Text',
};

export const getFileLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return LANGUAGE_LABELS[ext] ?? 'Plain Text';
};
