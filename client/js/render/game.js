import {
  getGameDetails,
  updateProgress,
  updateStatus,
  updatePlatform,
  updateHoursPlayed,
  updateMinutesPlayed,
  updateUserRating,
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
let allPlatforms = [];

function renderIntro(game) {
  gamePageTitle.textContent = game.name;
  gamePageCover.src = game.image_url;
}

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

function getPlatformLabel(game) {
  if (!game.platform) return "Choose Platform";
  return game.platform;
}

function getHoursPlayedLabel(game) {
  if (!game.hours_played) return 0;
  return game.hours_played;
}

function getMinutesPlayedLabel(game) {
  if (!game.minutes_played) return 0;
  return game.minutes_played;
}

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

  if (!game.user_rating) return "";
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

statusToggleBtn.addEventListener("click", () => {
  statusOptions.hidden = !statusOptions.hidden;
});

statusOptions.addEventListener("change", async (event) => {
  const selectedValue = event.target.value;
  const result = await updateStatus(gameId, selectedValue);

  loadGame();
});

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

userRatingStars.addEventListener("click", async (event) => {
  const star = event.target.closest(".star-btn");

  const value = star.dataset.value;

  const result = await updateUserRating(gameId, value);

  if (result.ok) {
    loadGame();
  }
});

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
  const userRatingLabelObj = getUserRatingLabel(data);
  userRatingLabel.innerHTML = userRatingLabelObj.label;
  userRatingLabel.style.color = userRatingLabelObj.color;
  userRatingLabel.style.backgroundColor = userRatingLabelObj.color + "33";
}

loadGame();
