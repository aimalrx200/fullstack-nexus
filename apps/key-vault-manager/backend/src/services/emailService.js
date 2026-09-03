// server/services/emailService.js
import nodemailer from "nodemailer";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

const IS_DEV_OR_TEST =
  env.NODE_ENV === "development" || env.NODE_ENV === "test";

// Configure production pool eagerly at file execution time
let transporter = !IS_DEV_OR_TEST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

if (transporter) {
  logger.info(
    "🚀 Production SMTP mail client pool pre-initialized successfully.",
  );
}

/**
 * Public initialization hook designed specifically for the parallel boot loader sequence.
 * This guarantees the dev/test mock sandboxes are completely generated before the server opens ports.
 */
export const initEmailService = async () => {
  if (transporter) return;

  if (IS_DEV_OR_TEST) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(
        "📧 Virtual Ethereal SMTP transporter initialized for local sandbox testing.",
      );
    } catch (err) {
      logger.error({
        msg: "❌ Failed to initialize virtual Ethereal SMTP account context",
        error: err.message,
      });
      // Do not crash production bootstrap if test account generation fails temporarily
    }
  }
};

/**
 * Core application service to dispatch account verification magic links.
 */
export const sendVerificationEmail = async (toEmail, verificationLink) => {
  try {
    // Fallback sanity layer just in case execution occurs before boot sequence finishes
    if (!transporter) {
      await initEmailService();
    }

    const mailOptions = {
      from: `"Secure Auth Service" <no-reply@yourproductiondomain.com>`,
      to: toEmail,
      subject: "Verify your email address",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Verify Your Account</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Thank you for registering. Please click the button below to verify your email address and activate your secure session account:</p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${verificationLink}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 6px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #71717a; font-size: 12px;">If the button above does not load, copy and paste this URL into your browser search bar:</p>
          <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${verificationLink}</p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
          <p style="color: #a1a1aa; font-size: 11px;">If you did not issue this registration request, you can completely ignore this message.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (IS_DEV_OR_TEST) {
      logger.info({
        msg: "🔗 Mock email dispatched successfully!",
        previewUrl: nodemailer.getTestMessageUrl(info),
      });
    }

    return true;
  } catch (error) {
    logger.error({
      msg: "Critical operational failure during transactional email dispatch loop.",
      error: error.message,
    });
    throw new Error("SMTP delivery service exception.", { cause: error });
  }
};
