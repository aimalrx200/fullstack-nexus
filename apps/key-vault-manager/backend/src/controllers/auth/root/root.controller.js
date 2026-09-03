// /server/controllers/root/root.controller.js

import { asyncHandler } from "#utils/asyncHandler.js";

export const home = asyncHandler(async (req, res) => {
  res.json({
    message: "Welcome to the API Home!",
  });
});
