export function isUzbekPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("998");
}

export function isTelegram(value) {
  return /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(String(value || "").trim());
}

export function isValidContact(value) {
  return isUzbekPhone(value) || isTelegram(value);
}

export function isValidName(value) {
  return String(value || "").trim().length >= 2;
}

export function extractContactFromText(text) {
  const source = String(text || "");
  const telegram = source.match(/@[a-zA-Z][a-zA-Z0-9_]{4,31}/);
  if (telegram) return telegram[0];
  const phone = source.match(/\+?998[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/);
  if (phone && isUzbekPhone(phone[0])) return phone[0];
  return null;
}
