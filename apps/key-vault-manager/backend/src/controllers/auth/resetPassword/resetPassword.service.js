// server/controllers/resetPassword/resetPassword.service.js

import Session from "#models/Session.js";
import { sessionCache } from "#utils/sessionCache.js";

/**
 * Executes the nuclear eject protocol. Revokes matching session logs in
 * MongoDB and clears distributed memory components concurrently.
 */
export const globallyTerminateUserSessions = async (userId) => {
  const activeSessions = await Session.find({
    userId,
    isRevoked: false,
  }).select("tokenFamilyId");

  if (activeSessions.length === 0) return;

  const targetFamilyIds = activeSessions.map((s) => s.tokenFamilyId);

  // Target-scoped database invalidation
  await Session.updateMany(
    { tokenFamilyId: { $in: targetFamilyIds }, isRevoked: false },
    { $set: { isRevoked: true } },
  );

  // Concurrently purge runtime distributed segments
  const cacheEvictionPromises = targetFamilyIds.map((familyId) =>
    sessionCache.del(`session:${familyId}`),
  );

  await Promise.all(cacheEvictionPromises);
};
