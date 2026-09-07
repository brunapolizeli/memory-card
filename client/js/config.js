const isLocal =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";

export const API_BASE_URL = isLocal
  ? "http://127.0.0.1:3000"
  : "https://memcard-log-server.vercel.app";
