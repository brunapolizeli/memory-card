import {
  searchGames,
  addGameFromSearch,
  getGamesList,
  removeGameFromLibrary,
  getUserPlatforms,
  getUserGenres,
  getUserExternalIds,
} from "../api.js";
import { showLoadingOverlay, hideLoadingOverlay } from "../shared/loading.js";

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

// one <ul> per filter dropdown; the checkboxes inside are read on demand
const statusFilterOptions = document.querySelector(".status-filter-options");
const progressFilterOptions = document.querySelector(
  ".progress-filter-options",
);
const playtimeFilterOptions = document.querySelector(
  ".playtime-filter-options",
);
const ratingFilterOptions = document.querySelector(".rating-filter-options");
const platformFilterOptions = document.querySelector(
  ".platform-filter-options",
);
const genreFilterOptions = document.querySelector(".genre-filter-options");

const searchGamesLibraryField = document.querySelector(
  ".search-games-library-field",
);

// --- State ---
let currentApiPage = 1;
let currentLibraryPage = 1;
let lastQuery = "";
let gameIdToRemove = null;
let currentRawgSearchResults = [];
let isFirstLoad = true;
let currentLibrarySearch = "";
let librarySearchTimeout;
// external ids (as numbers) of the games already in the user's library,
// fetched once per RAWG search so the result buttons can show "Added!"
let userExternalIds = [];

// --- RAWG search ---

// builds one <li> per RAWG search result; results already in the library
// get a disabled "Added!" button instead of "Add"
function renderSearchedGames(gamesArray) {
  return gamesArray
    .map(({ id, name, background_image }) => {
      let btn = `<button class="add-game-api-btn" data-id="${id}">Add</button>`;

      if (userExternalIds.includes(id)) {
        btn = `<button class="add-game-api-btn" disabled>Added!</button>`;
      }

      return `<li>
              <img class="game-image-api-search" src="${background_image ?? "assets/library/default-cover.png"}">
              <h3>${name}</h3>
              ${btn}
            </li>`;
    })
    .join("");
}

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
    currentRawgSearchResults = result.data.results;
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
    currentRawgSearchResults = result.data.results;

    // refreshed on every new search, so games added earlier show as "Added!"
    const idsResult = await getUserExternalIds();
    userExternalIds = idsResult.data.map(({ external_id }) =>
      Number(external_id),
    );

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

// handles clicking "Add" on a search result, using currentRawgSearchResults to find the full game object
searchResultsApi.addEventListener("click", async (event) => {
  const addButton = event.target.closest(".add-game-api-btn");
  if (!addButton) return;

  const clickedId = Number(addButton.dataset.id);
  const game = currentRawgSearchResults.find((g) => g.id === clickedId);

  const result = await addGameFromSearch(game);

  if (result.ok) {
    addButton.textContent = "Added!";
    addButton.disabled = true;
    // keeps the list in sync, so paging through the results still shows "Added!"
    userExternalIds.push(clickedId);
    loadLibrary();
  } else {
    addButton.textContent = result.data.error;
    setTimeout(() => {
      addButton.textContent = "Add";
    }, 3000);
  }
});

// --- Filters ---

// opens/closes each library filter dropdown independently
document.querySelectorAll(".filter-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const dropdown = button.closest(".filter-dropdown");
    const optionsList = dropdown.querySelector(".filter-options");
    optionsList.hidden = !optionsList.hidden;
  });
});

// reads the checked boxes inside a filter dropdown, looking them up at call time
// so it also works for checkboxes that were rendered later (platforms, genres)
function getSelectedValues(dropdownSelector) {
  const checkboxes = document.querySelectorAll(
    `${dropdownSelector} input[type='checkbox']`,
  );

  return [...checkboxes]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

// one array per filter, in the same order getGamesList expects its arguments
function getSelectedFilters() {
  return [
    getSelectedValues(".status-filter-options"),
    getSelectedValues(".progress-filter-options"),
    getSelectedValues(".playtime-filter-options"),
    getSelectedValues(".rating-filter-options"),
    getSelectedValues(".platform-filter-options"),
    getSelectedValues(".genre-filter-options"),
  ];
}

// reload the library (back to page 1) whenever a filter checkbox changes
statusFilterOptions.addEventListener("change", () => {
  currentLibraryPage = 1;
  loadLibrary();
});

progressFilterOptions.addEventListener("change", () => {
  currentLibraryPage = 1;
  loadLibrary();
});

playtimeFilterOptions.addEventListener("change", () => {
  currentLibraryPage = 1;
  loadLibrary();
});

ratingFilterOptions.addEventListener("change", () => {
  currentLibraryPage = 1;
  loadLibrary();
});

platformFilterOptions.addEventListener("change", () => {
  currentLibraryPage = 1;
  loadLibrary();
});

genreFilterOptions.addEventListener("change", () => {
  currentLibraryPage = 1;
  loadLibrary();
});

// search by name: waits until the person stops typing before reloading,
// so each key press doesn't fire its own request
searchGamesLibraryField.addEventListener("input", () => {
  clearTimeout(librarySearchTimeout);

  librarySearchTimeout = setTimeout(() => {
    currentLibrarySearch = searchGamesLibraryField.value;

    currentLibraryPage = 1;
    loadLibrary();
  }, 400);
});

// builds the platform checkboxes from the platforms the user has actually used
function renderUserPlatforms(userPlatforms) {
  return userPlatforms
    .map(({ platform }) => {
      return `<li>
              <label>${platform} <input type="checkbox" value="${platform}"></label>
            </li>`;
    })
    .join("");
}

// builds the genre checkboxes from the genres of the games in the user's library
function renderUserGenres(userGenres) {
  return userGenres
    .map(({ genre }) => {
      return `<li>
              <label>${genre} <input type="checkbox" value="${genre}"></label>
            </li>`;
    })
    .join("");
}

// --- Library grid ---

// builds one <li> per game in the user's library; when there is nothing to show
// (empty library, or a search/filter with no match) it returns a message instead
function renderGamesList(games) {
  if (games.length === 0) {
    return `<p class="no-games-message">No games found.</p>`;
  }

  return games
    .map(
      ({
        user_games_id,
        name,
        image_url,
        platforms,
        genres,
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
                    <p>${platforms?.[0] ?? "—"}</p>
                    <p>${genres?.[0] ?? "—"}</p>
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
      ...getSelectedFilters(),
      currentLibrarySearch,
    );
    const renderedList = renderGamesList(result.data.results);
    libraryGrid.innerHTML = renderedList;
    renderLibraryPagination(result.data.count);
  });
}

// toggles the options menu ("..." button) for a specific game card
libraryGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".library-game-options-btn");
  if (!button) return;

  const card = button.closest(".library-game-info");
  const menu = card.querySelector(".library-game-options-menu");
  menu.hidden = !menu.hidden;
});

// opens the remove-confirmation modal for a specific game
libraryGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".library-remove-game-btn");
  if (!button) return;

  const card = button.closest(".library-game-info");
  gameIdToRemove = card.dataset.userGameId;
  document.querySelector(".confirm-remove-overlay").hidden = false;
});

// cancels the removal and closes the modal without deleting anything
document
  .querySelector(".confirm-remove-cancel-btn")
  .addEventListener("click", () => {
    document.querySelector(".confirm-remove-overlay").hidden = true;
    gameIdToRemove = null;
  });

// confirms the removal, deletes the game, and reloads the list on success
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

// --- Load ---

// fetches and renders the user's library, filtered by whatever checkboxes are
// currently checked and by the search text; redirects to the home page if not
// authenticated. The loading overlay and the platform/genre lists only run on
// the first load.
async function loadLibrary() {
  if (isFirstLoad) {
    showLoadingOverlay();
  }

  const { status, data } = await getGamesList(
    currentLibraryPage,
    ...getSelectedFilters(),
    currentLibrarySearch,
  );

  // not authenticated: leave before touching anything else
  if (status === 401) {
    window.location.href = "index.html";
    return;
  }

  // built once, so the checkboxes keep their state while filtering
  if (isFirstLoad) {
    const userPlatforms = await getUserPlatforms();
    platformFilterOptions.innerHTML = renderUserPlatforms(userPlatforms.data);

    const userGenres = await getUserGenres();
    genreFilterOptions.innerHTML = renderUserGenres(userGenres.data);
  }

  const renderedGamesList = renderGamesList(data.results);
  libraryGrid.innerHTML = renderedGamesList;
  renderLibraryPagination(data.count);

  isFirstLoad = false;
  hideLoadingOverlay();
}

loadLibrary();
