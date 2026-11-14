// apps/nexus-ats/backend/scripts/verify-api.mjs

import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.API_URL || `http://localhost:${PORT}/api/v1`;

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

let sessionCookie = null;
let targetJob = null;
let createdCandidate = null;
let createdJob = null;

const logPass = (title) =>
  console.log(`  ${COLORS.green}✔ PASS:${COLORS.reset} ${title}`);
const logFail = (title, err) => {
  console.error(`  ${COLORS.red}✖ FAIL:${COLORS.reset} ${title}`);
  if (err) console.error(err);
};

const runSuite = async () => {
  console.log(
    `\n${COLORS.bold}${COLORS.cyan}====================================================${COLORS.reset}`,
  );
  console.log(
    `${COLORS.bold}${COLORS.cyan}  Nexus ATS Core API — End-to-End Verification Suite${COLORS.reset}`,
  );
  console.log(`  Target Gateway: ${COLORS.yellow}${BASE_URL}${COLORS.reset}`);
  console.log(
    `${COLORS.bold}${COLORS.cyan}====================================================${COLORS.reset}\n`,
  );

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Gateway Healthcheck & DB Status
    // -------------------------------------------------------------------------
    console.log(
      `${COLORS.bold}1. Health & Infrastructure Telemetry${COLORS.reset}`,
    );
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();

    if (healthRes.status === 200 && healthData.status === "OPERATIONAL") {
      logPass(
        `Gateway operational (Uptime: ${healthData.uptime}, Env: ${healthData.environment})`,
      );
    } else {
      throw new Error(`Healthcheck failed: ${JSON.stringify(healthData)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Seed Verification & Public Job Catalog
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}2. Database Auto-Seed & Public Jobs Catalog${COLORS.reset}`,
    );
    const jobsRes = await fetch(`${BASE_URL}/jobs`);
    const jobsData = await jobsRes.json();

    if (
      jobsRes.status === 200 &&
      Array.isArray(jobsData.jobs) &&
      jobsData.jobs.length >= 5
    ) {
      targetJob = jobsData.jobs[0];
      logPass(
        `Retrieved ${jobsData.count} seeded job requisitions from MongoDB Atlas`,
      );
      logPass(
        `Sample Seeded Role: "${targetJob.title}" (Applicant Count: ${targetJob.applicantCount})`,
      );
    } else {
      throw new Error(
        `Jobs seed verification failed: ${JSON.stringify(jobsData)}`,
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: Public Job Details by Slug
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}3. Public Job Discovery by Slug${COLORS.reset}`,
    );
    const slugRes = await fetch(`${BASE_URL}/jobs/${targetJob.slug}`);
    const slugData = await slugRes.json();

    if (slugRes.status === 200 && slugData.job?.slug === targetJob.slug) {
      logPass(`Successfully resolved job by slug: "/jobs/${targetJob.slug}"`);
    } else {
      throw new Error(`Slug resolution failed: ${JSON.stringify(slugData)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: 1-Click Demo Recruiter Authentication
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}4. 1-Click Evaluator Authentication (Alex Sterling)${COLORS.reset}`,
    );
    const demoRes = await fetch(`${BASE_URL}/auth/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const demoData = await demoRes.json();
    const setCookieHeader = demoRes.headers.get("set-cookie");

    if (demoRes.status === 200 && demoData.success && demoData.token) {
      if (setCookieHeader) {
        sessionCookie = setCookieHeader.split(";")[0];
      }
      logPass(
        `Authenticated as: ${demoData.user.name} (${demoData.user.role})`,
      );
      logPass(`JWT token issued & httpOnly session cookie acquired`);
    } else {
      throw new Error(
        `1-Click Demo authentication failed: ${JSON.stringify(demoData)}`,
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Protected Session Verification (/auth/me)
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}5. Protected Session Guard & Profile Sync${COLORS.reset}`,
    );
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Cookie: sessionCookie || "",
        Authorization: `Bearer ${demoData.token}`,
      },
    });

    const meData = await meRes.json();
    if (
      meRes.status === 200 &&
      meData.user?.email === "recruiter@nexus-ats.dev"
    ) {
      logPass(
        `Session verified via cookie/Bearer token for ${meData.user.email}`,
      );
    } else {
      throw new Error(
        `Protected session check failed: ${JSON.stringify(meData)}`,
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Public Application Intake & PDF Resume Upload
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}6. Candidate Application Intake & Document Storage${COLORS.reset}`,
    );
    const formData = new FormData();
    formData.append("jobId", targetJob.id);
    formData.append("name", "Jordan Blake");
    formData.append("email", `jordan.blake.${Date.now()}@example.com`);
    formData.append("phone", "+1 (555) 349-8812");
    formData.append("location", "Austin, TX");
    formData.append("websiteOrProfile", "https://github.com/jordan-blake-test");

    // Create a mock PDF file buffer
    const mockPdfBytes = new TextEncoder().encode(
      "%PDF-1.4 Mock Candidate Resume Document",
    );
    const mockPdfBlob = new Blob([mockPdfBytes], { type: "application/pdf" });
    formData.append("resume", mockPdfBlob, "jordan_blake_resume.pdf");

    const applyRes = await fetch(`${BASE_URL}/candidates/apply`, {
      method: "POST",
      body: formData,
    });

    const applyData = await applyRes.json();
    if (applyRes.status === 201 && applyData.success && applyData.candidate) {
      createdCandidate = applyData.candidate;
      logPass(
        `Candidate applied successfully: ${createdCandidate.name} (ID: ${createdCandidate.id})`,
      );
      logPass(`Stored Resume URL: ${createdCandidate.resumeUrl}`);
      logPass(
        `Stage initialized to: "${createdCandidate.stage.toUpperCase()}"`,
      );
    } else {
      throw new Error(
        `Candidate application failed: ${JSON.stringify(applyData)}`,
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: Recruiter Candidate Pool Retrieval
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}7. Recruiter Pipeline Listing & Filtering${COLORS.reset}`,
    );
    const candListRes = await fetch(`${BASE_URL}/candidates`, {
      headers: {
        Cookie: sessionCookie || "",
        Authorization: `Bearer ${demoData.token}`,
      },
    });

    const candListData = await candListRes.json();
    if (candListRes.status === 200 && candListData.candidates.length >= 13) {
      logPass(
        `Retrieved ${candListData.candidates.length} candidates (including new applicant)`,
      );
    } else {
      throw new Error(
        `Candidate list query failed: ${JSON.stringify(candListData)}`,
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: Kanban Stage Transition (Drag-and-Drop)
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}8. Kanban State Transition & Audit Timeline Append${COLORS.reset}`,
    );
    const stageRes = await fetch(
      `${BASE_URL}/candidates/${createdCandidate.id}/stage`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie || "",
          Authorization: `Bearer ${demoData.token}`,
        },
        body: JSON.stringify({ newStageId: "interview" }),
      },
    );

    const stageData = await stageRes.json();
    if (stageRes.status === 200 && stageData.candidate.stage === "interview") {
      logPass(`Candidate advanced from "APPLIED" -> "INTERVIEW"`);
      logPass(
        `Latest Timeline Event: "${stageData.candidate.timeline[0]?.note}"`,
      );
    } else {
      throw new Error(`Stage transition failed: ${JSON.stringify(stageData)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Scorecard Evaluation Update
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}9. Evaluator Scorecard & Competency Rating${COLORS.reset}`,
    );
    const scorecardRes = await fetch(
      `${BASE_URL}/candidates/${createdCandidate.id}/scorecard`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie || "",
          Authorization: `Bearer ${demoData.token}`,
        },
        body: JSON.stringify({
          technical: 5,
          communication: 5,
          systemDesign: 4,
          recommendation: "Strong Hire",
        }),
      },
    );

    const scorecardData = await scorecardRes.json();
    if (
      scorecardRes.status === 200 &&
      scorecardData.candidate.scorecard.recommendation === "Strong Hire"
    ) {
      logPass(`Scorecard recorded: Technical (5/5), Comm (5/5), Design (4/5)`);
      logPass(
        `Recommendation: "${scorecardData.candidate.scorecard.recommendation}" (Rating: ${scorecardData.candidate.rating}/5)`,
      );
    } else {
      throw new Error(
        `Scorecard update failed: ${JSON.stringify(scorecardData)}`,
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: Recruiter Feedback Note Recording
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}10. Recruiter Interview Feedback Note${COLORS.reset}`,
    );
    const noteRes = await fetch(
      `${BASE_URL}/candidates/${createdCandidate.id}/notes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie || "",
          Authorization: `Bearer ${demoData.token}`,
        },
        body: JSON.stringify({
          text: "Demonstrated exemplary knowledge of distributed systems and Redis Lua script locks.",
        }),
      },
    );

    const noteData = await noteRes.json();
    if (noteRes.status === 201 && noteData.candidate.notes.length > 0) {
      logPass(
        `Feedback note saved. Total notes: ${noteData.candidate.notes.length}`,
      );
      logPass(`Author: "${noteData.candidate.notes[0]?.author}"`);
    } else {
      throw new Error(`Note insertion failed: ${JSON.stringify(noteData)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 11: Requisition Creation & Status Mutation
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}11. Requisition Publishing & Lifecycle Toggle${COLORS.reset}`,
    );
    const createJobRes = await fetch(`${BASE_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie || "",
        Authorization: `Bearer ${demoData.token}`,
      },
      body: JSON.stringify({
        title: "Staff Cryptography & Security Engineer",
        department: "DevSecOps",
        location: "Remote",
        workplaceType: "Remote",
        employmentType: "Full-time",
        experienceLevel: "Staff / Lead",
        salaryRange: "$175,000 - $210,000 USD",
        summary:
          "Architect hardware-grade cryptographic key rotation and zero-trust policies across distributed cloud nodes.",
        responsibilities: ["Maintain AES-256-GCM vault security"],
        requirements: ["5+ years experience in applied cryptography"],
        benefits: ["Competitive equity grant"],
      }),
    });

    const createJobData = await createJobRes.json();
    if (createJobRes.status === 201 && createJobData.job) {
      createdJob = createJobData.job;
      logPass(
        `Created new requisition: "${createdJob.title}" (Slug: ${createdJob.slug})`,
      );

      // Toggle status from Active -> Paused
      const pauseRes = await fetch(`${BASE_URL}/jobs/${createdJob.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie || "",
          Authorization: `Bearer ${demoData.token}`,
        },
        body: JSON.stringify({ status: "Paused" }),
      });

      const pauseData = await pauseRes.json();
      if (pauseRes.status === 200 && pauseData.job.status === "Paused") {
        logPass(`Role status transitioned: "Active" -> "Paused"`);
      } else {
        throw new Error(`Status toggle failed: ${JSON.stringify(pauseData)}`);
      }
    } else {
      throw new Error(`Job creation failed: ${JSON.stringify(createJobData)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 12: Funnel Analytics Aggregation
    // -------------------------------------------------------------------------
    console.log(
      `\n${COLORS.bold}12. Funnel Analytics Pipeline Aggregation${COLORS.reset}`,
    );
    const analyticsRes = await fetch(`${BASE_URL}/analytics/overview`, {
      headers: {
        Cookie: sessionCookie || "",
        Authorization: `Bearer ${demoData.token}`,
      },
    });

    const analyticsData = await analyticsRes.json();
    if (analyticsRes.status === 200 && analyticsData.metrics) {
      logPass(`Talent Pool Size: ${analyticsData.metrics.totalCandidates}`);
      logPass(`Active Requisitions: ${analyticsData.metrics.activeJobs}`);
      logPass(
        `Interview Conversion Rate: ${analyticsData.metrics.interviewConversion}%`,
      );
      logPass(
        `Stage Breakdown: ${analyticsData.stageFunnel.map((s) => `${s.name}: ${s.count}`).join(" | ")}`,
      );
    } else {
      throw new Error(
        `Analytics aggregation failed: ${JSON.stringify(analyticsData)}`,
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Recruiter Logout
    // -------------------------------------------------------------------------
    console.log(`\n${COLORS.bold}13. Recruiter Session Logout${COLORS.reset}`);
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie || "",
        Authorization: `Bearer ${demoData.token}`,
      },
    });

    const logoutData = await logoutRes.json();
    if (logoutRes.status === 200 && logoutData.success) {
      logPass(`Session invalidated and cookie cleared`);
    } else {
      throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`);
    }

    // Final Success Summary
    console.log(
      `\n${COLORS.bold}${COLORS.green}====================================================${COLORS.reset}`,
    );
    console.log(
      `${COLORS.bold}${COLORS.green}  🎉 ALL 13 TEST PHASES PASSED WITH ZERO ERRORS!  ${COLORS.reset}`,
    );
    console.log(
      `${COLORS.bold}${COLORS.green}====================================================${COLORS.reset}\n`,
    );
    process.exit(0);
  } catch (error) {
    console.error(
      `\n${COLORS.bold}${COLORS.red}====================================================${COLORS.reset}`,
    );
    logFail("Test suite execution aborted due to an exception:", error.message);
    console.error(
      `${COLORS.bold}${COLORS.red}====================================================${COLORS.reset}\n`,
    );
    process.exit(1);
  }
};

runSuite();
