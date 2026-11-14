import { User } from "#models/User.js";
import { generateRecruiterToken } from "#services/generateTokens.js";
import { clearAuthCookie } from "#utils/cookieUtils.js";
import { asyncHandler } from "#utils/asyncHandler.js";

const DEFAULT_DEMO_EMAIL = "recruiter@nexus-ats.dev";

/**
 * @route   POST /api/v1/auth/demo
 * @desc    1-Click Evaluator pass as Lead Recruiter Alex Sterling
 * @access  Public
 */
export const demoLogin = asyncHandler(async (req, res) => {
  let user = await User.findOne({ email: DEFAULT_DEMO_EMAIL });

  // Fallback bootstrap if not yet seeded
  if (!user) {
    user = await User.create({
      name: "Alex Sterling",
      email: DEFAULT_DEMO_EMAIL,
      password: "NexusRecruiter2026!",
      role: "Lead Technical Recruiter",
      department: "Talent Acquisition",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    });
  }

  const token = generateRecruiterToken(res, user);

  res.status(200).json({
    success: true,
    message: "Authenticated via 1-Click Evaluator Pass",
    user,
    token,
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Standard email and password login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password credentials",
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password credentials",
    });
  }

  const token = generateRecruiterToken(res, user);

  res.status(200).json({
    success: true,
    message: "Signed in successfully",
    user,
    token,
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated recruiter profile
 * @access  Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clear session cookie
 * @access  Protected
 */
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: "Signed out successfully",
  });
});
