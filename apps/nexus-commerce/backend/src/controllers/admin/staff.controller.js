// apps/nexus-commerce/backend/src/controllers/admin/staff.controller.js
import crypto from "crypto";
import { User } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import env from "#config/env.js";

/**
 * List all staff members (Support Agents, Merchant Admins, Super Admins)
 * GET /api/v1/admin/staff
 */
export const getStaffMembers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
  const skip = (page - 1) * limit;

  const { search, role } = req.query;
  const query = {
    role: { $in: ["support_agent", "merchant_admin", "super_admin"] },
  };

  if (role && role !== "ALL") {
    query.role = role;
  }

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [staff, totalCount] = await Promise.all([
    User.find(query)
      .select(
        "name email role isProtected isDemoAccount createdAt updatedAt avatarUrl",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    staff,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});

/**
 * Invite / Provision a new Staff Member
 * POST /api/v1/admin/staff/invite
 */
export const inviteStaffMember = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: cleanEmail });

  if (user) {
    if (user.role !== "customer") {
      return res.status(409).json({
        success: false,
        message: `User is already a staff member with role: '${user.role}'.`,
      });
    }
    user.role = role;
    user.invitedBy = req.user.id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Promoted existing user ${cleanEmail} to ${role}.`,
      user,
    });
  }

  const temporaryPassword = `Staff_${crypto.randomBytes(6).toString("hex")}!9`;

  user = await User.create({
    name,
    email: cleanEmail,
    password: temporaryPassword,
    role,
    isEmailVerified: true,
    invitedBy: req.user.id,
  });

  return res.status(201).json({
    success: true,
    message: `Staff account provisioned for ${cleanEmail} as ${role}.`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * Update a staff member's role
 * PATCH /api/v1/admin/staff/:userId/role
 */
export const updateStaffRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return res
      .status(404)
      .json({ success: false, message: "Staff user not found." });
  }

  if (
    targetUser.email.toLowerCase().trim() ===
    env.MASTER_OWNER_EMAIL.toLowerCase().trim()
  ) {
    return res.status(403).json({
      success: false,
      message: "Security Violation: Master Owner role is immutable.",
    });
  }

  targetUser.role = role;
  await targetUser.save();

  return res.status(200).json({
    success: true,
    message: `Updated role for ${targetUser.email} to ${role}.`,
    user: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
    },
  });
});

/**
 * Revoke / Remove Staff Access
 * DELETE /api/v1/admin/staff/:userId
 */
export const revokeStaffAccess = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return res
      .status(404)
      .json({ success: false, message: "Staff user not found." });
  }

  if (
    targetUser.email.toLowerCase().trim() ===
    env.MASTER_OWNER_EMAIL.toLowerCase().trim()
  ) {
    return res.status(403).json({
      success: false,
      message: "Security Violation: Master Owner cannot be revoked.",
    });
  }

  // Demote to standard customer rather than wiping user order history
  targetUser.role = "customer";
  await targetUser.save();

  return res.status(200).json({
    success: true,
    message: `Revoked staff access for ${targetUser.email}. User restored to customer role.`,
  });
});
