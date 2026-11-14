import jwt from "jsonwebtoken";
import { env } from "#config/env.js";
import { AUTH_COOKIE_NAME } from "#config/time.constants.js";
import { User } from "#models/User.js";

export const protectRecruiter = async (req, res, next) => {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required. Please sign in to access recruiter resources.",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "The recruiter profile associated with this session no longer exists.",
      });
    }

    req.user = user;
    next();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session token is invalid or has expired. Please log in again.",
    });
  }
};
