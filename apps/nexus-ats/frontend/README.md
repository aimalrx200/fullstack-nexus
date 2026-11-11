# 🎯 Nexus ATS — High-Velocity Talent Acquisition Suite

[![Live Demo](https://img.shields.io/badge/Live_Demo-nexus--ats--frontend.vercel.app-6366F1?style=flat-square&logo=vercel)](https://nexus-ats-frontend.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![React Router 7](https://img.shields.io/badge/React_Router-v7.1-CA4245?logo=reactrouter&style=flat-square)](https://reactrouter.com/)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux_Toolkit_2.0-764ABC?logo=redux&style=flat-square)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?logo=vite&style=flat-square)](https://vitejs.dev/)
[![Drag and Drop](https://img.shields.io/badge/Drag_&_Drop-@hello--pangea/dnd-10B981?style=flat-square)](https://github.com/hello-pangea/dnd)
[![Recharts](https://img.shields.io/badge/Visualizations-Recharts_2.15-22C55E?style=flat-square)](https://recharts.org/)

> **Nexus ATS** is an enterprise-grade applicant tracking and hiring operations suite. It bridges a public careers portal with a recruiter workspace featuring interactive drag-and-drop Kanban pipelines, sliding candidate dossiers, job requisition management, and real-time recruitment funnel analytics.

---

## 📑 Table of Contents

- [Live Deployment](#-live-deployment)
- [Key Features](#-key-features)
- [Architecture & Engineering Highlights](#-architecture--engineering-highlights)
- [Interactive Testing Guide](#-interactive-testing-guide)
- [Workspace Directory Structure](#-workspace-directory-structure)
- [Quickstart & Local Development](#-quickstart--local-development)
- [State Management & Data Flow](#-state-management--data-flow)
- [Tech Stack Reference](#-tech-stack-reference)

---

## 🌐 Live Deployment

| Target               | URL                                                                    | Tier                       |
| :------------------- | :--------------------------------------------------------------------- | :------------------------- |
| **Nexus ATS Portal** | [nexus-ats-frontend.vercel.app](https://nexus-ats-frontend.vercel.app) | Production Vercel Edge SPA |

---

## ✨ Key Features

### 1. 🌐 Public Careers Portal

- **Job Board**: Live keyword search, department filtering pills, and workplace type selectors (Remote, Hybrid, On-site).
- **Position Detail Views**: Detailed role breakdowns covering responsibilities, technical qualifications, total rewards, and sticky compensation cards.
- **Closed-Loop Application Intake**: Interactive modal for submitting contact details, portfolio links, and PDF resumes with immediate visual feedback.

### 2. 📋 Recruiter Kanban Pipeline

- **Smooth Drag-and-Drop**: Built using `@hello-pangea/dnd` with two-axis scrolling (horizontal board track + vertical column scrolling).
- **Interactive Candidate Cards**: Displays candidate avatars, target roles, experience levels, skill tag overflow pills (`+N`), star ratings, and PDF resume badges.
- **Pipeline Filter Suite**: Filter applicants by specific job requisition, search in real-time across candidate names, emails, and skill tags, or reset all active filters with one click.
- **Zero-CLS Skeletons**: 5-column pulsed placeholder eliminates layout shifts during state hydration.

### 3. 📂 Candidate Dossier Drawer

- **Slide-Out Inspection Modal**: Mounts safely via `createPortal` with background scroll locking and `Escape` key listeners.
- **4-Tab Navigation**:
  - **Resume & Profile**: Access official CV documents, target salary expectations, experience, and verified skill badges.
  - **Scorecard Widget**: Interactive 1–5 star competency rater, sub-criteria progress meters (_Technical Architecture_, _Communication_, _System Design_), and hiring recommendations (_Strong Hire_, _Hire_, _Review Required_, _Do Not Hire_).
  - **Recruiter Notes**: Chronological feedback feed with author avatars, timestamps, and note creation.
  - **Activity Log**: Audit trail tracking inbound application submission and stage transitions.

### 4. 💼 Job Requisition Manager & Creator

- **Requisitions Management Canvas**: Dual-mode UI (data table on desktop, cards on mobile) with search, department filtering, and live applicant tallies.
- **Status Lifecycle Control**: Instantly toggle roles between `Active`, `Paused`, and `Archived` states.
- **Requisition Creator Modal**: Full dialog to publish new roles with automatic URL slug generation and dynamic requirement/responsibility list builders.

### 5. 📊 Recruitment Analytics & Funnel Dashboard

- **Executive KPI Cards**: Real-time metrics for _Total Talent Pool_, _Active Requisitions_, _Interview Progression Rate_, _Offer Extension Rate_, and _Average Evaluator Score_.
- **Interactive Recharts Visualizations**:
  - **Hiring Funnel Progression**: Bar chart mapping applicant volume across all recruitment stages.
  - **Department Hiring Velocity**: Distribution comparing candidate volume against open requisitions per pod.
  - **Hiring Health & Sentiment**: Breakdown of evaluator recommendations with custom progress meters.

---

## 🏗️ Architecture & Engineering Highlights

```text
+---------------------------------------------------------------------------------------+
|                             PUBLIC APPLICANT WORKFLOW                                 |
|  * Browse Open Roles (/jobs) -> Inspect Position Specs -> Submit Application Modal    |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | addCandidate & incrementApplicantCount
                                            v
+---------------------------------------------------------------------------------------+
|                            REDUX TOOLKIT NORMALIZED STORE                             |
|  * candidateSlice (applicants, stages, scorecards, notes, activity timelines)          |
|  * jobSlice (requisitions, statuses, applicant counters, department filters)          |
|  * authSlice (active recruiter session, demo pass, multi-tab sync status)             |
|  * uiSlice (candidate drawer, mobile sidebar, create-job modal states)                |
|  * themeSlice (reactive dark/light mode synchronized with DOM [data-theme])           |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | Instant Reactive State Projection
                                            v
+---------------------------------------------------------------------------------------+
|                            RECRUITER WORKSPACE WORKFLOW                               |
|  * Talent Pipeline: Optimistic drag-and-drop stage updates with Sonner notifications  |
|  * Dossier Drawer: Live 1-5 star scorecards, recruiter feedback notes, CV previews    |
|  * Requisition Manager: Status toggle (Active/Paused/Archived) & deep-link navigation  |
|  * Analytics Dashboard: Live Recharts funnel progression & department velocity        |
+---------------------------------------------------------------------------------------+
```

- **Cross-Tab Authentication Bus**: Uses the native browser `BroadcastChannel` API (`nexus_ats_auth_bus`) to sync sign-ins, logouts, and session expirations across multiple open browser tabs.
- **Zero Inline Styles**: 100% built with colocated CSS Modules (`.module.css`) and design tokens (`tokens/dark.css`, `tokens/light.css`), strictly avoiding inline `style={{}}` attributes.
- **Ultra-Responsive Layout**: Tested down to **320px** viewports with zero horizontal overflow, leveraging dynamic flex wrapping, adaptive table-to-card transformations, and `100dvh` mobile height support.
- **Defensive Error Boundaries**: Root-level `RouteErrorBoundary` catches route-level failures or dynamic code-splitting chunk errors, pairing with a dedicated `NotFoundPage` (404).

---

## 🧪 Interactive Testing Guide

Experience the entire system in under two minutes:

### Test 1: The Closed-Loop Application Flow

1. Open the [Nexus ATS Portal](https://nexus-ats-frontend.vercel.app) in your browser.
2. Select any open position (e.g., **Senior Frontend Architect**) and click **Apply Now**.
3. Fill in your details (e.g., _"Sarah Jenkins"_, upload any dummy PDF) and click **Send Application**.
4. Now, open `/login` and click **"Explore as Demo Recruiter"** (1-click login as Lead Recruiter _Alex Sterling_).
5. Look at the **New Applied** column on the Kanban board—your newly submitted applicant will appear at the top of the column immediately!

### Test 2: The Kanban Pipeline & Candidate Dossier

1. From the `/admin/pipeline` Kanban board, drag any candidate card and drop it into **Technical Interview** or **Offer Extended**.
2. Click directly on any card to slide open the **Candidate Dossier Drawer**.
3. Switch between tabs:
   - Click the **Scorecard** tab and update their rating from 4 to 5 stars.
   - Click the **Recruiter Notes** tab and submit an interview feedback note.
   - Click the **Activity Log** tab to see your stage change recorded in the timeline.

### Test 3: Requisition Management & Publishing

1. Go to **Job Requisitions** in the sidebar.
2. Click **"+ New Requisition"** and fill in a new role title (e.g., _"Staff Distributed Systems Engineer"_).
3. Click **Publish Requisition**—it will immediately appear in your table and be visible on the public careers board.
4. Try toggling a status from `Active` to `Paused` or `Archived` to see the live badge transformation.

### Test 4: Funnel Analytics

1. Click **Overview & Analytics** in the sidebar.
2. Observe the **Hiring Funnel Progression** chart, **Department Hiring Velocity** bars, and **Evaluator Sentiment** meters—all dynamically computed in real-time from your active candidates and jobs.

---

## 🗂️ Workspace Directory Structure

```text
apps/nexus-ats/frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── candidate-drawer/   # 4-tab dossier drawer, scorecards, notes, resume viewer
│   │   │   ├── jobs/               # CreateJobModal requisition creation dialog
│   │   │   └── pipeline/           # KanbanBoard, KanbanColumn, CandidateCard, BoardSkeleton
│   │   ├── common/                 # Badge, Button, TopProgressBar, RouteErrorBoundary
│   │   └── public/                 # ApplicationModal, JobCard, JobFilters
│   ├── config/                     # System constants, department lists, stage definitions
│   ├── layouts/                    # PublicLayout (Careers) & RecruiterLayout (Sidebar Shell)
│   ├── lib/
│   │   ├── auth/                   # BroadcastChannel auth bus, route guards, session manager
│   │   └── mockData/               # Normalized mock candidates, jobs, and stages
│   ├── pages/
│   │   ├── admin/                  # PipelinePage, JobManagerPage, AdminDashboardPage
│   │   ├── auth/                   # LoginPage with 1-click demo recruiter evaluation
│   │   └── public/                 # JobBoardPage, JobDetailPage, NotFoundPage (404)
│   ├── redux/
│   │   ├── slices/                 # auth, candidate, job, theme, and ui slices
│   │   └── store.js                # Root Redux store configuration
│   ├── routes/                     # Router.jsx (React Router v7 lazy loading), RootLayout.jsx
│   ├── styles/
│   │   ├── tokens/                 # dark.css & light.css custom property tokens
│   │   └── theme.css               # Shared utilities, badges, and glassmorphism panels
│   ├── App.jsx                     # Redux Provider & RouterProvider mount
│   ├── index.css                   # Global resets & scrollbar-gutter: stable
│   └── main.jsx                    # React 19 entrypoint
├── index.html                      # FOUC prevention theme script
├── package.json
└── vite.config.js
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`

### 2. Setup & Installation

From the monorepo root directory:

```bash
# 1. Install dependencies across all workspaces
npm install

# 2. Launch the Nexus ATS frontend development server (Port 5176)
npm run dev:ats
```

_Alternatively, you can launch directly from inside this workspace:_

```bash
cd apps/nexus-ats/frontend
npm run dev
```

Open your browser and navigate to:

```text
http://localhost:5176
```

### 3. Verification & Production Build

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ⚡ State Management & Data Flow

Nexus ATS utilizes **Redux Toolkit** to maintain normalized, cross-referenced client state:

| Slice                | Primary Responsibility                                                                                                                                            |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`candidateSlice`** | Manages applicant dossiers, Kanban drag-and-drop updates, recruiter notes, scorecards, stage transitions, and pipeline keyword search queries.                    |
| **`jobSlice`**       | Holds all job requisitions, creation flow (`createJob`), status mutations (`updateJobStatus`), applicant count counters (`incrementApplicantCount`), and filters. |
| **`authSlice`**      | Tracks authentication status (`INITIALIZING`, `AUTHENTICATED`, `UNAUTHENTICATED`), active user profile, and demo pass access.                                     |
| **`themeSlice`**     | Synchronizes `dark` and `light` mode across component state and DOM `data-theme` attributes, persisted to `localStorage`.                                         |
| **`uiSlice`**        | Orchestrates modal dialogs, sliding drawer states (`candidateDrawerOpen`), and sidebar collapse states.                                                           |

---

## 🛠️ Tech Stack Reference

- **UI Framework:** [React 19](https://react.dev/)
- **Application Routing:** [React Router v7](https://reactrouter.com/) (route-level `lazy()` code-splitting)
- **State Architecture:** [Redux Toolkit](https://redux-toolkit.js.org/) + React-Redux
- **Drag & Drop Engine:** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Data Visualizations:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Bundler & Tooling:** [Vite 8](https://vitejs.dev/)
- **Styling Architecture:** Pure CSS Modules + Custom Property Tokens (`var(--...)`)

---

## 📄 License

This project is part of the [FullStack Nexus](https://github.com/aimalrx200/fullstack-nexus) monorepo and is distributed under the [MIT License](../../../LICENSE).
