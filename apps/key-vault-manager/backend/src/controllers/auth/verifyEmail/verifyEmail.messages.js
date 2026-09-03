// server/controllers/verifyEmail/verifyEmail.messages.js

export const VERIFY_EMAIL_MESSAGES = {
  BAD_LINK: {
    success: false,
    message: "This link appears to be broken or incomplete.",
  },
  EXPIRED_OR_USED: {
    success: false,
    message:
      "We couldn't confirm this link. It may have expired or already been used.",
  },
  SUCCESS: "Your email has been successfully verified!",
};
