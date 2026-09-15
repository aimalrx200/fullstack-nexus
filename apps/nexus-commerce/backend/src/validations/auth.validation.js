import { z } from "zod";
import { isPhoneValid, normalizePhoneNumber } from "#utils/phoneUtils.js";
import {
  checkPasswordStrength,
  MIN_PASSWORD_SCORE,
} from "#utils/passwordStrength.js";

// 1. WebAuthn Passkey Registration Payload Schema
export const PasskeyRegisterVerifySchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
    name: z.string().min(2, "Name must be at least 2 characters long.").max(60),
    response: z.object({
      id: z.string().min(1, "Passkey credential ID is required."),
      rawId: z.string().min(1, "Raw credential ID is required."),
      response: z.object({
        clientDataJSON: z.string().min(1),
        attestationObject: z.string().min(1),
        transports: z.array(z.string()).optional(),
      }),
      type: z.literal("public-key"),
      clientExtensionResults: z.record(z.any()).optional(),
    }),
  }),
});

// 2. WebAuthn Passkey Authentication (Login) Payload Schema
export const PasskeyAuthVerifySchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
    response: z.object({
      id: z.string().min(1, "Passkey credential ID is required."),
      rawId: z.string().min(1, "Raw credential ID is required."),
      response: z.object({
        clientDataJSON: z.string().min(1),
        authenticatorData: z.string().min(1),
        signature: z.string().min(1),
        userHandle: z.string().optional(),
      }),
      type: z.literal("public-key"),
      clientExtensionResults: z.record(z.any()).optional(),
    }),
  }),
});

// 3. Fallback Password Login Schema
export const LoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
    password: z.string().min(1, "Password is required."),
  }),
});

// 4. Password Registration with Contextual zxcvbn Entropy Verification
export const RegisterPasswordSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters long.")
        .max(60),
      email: z
        .string()
        .email("Please provide a valid email address.")
        .toLowerCase()
        .trim(),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .max(100, "Password cannot exceed 100 characters.")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/,
          "Password must include uppercase, lowercase, a number, and a special character.",
        ),
    })
    .superRefine((data, ctx) => {
      const emailParts = data.email.split(/[@.]/).filter(Boolean);
      const nameParts = data.name.split(/\s+/).filter(Boolean);
      const contextualTerms = [...nameParts, ...emailParts];

      const result = checkPasswordStrength(data.password, contextualTerms);
      if (result.score < MIN_PASSWORD_SCORE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message:
            result.feedback.warning ||
            "Password is too easy to guess. Try adding more uncommon words.",
        });
      }
    }),
});

// 5. Customer Address Book Schema with Coordinate Bounds
export const AddressSchema = z.object({
  body: z.object({
    label: z.string().default("Home"),
    recipientName: z
      .string()
      .min(2, "Recipient name must be at least 2 characters."),
    phone: z
      .string()
      .refine((val) => isPhoneValid(val), {
        message: "Please provide a valid phone number with country code.",
      })
      .transform((val) => normalizePhoneNumber(val)),
    street: z.string().min(3, "Street address must be at least 3 characters."),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "Province or State is required."),
    postalCode: z.string().min(2, "Postal code is required."),
    country: z.string().default("Pakistan"),
    countryCode: z.string().default("PK"),
    isDefault: z.boolean().default(false),
    coordinates: z
      .object({
        lat: z
          .number()
          .min(-90)
          .max(90, "Latitude must be between -90 and 90."),
        lng: z
          .number()
          .min(-180)
          .max(180, "Longitude must be between -180 and 180."),
      })
      .optional(),
  }),
});

// 6. Forgot Password Request Schema
export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
  }),
});

// 7. Reset Password Execution Schema with zxcvbn Entropy Verification
export const ResetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, "Password reset token is required."),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .max(100, "Password cannot exceed 100 characters.")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/,
          "Password must include uppercase, lowercase, a number, and a special character.",
        ),
    })
    .superRefine((data, ctx) => {
      const result = checkPasswordStrength(data.password);
      if (result.score < MIN_PASSWORD_SCORE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message:
            result.feedback.warning ||
            "Password is too easy to guess. Try adding more uncommon words.",
        });
      }
    }),
});
