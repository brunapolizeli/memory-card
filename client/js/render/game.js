import { getGameDetails, updateProgress, updateStatus } from "../api.js";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const gamePageTitle = document.querySelector(".game-page-title");
const gamePageCover = document.querySelector(".game-page-cover");
const progressToggleBtn = document.querySelector(".progress-toggle-btn");
const progressOptions = document.querySelector(".progress-options");
const statusToggleBtn = document.querySelector(".status-toggle-btn");
const statusOptions = document.querySelector(".status-options");

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

async function loadGame() {
  const { ok, data } = await getGameDetails(gameId);
  if (!ok) return;
  renderIntro(data);
  const progressLabel = getProgressLabel(data);
  progressToggleBtn.textContent = progressLabel;
  const statusLabel = getStatusLabel(data);
  statusToggleBtn.textContent = statusLabel;
}

loadGame();
