import { API_BASE, authHeaders } from "./api";

export const trackUsage = async ({ tool, action, meta = {} }) => {
  const headers = authHeaders(true);

  if (!headers.Authorization) return;

  try {
    await fetch(`${API_BASE}/dashboard/track`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tool, action, meta }),
    });
  } catch (error) {
    console.error("Tracking failed:", error);
  }
};