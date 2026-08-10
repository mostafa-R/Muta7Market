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

export const isOriginAllowed = (origin) => {
  const allowed = getAllowedOrigins();
  return !origin || allowed.includes(origin);
};
