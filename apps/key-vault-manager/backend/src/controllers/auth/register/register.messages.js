// server/controllers/register/register.messages.js

export const REGISTER_MESSAGES = {
  CONFLICT: {
    success: false,
    message: "Username or Email already exists.",
  },
  OAUTH_CONFLICT: {
    success: false,
    message:
      "This email is linked to a Google account. Please log in using 'Sign in with Google'.",
  },
  REGISTRATION_UPDATED: {
    success: true,
    message:
      "Registration updated! A new verification link has been sent to your inbox.",
  },
  REGISTRATION_RACE_ABSORBED: {
    success: true,
    message:
      "Registration updated! A verification link has been sent to your inbox.",
  },
  SUCCESS: {
    success: true,
    message:
      "Registration completed successfully! Please check your email inbox to verify your account before logging in.",
  },
};
