export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  style = {},
}) {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontFamily: "inherit",
    transition: "var(--transition)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    lineHeight: 1,
    border: "1px solid transparent",
    boxSizing: "border-box", // <-- Added to prevent width overflow
  };

  const sizeStyles = {
    sm: { padding: "8px 12px", fontSize: "13px" },
    md: { padding: "10px 18px", fontSize: "14px" },
    lg: { padding: "12px 24px", fontSize: "15px" },
  };

  const variantStyles = {
    primary: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      borderColor: "transparent",
    },
    secondary: {
      backgroundColor: "var(--bg-surface-elevated)",
      color: "var(--text-primary)",
      borderColor: "var(--border-subtle)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--text-primary)",
      borderColor: "var(--border-default)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--text-secondary)",
      borderColor: "transparent",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {Icon && iconPosition === "left" && (
        <Icon size={size === "sm" ? 14 : 16} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === "right" && (
        <Icon size={size === "sm" ? 14 : 16} />
      )}
    </button>
  );
}
