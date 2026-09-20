// apps/nexus-commerce/backend/src/middlewares/adminMiddleware.js
import env from "#config/env.js";

export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in.",
    });
  }

  const isMasterOwner =
    req.user.email?.toLowerCase().trim() ===
    env.MASTER_OWNER_EMAIL.toLowerCase().trim();

  const isAuthorized =
    isMasterOwner ||
    req.user.role === "merchant_admin" ||
    req.user.role === "super_admin";

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Merchant Administrator privilege required.",
    });
  }

  next();
};
