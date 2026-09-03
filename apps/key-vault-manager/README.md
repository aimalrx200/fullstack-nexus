# Key Vault Manager — Enterprise Cryptographic Security Dashboard

[![React](https://img.shields.io/badge/Frontend-React_19.2-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express_5.2-000000?logo=express&style=flat-square)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-06B6D4?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Mongoose_9-47A248?logo=mongodb&style=flat-square)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Session_Cache-Redis_ioredis-DC382D?logo=redis&style=flat-square)](https://redis.io/)
[![Cryptography](https://img.shields.io/badge/Security-AES--256--GCM_AEAD-FF6B00?logo=shield&style=flat-square)](https://nodejs.org/api/crypto.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> An enterprise-grade, zero-trust Secret and Key Vault Management Dashboard featuring hardware-accelerated AES-256-GCM AEAD encryption, token family rotation with Redis sliding sessions, real-time command palette search (Cmd + K), on-the-fly authenticated decryption, SIEM compliance stream filtering, an interactive 403 attack simulator, and Merkle-sealed audit trails.

---

## Table of Contents

- [System Architecture Flow](#system-architecture-flow)
- [Cryptographic and Security Specification Matrix](#cryptographic-and-security-specification-matrix)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [REST API Reference](#rest-api-reference)
  - [Authentication Endpoints (/api/v1/auth)](#authentication-endpoints-apiv1auth)
  - [Vault and Secrets Endpoints (/api/v1/vault)](#vault-and-secrets-endpoints-apiv1vault)
  - [Telemetry and Health Check (/api/v1/check)](#telemetry-and-health-check-apiv1check)
- [Environment Configuration](#environment-configuration)
  - [Backend Environment (apps/key-vault-manager/backend/.env)](#backend-environment-appskey-vault-managerbackendenv)
  - [Frontend Environment (apps/key-vault-manager/frontend/.env)](#frontend-environment-appskey-vault-managerfrontendenv)
- [Quickstart and Installation](#quickstart-and-installation)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Monorepo Workspace Scripts](#monorepo-workspace-scripts)
- [License](#license)

---

## System Architecture Flow

```text
+-------------------------------------------------------------------------------+
|                       CLIENT TIER (React 19 + Vite)                           |
|  * Cyberpunk Glassmorphism Design System (Tailwind CSS v4 Token Engine)       |
|  * Command Palette (Cmd+K) with Live Query Cache Search Indexer               |
|  * Web Locks API Single-Flight Token Refresh & BroadcastChannel Sync          |
|  * Zero-Leak Cache Eviction on Account Switch (queryClient.clear)             |
+---------------------------------------+---------------------------------------+
                                        | Signed httpOnly Cookies (SameSite=Strict)
                                        | x-client-instance-id (Tab Sandbox Tracking)
                                        | x-request-id & x-request-timestamp Telemetry
                                        v
+-------------------------------------------------------------------------------+
|                     API GATEWAY TIER (Express 5.2)                            |
|  * Multi-Tier Rate Limiting (RedisStore / In-Memory Failover)                 |
|  * Zod Strict Structural Schemas & Content Normalization                      |
|  * Pino Defense-in-Depth Telemetry & Sensitive Header/Payload Redaction       |
+---------------------------------------+---------------------------------------+
                                        |
            +---------------------------+---------------------------+
            v                                                       v
+-------------------------------+       +---------------------------------------+
|   CRYPTOGRAPHIC ENGINE TIER   |       |        DISTRIBUTED SESSION TIER       |
|  * AES-256-GCM AEAD (12B IV)  |       |  * Redis Sliding Session Blacklist    |
|  * Scrypt Barrier Derivation  |       |  * Token Family Rotation & Replay Trap|
|  * Real-Time On-Demand Reveal |       |  * 2000ms Concurrency Grace Window    |
|  * Automated Version Rotation |       |  * LRU Memory Failover Layer          |
+---------------+---------------+       +-------------------+-------------------+
                |                                           |
                +-----------------------+-------------------+
                                        v
+-------------------------------------------------------------------------------+
|                        PERSISTENCE TIER (MongoDB)                             |
|  * Secrets: Ciphertext + Dynamic IV + AuthTag (Zero Plaintext at Rest)        |
|  * AuditLogs: Immutable SHA-256 HMAC Telemetry Stream                         |
|  * Sessions & Tokens: Native TTL Auto-Purge Indices                           |
+-------------------------------------------------------------------------------+
```

---

## Cryptographic and Security Specification Matrix

| Security Domain               | Implementation                                                       | Security Benefit                                                                            |
| :---------------------------- | :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Data Encryption at Rest**   | `AES-256-GCM` with random 96-bit IVs and 128-bit authentication tags | Guarantees data confidentiality and AEAD integrity detection against ciphertext tampering.  |
| **Master Key Derivation**     | `crypto.scryptSync` with cryptographic salt                          | Generates deterministic 256-bit barrier keys without storing master keys in plaintext.      |
| **Transport Security**        | `httpOnly`, `SameSite=Strict`, Signed Cookies (`/api/v1`)            | Eliminates client-side XSS cookie theft and cross-site request forgery (CSRF) vectors.      |
| **Token Family Rotation**     | Cryptographic token families (`tokenFamilyId` + `tokenVersion`)      | Immediate detection of token reuse; revokes the entire family tree upon replay attempts.    |
| **Concurrency Shield**        | 2000ms Grace Window                                                  | Prevents accidental session invalidations during simultaneous SPA network bursts.           |
| **Session Blacklisting**      | Redis `setex` with LRU failover                                      | Sub-millisecond distributed token revocation and compromise containment.                    |
| **Password Entropy**          | `@zxcvbn-ts` entropy checking (Score >= 3)                           | Prevents dictionary attacks, contextual email matching, and sequential patterns.            |
| **Tamper-Proof Audit Trail**  | MongoDB WORM ledger with SHA-256 Merkle root lineages                | Immutable chronological record of every key reveal, creation, rotation, and perimeter drop. |
| **Zero-Leak Cache Isolation** | React Query cache clearance protocol                                 | Completely evicts in-memory queries upon logout, preventing multi-tenant data leaks.        |

---

## Key Features

- **1-Click Evaluator Guest Pass:** Instant evaluator demo button on the login screen that self-provisions a verified administrator session (`demo@keyvault.io`) in under 3 seconds without requiring email confirmation or OAuth setup.
- **Cyberpunk Command Palette (Cmd + K / Ctrl + K):** High-speed global fuzzy search indexing live MongoDB secrets, mounted engines, zero-trust policies, machine identities, and audit logs with category filter chips and full keyboard navigation.
- **Multi-Namespace Vault Management (Production, Staging, Development):** Independent secret environments with dynamic database lease renewal, key revocation, and version history.
- **Multi-Language SDK Snippet Generator:** Copyable, production-ready integration snippets in **cURL**, **Node.js SDK**, **Python (hvac)**, and **Go (vault/api)** for every secret.
- **SIEM Compliance Stream & 403 Attack Simulator:** Live-polling audit ledger with category filter chips (Reveals, Creations, Rotations, Leases, Drops), CSV export, and an interactive Simulate 403 Drop Attack trigger.
- **Cryptographic Manifest Exporter:** Downloads a signed, timestamped `.json` configuration manifest with SHA-256 HMAC Merkle proof seals for disaster recovery backup.
- **Cyberpunk Glassmorphism UI:** Fully responsive dark and light modes styled using **Tailwind CSS v4** design tokens, scanline overlays, HUD brackets, and custom micro-animations.

---

## Tech Stack

### Frontend Workspace

- **Core:** React 19.2, Vite 8, React Router v7
- **Styling and Design System:** Tailwind CSS v4, Custom CSS Tokens and Cyberpunk Theme Engine
- **State and Data Fetching:** TanStack React Query v5, Redux Toolkit
- **Icons and Motion:** Lucide React, Framer Motion, Sonner Notifications
- **OAuth and Security:** `@react-oauth/google`, `@zxcvbn-ts` Password Analyzer

### Backend Workspace

- **Runtime and Framework:** Node.js (ES Modules), Express 5.2
- **Database and Cache:** MongoDB (Mongoose 9), Redis (`ioredis` + `rate-limit-redis`)
- **Cryptography:** Node.js `crypto` (`AES-256-GCM`, `scrypt`, `SHA-256`), `jsonwebtoken`, `bcrypt`
- **Validation and Logging:** Zod, Pino Structured Logger (`pino-pretty`)
- **Mail Service:** Nodemailer (with Ethereal local test fallback pool)

---

## REST API Reference

### Authentication Endpoints (/api/v1/auth)

| Method | Endpoint                       | Auth Required | Description                                                       |
| :----- | :----------------------------- | :-----------: | :---------------------------------------------------------------- |
| `POST` | `/api/v1/auth/demo`            |      No       | 1-Click self-healing demo evaluator session initialization        |
| `POST` | `/api/v1/auth/login`           |      No       | Traditional credential authentication (email/username + password) |
| `POST` | `/api/v1/auth/google`          |      No       | Google Workspace OAuth authorization code exchange                |
| `POST` | `/api/v1/auth/register`        |      No       | New account provisioning with verification token dispatch         |
| `POST` | `/api/v1/auth/verify-email`    |      No       | Consumes single-use SHA-256 verification token                    |
| `POST` | `/api/v1/auth/refresh`         |      No       | Rotates refresh token pair within concurrency grace window        |
| `POST` | `/api/v1/auth/forgot-password` |      No       | Dispatches rate-limited password reset link                       |
| `POST` | `/api/v1/auth/reset-password`  |      No       | Consumes reset token and globally terminates other sessions       |
| `POST` | `/api/v1/auth/logout`          |      Yes      | Nuclear session revocation across MongoDB and Redis cache         |

### Vault and Secrets Endpoints (/api/v1/vault)

| Method   | Endpoint                           | Auth Required | Description                                                         |
| :------- | :--------------------------------- | :-----------: | :------------------------------------------------------------------ |
| `GET`    | `/api/v1/vault/secrets`            |      Yes      | Retrieves all secrets for the user in namespace (values masked)     |
| `GET`    | `/api/v1/vault/secrets/:id/reveal` |      Yes      | Authenticated AES-256-GCM decryption + audit log dispatch           |
| `POST`   | `/api/v1/vault/secrets`            |      Yes      | Encrypts plaintext with random IV, stores ciphertext + auth tag     |
| `POST`   | `/api/v1/vault/secrets/:id/rotate` |      Yes      | Re-encrypts with fresh entropy and increments secret version        |
| `POST`   | `/api/v1/vault/secrets/:id/renew`  |      Yes      | Extends active dynamic database lease duration                      |
| `POST`   | `/api/v1/vault/secrets/:id/revoke` |      Yes      | Immediately revokes dynamic database lease                          |
| `DELETE` | `/api/v1/vault/secrets/:id`        |      Yes      | Purges secret and writes immutable audit record                     |
| `GET`    | `/api/v1/vault/audit-logs`         |      Yes      | Retrieves chronological audit records for the user                  |
| `POST`   | `/api/v1/vault/simulate-attack`    |      Yes      | Injects an external untrusted CIDR probe dropped by perimeter gates |
| `POST`   | `/api/v1/vault/reset-demo`         |      Yes      | Purges and re-seeds default encrypted showcase secrets              |

### Telemetry and Health Check (/api/v1/check)

| Method | Endpoint                   | Auth Required | Description                                               |
| :----- | :------------------------- | :-----------: | :-------------------------------------------------------- |
| `GET`  | `/api/v1/check/auth-check` |      Yes      | Returns authenticated identity claims and database status |

---

## Environment Configuration

### Backend Environment (apps/key-vault-manager/backend/.env)

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/key_vault_manager

# Cryptographic Signatures (Must be at least 32 characters)
JWT_SECRET=super_secret_jwt_cryptographic_key_at_least_32_characters_long!
REFRESH_SECRET=super_secret_refresh_cryptographic_key_32_characters!
COOKIE_SECRET=super_secret_cookie_signing_key_at_least_32_chars!

# Token Expiry Durations (Development in minutes, Production in days)
ACCESS_TOKEN_EXPIRY_DEV=15
REFRESH_TOKEN_EXPIRY_DEV=1440
ACCESS_TOKEN_EXPIRY_PROD=15
REFRESH_TOKEN_EXPIRY_PROD=7

# Distributed Cache (Optional: Leave empty to use local LRU fallback)
REDIS_URL=redis://127.0.0.1:6379

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_placeholder
GOOGLE_CLIENT_SECRET=your_google_client_secret_placeholder

# SMTP Configuration (Defaults to Ethereal in development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

### Frontend Environment (apps/key-vault-manager/frontend/.env)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id_placeholder
VITE_APP_ENV=development
```

---

## Quickstart and Installation

### 1. Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`
- **MongoDB:** Running locally on port `27017` or a cloud MongoDB Atlas connection URI
- **Redis (Optional):** Local Redis or Upstash Redis (falls back to in-memory LRU if not provided)

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/your-username/fullstack-nexus.git
cd fullstack-nexus
npm install
```

### 3. Launch Development Server

```bash
# Concurrently boots Backend (Port 3000) and Frontend (Port 5173)
npm run dev:key-vault
```

### 4. Explore the Dashboard

1. Open `http://localhost:5173` in your browser.
2. Click **Instant Evaluator Access (Demo Pass)** to sign in immediately without email confirmation.
3. Use **Cmd + K** (macOS) or **Ctrl + K** (Windows/Linux) to open the Command Palette.
4. Test on-demand AES-256 decryption, key rotation, and the **Simulate 403 Drop Attack** trigger.

---

## Testing and Quality Assurance

```bash
# Format codebase with Prettier
npm run format

# Run ESLint validation across all workspaces
npm run lint

# Build frontend production bundle
npm run build --workspace=apps/key-vault-manager/frontend

# Run backend unit tests with Vitest
npm run test --workspace=apps/key-vault-manager/backend
```

---

## Monorepo Workspace Scripts

| Command                 | Action                                                                        |
| :---------------------- | :---------------------------------------------------------------------------- |
| `npm run dev`           | Concurrently boots the default development workspace.                         |
| `npm run dev:key-vault` | Concurrently launches Key Vault backend (port 3000) and frontend (port 5173). |
| `npm run dev:portfolio` | Boots the developer portfolio workspace.                                      |
| `npm run lint`          | Runs ESLint across all monorepo packages.                                     |
| `npm run format`        | Runs Prettier write format on all JavaScript, JSX, CSS, and Markdown.         |

---

## License

This project is licensed under the [MIT License](../../LICENSE).
