# ⚡ FullStack Nexus — Enterprise Full-Stack Monorepo

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=nodedotjs&style=flat-square)](https://nodejs.org/)
[![npm Workspaces](https://img.shields.io/badge/npm-Workspaces-CB3837?logo=npm&style=flat-square)](https://docs.npmjs.com/cli/using-npm/workspaces)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000?logo=express&style=flat-square)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&style=flat-square)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Cache-Upstash_Redis-DC382D?logo=redis&style=flat-square)](https://redis.io/)
[![Cryptography](https://img.shields.io/badge/Security-AES--256--GCM-FF6B00?logo=shield&style=flat-square)](https://nodejs.org/api/crypto.html)
[![WebAuthn](https://img.shields.io/badge/Auth-FIDO2_Passkeys-4285F4?logo=fido&style=flat-square)](https://fidoalliance.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> A modern full-stack monorepo featuring three production-grade web applications: an autonomous e-commerce engine with live telemetry, a zero-trust cryptographic secrets vault, and an interactive recruiter applicant tracking system (ATS).

---

## 📑 Table of Contents

- [Live Production Deployments](#-live-production-deployments)
- [Featured Applications](#-featured-applications)
- [System Architecture](#-system-architecture)
- [Security & Engineering Standards](#-security--engineering-standards)
- [Repository Structure](#-repository-structure)
- [Quickstart & Local Development](#-quickstart--local-development)
- [Interactive Testing Guide](#-interactive-testing-guide)
- [Environment Configuration](#-environment-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## 🌐 Live Production Deployments

| Application                     | Live Demo URL                                                                                  | Tier                        |  Status  |
| :------------------------------ | :--------------------------------------------------------------------------------------------- | :-------------------------- | :------: |
| **🛍️ Nexus Commerce**           | [nexus-commerce-frontend.vercel.app](https://nexus-commerce-frontend.vercel.app)               | Vercel Edge SPA             | `ONLINE` |
| **⚙️ Commerce API Gateway**     | [nexus-commerce-backend.vercel.app/api/v1](https://nexus-commerce-backend.vercel.app/api/v1)   | Vercel Serverless (Node.js) | `ONLINE` |
| **🎯 Nexus ATS (Talent Suite)** | [nexus-ats-frontend.vercel.app](https://nexus-ats-frontend.vercel.app)                         | Vercel Edge SPA             | `ONLINE` |
| **🛡️ Key Vault Manager**        | [fullstack-nexus-frontend.vercel.app](https://fullstack-nexus-frontend.vercel.app)             | Vercel SPA + Edge Proxy     | `ONLINE` |
| **⚙️ Key Vault API Gateway**    | [fullstack-nexus-backend.vercel.app/api/v1](https://fullstack-nexus-backend.vercel.app/api/v1) | Vercel Serverless (Node.js) | `ONLINE` |
| **💼 Developer Portfolio Hub**  | [fullstack-nexus-portfolio.vercel.app](https://fullstack-nexus-portfolio.vercel.app)           | Vercel Edge SPA             | `ONLINE` |

---

## 📂 Featured Applications

| Application & Path                                          | Core Focus & Features                                                                                                                                  | Tech Stack                                                                    |                      Documentation                       |
| :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------: |
| **🛍️ [`apps/nexus-commerce`](./apps/nexus-commerce)**       | Multi-currency storefront, live GPS order delivery map, instant stock holds, 3-pane support helpdesk, and passwordless biometric passkeys.             | React 19, Express 5, Redis Lua, WebAuthn, Stripe, Socket.io, Tailwind v4      | [Read Commerce Specs ➔](./apps/nexus-commerce/README.md) |
| **🎯 [`apps/nexus-ats`](./apps/nexus-ats)**                 | High-velocity recruitment suite featuring drag-and-drop Kanban pipelines, 4-tab candidate dossiers, requisition lifecycle tools, and hiring analytics. | React 19, React Router v7, Redux Toolkit, @hello-pangea/dnd, Recharts, Sonner |      [Read ATS Specs ➔](./apps/nexus-ats/README.md)      |
| **🛡️ [`apps/key-vault-manager`](./apps/key-vault-manager)** | Enterprise secret credentials vault with hardware-grade AES-256-GCM encryption, granular access control, audit logs, and command palette (`⌘K`).       | React 19, Express 5, AES-256-GCM, MongoDB, Upstash Redis, Zod                 | [Read Vault Specs ➔](./apps/key-vault-manager/README.md) |
| **💼 [`apps/portfolio`](./apps/portfolio)**                 | Interactive engineering showcase featuring live API gateway ping telemetry, systems radar, and project visuals.                                        | React 19, Vite 8, Tailwind CSS v4, Framer Motion                              |   [Read Portfolio Specs ➔](./apps/portfolio/README.md)   |

---

## 🏗️ System Architecture

```text
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|  * Nexus Commerce: WebAuthn passkeys, live courier GPS radar, customer support desk   |
|  * Nexus ATS: Drag-and-drop Kanban pipeline, candidate dossier drawer, funnel charts  |
|  * Key Vault: Glassmorphism dashboard, real-time command palette search (Cmd + K)     |
|  * Shared: Multi-tab BroadcastChannel sync & automatic dark/light theme persistence   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | Secure httpOnly Cookies & REST API Calls
                                            v
+---------------------------------------------------------------------------------------+
|                                    API GATEWAYS                                       |
|  * Vercel Serverless Node.js Execution Handlers                                      |
|  * Real-Time Telemetry Gateways: WebSockets + Server-Sent Events (SSE)                 |
|  * Multi-Tier Rate Limiting & Distributed Idempotency Key deduplication               |
|  * Strict Zod Data Validation Schemas & Content Sanitization                          |
+-------------------------------------------+-------------------------------------------+
                                            |
            +-------------------------------+-------------------------------+
            v                                                               v
+---------------------------------------+       +---------------------------------------+
|           APPLICATION LOGIC           |       |       DISTRIBUTED SESSIONS & LOCKS    |
|  * AES-256-GCM AEAD Data Encryption   |       |  * Redis 10-Minute Temporary Cart Hold|
|  * WebAuthn / FIDO2 Level 3 Biometrics|       |  * Atomic Concurrency Control Scripts |
|  * Multi-Gateway Payments & Webhooks  |       |  * Refresh Token Family Lineage Guard |
+-------------------+-------------------+       +-------------------+-------------------+
                    |                                               |
                    +-----------------------+-----------------------+
                                            v
+---------------------------------------------------------------------------------------+
|                                  PERSISTENCE LAYER                                    |
|  * MongoDB Atlas: Encrypted Secrets (Zero Plaintext), Orders & Normalized Candidates  |
|  * Immutable Ledger: Comprehensive Audit Logs with SHA-256 Signatures                |
|  * Self-Purging Data: Native MongoDB TTL Indexes for Temporary Sessions and Holds     |
+---------------------------------------------------------------------------------------+
```

---

## 🔐 Security & Engineering Standards

- **Zero Plaintext at Rest**: Secrets and sensitive keys are encrypted with `AES-256-GCM` using unique 96-bit initialization vectors (IVs) and 128-bit authentication tags.
- **Biometric Authentication**: Supports passwordless WebAuthn / FIDO2 authentication (Touch ID, Face ID, Windows Hello) alongside traditional credentials.
- **Flash-Sale Inventory Protection**: Atomic Redis concurrency locks temporarily reserve items for 10 minutes during checkout to eliminate double-booking or overselling.
- **Token Family Rotation**: Automatic token versioning detects and neutralizes compromised token reuse attempts instantly.
- **Cross-Tab Real-Time Sync**: Utilizes the browser `BroadcastChannel` API to sync authentication, login, and sign-out states across all open tabs simultaneously.
- **Zero Cumulative Layout Shift (CLS)**: Custom pulsed skeletons match layout geometry identically before data hydrates.

---

## 🗂️ Repository Structure

```text
fullstack-nexus/
├── .github/workflows/              # Automated CI/CD & GitHub Actions Cron workflows
├── .husky/                         # Git hooks (commit-msg, pre-commit lint-staged)
├── apps/
│   ├── nexus-commerce/             # E-Commerce platform & real-time telemetry engine
│   │   ├── backend/                # Express 5 REST API, WebSockets & payment gateways
│   │   └── frontend/               # React 19 SPA, Tailwind CSS v4 & Redux Toolkit
│   │
│   ├── nexus-ats/                  # Recruitment suite & applicant tracking system
│   │   └── frontend/               # React 19 SPA, @hello-pangea/dnd & Recharts analytics
│   │
│   ├── key-vault-manager/          # Enterprise credentials & secret vault platform
│   │   ├── backend/                # Express 5 REST API, AES-256-GCM cryptographic engine
│   │   └── frontend/               # React 19 SPA, Cyberpunk theme & Command Palette
│   │
│   └── portfolio/                  # Developer portfolio & interactive systems showcase
│       └── src/                    # System topology, telemetry radars & projects registry
│
├── commitlint.config.js            # Commit conventions enforcement
├── eslint.config.js                # Unified ESLint 9 configuration
├── package.json                    # Root npm workspaces configuration
└── README.md                       # Monorepo documentation
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`
- **MongoDB:** Local instance running on port `27017` or a MongoDB Atlas cloud URI
- **Redis (Optional):** Local Redis or Upstash Redis URL (falls back to an in-memory cache if absent)

### 2. Installation

```bash
# 1. Clone the repository
git clone https://github.com/aimalrx200/fullstack-nexus.git
cd fullstack-nexus

# 2. Install dependencies across all monorepo workspaces
npm install
```

### 3. Launch Any Project

```bash
# Launch Nexus ATS (Frontend on :5176)
npm run dev:ats

# Launch Nexus Commerce (Backend on :4000, Frontend on :5175)
npm run dev:commerce

# Launch Key Vault Manager (Backend on :3000, Frontend on :5173)
npm run dev:key-vault

# Launch Developer Portfolio Hub (Frontend on :5174)
npm run dev:portfolio
```

---

## 🧪 Interactive Testing Guide

All applications include **1-Click Evaluator Sandboxes** so anyone can test full functionality immediately without setting up accounts:

### 1. Nexus ATS (`http://localhost:5176`)

- **Closed-Loop Application Flow**: Go to `/` (Careers Board), pick a job (e.g., _Senior Frontend Architect_), and submit an application. Switch to `/login` and click **"Explore as Demo Recruiter"**—your newly submitted applicant will appear immediately in the **New Applied** column of the Kanban board!
- **Interactive Kanban**: Drag and drop candidate cards across stages (_Applied_, _Screen_, _Interview_, _Offer_, _Archived_).
- **Candidate Dossier Drawer**: Click any candidate card to inspect their CV, record recruiter notes, review stage history, and rate their competency (1–5 stars).
- **Requisitions & Analytics**: Navigate to **Job Requisitions** to publish or pause roles, or check **Recruitment Analytics** to review stage funnel metrics and department hiring velocity.

### 2. Nexus Commerce (`http://localhost:5175`)

- **1-Click Evaluator Bar**: Click the sandbox bar on the login modal to switch instantly between **VIP Shopper**, **Support Care Specialist**, and **Merchant Ops Lead** roles.
- **Live Courier Radar**: Experience animated GPS courier updates with real-time waypoint delivery tracking.
- **Live Support Chat**: Test the real-time helpdesk with canned responses and image compression.

### 3. Key Vault Manager (`http://localhost:5173`)

- **Instant Admin Pass**: Click **⚡ Instant Evaluator Access** to enter as a verified security admin.
- **Command Palette**: Press **`Cmd + K`** (macOS) or **`Ctrl + K`** (Windows/Linux) to search and navigate between Development, Staging, and Production vaults.
- **Crypto Key Reveal**: Test real-time AES-256 key reveals and master key rotations.

---

## ⚙️ Environment Configuration

Sample environment files are provided inside each application workspace:

- `apps/nexus-commerce/backend/.env.example`
- `apps/nexus-commerce/frontend/.env.example`
- `apps/key-vault-manager/backend/.env.example`
- `apps/key-vault-manager/frontend/.env.example`
- `apps/portfolio/.env.example`

To configure a local backend, copy `.env.example` to `.env` inside the relevant workspace and fill in your connection strings.

---

## 🧪 Testing & Quality Assurance

```bash
# Run linting across the entire monorepo
npm run lint

# Format code with Prettier
npm run format

# Run backend unit/integration tests
npm run test --workspace=apps/nexus-commerce/backend
npm run test --workspace=apps/key-vault-manager/backend

# Validate production builds
npm run build --workspace=apps/nexus-commerce/frontend
npm run build --workspace=apps/nexus-ats/frontend
npm run build --workspace=apps/key-vault-manager/frontend
npm run build --workspace=apps/portfolio
```

---

## 🛠️ Available Scripts

| Command                 | Action                                                          |
| :---------------------- | :-------------------------------------------------------------- |
| `npm run dev:ats`       | Boots the Nexus ATS talent acquisition platform (`:5176`).      |
| `npm run dev:commerce`  | Boots Nexus Commerce API (`:4000`) and Storefront UI (`:5175`). |
| `npm run dev:key-vault` | Boots Key Vault API (`:3000`) and UI (`:5173`).                 |
| `npm run dev:portfolio` | Boots the developer portfolio hub (`:5174`).                    |
| `npm run lint`          | Runs ESLint 9 checks across all monorepo files.                 |
| `npm run format`        | Formats all code with Prettier.                                 |

---

## 📄 License

This repository is distributed under the [MIT License](./LICENSE).
