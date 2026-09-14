import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

// Initialize singleton instance once
const zxcvbn = new ZxcvbnFactory({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

export const MIN_PASSWORD_SCORE = 3;

/**
 * Computes the zxcvbn entropy score for a password against contextual user terms.
 */
export function checkPasswordStrength(password, userInputs = []) {
  if (!password) {
    return {
      score: 0,
      feedback: { warning: "Password is required.", suggestions: [] },
    };
  }
  return zxcvbn.check(password, userInputs.filter(Boolean));
}
