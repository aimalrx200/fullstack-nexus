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
];
