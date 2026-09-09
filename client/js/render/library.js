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
let currentPage = 1;
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

function renderPagination(count) {
  const totalPages = Math.ceil(count / 10);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const paginationHTML = pageNumbers
    .map((page) => {
      if (page === "...") {
        return `<span>...</span>`;
      }
      const activeClass = page === currentPage ? "active" : "";
      return `<button class="page-btn ${activeClass}" data-page="${page}">${page}</button>`;
    })
    .join("");

  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = paginationHTML;

  paginationContainer.addEventListener("click", async (event) => {
    const clickedButton = event.target.closest(".page-btn");
    if (!clickedButton) return;

    currentPage = Number(clickedButton.dataset.page);
    const result = await searchGames(lastQuery, currentPage);
    const renderedList = renderSearchedGames(result.data.results);
    searchResultsApi.innerHTML = renderedList;
    renderPagination(result.data.count);
  });
}

async function performSearch(query) {
  lastQuery = query;
  const result = await searchGames(query, currentPage);
  renderSearchedGames(result.data.results);
  renderPagination(result.data.count);
}

searchGamesApiBtn.addEventListener("click", async (event) => {
  const input = searchGamesApiInput.value;
  if (input) {
    currentPage = 1;
    lastQuery = input;
    const result = await searchGames(input, currentPage);
    currentSearchResults = result.data.results;
    const renderedList = renderSearchedGames(result.data.results);
    searchResultsApi.innerHTML = renderedList;
    renderPagination(result.data.count);
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

async function renderRecentlyAddedGames() {
  const { ok, data } = await getRecentlyAddedGames();

  if (!ok) {
    window.location.href = "index.html";
    return;
  }

  const games = data;

  if (games.length === 0) {
    currentlyPlaying.innerHTML = `<p class="no-games-message">No games in progress. Add one for it to show here!</p>`;
    return;
  }

  const renderedGamesList = games
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
                    <p>${platform}</p>
                    <p>${tags?.[0] ?? ""}
                  </div>
                  <div class="library-game-details-two">
                    <p>${status}</p>
                  </div>
                  <div class="library-game-details-three">
                    <p>${hours_played}</p>
                    <p>${user_rating ?? "No rating"}</p>
                  </div>
                </div>
              </li>`;
      },
    )
    .join("");

  libraryGrid.innerHTML = renderedGamesList;
}

renderRecentlyAddedGames();
