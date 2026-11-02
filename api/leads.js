import { postLead } from "../server/handlers.js";
import { applyCors, readRequestBody, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Только POST" });
    return;
  }
  try {
    const body = await readRequestBody(req);
    const payload = await postLead(body);
    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Сервер не ответил" });
  }
}
