import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Normalizes any valid phone number input into international E.164 format (+923001234567).
 * Handles domestic 03xx prefixes, missing plus signs, and international dials.
 */
export const normalizePhoneNumber = (phoneInput, defaultCountry = "PK") => {
  if (!phoneInput || typeof phoneInput !== "string") return null;

  const clean = phoneInput.trim();
  const parsed = parsePhoneNumberFromString(clean, defaultCountry);

  if (parsed && parsed.isValid()) {
    return parsed.format("E.164"); // e.g. +923001234567 or +15550001234
  }

  // Fallback cleanup (removes all non-digit and non-plus characters)
  const fallback = clean.replace(/[^\d+]/g, "");
  return fallback.length >= 10 ? fallback : null;
};

/**
 * Formats a phone number for national courier dispatch and local SMS gateways (0300 1234567).
 */
export const formatNationalPhoneNumber = (
  phoneInput,
  defaultCountry = "PK",
) => {
  if (!phoneInput) return "";

  const parsed = parsePhoneNumberFromString(phoneInput, defaultCountry);
  if (parsed && parsed.isValid()) {
    return parsed.formatNational();
  }

  return phoneInput;
};

/**
 * Evaluates whether a phone number is mathematically and structurally valid for a country.
 */
export const isPhoneValid = (phoneInput, defaultCountry = "PK") => {
  if (!phoneInput || typeof phoneInput !== "string") return false;

  const parsed = parsePhoneNumberFromString(phoneInput.trim(), defaultCountry);
  return Boolean(parsed && parsed.isValid());
};
