export const getAllowedOrigins = () => {
  return process.env.ALLOWED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) || [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5001",
    "http://localhost:5173",
    "https://muta7markt.com",
    "https://www.muta7markt.com",
    "https://dash.muta7markt.com",
    "https://dashboard.muta7markt.com",
  ];
};

const allowOriginless = process.env.ALLOW_ORIGINLESS_REQUESTS !== "false";

export const isOriginAllowed = (origin) => {
  const allowed = getAllowedOrigins();

  // No-Origin requests (curl, cron, webhooks, native apps, server-to-server)
  // are allowed intentionally: CORS is a browser-only protection and cannot
  // defend against non-browser clients anyway. Browsers always send Origin
  // on cross-origin requests, so this does not weaken browser security.
  // Set ALLOW_ORIGINLESS_REQUESTS=false to reject them entirely.
  if (!origin) return allowOriginless;

  return allowed.includes(origin);
};
