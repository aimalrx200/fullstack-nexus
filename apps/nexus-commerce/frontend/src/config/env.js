import { z } from "zod";

const cleanUrl = z
  .string()
  .url()
  .transform((val) => val.replace(/\/$/, ""));

const envSchema = z.object({
  VITE_API_URL: cleanUrl.default("http://localhost:4000/api/v1"),
  VITE_SOCKET_URL: cleanUrl.default("http://localhost:4000"),
  VITE_STRIPE_PUBLIC_KEY: z.string().default("pk_test_placeholder_key"),
  VITE_GOOGLE_MAPS_API_KEY: z.string().optional().or(z.literal("")),
  VITE_APP_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
    VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    VITE_APP_ENV:
      import.meta.env.VITE_APP_ENV ||
      (import.meta.env.PROD ? "production" : "development"),
  });
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error(
      "❌ Invalid frontend environment configuration:",
      err.format(),
    );
  }
  // Safe runtime fallback
  parsedEnv = {
    VITE_API_URL: "http://localhost:4000/api/v1",
    VITE_SOCKET_URL: "http://localhost:4000",
    VITE_STRIPE_PUBLIC_KEY: "pk_test_placeholder_key",
    VITE_GOOGLE_MAPS_API_KEY: "",
    VITE_APP_ENV: "development",
  };
}

export const env = parsedEnv;
export default env;
