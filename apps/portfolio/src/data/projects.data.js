// apps/portfolio/src/data/projects.data.js

export const PROJECTS_REGISTRY = [
  {
    id: "nexus-commerce",
    tier: "flagship",
    badge: "Live Demo",
    title: "Nexus Commerce — Modern Multi-Currency E-Commerce Platform",
    tagline:
      "A complete online shopping platform featuring real-time order tracking on interactive maps, instant cart reservations, seamless multi-gateway checkout, and live customer support chat.",
    category: "E-Commerce & Retail",
    status: "Active",
    featured: true,
    links: {
      liveDemo: "https://nexus-commerce-frontend.vercel.app",
      github:
        "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/nexus-commerce",
    },
    demoCredentials: {
      hasEvaluatorPass: true,
      description:
        "Instant 1-click demo login with quick role switching (Shopper, Support Agent, Store Manager).",
    },
    architectureHighlights: [
      {
        title: "Live Delivery Tracking",
        desc: "Interactive map updates showing order dispatch, courier progress, and delivery confirmation.",
      },
      {
        title: "Flexible Payment Options",
        desc: "Seamless checkout supporting credit/debit cards, regional mobile wallets, and cash on delivery.",
      },
      {
        title: "Multi-Currency Pricing",
        desc: "Instant currency switching between USD ($) and PKR (₨) with localized price formatting.",
      },
      {
        title: "Live Customer Support",
        desc: "Real-time messaging between shoppers and support specialists with quick canned responses.",
      },
      {
        title: "Smart Cart Reservation",
        desc: "Temporarily holds items during checkout to prevent accidental out-of-stock conflicts.",
      },
      {
        title: "Dedicated Management Portals",
        desc: "Role-tailored dashboards for shoppers, fulfillment teams, and store administrators.",
      },
    ],
    techStack: [
      "React 19",
      "Node.js",
      "Express",
      "MongoDB Atlas",
      "Redux Toolkit",
      "Tailwind CSS",
      "Stripe",
      "WebSockets",
      "Cloudinary",
    ],
    metrics: [
      { label: "Currencies", value: "USD ($) & PKR (₨)" },
      { label: "Payment Rails", value: "Cards, Wallets & COD" },
      { label: "Order Tracking", value: "Interactive Live Map" },
      { label: "Live Support", value: "Real-Time Chat" },
    ],
  },
  {
    id: "key-vault-manager",
    tier: "flagship",
    badge: "Live Demo",
    title: "Key Vault Manager — Secure Credentials & Secrets Dashboard",
    tagline:
      "A sleek credentials and API key management dashboard designed for teams to safely organize, inspect, and audit environment variables and sensitive configuration data.",
    category: "Security & Productivity",
    status: "Active",
    featured: true,
    links: {
      liveDemo: "https://fullstack-nexus-frontend.vercel.app",
      github:
        "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/key-vault-manager",
    },
    demoCredentials: {
      hasEvaluatorPass: true,
      description:
        "Instant 1-click evaluator login to immediately explore all dashboard features.",
    },
    architectureHighlights: [
      {
        title: "Multi-Environment Organization",
        desc: "Separate and manage credentials across distinct Development, Staging, and Production vaults.",
      },
      {
        title: "Granular Access Permissions",
        desc: "Clear permission boundaries to control which team members can view, copy, or update secrets.",
      },
      {
        title: "Comprehensive Audit Logs",
        desc: "Detailed activity history recording every key access, modification, and account action.",
      },
      {
        title: "Quick Command Palette",
        desc: "Fast keyboard shortcut navigation (⌘K) to instantly search and jump between vaults.",
      },
      {
        title: "Secure Session Controls",
        desc: "Protected sign-in workflows with automatic timeout safeguards for inactive sessions.",
      },
    ],
    techStack: [
      "React 19",
      "Node.js",
      "Express",
      "MongoDB Atlas",
      "Redux Toolkit",
      "Tailwind CSS",
      "Zod Validation",
    ],
    metrics: [
      { label: "Workspaces", value: "Dev, Staging & Prod" },
      { label: "Navigation", value: "Quick Search (⌘K)" },
      { label: "Activity Log", value: "Full Audit History" },
      { label: "Demo Access", value: "1-Click Instant Login" },
    ],
  },
  {
    id: "nexus-ats",
    tier: "flagship",
    badge: "Live Demo",
    title: "Nexus ATS — High-Velocity Talent Acquisition & Hiring Suite",
    tagline:
      "A modern hiring platform pairing a public job board with an interactive recruiter Kanban pipeline, candidate dossier drawer, job requisition creator, and funnel analytics.",
    category: "HR Tech & Workflow Automation",
    status: "Active",
    featured: true,
    links: {
      liveDemo: "https://nexus-ats-frontend.vercel.app",
      github:
        "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/nexus-ats",
    },
    demoCredentials: {
      hasEvaluatorPass: true,
      description:
        "Instant 1-click demo login as Lead Technical Recruiter to explore the pipeline and review candidates.",
    },
    architectureHighlights: [
      {
        title: "Interactive Drag-and-Drop Kanban",
        desc: "Smooth candidate stage progression with optimistic UI updates, zero layout shift (CLS), and multi-criteria filter bars.",
      },
      {
        title: "Deep Candidate Dossier Drawer",
        desc: "Sliding inspection portal with 4-tab dossier navigation, 1–5 star competency scorecards, recruiter feedback notes, and resume previews.",
      },
      {
        title: "Closed-Loop Public Intake",
        desc: "Instant candidate enrollment—applications submitted via the public careers portal immediately populate the recruiter's 'New Applied' column.",
      },
      {
        title: "Requisition Management & Creator",
        desc: "Full role lifecycle tools to create, publish, pause, or archive openings with automatic slug generation and department filters.",
      },
      {
        title: "Recruiting Analytics Dashboard",
        desc: "Executive hiring funnel charts, department hiring velocity, and evaluator sentiment distribution built with Recharts.",
      },
      {
        title: "Cross-Tab Authentication Sync",
        desc: "BroadcastChannel-backed session bus synchronizing sign-in, sign-out, and session states across multiple browser tabs in real time.",
      },
    ],
    techStack: [
      "React 19",
      "React Router v7",
      "Redux Toolkit",
      "@hello-pangea/dnd",
      "Recharts",
      "Sonner",
      "CSS Modules",
      "BroadcastChannel API",
    ],
    metrics: [
      { label: "Pipeline UI", value: "Drag & Drop Kanban" },
      { label: "Candidate Review", value: "4-Tab Dossier Drawer" },
      { label: "Funnel Telemetry", value: "Recharts Analytics" },
      { label: "Session Sync", value: "Multi-Tab Broadcast" },
    ],
  },
];
