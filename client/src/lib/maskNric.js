export function maskNric(nric) {
  if (typeof nric !== "string") return "";

  const identifier = nric.trim();
  if (!identifier) return "";
  if (identifier.length <= 3) return "•".repeat(identifier.length);

  return `${identifier[0]}${"•".repeat(identifier.length - 3)}${identifier.slice(-2)}`;
}
