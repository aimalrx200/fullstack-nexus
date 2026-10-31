export default function Badge({
  children,
  variant = "primary",
  icon: Icon,
  className = "",
}) {
  const variantClassMap = {
    primary: "ats-badge-primary",
    success: "ats-badge-success",
    warning: "ats-badge-warning",
    danger: "ats-badge-danger",
  };

  const badgeClass = variantClassMap[variant] || "ats-badge-primary";

  return (
    <span className={`ats-badge ${badgeClass} ${className}`}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
}
