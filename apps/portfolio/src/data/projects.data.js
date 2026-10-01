// apps/portfolio/src/data/projects.data.js

/**
 * Data-Driven Project Registry
 * Authoritative registry of all flagship platforms and upcoming distributed systems
 */
export const PROJECTS_REGISTRY = [
  {
    id: "nexus-commerce",
    tier: "flagship",
    badge: "🟢 Live in Production",
    title:
      "Nexus Commerce — Autonomous Multi-Currency E-Commerce & Concurrency Engine",
    tagline:
      "Enterprise commerce platform engineered with atomic Redis Lua 10-minute flash-sale stock locks, WebAuthn FIDO2 biometric passkeys (Face ID / Touch ID), 4-tier RBAC delegation, live GPS courier tracking radar, and resilient multi-gateway payment pipelines.",
    category: "High-Concurrency Commerce & Telemetry",
    status: "Production",
    featured: true,
    links: {
      liveDemo: "https://nexus-commerce-frontend.vercel.app",
      apiGateway: "https://nexus-commerce-backend.vercel.app/api/v1",
      healthCheck: "https://nexus-commerce-backend.vercel.app/api/v1/health",
      github:
        "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/nexus-commerce",
    },
    demoCredentials: {
      hasEvaluatorPass: true,
      description:
        "1-Click instant evaluator pass with 4-tier RBAC role switcher (VIP Shopper, Support Specialist, Operations Lead).",
    },
    architectureHighlights: [
      {
        title: "Atomic Redis Lua Stock Holds",
        desc: "Race-condition-proof 10-minute checkout inventory locks using atomic Lua scripts with MongoDB OCC transaction rollback.",
      },
      {
        title: "WebAuthn FIDO2 Passkeys",
        desc: "Cryptographic hardware-bound passwordless authentication supported across iOS Touch ID, Face ID, and Windows Hello.",
      },
      {
        title: "Adaptive Dual-Protocol Telemetry",
        desc: "Bi-directional Socket.io in local development with automatic fallback to Server-Sent Events (SSE) with exponential backoff on Vercel Serverless.",
      },
      {
        title: "4-Tier RBAC & Sovereignty Shield",
        desc: "Granular authorization hierarchy separating Super Admin, Merchant Admin, Support Agent, and Shopper, guarded by immutable master owner immunity.",
      },
      {
        title: "Multi-Gateway Payment Pipeline",
        desc: "Idempotent payment processing across Stripe (3DS SCA), JazzCash HMAC-SHA256, Easypaisa Checksum IPN, and Cash on Delivery (COD).",
      },
      {
        title: "Live GPS Courier Radar",
        desc: "Real-time waypoint dispatch simulation on interactive Google Maps with automated Cash on Delivery payment settlement upon physical delivery.",
      },
    ],
    techStack: [
      "React 19",
      "Express 5.2",
      "Tailwind CSS v4",
      "Upstash Redis (Lua)",
      "MongoDB Atlas",
      "WebAuthn (FIDO2)",
      "Socket.io + SSE",
      "Stripe SDK",
      "Sharp (WebP)",
      "Cloudinary CDN",
      "Redux Toolkit",
      "TanStack Query v5",
    ],
    metrics: [
      { label: "Inventory Lock TTL", value: "600s (10 Mins)" },
      { label: "Token Grace Window", value: "2,000ms" },
      { label: "Supported Currencies", value: "USD ($) / PKR (₨)" },
      { label: "Auth Architecture", value: "FIDO2 Passkeys + JWT" },
    ],
  },
  {
    id: "key-vault-manager",
    tier: "flagship",
    badge: "🟢 Live in Production",
    title: "Key Vault Manager — Zero-Trust Cryptographic Engine",
    tagline:
      "Enterprise secret storage platform with hardware-accelerated AES-256-GCM AEAD encryption, Redis sliding session blacklisting, token family rotation, and an immutable Merkle audit ledger.",
    category: "Security & Distributed Systems",
    status: "Production",
    featured: true,
    links: {
      liveDemo: "https://fullstack-nexus-frontend.vercel.app",
      apiGateway: "https://fullstack-nexus-backend.vercel.app/api/v1",
      github:
        "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/key-vault-manager",
    },
    demoCredentials: {
      hasEvaluatorPass: true,
      description:
        "1-Click instant evaluator access (bypasses email/OAuth in < 2s).",
    },
    architectureHighlights: [
      {
        title: "AES-256-GCM AEAD at Rest",
        desc: "Random 96-bit IVs and 128-bit authentication tags ensure ciphertext integrity and tamper detection.",
      },
      {
        title: "Token Family Rotation Trap",
        desc: "Cryptographic (tokenFamilyId + tokenVersion) tracking with a 2,000ms concurrency grace buffer.",
      },
      {
        title: "Redis Sliding Sessions",
        desc: "Upstash Cloud Redis with in-memory LRU fallback for sub-millisecond session invalidation.",
      },
      {
        title: "Same-Origin Edge Proxy",
        desc: "Vercel Edge Rewrite converting cross-site tokens into 100% first-party cookies (SameSite=Strict).",
      },
    ],
    techStack: [
      "React 19",
      "Express 5.2",
      "AES-256-GCM",
      "MongoDB Atlas",
      "Upstash Redis",
      "Tailwind v4",
      "Zod",
      "Vercel Serverless",
    ],
    metrics: [
      { label: "Encryption Grade", value: "AES-256-GCM" },
      { label: "Token Refresh Buffer", value: "2,000ms" },
      { label: "Demo Boot Time", value: "< 2.0s" },
      { label: "Audit Integrity", value: "SHA-256 WORM" },
    ],
  },
  {
    id: "distributed-event-mesh",
    tier: "upcoming",
    badge: "⚡ In Architecture & Design",
    title: "Project 02: High-Throughput Distributed Event Mesh",
    tagline:
      "Low-latency real-time pub/sub broker architecture designed with partition rebalancing, persistent dead-letter queues, and WebSocket clustering.",
    category: "Distributed Systems & Streaming",
    status: "In Architecture",
    featured: false,
    links: {
      github: "https://github.com/aimalrx200/fullstack-nexus",
    },
    architectureHighlights: [
      {
        title: "Partition Leader Consensus",
        desc: "Raft-inspired quorum heartbeats for stateful WebSocket broker nodes.",
      },
      {
        title: "Dead-Letter Auto-Retry",
        desc: "Backoff replay policies guaranteeing at-least-once stream processing.",
      },
    ],
    techStack: [
      "Node.js",
      "Redis Pub/Sub",
      "WebSockets",
      "Docker",
      "TimescaleDB",
    ],
    metrics: [
      { label: "Target Throughput", value: "100k msg/s" },
      { label: "Broker Latency", value: "< 5ms" },
    ],
  },
  {
    id: "ai-rag-vector-gateway",
    tier: "upcoming",
    badge: "🧠 In Development",
    title: "Project 03: Autonomous AI RAG & Knowledge Gateway",
    tagline:
      "Multi-tenant vector search routing engine featuring semantic caching, contextual chunking, and latency-optimized LLM fallback pools.",
    category: "AI Infrastructure & Vector Search",
    status: "In Development",
    featured: false,
    links: {
      github: "https://github.com/aimalrx200/fullstack-nexus",
    },
    architectureHighlights: [
      {
        title: "Semantic Redis Caching",
        desc: "Embeddings-based similarity query cache saving up to 80% upstream LLM costs.",
      },
      {
        title: "Adaptive Chunking",
        desc: "Hybrid dense & sparse BM25 retrieval for high-fidelity code synthesis.",
      },
    ],
    techStack: ["Python", "FastAPI", "Qdrant / pgvector", "LangChain", "Redis"],
    metrics: [
      { label: "Cache Hit Ratio", value: "~75%" },
      { label: "Vector Recall", value: "0.94 NDCG" },
    ],
  },
  {
    id: "cloud-native-microservices-mesh",
    tier: "upcoming",
    badge: "🔬 In Planning",
    title: "Project 04: Cloud-Native Microservices Service Mesh",
    tagline:
      "Zero-trust mTLS proxy mesh with distributed OpenTelemetry tracing, circuit breaking, and dynamic gRPC load balancing.",
    category: "Cloud Native & DevOps",
    status: "In Planning",
    featured: false,
    links: {
      github: "https://github.com/aimalrx200/fullstack-nexus",
    },
    architectureHighlights: [
      {
        title: "Envoy Sidecar Pattern",
        desc: "Automatic SPIFFE/SPIRE certificate rotation and Layer 7 traffic routing.",
      },
      {
        title: "Distributed Tracing",
        desc: "OpenTelemetry and Jaeger distributed context propagation across microservices.",
      },
    ],
    techStack: ["Go", "gRPC", "Kubernetes", "OpenTelemetry", "Envoy"],
    metrics: [
      { label: "Tracing Overhead", value: "< 1.2ms" },
      { label: "Service Discovery", value: "mTLS Native" },
    ],
  },
];
