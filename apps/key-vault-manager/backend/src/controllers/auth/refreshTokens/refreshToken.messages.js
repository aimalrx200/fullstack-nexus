// server/controllers/refreshTokens/refreshToken.messages.js

export const REFRESH_MESSAGES = {
  SIGN_IN_CONTINUE: { message: "Please sign in to continue." },
  SESSION_ENDED: { message: "Your session has ended. Please sign in again." },
  SESSION_INACTIVE: {
    message: "Your session is no longer active. Please sign in again.",
  },
  SESSION_GENERIC_ENDED: { message: "Your session has ended." },
  PROFILE_UNAVAILABLE: { message: "Account profile is currently unavailable." },
  VERIFICATION_REQUIRED: {
    message: "Please check your inbox for a link to finish signing in.",
  },
  SUCCESS: "Session updated successfully.",
};
