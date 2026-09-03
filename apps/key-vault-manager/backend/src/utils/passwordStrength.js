// server/utils/passwordStrength.js
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

// Build the zxcvbn instance once at startup — it's expensive to initialize.
// Import this singleton wherever you need password strength checks.
const zxcvbn = new ZxcvbnFactory({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

export default zxcvbn;

/**
 * Score meanings:
 *   0 — too guessable      (guesses < 10^3)
 *   1 — very guessable     (guesses < 10^6)
 *   2 — somewhat guessable (guesses < 10^8)
 *   3 — safely unguessable (guesses < 10^10)  ← minimum we require
 *   4 — very unguessable   (guesses >= 10^10)
 */
export const MIN_PASSWORD_SCORE = 3;

/**
 * Returns the zxcvbn result for a password, optionally penalizing
 * user-supplied inputs (username, email) that appear in the password.
 *
 * @param {string} password
 * @param {string[]} userInputs - e.g. [username, email]
 * @returns {{ score: number, feedback: { warning: string, suggestions: string[] } }}
 */
export function checkPasswordStrength(password, userInputs = []) {
  return zxcvbn.check(password, userInputs);
}
