import { API_BASE_URL } from "./config.js";

export async function getCurrentlyPlaying() {
  const response = await fetch(`${API_BASE_URL}/library/currently-playing`, {
    credentials: "include",
  });
  return response.json();
}

export async function login(loginEmail, loginPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function signup(signupUsername, signupEmail, signupPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}
