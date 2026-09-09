import {
  searchGames,
  addGameFromSearch,
  getRecentlyAddedGames,
} from "../api.js";

const searchGamesApiInput = document.querySelector(".search-games-api-input");
const searchGamesApiBtn = document.querySelector(".search-games-api-btn");
const searchResultsApiOverlay = document.querySelector(
  ".search-results-api-overlay",
);
const searchResultsApi = document.querySelector(".search-results-api");
const libraryFilters = document.querySelector(".library-filters");
const libraryGrid = document.querySelector(".library-grid");
let currentApiPage = 1;
let currentLibraryPage = 1;
let lastQuery = "";
let currentSearchResults = [];

function renderSearchedGames(gamesArray) {
  return gamesArray
    .map(({ id, name, background_image }) => {
      return `<li>
              <img class="game-image-api-search" src="${background_image ?? "assets/default-cover.png"}">
              <h3>${name}</h3>
              <button class="add-game-api-btn" data-id="${id}">Add</button>
            </li>`;
    })
    .join("");
}

document.querySelectorAll(".filter-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const dropdown = button.closest(".filter-dropdown");
    const optionsList = dropdown.querySelector(".filter-options");
    optionsList.hidden = !optionsList.hidden;
  });
});

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const delta = 1;

  for (let i = 1; i <= totalPages; i++) {
    const isFirst = i === 1;
    const isLast = i === totalPages;
    const isNearCurrent = Math.abs(i - currentPage) <= delta;

    if (isFirst || isLast || isNearCurrent) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
}

function renderApiPagination(count) {
  const totalPages = Math.ceil(count / 10);
  const pageNumbers = getPageNumbers(currentApiPage, totalPages);

  const paginationHTML = pageNumbers
    .map((page) => {
      if (page === "...") {
        return `<span>...</span>`;
      }
      const activeClass = page === currentApiPage ? "active" : "";
      return `<button class="api-page-btn ${activeClass}" data-api-page="${page}">${page}</button>`;
    })
    .join("");

  const paginationContainer = document.querySelector(".api-pagination");
  paginationContainer.innerHTML = paginationHTML;

  paginationContainer.addEventListener("click", async (event) => {
    const clickedButton = event.target.closest(".api-page-btn");
    if (!clickedButton) return;

    currentApiPage = Number(clickedButton.dataset.apiPage);
    const result = await searchGames(lastQuery, currentApiPage);
    const renderedList = renderSearchedGames(result.data.results);
    searchResultsApi.innerHTML = renderedList;
    renderApiPagination(result.data.count);
  });
}

async function performApiSearch(query) {
  lastQuery = query;
  const result = await searchGames(query, currentApiPage);
  renderSearchedGames(result.data.results);
  renderApiPagination(result.data.count);
}

searchGamesApiBtn.addEventListener("click", async (event) => {
  const input = searchGamesApiInput.value;
  if (input) {
    currentApiPage = 1;
    lastQuery = input;
    const result = await searchGames(input, currentApiPage);
    currentSearchResults = result.data.results;
    const renderedList = renderSearchedGames(result.data.results);
    searchResultsApi.innerHTML = renderedList;
    renderApiPagination(result.data.count);
    searchResultsApiOverlay.classList.add("visible");
    libraryFilters.hidden = true;
  }
});

searchResultsApi.addEventListener("click", async (event) => {
  const addButton = event.target.closest(".add-game-api-btn");
  if (!addButton) return;

  const clickedId = Number(addButton.dataset.id);
  const game = currentSearchResults.find((g) => g.id === clickedId);

  const result = await addGameFromSearch(game);

  if (result.ok) {
    addButton.textContent = "Added!";
    addButton.disabled = true;
  } else {
    addButton.textContent = result.data.error;
    setTimeout(() => {
      addButton.textContent = "Add";
    }, 3000);
  }
});

function renderRecentlyAddedGames(games) {
  if (games.length === 0) {
    libraryGrid.innerHTML = `<p class="no-games-message">No games in your library yet. Add one to get started!</p>`;
    return "";
  }

  return games
    .map(
      ({
        name,
        image_url,
        platform,
        tags,
        status,
        hours_played,
        user_rating,
      }) => {
        return `<li class="library-game-info">
                <img class="library-game-cover" src="${image_url}">
                <div class="library-game-details">
                  <h3 class="library-game-title">${name}</h3>
                  <div class="library-game-details-one">
                    <p>${platform ?? "—"}</p>
                    <p>${tags?.[0] ?? "—"}</p>
                  </div>
                  <div class="library-game-details-two">
                    <p>${status ?? "—"}</p>
                  </div>
                  <div class="library-game-details-three">
                    <p><img class="clock-icon" src="assets/icons/clock-icon.png">${hours_played ?? "—"}</p>
                    <p><img class="star-icon" src="assets/icons/star-icon.png">${user_rating ?? "—"}</p>
                  </div>
                </div>
              </li>`;
      },
    )
    .join("");
}

async function renderLibraryPagination(count) {
  const totalPages = Math.ceil(count / 4);
  const pageNumbers = getPageNumbers(currentLibraryPage, totalPages);

  const paginationHTML = pageNumbers
    .map((page) => {
      if (page === "...") {
        return `<span>...</span>`;
      }
      const activeClass = page === currentLibraryPage ? "active" : "";
      return `<button class="library-page-btn ${activeClass}" data-library-page="${page}">${page}</button>`;
    })
    .join("");

  const paginationContainer = document.querySelector(".library-pagination");
  paginationContainer.innerHTML = paginationHTML;

  paginationContainer.addEventListener("click", async (event) => {
    const clickedButton = event.target.closest(".library-page-btn");
    if (!clickedButton) return;

    currentLibraryPage = Number(clickedButton.dataset.libraryPage);
    const result = await getRecentlyAddedGames(currentLibraryPage);
    const renderedList = renderRecentlyAddedGames(result.data.results);
    libraryGrid.innerHTML = renderedList;
    renderLibraryPagination(result.data.count);
  });
}

async function loadLibrary() {
  const result = await getRecentlyAddedGames(currentLibraryPage);
  const renderedList = renderRecentlyAddedGames(result.data.results);
  libraryGrid.innerHTML = renderedList;
  renderLibraryPagination(result.data.count);
}

loadLibrary();
