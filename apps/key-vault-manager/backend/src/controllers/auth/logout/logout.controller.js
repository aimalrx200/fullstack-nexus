// server/controllers/logout/logout.controller.js

import { asyncHandler } from "#utils/asyncHandler.js";
import { LOGOUT_MESSAGES } from "./logout.messages.js";
import {
  extractTokenFamilyIdFallback,
  revokeSessionState,
} from "./logout.service.js";
import {
  accessTokenClearCookieOptions,
  refreshTokenClearCookieOptions,
} from "#utils/cookieUtils.js";

export const logout = asyncHandler(async (req, res) => {
  // 1. Wipe client-side storage cookies INSTANTLY to break potential cross-tab race conditions
  res.clearCookie("access_token", accessTokenClearCookieOptions);
  res.clearCookie("refresh_token", refreshTokenClearCookieOptions);

  const clientInstanceId = req.headers["x-client-instance-id"];

  let tokenFamilyId = req.user?.tokenFamilyId;

  // 2. Delegate lookup loop down to service layer if context is empty
  if (!tokenFamilyId) {
    tokenFamilyId = await extractTokenFamilyIdFallback(req, clientInstanceId);
  }

  // 3. Evict server cache indices and clear DB persistence layers concurrently
  if (tokenFamilyId) {
    await revokeSessionState(tokenFamilyId);
  }

  // 4. Return clean 200 OK resolution signature
  return res.status(200).json(LOGOUT_MESSAGES.SUCCESS);
});
