import { API_BASE_URL } from "./config.js";

export async function getCurrentlyPlaying() {
  const response = await fetch(`${API_BASE_URL}/library/currently-playing`, {
    credentials: "include",
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function getGamesList(page = 1, statuses = [], progress = []) {
  let url = `${API_BASE_URL}/library/games-list?page=${page}`;

  statuses.forEach((status) => {
    url += `&statuses=${status}`;
  });

  progress.forEach((progressItem) => {
    url += `&progress=${progressItem}`;
  });

  const response = await fetch(url, {
    credentials: "include",
  });
  const data = await response.json();
  return { ok: response.ok, data };
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

export async function searchGames(query, page = 1) {
  const response = await fetch(
    `${API_BASE_URL}/games/search?search=${encodeURIComponent(query)}&page=${page}`,
  );
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function addGameFromSearch(game) {
  const response = await fetch(`${API_BASE_URL}/library/add-from-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      external_id: game.id,
      name: game.name,
      image_url: game.background_image,
      tags: game.genres.map((g) => g.name),
      rawg_rating: game.rating,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function removeGameFromLibrary(id) {
  const response = await fetch(`${API_BASE_URL}/library/remove-game`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function logOut() {
  const response = await fetch(`${API_BASE_URL}/auth/log-out`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function getGameDetails(id) {
  const response = await fetch(
    `${API_BASE_URL}/library/game-details?id=${id}`,
    {
      credentials: "include",
    },
  );
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateProgress(id, started, completed, platinum) {
  const response = await fetch(`${API_BASE_URL}/library/update-progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      started,
      completed,
      platinum,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/library/update-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      status,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updatePlatform(id, name) {
  const response = await fetch(`${API_BASE_URL}/library/update-platform`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      name,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateHoursPlayed(id, hours_played) {
  const response = await fetch(`${API_BASE_URL}/library/update-hours-played`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      hours_played,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateMinutesPlayed(id, minutes_played) {
  const response = await fetch(
    `${API_BASE_URL}/library/update-minutes-played`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id,
        minutes_played,
      }),
    },
  );
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateUserRating(id, value) {
  const response = await fetch(`${API_BASE_URL}/library/update-user-rating`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      value,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateDifficulty(id, value) {
  const response = await fetch(`${API_BASE_URL}/library/update-difficulty`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      value,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateStartDate(id, date) {
  const response = await fetch(`${API_BASE_URL}/library/update-start-date`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      date,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateCompletedDate(id, date) {
  const response = await fetch(
    `${API_BASE_URL}/library/update-completed-date`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id,
        date,
      }),
    },
  );
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updatePlatinumDate(id, date) {
  const response = await fetch(`${API_BASE_URL}/library/update-platinum-date`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      date,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateCompletedNotes(id, note) {
  const response = await fetch(
    `${API_BASE_URL}/library/update-completed-notes`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id,
        note,
      }),
    },
  );
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updatePlatinumNotes(id, note) {
  const response = await fetch(
    `${API_BASE_URL}/library/update-platinum-notes`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id,
        note,
      }),
    },
  );
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function updateGameModes(id, modes) {
  const response = await fetch(`${API_BASE_URL}/library/update-game-modes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      id,
      modes,
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function getPlatforms() {
  const response = await fetch(`${API_BASE_URL}/games/search-platforms`);
  const data = await response.json();
  return { ok: response.ok, data };
}
