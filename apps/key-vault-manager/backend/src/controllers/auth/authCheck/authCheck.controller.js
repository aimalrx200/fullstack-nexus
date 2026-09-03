// src/controllers/authCheck/authCheck.controller.js

import { asyncHandler } from "#utils/asyncHandler.js";
import mongoose from "mongoose";

export const authCheck = asyncHandler(async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected (Error)";

  const {
    username,
    id: userId,
    role,
    email,
    name,
    avatarUrl,
    isVerified,
  } = req.user;

  res.status(200).json({
    success: true,
    authenticated: true,
    message: `Welcome ${name || username}, user ${userId}! Role: ${role}. Response from protected server!`,
    database_status: dbStatus,
    user: {
      username,
      userId,
      email: email || null,
      role,
      isVerified: isVerified ?? true,
      name: name || null,
      avatarUrl: avatarUrl || null,
    },
  });
});
