/**
 * Data-Driven Project Registry
 * Allows instant onboarding of new projects (Project 02, 03, 04)
 */
export const PROJECTS_REGISTRY = [
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
