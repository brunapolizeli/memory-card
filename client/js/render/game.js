import {
  getGameDetails,
  updateProgress,
  updateStatus,
  updatePlatform,
  updateHoursPlayed,
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

hoursPlayedField.addEventListener("input", () => {
  hoursPlayedField.value = hoursPlayedField.value.replace(/[^0-9]/g, "");

  if (
    hoursPlayedField.value.length > 1 &&
    hoursPlayedField.value.charAt(0) === "0"
  ) {
    hoursPlayedField.value = hoursPlayedField.value.slice(1);
  }

  if (hoursPlayedField.value.length === 0) {
    hoursPlayedField.value = 0;
  }
});

hoursPlayedField.addEventListener("blur", async () => {
  const result = await updateHoursPlayed(gameId, hoursPlayedField.value);

  if (result.ok) {
    loadGame();
  }
});

minutesPlayedField.addEventListener("input", () => {
  minutesPlayedField.value = minutesPlayedField.value.replace(/[^0-9]/g, "");

  if (
    minutesPlayedField.value.length > 1 &&
    minutesPlayedField.value.charAt(0) === "0"
  ) {
    minutesPlayedField.value = minutesPlayedField.value.slice(1);
  }

  if (minutesPlayedField.value > 59) {
    minutesPlayedField.value = 59;
  }

  if (minutesPlayedField.value.length === 0) {
    minutesPlayedField.value = 0;
  }
});

minutesPlayedField.addEventListener("blur", async () => {
  const result = await updateMinutesPlayed(gameId, minutesPlayedField.value);

  if (result.ok) {
    loadGame();
  }
});

async function loadGame() {
  const { ok, data } = await getGameDetails(gameId);
  if (!ok) return;
  renderIntro(data);
  progressToggleBtn.textContent = getProgressLabel(data);
  statusToggleBtn.textContent = getStatusLabel(data);
  platformSelectionBtn.textContent = getPlatformLabel(data);
  hoursPlayedField.value = getHoursPlayedLabel(data);
  minutesPlayedField.value = getMinutesPlayedLabel(data);
}

loadGame();
