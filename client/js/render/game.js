import {
  getGameDetails,
  updateProgress,
  updateStatus,
  updatePlatform,
  updateHoursPlayed,
  updateMinutesPlayed,
  updateUserRating,
  updateDifficulty,
  updateStartDate,
  updateCompletedDate,
  updatePlatinumDate,
  updateCompletedNotes,
  updatePlatinumNotes,
  updateGameModes,
  getPlatforms,
} from "../api.js";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const gamePageTitle = document.querySelector(".game-page-title");
const gamePageCover = document.querySelector(".game-page-cover");
const progressToggleBtn = document.querySelector(".progress-toggle-btn");
const progressOptions = document.querySelector(".progress-options");
const statusToggleBtn = document.querySelector(".status-toggle-btn");
const statusOptions = document.querySelector(".status-options");
const platformSelectionBtn = document.querySelector(".platform-selection-btn");
const platformSearchOverlay = document.querySelector(
  ".platform-search-overlay",
);
const closePlatformSearchBtn = document.querySelector(
  ".close-platform-search-btn",
);
const main = document.querySelector("main");
const platformSearchInput = document.querySelector(".platform-search-input");
const platformSearchResults = document.querySelector(
  ".platform-search-results",
);
const hoursPlayedField = document.querySelector(".hours-played-field");
const minutesPlayedField = document.querySelector(".minutes-played-field");
const userRatingStars = document.querySelector(".user-rating-stars");
const userRatingFraction = document.querySelector(".user-rating-fraction");
const userRatingLabel = document.querySelector(".user-rating-label");
const downwardArrowIcon = `<img class="downward-arrow-icon" src="assets/icons/downward-arrow-icon.png">`;
const rawgStars = document.querySelectorAll(".rawg-rating-stars li");
const rawgRatingFraction = document.querySelector(".rawg-rating-fraction");
const difficultyDrops = document.querySelector(".difficulty-drops");
const difficultyLabel = document.querySelector(".difficulty-label");
const userRatingTooltip = document.querySelector(".user-rating-tooltip");
const difficultyTooltip = document.querySelector(".difficulty-tooltip");
const startDateField = document.querySelector(".start-date-field");
const completedDateField = document.querySelector(".completed-date-field");
const platinumDateField = document.querySelector(".platinum-date-field");
const completedNotesField = document.querySelector(".completed-notes-field");
const platinumNotesField = document.querySelector(".platinum-notes-field");
const gameModeField = document.querySelector(".game-mode-field");
const addModeBtn = document.querySelector(".add-mode-btn");
const addedGameModesList = document.querySelector(".added-game-modes");
let gameModes = [];
let allPlatforms = [];

// ---- Intro (title, cover) ----

function renderIntro(game) {
  gamePageTitle.textContent = game.name;
  gamePageCover.src = game.image_url;
}

// ---- Progress ----

function getProgressLabel(game) {
  if (game.platinum) {
    return "Platinum";
  } else if (game.completed) {
    return "Completed";
  } else if (game.started) {
    return "Started";
  } else {
    return "Haven't Started";
  }
}

progressToggleBtn.addEventListener("click", () => {
  progressOptions.hidden = !progressOptions.hidden;
});

progressOptions.addEventListener("change", async (event) => {
  const selectedValue = event.target.value;

  const progressMap = {
    "not-started": { started: false, completed: false, platinum: false },
    started: { started: true, completed: false, platinum: false },
    completed: { started: true, completed: true, platinum: false },
    platinum: { started: true, completed: true, platinum: true },
  };

  const progressValues = progressMap[selectedValue];

  const result = await updateProgress(
    gameId,
    progressValues.started,
    progressValues.completed,
    progressValues.platinum,
  );

  loadGame();
});

// ---- Status ----

function getStatusLabel(game) {
  const statusLabels = {
    wishlist: "Wishlist",
    backlog: "Backlog",
    playing: "Playing",
    "on-hold": "On Hold",
    finished: "Finished",
    replaying: "Replaying",
    dropped: "Dropped",
  };

  if (!game.status) return "Choose Status";
  return statusLabels[game.status];
}

statusToggleBtn.addEventListener("click", () => {
  statusOptions.hidden = !statusOptions.hidden;
});

statusOptions.addEventListener("change", async (event) => {
  const selectedValue = event.target.value;
  const result = await updateStatus(gameId, selectedValue);

  loadGame();
});

// ---- Platform ----

function getPlatformLabel(game) {
  if (!game.platform) return "Choose Platform";
  return game.platform;
}

platformSelectionBtn.addEventListener("click", async () => {
  platformSearchOverlay.hidden = false;
  main.inert = true;
  const result = await getPlatforms();
  allPlatforms = result.data;
});

closePlatformSearchBtn.addEventListener("click", () => {
  platformSearchOverlay.hidden = true;
  main.inert = false;
});

platformSearchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value;

  const filtered = allPlatforms.filter((platform) => {
    return platform.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const platforms = filtered.slice(0, 5);

  const renderedPlatformsList = platforms
    .map(({ name }) => {
      return `<li class="platform" data-name="${name}"><h5>${name}</h5></li>`;
    })
    .join("");

  platformSearchResults.innerHTML = `<h4 class="platform-search-results-title">Platforms</h4>`;
  platformSearchResults.innerHTML += renderedPlatformsList;
});

platformSearchResults.addEventListener("click", async (event) => {
  const item = event.target.closest(".platform");
  if (!item) return;

  const name = item.dataset.name;
  const result = await updatePlatform(gameId, name);

  if (result.ok) {
    loadGame();
    platformSearchOverlay.hidden = true;
    main.inert = false;
  }
});

// ---- Hours / Minutes played ----

function getHoursPlayedLabel(game) {
  if (!game.hours_played) return 0;
  return game.hours_played;
}

function getMinutesPlayedLabel(game) {
  if (!game.minutes_played) return 0;
  return game.minutes_played;
}

// Shared by hours and minutes fields: strips non-digits, removes leading
// zero, and clamps to an optional max (used for minutes, capped at 59).
function sanitizeNumericField(field, max) {
  field.value = field.value.replace(/[^0-9]/g, "");

  if (field.value.length > 1 && field.value.charAt(0) === "0") {
    field.value = field.value.slice(1);
  }

  if (max !== undefined && Number(field.value) > max) {
    field.value = String(max);
  }

  if (field.value.length === 0) {
    field.value = "0";
  }
}

hoursPlayedField.addEventListener("input", () => {
  sanitizeNumericField(hoursPlayedField);
});

minutesPlayedField.addEventListener("input", () => {
  sanitizeNumericField(minutesPlayedField, 59);
});

hoursPlayedField.addEventListener("blur", async () => {
  const result = await updateHoursPlayed(gameId, hoursPlayedField.value);

  if (result.ok) {
    loadGame();
  }
});

minutesPlayedField.addEventListener("blur", async () => {
  const result = await updateMinutesPlayed(gameId, minutesPlayedField.value);

  if (result.ok) {
    loadGame();
  }
});

// ---- Your Rating (user rating, 1-6 stars) ----

function getUserRatingFraction(game) {
  if (!game.user_rating) return "";
  return `${game.user_rating}/5`;
}

function getUserRatingLabel(game) {
  const ratingLabels = {
    1: { label: "Terrible", color: "#C77B6B" },
    2: { label: "Bad", color: "#E0A458" },
    3: { label: "Okay", color: "#E8D06B" },
    4: { label: "Good", color: "#4A90D9" },
    5: { label: "Great", color: "#8FC97D" },
    6: { label: "Masterpiece", color: "#0EA5C4" },
  };

  if (!game.user_rating) return { label: "", color: "transparent" };
  return ratingLabels[game.user_rating];
}

function renderFilledStars(user_rating) {
  document.querySelectorAll(".star-btn").forEach((star) => {
    const img = star.querySelector("img");

    const value = Number(star.dataset.value);

    if (value === 6 && user_rating === 6) {
      img.src = `assets/icons/special-user-rating-icon.png`;
    } else if (value <= user_rating && value !== 6) {
      img.src = `assets/icons/yellow-user-rating-icon.png`;
    } else {
      img.src = `assets/icons/empty-rating-icon.png`;
    }
  });
}

userRatingStars.addEventListener("click", async (event) => {
  const star = event.target.closest(".star-btn");

  const value = star.dataset.value;

  const result = await updateUserRating(gameId, value);

  if (result.ok) {
    loadGame();
  }
});

// ---- Difficulty Score (1-5 drops) ----

function getDifficultyLabel(game) {
  const difficultyLabels = {
    1: { label: "Easy", color: "#8FC97D" },
    2: { label: "Medium", color: "#B8D96B" },
    3: { label: "Tricky", color: "#E8D06B" },
    4: { label: "Hard", color: "#E0A458" },
    5: { label: "Brutal", color: "#C77B6B" },
  };

  if (!game.difficulty) return { label: "", color: "transparent" };
  return difficultyLabels[game.difficulty];
}

function renderFilledDrops(difficulty) {
  document.querySelectorAll(".drop-btn").forEach((drop) => {
    const img = drop.querySelector("img");

    const value = Number(drop.dataset.value);

    if (value <= difficulty) {
      img.src = `assets/icons/filled-difficulty-icon.png`;
    } else {
      img.src = `assets/icons/empty-difficulty-icon.png`;
    }
  });
}

difficultyDrops.addEventListener("click", async (event) => {
  const drop = event.target.closest(".drop-btn");

  const value = drop.dataset.value;

  const result = await updateDifficulty(gameId, value);

  if (result.ok) {
    loadGame();
  }
});

// ---- RAWG Rating (read-only, partial star fill) ----

function getRawgRatingFraction(game) {
  if (!game.rawg_rating) return "";
  return `${game.rawg_rating}/5`;
}

function renderRawgRating(game) {
  const rating = game.rawg_rating;
  const integer = Math.floor(rating);
  const decimal_percentage = (rating - integer) * 100;

  rawgStars.forEach((li, index) => {
    const star = li.querySelector(".rawg-star");
    const fill = star.querySelector(".star-fill");

    if (index < integer) {
      fill.style.width = `100%`;
    } else if (index === integer && decimal_percentage !== 0) {
      fill.style.width = `${decimal_percentage}%`;
    } else {
      fill.style.width = `0%`;
    }
  });
}

// ---- Game Modes (free-text tags, stored as an array) ----

function renderGameModes() {
  addedGameModesList.innerHTML = gameModes
    .map((mode) => {
      return `<li class="mode-tag">${mode} <button type="button" class="remove-mode-btn" data-mode="${mode}">×</button></li>`;
    })
    .join("");
}

addModeBtn.addEventListener("click", async () => {
  const newMode = gameModeField.value.trim();
  if (!newMode) return;

  gameModes.push(newMode);
  gameModeField.value = "";
  renderGameModes();

  const result = await updateGameModes(gameId, gameModes);

  if (result.ok) {
    loadGame();
  }
});

// Delegated listener: catches clicks on any "×" button inside the list,
// since each tag (and its remove button) is generated dynamically.
addedGameModesList.addEventListener("click", async (event) => {
  const btn = event.target.closest(".remove-mode-btn");
  if (!btn) return;

  const modeToRemove = btn.dataset.mode;
  gameModes = gameModes.filter((mode) => mode !== modeToRemove);
  renderGameModes();

  const result = await updateGameModes(gameId, gameModes);

  if (result.ok) {
    loadGame();
  }
});

// ---- Timeline (start / completed / platinum dates) ----

// Dates come back from the backend with a time/timezone attached; an
// <input type="date"> only accepts yyyy-mm-dd, so this trims it down.
function getDate(game, field) {
  if (!game[field]) return "";
  return game[field].slice(0, 10);
}

startDateField.addEventListener("change", async () => {
  const date = startDateField.value;

  const result = await updateStartDate(gameId, date);

  if (result.ok) {
    loadGame();
  }
});

completedDateField.addEventListener("change", async () => {
  const date = completedDateField.value;

  const result = await updateCompletedDate(gameId, date);

  if (result.ok) {
    loadGame();
  }
});

platinumDateField.addEventListener("change", async () => {
  const date = platinumDateField.value;

  const result = await updatePlatinumDate(gameId, date);

  if (result.ok) {
    loadGame();
  }
});

// ---- Notes (completion / platinum) ----

function getNotes(game, field) {
  if (!game[field]) return "";
  return game[field];
}

completedNotesField.addEventListener("change", async () => {
  const note = completedNotesField.value;

  const result = await updateCompletedNotes(gameId, note);

  if (result.ok) {
    loadGame();
  }
});

platinumNotesField.addEventListener("change", async () => {
  const note = platinumNotesField.value;

  const result = await updatePlatinumNotes(gameId, note);

  if (result.ok) {
    loadGame();
  }
});

// ---- Load / render everything ----

async function loadGame() {
  const { ok, data } = await getGameDetails(gameId);
  if (!ok) return;

  renderIntro(data);

  progressToggleBtn.innerHTML = `${getProgressLabel(data)} ${downwardArrowIcon}`;
  statusToggleBtn.innerHTML = `${getStatusLabel(data)} ${downwardArrowIcon}`;
  platformSelectionBtn.innerHTML = `${getPlatformLabel(data)} ${downwardArrowIcon}`;

  hoursPlayedField.value = getHoursPlayedLabel(data);
  minutesPlayedField.value = getMinutesPlayedLabel(data);

  renderFilledStars(data.user_rating);
  userRatingFraction.innerHTML = getUserRatingFraction(data);

  if (!data.user_rating) {
    userRatingTooltip.hidden = true;
  } else {
    userRatingTooltip.hidden = false;
    const userRatingLabelObj = getUserRatingLabel(data);
    userRatingLabel.innerHTML = userRatingLabelObj.label;
    userRatingLabel.style.color = userRatingLabelObj.color;
    userRatingLabel.style.backgroundColor = userRatingLabelObj.color + "33";
  }

  renderFilledDrops(data.difficulty);

  if (!data.difficulty) {
    difficultyTooltip.hidden = true;
  } else {
    difficultyTooltip.hidden = false;
    const difficultyLabelObj = getDifficultyLabel(data);
    difficultyLabel.innerHTML = difficultyLabelObj.label;
    difficultyLabel.style.color = difficultyLabelObj.color;
    difficultyLabel.style.backgroundColor = difficultyLabelObj.color + "33";
  }

  renderRawgRating(data);
  rawgRatingFraction.innerHTML = getRawgRatingFraction(data);

  gameModes = data.game_modes || [];
  renderGameModes();

  startDateField.value = getDate(data, "start_date");
  completedDateField.value = getDate(data, "completed_date");
  platinumDateField.value = getDate(data, "platinum_date");

  completedNotesField.value = getNotes(data, "completed_notes");
  platinumNotesField.value = getNotes(data, "platinum_notes");
}

loadGame();
