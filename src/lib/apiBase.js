export function apiUrl(path) {
  const base = String(import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
