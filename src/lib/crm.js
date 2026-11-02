import { apiUrl } from "@/lib/apiBase.js";

export async function submitLeadToCRM(data) {
  const response = await fetch(apiUrl("/api/leads"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Заявку не удалось отправить");
  }
  return payload;
}
