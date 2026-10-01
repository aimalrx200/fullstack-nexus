# ⚡ FullStack Nexus — Enterprise Systems & Cryptographic Monorepo

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=nodedotjs&style=flat-square)](https://nodejs.org/)
[![npm Workspaces](https://img.shields.io/badge/npm-Workspaces-CB3837?logo=npm&style=flat-square)](https://docs.npmjs.com/cli/using-npm/workspaces)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000?logo=express&style=flat-square)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&style=flat-square)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Cache-Upstash_Redis-DC382D?logo=redis&style=flat-square)](https://redis.io/)
[![Cryptography](https://img.shields.io/badge/Security-AES--256--GCM_AEAD-FF6B00?logo=shield&style=flat-square)](https://nodejs.org/api/crypto.html)
[![WebAuthn](https://img.shields.io/badge/Auth-FIDO2_Passkeys-4285F4?logo=fido&style=flat-square)](https://fidoalliance.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> An enterprise-grade full-stack monorepo demonstrating zero-trust security architectures, hardware-accelerated AES-256-GCM AEAD cryptography, Redis-backed sliding token family rotation, WebAuthn FIDO2 biometric passkeys, atomic 10-minute flash-sale inventory locks, real-time command palette search (`Cmd + K`), and distributed telemetry streams.

---

## Table of Contents

- [Live Production Deployments](#-live-production-deployments)
- [Monorepo Workspaces Directory](#-monorepo-workspaces-directory)
- [System Architecture & Distributed Flow](#-system-architecture--distributed-flow)
- [Cryptographic & Security Specification Matrix](#-cryptographic--security-specification-matrix)
- [Repository Structure](#-repository-structure)
- [Quickstart & Local Development](#-quickstart--local-development)
- [Environment Configuration](#-environment-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Monorepo Scripts Reference](#-monorepo-scripts-reference)
- [License](#-license)

---

## 🌐 Live Production Deployments

| Deployment Target                  | Live Production URL                                                                            | Deployment Tier             |  Status  |
| :--------------------------------- | :--------------------------------------------------------------------------------------------- | :-------------------------- | :------: |
| **🛍️ Nexus Commerce (Storefront)** | [nexus-commerce-frontend.vercel.app](https://nexus-commerce-frontend.vercel.app)               | Vercel Edge SPA             | `ONLINE` |
| **⚙️ Nexus Commerce API Gateway**  | [nexus-commerce-backend.vercel.app/api/v1](https://nexus-commerce-backend.vercel.app/api/v1)   | Vercel Serverless (Node.js) | `ONLINE` |
| **🛡️ Key Vault Manager (UI)**      | [fullstack-nexus-frontend.vercel.app](https://fullstack-nexus-frontend.vercel.app)             | Vercel SPA + Edge Proxy     | `ONLINE` |
| **⚙️ Key Vault API Gateway**       | [fullstack-nexus-backend.vercel.app/api/v1](https://fullstack-nexus-backend.vercel.app/api/v1) | Vercel Serverless (Node.js) | `ONLINE` |
| **💼 Developer Portfolio Hub**     | [fullstack-nexus-portfolio.vercel.app](https://fullstack-nexus-portfolio.vercel.app)           | Vercel Edge SPA             | `ONLINE` |

---

## 📂 Monorepo Workspaces Directory

| Project / Workspace                                         | Domain & Architecture                                     | Core Tech Stack                                                                                |                  Specs & Documentation                   |
| :---------------------------------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------: |
| **🛍️ [`apps/nexus-commerce`](./apps/nexus-commerce)**       | Autonomous Multi-Currency Commerce, Telemetry & Sockets   | React 19, Express 5, Redis Lua, WebAuthn, Stripe, Tailwind v4, Cloudinary CDN, Socket.io + SSE | [Read Commerce Specs ➔](./apps/nexus-commerce/README.md) |
| **🛡️ [`apps/key-vault-manager`](./apps/key-vault-manager)** | Enterprise Secret Vault, Zero-Trust IAM & Cryptography    | React 19, Express 5, AES-256-GCM, MongoDB, Upstash Redis, Tailwind v4, Zod                     | [Read Vault Specs ➔](./apps/key-vault-manager/README.md) |
| **💼 [`apps/portfolio`](./apps/portfolio)**                 | Systems Engineering Showcase, Telemetry Ping & Tech Radar | React 19, Vite 8, Tailwind CSS v4, Framer Motion                                               |   [Read Portfolio Specs ➔](./apps/portfolio/README.md)   |
| **⚡ `Project 02: Event Mesh`**                             | Low-Latency Pub/Sub Broker & Dead-Letter Replay           | Node.js, Redis Pub/Sub, WebSockets, TimescaleDB                                                |                    _In Architecture_                     |
| **🧠 `Project 03: RAG Gateway`**                            | Semantic Caching & Autonomous Vector Search Engine        | Python, FastAPI, Qdrant / pgvector, LangChain                                                  |                     _In Development_                     |

---

## 🏗️ System Architecture & Distributed Flow

```text
+---------------------------------------------------------------------------------------+
|                           CLIENT TIER (React 19 + Vite 8)                             |
|  * Portfolio Hub: Live Gateway Latency Telemetry, Command Palette, System Radar       |
|  * Nexus Commerce: WebAuthn Passkeys, Live GPS Courier Radar, 3-Pane Support Desk     |
|  * Key Vault: Cyberpunk Glassmorphism UI, Zero-Leak Query Cache Eviction Protocol     |
|  * Web Locks API Single-Flight Token Refresh & Cross-Tab BroadcastChannel Sync        |
+-------------------------------------------+-------------------------------------------+
                                            | Signed httpOnly Partitioned Cookies (CHIPS)
                                            | x-client-instance-id & x-guest-session-id
                                            | x-request-id & x-request-timestamp Telemetry
                                            v
+---------------------------------------------------------------------------------------+
|                         API GATEWAY TIER (Express 5.2 / ESM)                          |
|  * Vercel Serverless Execution Router (/api/index.js)                                 |
|  * Dual Real-Time Gateway: Socket.io (Dev) + Server-Sent Events SSE (Prod Serverless) |
|  * Multi-Tier Rate Limiting (RedisStore / In-Memory Failover)                         |
|  * Zod Strict Structural Schemas & Content Sanitization (XSS Stripper)                |
|  * Pino Defense-in-Depth Structured Telemetry & Sensitive Field Redaction             |
+-------------------------------------------+-------------------------------------------+
                                            |
            +-------------------------------+-------------------------------+
            v                                                               v
+---------------------------------------+       +---------------------------------------+
|      COMMERCE & CRYPTO ENGINE         |       |       DISTRIBUTED SESSION & LOCKS     |
|  * AES-256-GCM AEAD (96-bit IV)       |       |  * Upstash Redis 10-Minute Stock Holds|
|  * Scrypt Barrier Key Derivation      |       |  * Atomic Redis Lua Concurrency Script|
|  * WebAuthn FIDO2 Biometric Challenge |       |  * Token Family Rotation & Grace Trap |
|  * Multi-Gateway Webhooks & IPN Dedupe|       |  * Distributed Idempotency Key Store  |
+-------------------+-------------------+       +-------------------+-------------------+
                    |                                               |
                    +-----------------------+-----------------------+
                                            v
+---------------------------------------------------------------------------------------+
|                         PERSISTENCE TIER (MongoDB Atlas)                              |
|  * Secrets: Ciphertext + Dynamic IV + AuthTag (Zero Plaintext at Rest)                |
|  * Inventory & Orders: OCC Atomic Transactions with Saga Rollback on Cancellation     |
|  * AuditLogs & Transactions: Immutable WORM Ledger with SHA-256 Event Signatures      |
|  * Sessions & Holds: Native MongoDB TTL Auto-Purge Indices (600s / 24h)               |
+---------------------------------------------------------------------------------------+
```

---

## 🔐 Cryptographic & Security Specification Matrix

| Security Domain              | Implementation Standard                                              | Security Rationale                                                                                                    |
| :--------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **Data Encryption at Rest**  | `AES-256-GCM` with random 96-bit IVs and 128-bit authentication tags | Ensures cryptographic confidentiality and authenticated AEAD tamper detection across all secret keys.                 |
| **Biometric Authentication** | `WebAuthn / FIDO2` Level 3 Attestation & Assertion Verification      | Eliminates passwords and credential stuffing via hardware-bound biometrics (Face ID, Touch ID, Windows Hello).        |
| **Flash-Sale Stock Holds**   | Atomic `Redis Lua Scripts` + MongoDB OCC Transactions                | Prevents overselling during high-concurrency checkouts with guaranteed 10-minute hold TTL expiration.                 |
| **Master Key Derivation**    | `crypto.scryptSync` with cryptographic domain salt                   | Derives deterministic 256-bit barrier keys in memory without storing raw root keys in plaintext.                      |
| **Transport Security**       | `httpOnly`, `SameSite=None/Lax`, `Secure`, `Partitioned` (CHIPS)     | Neutralizes client-side XSS cookie harvesting and cross-site request forgery (CSRF) across subdomains.                |
| **Token Family Rotation**    | Cryptographic token families (`tokenFamilyId` + `tokenVersion`)      | Immediate detection of token reuse; blacklists the entire token lineage upon replay attempts.                         |
| **Concurrency Shield**       | `2,000ms` Temporal Grace Window                                      | Prevents spurious session invalidation during simultaneous asynchronous Single-Page Application (SPA) network bursts. |
| **Webhook Deduplication**    | `WebhookEvent` unique index deduplication gate                       | Guarantees at-most-once processing for Stripe, JazzCash, and Easypaisa payment webhooks.                              |
| **4-Tier RBAC & Immunity**   | Super Admin, Merchant Admin, Support Agent, VIP Customer             | Granular privilege delegation guarded by immutable Master Owner root immunity.                                        |
| **Entropy Verification**     | `@zxcvbn-ts` algorithmic password score checking ($\ge 3$)           | Blocks dictionary attacks, sequential character patterns, and contextual user term leaks.                             |
| **Cache Isolation**          | React Query client eviction protocol (`queryClient.clear`)           | Completely flushes query memory upon logout, eliminating multi-tenant cross-session data leaks.                       |

---

## 🗂️ Repository Structure

```text
fullstack-nexus/
├── .github/workflows/              # Automated CI/CD & GitHub Actions Cron Jobs
│   └── inventory-cron.yml          # 10-minute self-healing inventory reconciler ping
├── .husky/                         # Git hooks (commit-msg, pre-commit)
├── apps/
│   ├── nexus-commerce/             # Autonomous Multi-Currency E-Commerce & Telemetry Engine
│   │   ├── backend/                # Express 5 REST API, WebSockets, Redis Lua, Payment Gateways
│   │   │   ├── api/                # Vercel serverless function entrypoint
│   │   │   ├── src/                # Controllers, models, routes, gateways & services
│   │   │   └── package.json
│   │   ├── frontend/               # React 19 SPA, Tailwind v4, Redux Toolkit, TanStack Query
│   │   │   ├── src/                # Storefront, Admin layout, 3-pane chat, GPS radar, modals
│   │   │   └── package.json
│   │   └── README.md
│   │
│   ├── key-vault-manager/          # Enterprise Key & Secret Vault Platform
│   │   ├── backend/                # Express 5 REST API, AES-256-GCM Engine, Redis & MongoDB
│   │   ├── frontend/               # React 19 SPA, Tailwind v4 Cyberpunk UI, Command Palette
│   │   └── README.md
│   │
│   └── portfolio/                  # Developer Portfolio & Monorepo Showcase Hub
│       ├── src/                    # System topology, interactive radars, modals & telemetry
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

# 2. Install dependencies across all monorepo workspaces
npm install
```

### 3. Launch Development Environments

```bash
# Concurrently launch Nexus Commerce (Backend on :4000, Frontend on :5175)
npm run dev:commerce

# Or launch Key Vault Manager (Backend on :3000, Frontend on :5173)
npm run dev:key-vault

# Or launch the Developer Portfolio Hub (Frontend on :5174)
npm run dev:portfolio
```

### 4. Interactive Showcase Access

1. **Nexus Commerce (`http://localhost:5175`):**
   - Click the **1-Click Evaluator Sandbox** bar on the login modal to switch between **VIP Shopper**, **Support Care Specialist**, and **Merchant Ops Lead** roles in under 2 seconds.
   - Test passwordless **WebAuthn Biometric Passkeys** (Touch ID / Face ID / Windows Hello).
   - Experience the **Live Courier GPS Telemetry Radar** with automated waypoint tracking.
   - Explore the **3-Pane Support Helpdesk** with real-time socket chat, client-side photo downscaling, and double-check read receipts (`CheckCheck`).

2. **Key Vault Manager (`http://localhost:5173`):**
   - Click **⚡ Instant Evaluator Access** to provision a verified admin pass (`demo@keyvault.io`).
   - Press **`Cmd + K`** (macOS) or **`Ctrl + K`** (Windows/Linux) to open the Command Palette.
   - Test real-time AES-256 key reveals, master key rotations, and the **Simulate 403 Drop Attack** security trigger.

---

## ⚙️ Environment Configuration

### Nexus Commerce Backend (`apps/nexus-commerce/backend/.env`)

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5175
MONGO_URI=mongodb://127.0.0.1:27017/nexus_commerce
REDIS_URL=redis://127.0.0.1:6379

# Sovereign Root Owner Identity
MASTER_OWNER_EMAIL=owner@nexuscommerce.io

# Cryptographic Signatures (Must be >= 32 characters)
JWT_SECRET=your_32_character_jwt_secret_key_minimum_length_here
REFRESH_SECRET=your_32_character_refresh_token_secret_key_here
COOKIE_SECRET=your_32_character_cookie_signature_secret_key_here

# Token Lifespans & Concurrency Holds
ACCESS_TOKEN_EXPIRY_DEV=15
REFRESH_TOKEN_EXPIRY_DEV=1440
ACCESS_TOKEN_EXPIRY_PROD=15
REFRESH_TOKEN_EXPIRY_PROD=7
INVENTORY_HOLD_TTL_SECONDS=600

# WebAuthn / Passkeys Configuration
RP_NAME="Nexus Commerce"
RP_ID=localhost
ORIGIN=http://localhost:5175

# Payment Gateway Credentials (Sandbox / Test Mode)
STRIPE_SECRET_KEY=sk_test_placeholder_key
STRIPE_WEBHOOK_SECRET=whsec_placeholder_webhook_secret

JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_RETURN_URL=http://localhost:4000/api/v1/payments/jazzcash/callback

EASYPAISA_STORE_ID=
EASYPAISA_HASH_KEY=
EASYPAISA_RETURN_URL=http://localhost:4000/api/v1/payments/easypaisa/callback

# Cloudinary CDN Media Storage (Optional: Falls back to local scoped disk)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Transactional Email (Defaults to Ethereal sandbox in development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# M2M Cron Reconciliation Secret
CRON_SECRET=nexus_cron_secure_key_123
```

### Nexus Commerce Frontend (`apps/nexus-commerce/frontend/.env`)

```env
VITE_API_URL=/api/v1
VITE_SOCKET_URL=http://localhost:4000
VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder_key
VITE_GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_APP_ENV=development
```

---

## 🧪 Testing & Quality Assurance

```bash
# Run flat-config ESLint validation across all monorepo workspaces
npm run lint

# Format codebase with Prettier
npm run format

# Run test suites across backend engines
npm run test --workspace=apps/nexus-commerce/backend
npm run test --workspace=apps/key-vault-manager/backend

# Validate production builds
npm run build --workspace=apps/nexus-commerce/frontend
npm run build --workspace=apps/key-vault-manager/frontend
npm run build --workspace=apps/portfolio
```

---

## 🛠️ Monorepo Scripts Reference

| Command                 | Action                                                                       |
| :---------------------- | :--------------------------------------------------------------------------- |
| `npm run dev`           | Concurrently boots the primary workspace (`nexus-commerce`).                 |
| `npm run dev:commerce`  | Concurrently launches Nexus Commerce API (`:4000`) and Storefront (`:5175`). |
| `npm run dev:key-vault` | Concurrently launches Key Vault API (`:3000`) and UI (`:5173`).              |
| `npm run dev:portfolio` | Launches the Developer Portfolio showcase server (`:5174`).                  |
| `npm run lint`          | Runs ESLint flat-config checking across all workspace files.                 |
| `npm run format`        | Runs Prettier formatting across JavaScript, JSX, CSS, and Markdown.          |

---

## 📄 License

This repository is distributed under the [MIT License](./LICENSE).
