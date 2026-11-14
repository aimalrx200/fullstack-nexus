import { Candidate } from "#models/Candidate.js";
import { Job } from "#models/Job.js";

export const getHiringAnalytics = async () => {
  const [candidateStats, activeJobsCount, totalJobs] = await Promise.all([
    Candidate.aggregate([
      {
        $facet: {
          totalPool: [{ $count: "count" }],
          stageCounts: [{ $group: { _id: "$stage", count: { $sum: 1 } } }],
          recommendations: [
            {
              $group: { _id: "$scorecard.recommendation", count: { $sum: 1 } },
            },
          ],
          avgRating: [
            { $match: { rating: { $gt: 0 } } },
            { $group: { _id: null, avgScore: { $avg: "$rating" } } },
          ],
          departments: [
            { $unwind: "$tags" },
            {
              $match: {
                tags: {
                  $in: [
                    "Engineering",
                    "Product",
                    "Design",
                    "DevSecOps",
                    "Marketing",
                  ],
                },
              },
            },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
          ],
        },
      },
    ]),
    Job.countDocuments({ status: "Active" }),
    Job.countDocuments(),
  ]);

  const raw = candidateStats[0] || {};
  const totalCandidates = raw.totalPool?.[0]?.count || 0;

  // Format Stage Counts
  const stagesMap = {
    applied: 0,
    screen: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };
  (raw.stageCounts || []).forEach((item) => {
    if (stagesMap[item._id] !== undefined) {
      stagesMap[item._id] = item.count;
    }
  });

  const stageFunnelData = [
    { name: "New Applied", key: "applied", count: stagesMap.applied },
    { name: "Phone Screen", key: "screen", count: stagesMap.screen },
    {
      name: "Technical Interview",
      key: "interview",
      count: stagesMap.interview,
    },
    { name: "Offer Extended", key: "offer", count: stagesMap.offer },
    { name: "Archived", key: "rejected", count: stagesMap.rejected },
  ];

  // Rates
  const interviewConversion = totalCandidates
    ? Math.round(
        ((stagesMap.interview + stagesMap.offer) / totalCandidates) * 100,
      )
    : 0;
  const offerRate = totalCandidates
    ? Math.round((stagesMap.offer / totalCandidates) * 100)
    : 0;
  const avgScore = raw.avgRating?.[0]?.avgScore
    ? raw.avgRating[0].avgScore.toFixed(1)
    : "0.0";

  // Recommendations
  const recsMap = {
    "Strong Hire": 0,
    Hire: 0,
    "Review Required": 0,
    "Do Not Hire": 0,
  };
  (raw.recommendations || []).forEach((item) => {
    if (item._id && recsMap[item._id] !== undefined) {
      recsMap[item._id] = item.count;
    }
  });

  return {
    metrics: {
      totalCandidates,
      activeJobs: activeJobsCount,
      totalJobs,
      interviewConversion,
      offerRate,
      avgScore,
    },
    stageFunnel: stageFunnelData,
    recommendations: Object.entries(recsMap).map(([label, count]) => ({
      label,
      count,
    })),
  };
};
