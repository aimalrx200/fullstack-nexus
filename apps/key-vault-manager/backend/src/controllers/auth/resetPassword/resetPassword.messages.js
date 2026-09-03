// server/controllers/resetPassword/resetPassword.messages.js

export const RESET_PASSWORD_MESSAGES = {
  INVALID_OR_EXPIRED: {
    success: false,
    message: "This link may have expired or already been used.",
  },
  OAUTH_RESTRICTED: {
    success: false,
    message:
      "This account is managed through Google. Please log in using 'Sign in with Google'.",
  },
  SUCCESS: {
    success: true,
    message: "Your password has been successfully updated.",
  },
};
