const OBSIDIAN_API = "http://127.0.0.1:27123";

const API_KEY = "71ccd2b2a51359a092c4d814feb54ef2e8a17257e94c37668d351f43ca255f61";

export async function fetchDailyLog() {
  const today = new Date().toISOString().split("T")[0];

  const path = encodeURIComponent(
    `13-Operations/Daily Logs/${today}.md`
  );

  const response = await fetch(
    `${OBSIDIAN_API}/vault/${path}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch daily log");
  }

  return await response.text();
}