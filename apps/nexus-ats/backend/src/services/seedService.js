import { Job, Candidate, User } from "#models/index.js";
import { logger } from "#config/logger.js";

const DEFAULT_DEMO_RECRUITER = {
  name: "Alex Sterling",
  email: "recruiter@nexus-ats.dev",
  password: "NexusRecruiter2026!",
  role: "Lead Technical Recruiter",
  department: "Talent Acquisition",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
};

const SEED_JOBS = [
  {
    mockId: "job-1",
    slug: "senior-frontend-architect",
    title: "Senior Frontend Architect",
    department: "Engineering",
    location: "Remote",
    workplaceType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    salaryRange: "$135,000 - $165,000 USD",
    applicantCount: 14,
    status: "Active",
    postedDate: "2026-10-18",
    summary:
      "Lead the architecture and performance engineering of our core web client applications. You will champion modern CSS token architectures, state orchestration, and micro-frontend boundaries.",
    responsibilities: [
      "Architect resilient, accessible React interfaces that render within sub-100ms budgets.",
      "Maintain design system tokens and component consistency across multiple engineering pods.",
      "Conduct rigorous code reviews and mentor junior-to-mid full-stack engineers.",
      "Collaborate closely with product designers to implement pixel-perfect user experiences.",
    ],
    requirements: [
      "5+ years building production-grade Single Page Applications using React and modern JavaScript/TypeScript.",
      "Deep understanding of browser rendering pipelines, Web Vitals optimization, and CSS architectures.",
      "Demonstrated experience with state management libraries (Redux Toolkit, Zustand, or TanStack Query).",
      "Strong communication skills for asynchronous, remote-first team dynamics.",
    ],
    benefits: [
      "100% remote-first flexibility with home office stipend",
      "Comprehensive health, dental, and vision insurance",
      "Unlimited Paid Time Off (PTO) with 3-week mandatory minimum",
      "Annual $2,500 learning & conference budget",
    ],
  },
  {
    mockId: "job-2",
    slug: "staff-backend-distributed-systems",
    title: "Staff Backend Systems Engineer",
    department: "Engineering",
    location: "Hybrid • San Francisco, CA",
    workplaceType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Staff / Lead",
    salaryRange: "$160,000 - $190,000 USD",
    applicantCount: 9,
    status: "Active",
    postedDate: "2026-10-22",
    summary:
      "Spearhead high-throughput transaction processing pipelines, distributed lock managers, and asynchronous event bus architectures across our Node.js microservices cluster.",
    responsibilities: [
      "Scale event streaming services using Redis Pub/Sub, BullMQ, and MongoDB replica sets.",
      "Design idempotent payment pipelines and bulletproof audit trails.",
      "Drive system reliability, latency reduction, and 99.99% uptime SLAs.",
    ],
    requirements: [
      "6+ years backend engineering experience with Node.js/TypeScript in distributed cloud environments.",
      "Hands-on expertise with database indexing strategies, query execution plans, and transaction boundaries.",
      "Deep familiarity with Docker containerization, CI/CD automation, and Linux server environments.",
    ],
    benefits: [
      "Competitive equity stock option grant",
      "Catered gourmet lunches on hybrid office days",
      "Premium 401(k) matching up to 5%",
    ],
  },
  {
    mockId: "job-3",
    slug: "lead-product-designer-systems",
    title: "Lead Product Designer",
    department: "Design",
    location: "Remote",
    workplaceType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Staff / Lead",
    salaryRange: "$120,000 - $145,000 USD",
    applicantCount: 18,
    status: "Active",
    postedDate: "2026-10-12",
    summary:
      "Define the visual language, design token hierarchies, and interactive UX patterns for our next-generation hiring intelligence platform.",
    responsibilities: [
      "Produce high-fidelity Figma components, interactive prototypes, and motion specifications.",
      "Partner with engineers to ensure design token synchronization between Figma and code.",
      "Lead user interviews, usability testing sessions, and synthesized heuristic reviews.",
    ],
    requirements: [
      "4+ years designing complex enterprise SaaS or developer tooling products.",
      "Exceptional portfolio showcasing typography, spatial hierarchy, and token-based design systems.",
      "Familiarity with HTML/CSS constraints and responsive mobile layout behaviors.",
    ],
    benefits: [
      "Top-tier ergonomic workstation setup (Apple Silicon MacBook Pro + 4K Display)",
      "Flexible working schedule across worldwide timezones",
      "Wellness and fitness monthly allowance",
    ],
  },
  {
    mockId: "job-4",
    slug: "cloud-devsecops-engineer",
    title: "Cloud DevSecOps Engineer",
    department: "DevSecOps",
    location: "Remote",
    workplaceType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    salaryRange: "$140,000 - $170,000 USD",
    applicantCount: 6,
    status: "Active",
    postedDate: "2026-10-25",
    summary:
      "Secure cloud infrastructure, automate deployment pipelines, and maintain Zero-Trust secret management vaults across staging and production clusters.",
    responsibilities: [
      "Automate infrastructure as code (IaC) and zero-downtime blue/green deployment workflows.",
      "Implement runtime secret rotation, automated vulnerability scanning, and audit compliance logging.",
      "Maintain automated backups, disaster recovery failovers, and synthetic monitoring.",
    ],
    requirements: [
      "4+ years in DevSecOps, Site Reliability Engineering, or Cloud Architecture.",
      "Strong grasp of Linux systems, Docker container internals, and reverse proxies (Nginx/Envoy).",
      "Experience with security compliance (SOC2 / ISO27001 posture) and cryptographic key vaults.",
    ],
    benefits: [
      "Annual home internet and mobile data reimbursement",
      "Comprehensive parental leave policy (16 weeks paid)",
      "Quarterly performance bonuses",
    ],
  },
  {
    mockId: "job-5",
    slug: "technical-product-manager",
    title: "Technical Product Manager",
    department: "Product",
    location: "Hybrid • New York, NY",
    workplaceType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Mid-Level",
    salaryRange: "$115,000 - $140,000 USD",
    applicantCount: 8,
    status: "Active",
    postedDate: "2026-10-28",
    summary:
      "Own the roadmap for our candidate pipeline automation and analytics suite, turning qualitative hiring feedback into quantifiable software features.",
    responsibilities: [
      "Translate customer requests and recruiter pain points into actionable engineering epics.",
      "Define sprint scope, acceptance criteria, and product success metrics.",
      "Coordinate release timelines between frontend, backend, and sales stakeholders.",
    ],
    requirements: [
      "3+ years technical product management experience in B2B SaaS or workflow tools.",
      "Ability to write clear specifications, user stories, and data-flow diagrams.",
      "Solid analytical mindset with SQL or analytics dashboard proficiency.",
    ],
    benefits: [
      "Commuter transit passes and corporate discounts",
      "Comprehensive medical and dental coverage",
      "Annual company international retreats",
    ],
  },
];

const SEED_CANDIDATES = [
  {
    mockJobId: "job-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    phone: "+1 (415) 890-2341",
    location: "Austin, TX (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    stage: "interview",
    rating: 5,
    appliedDate: "2026-10-21",
    experienceYears: 6,
    expectedSalary: "$150,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://github.com/sarah-frontend-architect",
    tags: ["React 19", "Performance", "Design Systems", "Redux"],
    scorecard: {
      technical: 5,
      communication: 5,
      systemDesign: 4,
      recommendation: "Strong Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "Initial screen went exceptionally well. Deep knowledge of React internals and CSS custom property token engines. Moving to panel interview.",
        createdAt: "2026-10-24 10:30 AM",
      },
    ],
  },
  {
    mockJobId: "job-1",
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    phone: "+1 (206) 555-8910",
    location: "Seattle, WA (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    stage: "applied",
    rating: 4,
    appliedDate: "2026-10-29",
    experienceYears: 5,
    expectedSalary: "$145,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://marcusvance.dev",
    tags: ["TypeScript", "Next.js", "Vite", "Tailwind"],
    scorecard: {
      technical: 4,
      communication: 4,
      systemDesign: 4,
      recommendation: "Hire",
    },
    notes: [],
  },
  {
    mockJobId: "job-1",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+44 20 7946 0912",
    location: "London, UK (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    stage: "offer",
    rating: 5,
    appliedDate: "2026-10-15",
    experienceYears: 7,
    expectedSalary: "$155,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://github.com/elena-rostova",
    tags: ["Web Vitals", "Micro-Frontends", "Accessibility (a11y)"],
    scorecard: {
      technical: 5,
      communication: 5,
      systemDesign: 5,
      recommendation: "Strong Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "All interviewers gave unanimous 5/5 scores. Formal offer packet sent yesterday; awaiting final signed agreement.",
        createdAt: "2026-10-28 04:15 PM",
      },
    ],
  },
  {
    mockJobId: "job-2",
    name: "David Okafor",
    email: "d.okafor@example.com",
    phone: "+1 (312) 441-9981",
    location: "Chicago, IL (Hybrid)",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    stage: "screen",
    rating: 4,
    appliedDate: "2026-10-26",
    experienceYears: 8,
    expectedSalary: "$175,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://github.com/dokafor",
    tags: ["Node.js", "Distributed Locks", "Redis", "Postgres"],
    scorecard: {
      technical: 4,
      communication: 4,
      systemDesign: 5,
      recommendation: "Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "Scheduled for 30-min recruiter phone call on Monday.",
        createdAt: "2026-10-27 11:00 AM",
      },
    ],
  },
  {
    mockJobId: "job-2",
    name: "Chen Wei",
    email: "chen.wei@example.com",
    phone: "+1 (415) 302-8812",
    location: "San Francisco, CA (Hybrid)",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    stage: "interview",
    rating: 5,
    appliedDate: "2026-10-20",
    experienceYears: 9,
    expectedSalary: "$180,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://chenwei.io",
    tags: ["High Concurrency", "Kafka", "MongoDB", "Golang"],
    scorecard: {
      technical: 5,
      communication: 4,
      systemDesign: 5,
      recommendation: "Strong Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "Aced the distributed locking whiteboard round. Panel interview scheduled for tomorrow afternoon.",
        createdAt: "2026-10-26 02:00 PM",
      },
    ],
  },
  {
    mockJobId: "job-3",
    name: "Amara Miller",
    email: "amara.m@example.com",
    phone: "+1 (303) 774-1290",
    location: "Denver, CO (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    stage: "applied",
    rating: 4,
    appliedDate: "2026-10-30",
    experienceYears: 6,
    expectedSalary: "$135,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://amaramiller.design",
    tags: ["Figma Tokens", "Prototyping", "Design Systems"],
    scorecard: {
      technical: 4,
      communication: 4,
      systemDesign: 4,
      recommendation: "Review Required",
    },
    notes: [],
  },
  {
    mockJobId: "job-3",
    name: "Julian Thorne",
    email: "julian.thorne@example.com",
    phone: "+1 (212) 660-4921",
    location: "Brooklyn, NY (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    stage: "interview",
    rating: 4,
    appliedDate: "2026-10-18",
    experienceYears: 7,
    expectedSalary: "$140,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://julianthorne.work",
    tags: ["SaaS B2B", "Accessibility", "Interaction Design"],
    scorecard: {
      technical: 4,
      communication: 5,
      systemDesign: 4,
      recommendation: "Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "Portfolio presentation was outstanding. Design tokens match our exact CSS architectural philosophy.",
        createdAt: "2026-10-23 05:00 PM",
      },
    ],
  },
  {
    mockJobId: "job-4",
    name: "Tariq Al-Mansoor",
    email: "tariq.m@example.com",
    phone: "+971 4 391 0000",
    location: "Dubai, UAE (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    stage: "applied",
    rating: 3,
    appliedDate: "2026-10-28",
    experienceYears: 4,
    expectedSalary: "$140,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://github.com/tariq-ops",
    tags: ["Docker", "Zero-Trust", "CI/CD Pipelines"],
    scorecard: {
      technical: 3,
      communication: 4,
      systemDesign: 3,
      recommendation: "Review Required",
    },
    notes: [],
  },
  {
    mockJobId: "job-4",
    name: "Siddharth Patel",
    email: "sid.patel@example.com",
    phone: "+91 98200 12345",
    location: "Bangalore, India (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    stage: "screen",
    rating: 5,
    appliedDate: "2026-10-26",
    experienceYears: 6,
    expectedSalary: "$145,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://github.com/sid-cloud",
    tags: ["Kubernetes", "Vault Cryptography", "Terraform"],
    scorecard: {
      technical: 5,
      communication: 4,
      systemDesign: 5,
      recommendation: "Strong Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "Impressive track record managing multi-cluster secrets in enterprise banking environments.",
        createdAt: "2026-10-29 01:20 PM",
      },
    ],
  },
  {
    mockJobId: "job-5",
    name: "Emily Watson",
    email: "emily.watson@example.com",
    phone: "+1 (617) 902-3341",
    location: "Boston, MA (Hybrid)",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    stage: "screen",
    rating: 4,
    appliedDate: "2026-10-27",
    experienceYears: 5,
    expectedSalary: "$130,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://linkedin.com/in/emily-watson-pm",
    tags: ["Roadmapping", "Agile/Scrum", "Data Analytics"],
    scorecard: {
      technical: 4,
      communication: 5,
      systemDesign: 3,
      recommendation: "Hire",
    },
    notes: [],
  },
  {
    mockJobId: "job-1",
    name: "Robert Vance",
    email: "robert.v@example.com",
    phone: "+1 (512) 332-9011",
    location: "Dallas, TX (Remote)",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    stage: "rejected",
    rating: 2,
    appliedDate: "2026-10-14",
    experienceYears: 2,
    expectedSalary: "$140,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://github.com/robertv",
    tags: ["Junior/Mid", "React Basics"],
    scorecard: {
      technical: 2,
      communication: 3,
      systemDesign: 2,
      recommendation: "Do Not Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "Years of architectural experience does not meet the Senior/Staff baseline criteria for this requisition. Politely passed via email.",
        createdAt: "2026-10-17 11:15 AM",
      },
    ],
  },
  {
    mockJobId: "job-2",
    name: "Kavita Sundaram",
    email: "kavita.s@example.com",
    phone: "+1 (408) 721-8899",
    location: "San Jose, CA (Hybrid)",
    avatar:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80",
    stage: "offer",
    rating: 5,
    appliedDate: "2026-10-10",
    experienceYears: 8,
    expectedSalary: "$185,000",
    resumeUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    portfolioUrl: "https://github.com/kavita-systems",
    tags: ["Distributed Systems", "Redis Queues", "ScyllaDB"],
    scorecard: {
      technical: 5,
      communication: 5,
      systemDesign: 5,
      recommendation: "Strong Hire",
    },
    notes: [
      {
        author: "Alex Sterling (Recruiter)",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        text: "Offer extended: $185,000 base + 0.15% equity grant. Target start date mid-November.",
        createdAt: "2026-10-25 03:00 PM",
      },
    ],
  },
];

export const seedDatabase = async () => {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount > 0) {
      logger.debug(
        "Database already seeded with requisitions. Skipping auto-seed.",
      );
      return;
    }

    logger.info("🌱 Seeding initial Nexus ATS data into MongoDB...");

    // 1. Seed Demo Recruiter
    let demoUser = await User.findOne({ email: DEFAULT_DEMO_RECRUITER.email });
    if (!demoUser) {
      demoUser = await User.create(DEFAULT_DEMO_RECRUITER);
      logger.info(`👤 Demo recruiter seeded: ${demoUser.email}`);
    }

    // 2. Seed Job Requisitions
    const jobMap = new Map();
    for (const jobData of SEED_JOBS) {
      const { mockId, ...data } = jobData;
      const createdJob = await Job.create(data);
      jobMap.set(mockId, createdJob);
    }
    logger.info(`💼 ${jobMap.size} job requisitions successfully seeded.`);

    // 3. Seed Candidates (Mapping mockJobId to newly persisted Job ObjectId)
    const candidateDocs = SEED_CANDIDATES.map((cand) => {
      const { mockJobId, ...candidateData } = cand;
      const targetJob = jobMap.get(mockJobId);

      return {
        ...candidateData,
        jobId: targetJob ? targetJob._id : null,
        jobTitle: targetJob ? targetJob.title : "General Requisition",
      };
    }).filter((c) => c.jobId !== null);

    await Candidate.insertMany(candidateDocs);
    logger.info(
      `👥 ${candidateDocs.length} candidate dossiers successfully seeded.`,
    );

    logger.info("✅ Database auto-seed completed successfully.");
  } catch (error) {
    logger.error({ err: error.message }, "❌ Database auto-seed failed");
  }
};
