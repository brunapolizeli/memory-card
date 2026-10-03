import { getUserStats, getGamesByPlatform } from "../api.js";
import { showLoadingOverlay, hideLoadingOverlay } from "../shared/loading.js";

const userStatsGridArray = [
  ...document.querySelectorAll(".user-stats-grid [data-name]"),
];
const sliceColors = [
  "#4A90D9",
  "#8C7AE6",
  "#7CC576",
  "#FFC94A",
  "#0EA5C4",
  "#F0A35E",
];
const gamesByPlatformDonut = document.querySelector(".games-by-platform-donut");
const gamesByPlatformDonutTotal = document.querySelector(
  ".games-by-platform-donut-total",
);
const gamesByPlatformLegend = document.querySelector(
  ".games-by-platform-legend",
);
let isFirstLoad = true;

function getUserStat(data, key) {
  return data[key] ?? "-";
}

function getPlaytime(data) {
  if (data.total_minutes == null) return "-";
  return `${data.total_hours}h ${data.total_minutes}min`;
}

function getPlatformSlices(platformsArray) {
  let slices = platformsArray;

  if (platformsArray.length > 6) {
    const firstFive = platformsArray.slice(0, 5);
    const rest = platformsArray.slice(5);
    const restTotal = rest.reduce((sum, item) => sum + item.total, 0);

    slices = [...firstFive, { platform: "Other", total: restTotal }];
  }

  return slices.map((slice, index) => ({
    ...slice,
    color: sliceColors[index],
  }));
}

function getDonutGradient(slices, grandTotal) {
  let start = 0;

  const parts = slices.map(({ total, color }) => {
    const end = start + (total / grandTotal) * 100;
    const part = `${color} ${start}% ${end}%`;
    start = end;
    return part;
  });

  return `conic-gradient(${parts.join(", ")})`;
}

function renderGamesByPlatformLegend(slices, grandTotal) {
  return slices
    .map(({ platform, total, color }) => {
      const percentage = Math.round((total / grandTotal) * 100);
      return `<li>
        <span class="legend-dot" style="background: ${color}"></span>
        ${platform}: ${total} (${percentage}%)
      </li>`;
    })
    .join("");
}

async function loadDashboard() {
  if (isFirstLoad) {
    showLoadingOverlay();
  }

  const [statsResult, platformsResult] = await Promise.all([
    getUserStats(),
    getGamesByPlatform(),
  ]);
  const { ok: statsOk, data: statsData } = statsResult;
  const { ok: platformsOk, data: platformsData } = platformsResult;

  if (!statsOk) {
    isFirstLoad = false;
    hideLoadingOverlay();
    return;
  }

  if (!platformsOk) {
    isFirstLoad = false;
    hideLoadingOverlay();
    return;
  }

  userStatsGridArray.forEach((item) => {
    item.textContent = getUserStat(statsData, item.dataset.name);
  });
  document.querySelector("[data-name='total_playtime']").textContent =
    getPlaytime(statsData);

  const slices = getPlatformSlices(platformsData.platforms);
  const gradient = getDonutGradient(slices, platformsData.grandTotal);

  if (platformsData.grandTotal === 0) {
    gamesByPlatformDonut.style.background = `#d3d3d3`;
  } else {
    gamesByPlatformDonut.style.background = gradient;
  }

  gamesByPlatformDonutTotal.textContent = platformsData.grandTotal;
  gamesByPlatformLegend.innerHTML = renderGamesByPlatformLegend(
    slices,
    platformsData.grandTotal,
  );

  isFirstLoad = false;
  hideLoadingOverlay();
}

loadDashboard();
