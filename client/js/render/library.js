import {
  searchGames,
  addGameFromSearch,
  getGamesList,
  removeGameFromLibrary,
} from "../api.js";

// --- DOM references ---
const searchGamesApiInput = document.querySelector(".search-games-api-input");
const searchGamesApiBtn = document.querySelector(".search-games-api-btn");
const closeSearchResultsApiBtn = document.querySelector(
  ".close-search-results-api-btn",
);
const searchResultsApiOverlay = document.querySelector(
  ".search-results-api-overlay",
);
const searchResultsApi = document.querySelector(".search-results-api");
const libraryFilters = document.querySelector(".library-filters");
const libraryGridOverlay = document.querySelector(".library-grid-overlay");
const libraryGrid = document.querySelector(".library-grid");
const statusFilterOptionsCheckboxes = document.querySelectorAll(
  ".status-filter-options input[type='checkbox']",
);
const statusFilterOptions = document.querySelector(".status-filter-options");
let currentApiPage = 1;
let currentLibraryPage = 1;
let lastQuery = "";
let gameIdToRemove = null;
let currentSearchResults = [];
let selectedStatuses = [];

// builds one <li> per RAWG search result
function renderSearchedGames(gamesArray) {
  return gamesArray
    .map(({ id, name, background_image }) => {
      return `<li>
              <img class="game-image-api-search" src="${background_image ?? "assets/library/default-cover.png"}">
              <h3>${name}</h3>
              <button class="add-game-api-btn" data-id="${id}">Add</button>
            </li>`;
    })
    .join("");
}

// opens/closes each library filter dropdown independently
document.querySelectorAll(".filter-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const dropdown = button.closest(".filter-dropdown");
    const optionsList = dropdown.querySelector(".filter-options");
    optionsList.hidden = !optionsList.hidden;
  });
});

// builds the [1, "...", 5, 6, 7, "...", 20] pattern for pagination
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

// renders pagination for the RAWG search results and handles page clicks
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
    currentSearchResults = result.data.results;
    const renderedList = renderSearchedGames(result.data.results);
    searchResultsApi.innerHTML = renderedList;
    renderApiPagination(result.data.count);
  });
}

// runs a new RAWG search, shows the results overlay, and hides the library behind it
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
    libraryGridOverlay.hidden = true;
  }
});

// closes the search overlay and restores the library view
closeSearchResultsApiBtn.addEventListener("click", () => {
  searchResultsApiOverlay.classList.remove("visible");
  libraryFilters.hidden = false;
  libraryGridOverlay.hidden = false;
});

// handles clicking "Add" on a search result, using currentSearchResults to find the full game object
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

function getSelectedStatuses() {
  return [...statusFilterOptionsCheckboxes]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

statusFilterOptions.addEventListener("change", () => {
  currentLibraryPage = 1;
  loadLibrary();
});

// builds one <li> per game already in the user's library
function renderGamesList(games) {
  if (games.length === 0) {
    libraryGrid.innerHTML = `<p class="no-games-message">No games in your library yet. Add one to get started!</p>`;
    return "";
  }

  return games
    .map(
      ({
        user_games_id,
        name,
        image_url,
        platform,
        tags,
        status,
        hours_played,
        user_rating,
      }) => {
        return `<li class="library-game-info" data-user-game-id="${user_games_id}">
                <button class="library-game-options-btn" type="button">˙˙˙</button>
                <ul class="library-game-options-menu" hidden>
                  <li><button class="library-edit-game-btn">Edit</button></li>
                  <li><button class="library-remove-game-btn">Remove</button></li>
                </ul>
                <img class="library-game-cover" src="${image_url}">
                <div class="library-game-details">
                  <h3 class="library-game-title">${name}</h3>
                  <div class="library-game-details-one">
                    <p>${platform ?? "—"}</p>
                    <p>${tags?.[0] ?? "—"}</p>
                  </div>
                  <div class="library-game-details-two">
                    <p>${status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}</p>
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

// renders pagination for the user's library and handles page clicks
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
    const result = await getGamesList(
      currentLibraryPage,
      getSelectedStatuses(),
    );
    const renderedList = renderGamesList(result.data.results);
    libraryGrid.innerHTML = renderedList;
    renderLibraryPagination(result.data.count);
  });
}

// fetches and renders the user's library; redirects to the home page if not authenticated
async function loadLibrary() {
  const { ok, data } = await getGamesList(
    currentLibraryPage,
    getSelectedStatuses(),
  );

  // if (!ok) {
  //window.location.href = "index.html";
  //return;
  //}

  const renderedList = renderGamesList(data.results);
  libraryGrid.innerHTML = renderedList;
  renderLibraryPagination(data.count);
}

loadLibrary();

// toggles the options menu ("..." button) for a specific game card
libraryGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".library-game-options-btn");
  if (!button) return;

  const card = button.closest(".library-game-info");
  const menu = card.querySelector(".library-game-options-menu");
  menu.hidden = !menu.hidden;
});

// removes a game from the library and reloads the list on success
libraryGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".library-remove-game-btn");
  if (!button) return;

  const card = button.closest(".library-game-info");
  gameIdToRemove = card.dataset.userGameId;
  document.querySelector(".confirm-remove-overlay").hidden = false;
});

document
  .querySelector(".confirm-remove-cancel-btn")
  .addEventListener("click", () => {
    document.querySelector(".confirm-remove-overlay").hidden = true;
    gameIdToRemove = null;
  });

document
  .querySelector(".confirm-remove-yes-btn")
  .addEventListener("click", async () => {
    const result = await removeGameFromLibrary(gameIdToRemove);
    document.querySelector(".confirm-remove-overlay").hidden = true;

    if (result.ok) {
      loadLibrary();
    }
  });

// redirects to the game details page for editing
libraryGrid.addEventListener("click", async (event) => {
  const button = event.target.closest(".library-edit-game-btn");
  if (!button) return;

  const card = button.closest(".library-game-info");
  const id = card.dataset.userGameId;
  window.location.href = `game.html?id=${id}`;
});
