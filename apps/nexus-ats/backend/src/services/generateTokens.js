import jwt from "jsonwebtoken";
import { env } from "#config/env.js";
import { setAuthCookie } from "#utils/cookieUtils.js";

export const generateRecruiterToken = (res, user) => {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || "7d",
  });

  if (res) {
    setAuthCookie(res, token);
  }

  return token;
};
