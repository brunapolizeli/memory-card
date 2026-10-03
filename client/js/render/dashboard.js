import { getUserStats } from "../api.js";
import { showLoadingOverlay, hideLoadingOverlay } from "../shared/loading.js";

const userStatsGridArray = [
  ...document.querySelectorAll(".user-stats-grid [data-name]"),
];
let isFirstLoad = true;

function getUserStat(data, key) {
  return data[key] ?? "-";
}

function getPlaytime(data) {
  if (data.total_minutes == null) return "-";
  return `${data.total_hours}h ${data.total_minutes}min`;
}

async function loadDashboard() {
  if (isFirstLoad) {
    showLoadingOverlay();
  }

  const { ok, data } = await getUserStats();
  if (!ok) return;

  userStatsGridArray.forEach((item) => {
    item.textContent = getUserStat(data, item.dataset.name);
  });

  document.querySelector("[data-name='total_playtime']").textContent =
    getPlaytime(data);

  isFirstLoad = false;
  hideLoadingOverlay();
}

loadDashboard();
