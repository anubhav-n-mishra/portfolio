// Portfolio Data - Anubhav Mishra
// Single source of truth for every surface: IDE panels, terminal, virtual files,
// the classic /portfolio page and the offline assistant.

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  tech: string[];
  url?: string;
  repo?: string;
  status: 'production' | 'active' | 'beta';
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  highlights: string[];
  tech: string[];
  category: 'Systems' | 'Compilers' | 'Backend' | 'AI/ML' | 'Desktop' | 'Full-Stack' | 'Data';
  repo: string;
  stars?: number;
  featured: boolean;
}

export const portfolioData = {
  personal: {
    name: 'Anubhav Mishra',
    title: 'Product Engineer',
    subtitle: 'x86 kernels to LLVM compilers to multi-tenant SaaS in production',
    tagline:
      'I build products end to end. Some run on customers’ own servers behind a licence check, some run in a browser tab, and one of them boots off a floppy image in QEMU.',
    avatar: '/profile.png',
    location: 'Dehradun, India',
    timezone: 'IST (UTC+5:30)',
    availability: 'Open to remote engineering roles and freelance projects',
    responseTime: 'Usually replies within a day',
    overlap: 'Comfortable overlapping EU and US-East hours',
    education: {
      degree: 'B.Tech, Computer Science & Engineering',
      university: 'Graphic Era Hill University',
      status: 'Graduated',
    },
    bio: `Product engineer shipping software end to end — database schema and row-level security
through to the interface people actually click.

Before the product work I led a four-person team building an x86 operating system from the
bootloader up, and wrote a statically-typed language on a real LLVM backend. Those two are
why I am comfortable anywhere in a stack.`,
    pitch: `Most people who write Next.js have never written a bootloader, and most people who
write bootloaders have never shipped a multi-tenant SaaS to a paying customer. I have done
both, and the middle is where the interesting problems live.`,
  },

  contact: {
    email: 'anubhav09.work@gmail.com',
    github: 'https://github.com/anubhav-n-mishra',
    githubUser: 'anubhav-n-mishra',
    linkedin: 'https://linkedin.com/in/anubhav-mishra0',
    website: 'https://mishraanubhav.me',
    leetcode: 'https://leetcode.com/anubhav_n_mishra/',
    resume: '/Anubhav_Mishra.pdf',
  },

  github: {
    username: 'anubhav-n-mishra',
    repositories: 116,
    profile: 'https://github.com/anubhav-n-mishra',
  },

  // Numbers that are actually verifiable from the repos themselves.
  impact: [
    { label: 'Products live in production', value: '5' },
    { label: 'RLS policies enforcing access in Terra', value: '164' },
    { label: 'Client-side tools in Yuitility', value: '79' },
    { label: 'Tracked features in Pathshala', value: '326' },
    { label: 'Public repositories', value: '116' },
    { label: 'Stack layers, bootloader to SaaS', value: '6' },
  ],

  // Bootloader -> product. The point of the whole CV.
  stackLayers: [
    { layer: 'Hardware & boot', detail: 'x86 bootloader, protected mode, interrupt tables' },
    { layer: 'Compilers', detail: 'Lexer, parser, IR generation, LLVM-19 backend' },
    { layer: 'Native desktop', detail: 'Chromium/Electron shells, packaged Windows + Linux builds' },
    { layer: 'Services & APIs', detail: 'FastAPI, Node, job queues, rate limiting, caching' },
    { layer: 'Data & authorization', detail: 'PostgreSQL, row-level security, multi-tenant isolation' },
    { layer: 'Product', detail: 'Multi-tenant SaaS, PWAs, on-prem licensed delivery' },
  ],

  products: [
    {
      id: 'terra',
      name: 'Terra',
      tagline: 'Land, legal and approvals platform for renewable-energy developers',
      description:
        'Ships as licensed Docker images onto the customer’s own infrastructure. One Next.js app plus a self-hosted Supabase stack — GoTrue, PostgREST, storage-api on MinIO, Valkey and a pg-boss worker. Customers never receive source: they get pre-built images, generate their own secrets, and run the whole thing themselves.',
      highlights: [
        '164 row-level-security policies are the primary access control — server actions are the second layer, not the first. Hiding a button protects nothing.',
        'Ed25519-signed licences bound to machine hardware. Entitlements fail closed: no valid licence means paid modules are off, not degraded.',
        'Three structural tests fail the PR by design — a server action with no auth call, a gated feature with no entitlement check, or an undocumented SECURITY DEFINER function.',
        'Split test suites: unit tests run on a clean checkout with no Docker so CI can run them every push; integration tests bring up real Postgres and assert what the database enforces.',
        'Approval authority is a function, not a tier comparison — top_management outranks division_vp but deliberately cannot approve.',
        'Real landowner PII, so DPDP Act obligations are a design constraint rather than an afterthought.',
      ],
      tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'Docker', 'MinIO', 'Valkey', 'Ed25519'],
      url: 'https://terra.amvelt.com',
      status: 'production',
    },
    {
      id: 'seva-sankul',
      name: 'Seva Sankul',
      tagline: 'Public platform and admin portal for the Rajasthan Police',
      description:
        'Delivered under subcontract to GTO Sky. A public-facing platform plus the internal admin portal behind it, serving a state police department.',
      highlights: [
        'Government delivery: real citizens on the public side, real officers on the admin side.',
        'Separate public and admin surfaces over one data model, with role separation enforced in the database.',
      ],
      tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase'],
      url: 'https://sevasankul.org',
      status: 'production',
    },
    {
      id: 'hive',
      name: 'Hive',
      tagline: 'Offline-first workspace — projects, tasks, internal mail, live chat, audit trail',
      description:
        'An installable PWA that genuinely works with no network, not one that shows a sad cloud icon. Every write goes into an IndexedDB outbox first and replays when connectivity returns.',
      highlights: [
        'Duplicate replays are impossible: each payload carries a client_id that is UNIQUE in Postgres, so the database refuses the second copy rather than the client trying to remember.',
        'Replays give up after eight attempts, so one poisoned row cannot wedge the whole queue.',
        'Chat sends over Realtime broadcast first and the database write reconciles behind it — the broadcast is a latency optimisation, never the delivery guarantee.',
        'Web Push via VAPID, fanned out by a Postgres trigger calling an Edge Function, so alerts arrive with the app fully closed.',
        'Passkeys (WebAuthn) and TOTP: admin accounts cannot get in on a password alone, enforced server-side in the layout rather than hidden in the UI.',
        'Interface follows Apple’s fluid-interface principles — feedback on pointer-down, drags tracking one-to-one, flicks resolved by projecting release velocity.',
      ],
      tech: ['Next.js', 'TypeScript', 'IndexedDB', 'PostgreSQL', 'WebAuthn', 'Web Push', 'PWA'],
      url: 'https://hive.amvelt.com',
      status: 'production',
      note: 'Login required',
    },
    {
      id: 'yaps',
      name: 'Yaps',
      tagline: 'Peer-to-peer video conferencing with no media server',
      description:
        'Full-mesh WebRTC over PeerJS. Every participant connects directly to every other participant — no SFU, no MCU, and no media ever touches a server I pay for. Static files on the edge; the call itself is peer-to-peer.',
      highlights: [
        'STUN plus TURN relay fallback, because full mesh is useless if a participant sits behind a symmetric NAT and the connection silently never establishes.',
        'Lobby / waiting room, in-call chat, screen share via getDisplayMedia, reactions, installable PWA.',
        'Permissions-Policy scoped at the edge — camera=(self), microphone=(self), display-capture=(self) — alongside nosniff, X-Frame-Options and a strict Referrer-Policy.',
        'Single sign-on by short-lived ES256-signed ticket in the URL fragment: it never leaves the browser and never reaches a server log. Yaps verifies against the public key only, so there is no secret in the client to lift.',
      ],
      tech: ['WebRTC', 'PeerJS', 'TypeScript', 'ES256 / JOSE', 'PWA'],
      url: 'https://yaps.amvelt.com',
      status: 'production',
    },
    {
      id: 'yuitility',
      name: 'Yuitility',
      tagline: '79 client-side tools — nothing ever leaves your browser',
      description:
        'PDF merge/split/compress/watermark, image conversion and compression, local-ML background removal via WebAssembly, fake-data generation, financial calculators. Everything runs in the browser: no upload, no round trip, no privacy question.',
      highlights: [
        '49 further tools are declared but unbuilt, and those routes serve an honest “not built yet” page marked noindex — the site never competes in search for something it cannot do.',
        'npm run seo:audit runs as prebuild: adding a tool id without a matching component fails the build.',
        'Local ML background removal running entirely in WebAssembly.',
      ],
      tech: ['Next.js', 'TypeScript', 'WebAssembly', 'Web Workers', 'Canvas API'],
      url: 'https://yuitility.app',
      status: 'production',
    },
    {
      id: 'phexara',
      name: 'Phexara / Nebula',
      tagline: 'Chromium desktop browser with workspaces instead of tabs',
      description:
        'A desktop browser built on Chromium. Workspaces replace the tab strip, a Ctrl+K command bar drives navigation, and an AI console is built in. Distributed as a Windows installer and a Linux AppImage.',
      highlights: [
        'Workspace model instead of an unbounded tab strip.',
        'Ctrl+K command bar as the primary navigation surface.',
        'Packaged and shipped for two platforms — Windows installer plus Linux AppImage.',
      ],
      tech: ['Electron', 'Chromium', 'TypeScript', 'Node.js'],
      url: 'https://phexara.mishraanubhav.me',
      status: 'production',
    },
    {
      id: 'pathshala',
      name: 'Pathshala',
      tagline: 'Multi-tenant school platform where a mistake is a cross-tenant leak',
      description:
        'ERPNext is the ERP a school runs. Pathshala is the platform that runs hundreds of them — which makes tenant isolation the whole problem.',
      highlights: [
        'Tenant identity comes from the Host header only — never a query param, body field or client-settable header. Middleware strips inbound x-tenant-* headers before routing.',
        'withTenant() sets app.tenant_id transaction-locally, which is what makes connection pooling safe under multi-tenancy.',
        'DATABASE_URL must point at abs_app, never postgres — the postgres role has rolbypassrls, so that single mistake disables every isolation policy silently, with no error and no log line.',
        'rls-coverage.test.ts fails the build if any tenant-scoped table lacks FORCE ROW LEVEL SECURITY.',
        '11 ADRs, an EARS-format PRD, and a 326-item feature register tracked honestly — the repo states plainly that ~21% is built and lists exactly what is not.',
      ],
      tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'ERPNext', 'Docker'],
      status: 'active',
    },
  ] as Product[],

  projects: [
    {
      id: 'argon-os',
      name: 'ARGON OS',
      description:
        'An x86 operating system written from scratch — bootloader, protected-mode switch, round-robin scheduler, in-memory filesystem and an interactive shell.',
      longDescription: `A modular x86 operating system built from the ground up:
- Custom bootloader in NASM, real mode to protected mode transition
- Interrupt descriptor table and hardware interrupt handling
- Round-robin process scheduler with context switching
- In-memory filesystem
- Keyboard and VGA text-mode drivers
- Interactive shell running on top of it all

I led the team of four: architecture, integration, the bootloader, and the
i686-elf cross-compiler toolchain.`,
      highlights: [
        'Led a four-person team — owned architecture, integration, bootloader and toolchain.',
        'Boots in QEMU from a floppy image.',
        'Round-robin scheduler with real context switching.',
      ],
      tech: ['C', 'NASM', 'x86 Assembly', 'QEMU', 'i686-elf', 'Make'],
      category: 'Systems',
      repo: 'https://github.com/anubhav-n-mishra/AGRAN_OS',
      stars: 1,
      featured: true,
    },
    {
      id: 'gran',
      name: 'GRAN',
      description:
        'A statically-typed programming language on a real LLVM-19 backend — lexer, recursive-descent parser, IR generation and a C runtime library.',
      longDescription: `A compiled language, not an interpreter:
- Hand-written lexer and recursive-descent parser
- Static type checking over the AST
- LLVM IR generation targeting LLVM-19
- C runtime library linked into the output
- Produces native executables`,
      highlights: [
        'Real LLVM-19 backend — emits IR, not bytecode for a toy VM.',
        'Static type checker over a hand-written recursive-descent parser.',
        'C runtime library linked into produced binaries.',
      ],
      tech: ['C++', 'LLVM 19', 'Make', 'Compiler Design'],
      category: 'Compilers',
      repo: 'https://github.com/anubhav-n-mishra/GRAN',
      stars: 1,
      featured: true,
    },
    {
      id: 'qriftly',
      name: 'QRiftly',
      description:
        'A shipped Windows desktop QR scanner distributed as a standalone .exe — popup camera, theming, and WiFi auto-connect straight from a QR code. Fully offline.',
      highlights: [
        'Shipped as a standalone Windows executable, not a script with a README.',
        'Parses WIFI: QR payloads and connects the machine automatically.',
        'Runs entirely offline — no network dependency at all.',
      ],
      tech: ['Python', 'OpenCV', 'pyzbar', 'PyInstaller'],
      category: 'Desktop',
      repo: 'https://github.com/anubhav-n-mishra/Desktop-QR-Scanner',
      stars: 10,
      featured: true,
    },
    {
      id: 'xtts-api',
      name: 'XTTS Voice API',
      description:
        'Production text-to-speech service — voice cloning across 17 languages, tiered auth, rate limiting, an async job queue, audio caching, usage analytics and an admin dashboard.',
      highlights: [
        'Tiered authentication with per-tier rate limiting.',
        'Async job queue so long syntheses do not block the request path.',
        'Audio caching keyed on text plus voice, with usage analytics behind an admin dashboard.',
        'Containerised and deployable free on HuggingFace Spaces.',
      ],
      tech: ['FastAPI', 'Python', 'Docker', 'Coqui XTTS-v2', 'Redis'],
      category: 'Backend',
      repo: 'https://github.com/anubhav-n-mishra/xtts-api',
      stars: 3,
      featured: true,
    },
    {
      id: 'insight-engine',
      name: 'Insight Engine',
      description:
        'Raw CSV or SQL in, ranked insights out — then a generated PowerPoint, a 30-second AI voice briefing, and a QR-gated live dashboard.',
      highlights: [
        'Polars over Pandas and DuckDB for joins — chosen for the memory profile, not for fashion.',
        'Ranks insights rather than dumping every correlation it finds.',
        'Generates a PPTX deck and a spoken briefing from the same analysis pass.',
      ],
      tech: ['FastAPI', 'Polars', 'DuckDB', 'Python', 'Gemini'],
      category: 'Data',
      repo: 'https://github.com/anubhav-n-mishra/Automated-ai-insight-system',
      stars: 1,
      featured: true,
    },
    {
      id: 'poi-inspector',
      name: 'POI Inspector',
      description:
        'Scores point-of-interest polygons against satellite imagery — IOU, leakage and road overlap — into a weighted 0–100 grade with PDF reports.',
      highlights: [
        'Geometric scoring: IOU, boundary leakage and road-network overlap combined into one weighted grade.',
        'Generates PDF audit reports per polygon batch.',
      ],
      tech: ['FastAPI', 'OpenCV', 'Shapely', 'Next.js', 'Python'],
      category: 'Data',
      repo: 'https://github.com/anubhav-n-mishra/POI_INSPECTOR',
      featured: true,
    },
    {
      id: 'lelouch-ai',
      name: 'Lelouch AI',
      description:
        'A voice assistant with a full speech pipeline — streaming speech-to-text, LLM reasoning with web search, and synthesised speech back, over persisted chat history.',
      highlights: [
        'Full duplex voice pipeline: AssemblyAI STT → Gemini → Murf TTS.',
        'Web search integrated into the reasoning step rather than bolted on after.',
        'Authenticated users with persisted chat history in Supabase.',
      ],
      tech: ['FastAPI', 'Python', 'AssemblyAI', 'Gemini', 'Murf.ai', 'Supabase'],
      category: 'AI/ML',
      repo: 'https://github.com/anubhav-n-mishra/30-days-ai-agent-challenge',
      stars: 2,
      featured: false,
    },
    {
      id: 'cinewave',
      name: 'CineWave',
      description:
        'Group-watch streaming platform — playback synchronised across viewers in real time, with live chat and subscription billing.',
      highlights: [
        'Real-time playback sync across participants over WebSockets.',
        'Razorpay subscription billing with webhook reconciliation.',
      ],
      tech: ['React', 'Node.js', 'Supabase', 'WebSocket', 'Razorpay'],
      category: 'Full-Stack',
      repo: 'https://github.com/anubhav-n-mishra/CineWave',
      stars: 1,
      featured: false,
    },
    {
      id: 'personality-classification',
      name: 'Personality Classification',
      description:
        'Big Five personality classification from a 50-question instrument, clustered with K-Means over a persisted response set.',
      highlights: [
        'K-Means clustering over the five Big Five trait dimensions.',
        'Responses persisted so the model can be retrained on collected data.',
      ],
      tech: ['Python', 'Flask', 'scikit-learn', 'SQLite'],
      category: 'AI/ML',
      repo: 'https://github.com/anubhav-n-mishra/Data-Mining-for-automated-personality-classification',
      stars: 1,
      featured: false,
    },
  ] as Project[],

  // Sorted honestly, the way the GitHub profile does it.
  skills: {
    confident: {
      label: 'Would defend in an interview',
      items: [
        'TypeScript',
        'Next.js',
        'PostgreSQL',
        'SQL + Row-Level Security',
        'React',
        'Node.js',
        'Python',
        'FastAPI',
        'Docker',
        'Supabase',
        'C',
        'Git',
      ],
    },
    shipped: {
      label: 'Shipped real things with',
      items: [
        'Prisma',
        'pnpm',
        'Vitest',
        'C++',
        'LLVM',
        'NASM',
        'Electron',
        'WebAssembly',
        'Tailwind CSS',
        'MinIO / S3',
        'OpenCV',
        'Polars',
        'DuckDB',
        'WebAuthn',
        'Web Push',
        'WebRTC',
        'PeerJS',
      ],
    },
    learning: {
      label: 'Currently learning',
      items: ['Distributed systems', 'Observability & tracing', 'Payments at scale', 'Kubernetes'],
    },
  },

  // Kept from the CV — these are not on the GitHub profile but matter for hiring.
  certifications: [
    'Google Cybersecurity Professional Certificate — Google',
    'AWS Cloud Quest — AWS',
    'Google Cloud Computing Foundations — NPTEL',
    'Cybersecurity Fundamentals — Cisco',
    'Networking Fundamentals — Cisco',
  ],

  achievements: [
    {
      title: 'Selected for Amazon ML Summer School',
      year: '2025',
      description: 'Competitive machine-learning programme run by Amazon.',
    },
    {
      title: '6th place — AWS JAM',
      year: '2025',
      description: "Dehradun's first AWS Jam event.",
    },
    {
      title: 'Finalist — Hack-O-Holic Hackathon',
      year: '2023',
      description: 'Graphic Era Hill University.',
    },
    {
      title: 'President — College E&D Club',
      year: '2024–2025',
      description: 'Led 100+ students through workshops on cybersecurity and startup incubation.',
    },
  ],

  currentFocus: [
    'Driving Terra through its production go-lives, and the on-prem delivery pipeline around it',
    'Building out Pathshala — admissions, payments and background jobs are next',
    'Growing Yuitility past 79 tools, with the SEO gate holding the line',
    'Taking select freelance work — SaaS products, Postgres-heavy backends, on-prem delivery',
  ],

  interests: [
    'Multi-tenant data isolation and row-level security',
    'On-prem and air-gapped software delivery',
    'Compilers and low-level systems',
    'Offline-first and local-first application design',
  ],
};

export type PortfolioData = typeof portfolioData;

export const featuredProjects = portfolioData.projects.filter((p) => p.featured);
export const liveProducts = portfolioData.products.filter((p) => !!p.url);

export const allSkills: string[] = [
  ...portfolioData.skills.confident.items,
  ...portfolioData.skills.shipped.items,
  ...portfolioData.skills.learning.items,
];
