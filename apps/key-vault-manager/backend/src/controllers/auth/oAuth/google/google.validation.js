// server/controllers/oAuth/google/google.validation.js

import { z } from "zod";

export const GoogleAuthSchema = z.object({
  body: z
    .object({
      code: z
        .string({ message: "Authorization code is required." })
        .trim()
        .min(1, { message: "Authorization code cannot be empty." }),
    })
    .strict(),
});
