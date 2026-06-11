/** Shared input validation patterns. */

/** Lenient international phone format: optional +, digits, spaces, dashes, parens. */
export const PHONE_PATTERN = /^[+]?[0-9\s\-()]{7,20}$/;
