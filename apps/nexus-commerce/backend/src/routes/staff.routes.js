// apps/nexus-commerce/backend/src/routes/staff.routes.js
import { Router } from "express";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import {
  requireRoles,
  ownerImmunityGuard,
} from "#middlewares/rbacMiddleware.js";
import { validate } from "#middlewares/validate.js";
import {
  getStaffMembers,
  inviteStaffMember,
  updateStaffRole,
  revokeStaffAccess,
} from "#controllers/admin/staff.controller.js";
import {
  InviteStaffSchema,
  UpdateStaffRoleSchema,
} from "#validations/staff.validation.js";

const router = Router();

// Staff administration is strictly restricted to Super Admin
router.use(authMiddleware, requireRoles("super_admin"));

router.get("/", getStaffMembers);
router.post("/invite", validate(InviteStaffSchema), inviteStaffMember);
router.patch(
  "/:userId/role",
  ownerImmunityGuard,
  validate(UpdateStaffRoleSchema),
  updateStaffRole,
);
router.delete("/:userId", ownerImmunityGuard, revokeStaffAccess);

export default router;
