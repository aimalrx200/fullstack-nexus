// src/controllers/login/login.messages.js

export const LOGIN_MESSAGES = {
  INVALID_CREDENTIALS: {
    success: false,
    message: "Invalid username, email, or password.", // 🔴 Updated error copy
  },
  COOLDOWN_ACTIVE: {
    success: false,
    message: "Please check your inbox for a sign-in link or try again shortly.",
  },
  VERIFICATION_SENT: {
    success: false,
    message: "Please check your inbox for a link to finish signing in.",
  },
  SUCCESS: "Successfully signed in.",
};
