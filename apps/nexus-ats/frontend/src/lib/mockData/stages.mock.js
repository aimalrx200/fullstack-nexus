export const MOCK_STAGES = [
  {
    id: "applied",
    title: "New Applied",
    description: "Inbound candidates awaiting initial screening",
    accentColor: "#3b82f6", // Blue
    badgeClass: "ats-badge-primary",
  },
  {
    id: "screen",
    title: "Phone Screen",
    description: "Recruiter culture fit & preliminary background review",
    accentColor: "#8b5cf6", // Violet
    badgeClass: "ats-badge-warning",
  },
  {
    id: "interview",
    title: "Technical Interview",
    description: "Deep-dive system architecture & panel interviews",
    accentColor: "#0ea5e9", // Sky Blue
    badgeClass: "ats-badge-primary",
  },
  {
    id: "offer",
    title: "Offer Extended",
    description: "Formal employment offer issued and under review",
    accentColor: "#10b981", // Emerald
    badgeClass: "ats-badge-success",
  },
  {
    id: "rejected",
    title: "Archived",
    description: "Candidates not progressing for current requisitions",
    accentColor: "#ef4444", // Rose
    badgeClass: "ats-badge-danger",
  },
];
