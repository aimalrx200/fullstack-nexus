// src/components/dashboard/common/StatsCard.jsx

export function StatsCard({
  icon: Icon,
  title,
  value,
  badgeText,
  badgeVariant = "success", // 'success' | 'warning' | 'danger' | 'muted'
  subtext,
}) {
  const badgeStyles = {
    success: "stats-card-badge-success",
    warning: "stats-card-badge-warning",
    danger: "stats-card-badge-danger",
    muted: "stats-card-badge-muted",
  };

  const dotStyles = {
    success: "stats-card-dot-success",
    warning: "stats-card-dot-warning",
    danger: "stats-card-dot-danger",
    muted: "stats-card-dot-muted",
  };

  return (
    <div className="stats-card-container">
      {/* Top Header Row */}
      <div className="stats-card-header">
        <div className="stats-card-title-group">
          {Icon && <Icon className="stats-card-icon" />}
          <span className="stats-card-title">{title}</span>
        </div>

        {badgeText && (
          <span
            className={`stats-card-badge ${
              badgeStyles[badgeVariant] || badgeStyles.muted
            }`}
          >
            <span
              className={`stats-card-dot ${
                dotStyles[badgeVariant] || dotStyles.muted
              }`}
            />
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Value & Subtext */}
      <div className="stats-card-body">
        <span className="stats-card-value">{value}</span>
        {subtext && <span className="stats-card-subtext">{subtext}</span>}
      </div>
    </div>
  );
}
