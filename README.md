# ⚡ FullStack Nexus — Enterprise Systems & Cryptographic Monorepo

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=nodedotjs&style=flat-square)](https://nodejs.org/)
[![npm Workspaces](https://img.shields.io/badge/npm-Workspaces-CB3837?logo=npm&style=flat-square)](https://docs.npmjs.com/cli/using-npm/workspaces)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000?logo=express&style=flat-square)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&style=flat-square)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Cache-Upstash_Redis-DC382D?logo=redis&style=flat-square)](https://redis.io/)
[![Cryptography](https://img.shields.io/badge/Security-AES--256--GCM_AEAD-FF6B00?logo=shield&style=flat-square)](https://nodejs.org/api/crypto.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> An enterprise-grade full-stack monorepo demonstrating zero-trust security architectures, hardware-accelerated AES-256-GCM AEAD cryptography, Redis-backed sliding token family rotation, real-time command palette search (`Cmd + K`), and an interactive systems engineering portfolio.

---

## Table of Contents

- [Live Production Deployments](#-live-production-deployments)
- [Monorepo Workspaces Directory](#-monorepo-workspaces-directory)
- [System Architecture & Flow](#-system-architecture--flow)
- [Cryptographic & Security Specification Matrix](#-cryptographic--security-specification-matrix)
- [Repository Structure](#-repository-structure)
- [Quickstart & Local Development](#-quickstart--local-development)
- [Environment Configuration](#-environment-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Monorepo Scripts Reference](#-monorepo-scripts-reference)
- [License](#-license)

---

## 🌐 Live Production Deployments

| Deployment Target             | Live Production URL                                                                            | Deployment Tier             |  Status  |
| :---------------------------- | :--------------------------------------------------------------------------------------------- | :-------------------------- | :------: |
| **💼 Developer Portfolio**    | [fullstack-nexus-portfolio.vercel.app](https://fullstack-nexus-portfolio.vercel.app)           | Vercel Edge SPA             | `ONLINE` |
| **🛡️ Key Vault Manager (UI)** | [fullstack-nexus-frontend.vercel.app](https://fullstack-nexus-frontend.vercel.app)             | Vercel SPA + Edge Proxy     | `ONLINE` |
| **⚙️ Key Vault API Gateway**  | [fullstack-nexus-backend.vercel.app/api/v1](https://fullstack-nexus-backend.vercel.app/api/v1) | Vercel Serverless (Node.js) | `ONLINE` |

---

## 📂 Monorepo Workspaces Directory

| Project / Workspace                                         | Domain & Architecture                                     | Core Tech Stack                                                       |                  Specs & Documentation                   |
| :---------------------------------------------------------- | :-------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------: |
| **🛡️ [`apps/key-vault-manager`](./apps/key-vault-manager)** | Enterprise Secret Vault, Zero-Trust IAM & Cryptography    | React 19, Express 5, AES-256-GCM, MongoDB, Upstash Redis, Tailwind v4 | [Read Vault Specs ➔](./apps/key-vault-manager/README.md) |
| **💼 [`apps/portfolio`](./apps/portfolio)**                 | Systems Engineering Showcase, Telemetry Ping & Tech Radar | React 19, Vite 8, Tailwind CSS v4, Framer Motion                      |   [Read Portfolio Specs ➔](./apps/portfolio/README.md)   |
| **⚡ `Project 02: Event Mesh`**                             | Low-Latency Pub/Sub Broker & Dead-Letter Replay           | Node.js, Redis Pub/Sub, WebSockets, TimescaleDB                       |                    _In Architecture_                     |
| **🧠 `Project 03: RAG Gateway`**                            | Semantic Caching & Autonomous Vector Search Engine        | Python, FastAPI, Qdrant / pgvector, LangChain                         |                     _In Development_                     |

---

## 🏗️ System Architecture & Flow

```text
+-------------------------------------------------------------------------------+
|                       CLIENT TIER (React 19 + Vite 8)                         |
|  * Portfolio Hub: Live Gateway Latency Ping, Command Palette, Topology Grid  |
|  * Key Vault: Cyberpunk Glassmorphism UI, Zero-Leak Query Cache Eviction     |
|  * Web Locks API Single-Flight Token Refresh & Cross-Tab BroadcastChannel     |
+---------------------------------------+---------------------------------------+
                                        | Signed httpOnly Cookies (SameSite=Strict)
                                        | x-client-instance-id (Tab Sandbox Tracking)
                                        | x-request-id & x-request-timestamp Telemetry
                                        v
+-------------------------------------------------------------------------------+
|                     API GATEWAY TIER (Express 5.2)                            |
|  * Vercel Serverless Execution Router (/api/index.js)                         |
|  * Multi-Tier Rate Limiting (RedisStore / In-Memory Failover)                 |
|  * Zod Strict Structural Schemas & Content Normalization                      |
|  * Pino Defense-in-Depth Telemetry & Sensitive Header Redaction              |
+---------------------------------------+---------------------------------------+
                                        |
            +---------------------------+---------------------------+
            v                                                       v
+-------------------------------+       +---------------------------------------+
|   CRYPTOGRAPHIC ENGINE TIER   |       |        DISTRIBUTED SESSION TIER       |
|  * AES-256-GCM AEAD (12B IV)  |       |  * Upstash Redis Sliding Session Set  |
|  * Scrypt Barrier Derivation  |       |  * Token Family Rotation & Replay Trap|
|  * Real-Time On-Demand Reveal |       |  * 2000ms Concurrency Grace Window    |
|  * Automated Version Rotation |       |  * LRU Memory Failover Layer          |
+---------------+---------------+       +-------------------+-------------------+
                |                                           |
                +-----------------------+-------------------+
                                        v
+-------------------------------------------------------------------------------+
|                        PERSISTENCE TIER (MongoDB Atlas)                       |
|  * Secrets: Ciphertext + Dynamic IV + AuthTag (Zero Plaintext at Rest)        |
|  * AuditLogs: Immutable SHA-256 HMAC Telemetry Stream                         |
|  * Sessions & Tokens: Native TTL Auto-Purge Indices                           |
+-------------------------------------------------------------------------------+
```

---

## 🔐 Cryptographic & Security Specification Matrix

| Security Domain             | Implementation Standard                                              | Security Rationale                                                                                                    |
| :-------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **Data Encryption at Rest** | `AES-256-GCM` with random 96-bit IVs and 128-bit authentication tags | Ensures cryptographic confidentiality and authenticated AEAD tamper detection across all secret keys.                 |
| **Master Key Derivation**   | `crypto.scryptSync` with cryptographic domain salt                   | Derives deterministic 256-bit barrier keys in memory without storing raw root keys in plaintext.                      |
| **Transport Security**      | `httpOnly`, `SameSite=Strict`, Signed Cookies (`/api/v1`)            | Neutralizes client-side XSS cookie harvesting and cross-site request forgery (CSRF) vectors.                          |
| **Token Family Rotation**   | Cryptographic token families (`tokenFamilyId` + `tokenVersion`)      | Immediate detection of token reuse; nukes the entire family tree upon replay attempts.                                |
| **Concurrency Shield**      | `2000ms` Temporal Grace Window                                       | Prevents spurious session invalidation during simultaneous asynchronous Single-Page Application (SPA) network bursts. |
| **Session Blacklisting**    | Upstash Redis `setex` with in-memory LRU fallback                    | Guarantees sub-millisecond distributed token revocation across serverless and multi-region nodes.                     |
| **Entropy Verification**    | `@zxcvbn-ts` algorithmic password score checking ($\ge 3$)           | Prevents dictionary attacks, sequential character patterns, and contextual username/email leaks.                      |
| **Immutable Audit Trail**   | MongoDB WORM ledger with SHA-256 HMAC Merkle roots                   | Chronological tamper-proof ledger of every secret reveal, key rotation, and perimeter 403 drop.                       |
| **Cache Isolation**         | React Query client eviction protocol (`queryClient.clear`)           | Completely flushes query memory upon logout, eliminating multi-tenant cross-session data leaks.                       |

---

## 🗂️ Repository Structure

```text
fullstack-nexus/
├── .husky/                         # Git hooks (commit-msg, pre-commit)
├── apps/
│   ├── key-vault-manager/          # Enterprise Key & Vault Platform
│   │   ├── backend/                # Express 5 REST API, AES-256-GCM Engine, Redis & MongoDB
│   │   │   ├── api/                # Vercel serverless function entrypoint
│   │   │   ├── src/                # Modular controllers, models, routes & services
│   │   │   └── package.json
│   │   ├── frontend/               # React 19 SPA, Tailwind v4 Cyberpunk UI, Command Palette
│   │   │   ├── src/                # Layouts, pages, hooks, Redux store & API clients
│   │   │   └── package.json
│   │   └── README.md
│   │
│   └── portfolio/                  # Developer Portfolio & Monorepo Showcase Hub
│       ├── src/                    # System topology, interactive radars, modals & telemetry
│       ├── package.json
│       └── README.md
│
├── commitlint.config.js            # Conventional commit standards enforcement
├── eslint.config.js                # Flat ESLint 9 configuration across all workspaces
├── package.json                    # Root npm workspaces manifest & shared scripts
└── README.md                       # Monorepo root documentation
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`
- **MongoDB:** Local instance on port `27017` or a cloud MongoDB Atlas connection URI
- **Redis (Optional):** Local Redis or Upstash Redis URL (falls back to local memory LRU if absent)

### 2. Installation

```bash
# 1. Clone repository
git clone https://github.com/aimalrx200/fullstack-nexus.git
cd fullstack-nexus

# 2. Install dependencies across all workspaces
npm install
```

### 3. Launch Development Servers

```bash
# Boot Key Vault Manager (Backend on :3000, Frontend on :5173)
npm run dev:key-vault

# Or launch the Portfolio Hub (Frontend on :5174)
npm run dev:portfolio
```

### 4. Interactive Showcase Access

1. Navigate to `http://localhost:5173`.
2. Click **⚡ Instant Evaluator Access (Demo Pass)** to self-provision a verified administrator session (`demo@keyvault.io`) in under 2 seconds.
3. Press **`Cmd + K`** (macOS) or **`Ctrl + K`** (Windows/Linux) to open the Command Palette.
4. Test real-time AES-256 key reveals, master key rotations, and the **Simulate 403 Drop Attack** trigger.

---

## ⚙️ Environment Configuration

### Backend Environment (`apps/key-vault-manager/backend/.env`)

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/key_vault_manager

# Cryptographic Signatures (Must be >= 32 characters)
JWT_SECRET=your_32_character_jwt_secret_key_minimum_length_here
REFRESH_SECRET=your_32_character_refresh_token_secret_key_here
COOKIE_SECRET=your_32_character_cookie_signature_secret_key_here

# Token Lifespans (Dev in minutes, Prod in days)
ACCESS_TOKEN_EXPIRY_DEV=15
REFRESH_TOKEN_EXPIRY_DEV=1440
ACCESS_TOKEN_EXPIRY_PROD=15
REFRESH_TOKEN_EXPIRY_PROD=7
EMAIL_VERIFICATION_TOKEN_TTL=86400

# Distributed Cache (Optional: Leave empty for local in-memory LRU)
REDIS_URL=redis://127.0.0.1:6379

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# SMTP Mail Transport (Defaults to Ethereal in development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

### Key Vault Frontend Environment (`apps/key-vault-manager/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
VITE_APP_ENV=development
```

### Portfolio Environment (`apps/portfolio/.env`)

```env
VITE_GATEWAY_URL=https://fullstack-nexus-backend.vercel.app/api/v1
```

---

## 🧪 Testing & Quality Assurance

```bash
# Run linting across all monorepo workspaces
npm run lint

# Format all code files with Prettier
npm run format

# Run backend unit tests with Vitest
npm run test --workspace=apps/key-vault-manager/backend

# Build production bundles
npm run build --workspace=apps/key-vault-manager/frontend
npm run build --workspace=apps/portfolio
```

---

## 🛠️ Monorepo Scripts Reference

| Command                 | Action                                                                        |
| :---------------------- | :---------------------------------------------------------------------------- |
| `npm run dev`           | Concurrently boots the default development workspace (`key-vault`).           |
| `npm run dev:key-vault` | Concurrently launches Key Vault backend (`:3000`) and frontend (`:5173`).     |
| `npm run dev:portfolio` | Launches the Portfolio development server (`:5174`).                          |
| `npm run lint`          | Runs flat-config ESLint validation across all monorepo files.                 |
| `npm run format`        | Runs Prettier write formatting across all JavaScript, JSX, CSS, and Markdown. |

---

## 📄 License

This repository is distributed under the [MIT License](./LICENSE).
