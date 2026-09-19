// apps/nexus-commerce/backend/src/middlewares/rbacMiddleware.js
import env from "#config/env.js";

/**
 * Flexible Multi-Role Authorization Middleware
 * Verifies if authenticated requester holds one of the required roles.
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in.",
      });
    }

    // Sovereign Rule: The Master Owner always passes any administrative role check
    const isMasterOwner =
      req.user.email?.toLowerCase().trim() ===
      env.MASTER_OWNER_EMAIL.toLowerCase().trim();

    if (isMasterOwner || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access Denied: Requires [${allowedRoles.join(" or ")}] privileges.`,
    });
  };
};

/**
 * Master Record Tamper-Proofing Guard
 * Prevents non-owner users and demo evaluators from deleting or modifying protected records.
 */
export const protectMasterRecord = (Model, idParamName = "id") => {
  return async (req, res, next) => {
    const isMasterOwner =
      req.user?.email?.toLowerCase().trim() ===
      env.MASTER_OWNER_EMAIL.toLowerCase().trim();

    if (isMasterOwner) {
      return next();
    }

    const recordId = req.params[idParamName];
    if (!recordId) return next();

    try {
      const doc = await Model.findById(recordId).select("isProtected").lean();
      if (doc?.isProtected) {
        return res.status(403).json({
          success: false,
          message:
            "Protected Record: Flagship showcase records cannot be altered or deleted in demo mode.",
        });
      }
    } catch {
      // If record not found, let controller handle 404
    }

    next();
  };
};

/**
 * Master Owner Immunity Guard
 * Ensures the platform root owner account can never be deleted, demoted, or altered by anyone.
 */
export const ownerImmunityGuard = (req, res, next) => {
  const targetEmail = req.body?.email || req.params?.email;
  const isTargetMasterOwner =
    targetEmail?.toLowerCase().trim() ===
    env.MASTER_OWNER_EMAIL.toLowerCase().trim();

  if (isTargetMasterOwner) {
    return res.status(403).json({
      success: false,
      message:
        "Security Policy: The Master Owner account is immutable and cannot be modified.",
    });
  }

  next();
};
