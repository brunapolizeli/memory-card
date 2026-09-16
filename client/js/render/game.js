import { getGameDetails, updateProgress } from "../api.js";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const gamePageTitle = document.querySelector(".game-page-title");
const gamePageCover = document.querySelector(".game-page-cover");
const progressToggleBtn = document.querySelector(".progress-toggle-btn");
const progressOptions = document.querySelector(".progress-options");

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
});

async function loadGame() {
  const { ok, data } = await getGameDetails(gameId);
  if (!ok) return;
  renderIntro(data);
  const progressLabel = getProgressLabel(data);
  progressToggleBtn.textContent = progressLabel;
}

loadGame();
