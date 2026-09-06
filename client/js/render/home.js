import { getCurrentlyPlaying, login, signup } from "../api.js";

const currentlyPlaying = document.querySelector(".currently-playing");
const dotsContainer = document.querySelector(".dots-container");
const loginBtn = document.querySelector(".login-btn");
const authModal = document.querySelector(".auth-modal");
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const toggleBtn = document.querySelectorAll(".toggle-btn");
const modalOverlay = document.querySelector(".modal-overlay");
const closeAuthBtn = document.querySelector(".close-auth-btn");
const loginEmail = document.querySelector('[name="login-email"]');
const loginPassword = document.querySelector('[name="login-password"]');
const signupUsername = document.querySelector('[name="signup-username"]');
const signupEmail = document.querySelector('[name="signup-email"]');
const signupPassword = document.querySelector('[name="signup-password"]');
const loginError = document.querySelector(".login-error");
const usernameError = document.querySelector(".username-error");
const emailError = document.querySelector(".email-error");
const signupError = document.querySelector(".signup-error");

// hero carousel
async function renderCurrentlyPlaying() {
  const { ok, data } = await getCurrentlyPlaying();

  // not logged in: show the illustration instead of the carousel
  if (!ok) {
    currentlyPlaying.innerHTML = `<img src="assets/logged-out.png" alt="Please log in to see your currently playing games" class="logged-out-illustration">`;
    return;
  }

  const games = data;

  // logged in, but nothing in progress yet
  if (games.length === 0) {
    currentlyPlaying.innerHTML = `<p class="no-games-message">No games in progress. Add one for it to show here!</p>`;
    return;
  }

  // only show up to 5 games in the carousel, even if there are more
  const games_slice = games.slice(0, 5);

  // builds one <li> per displayed game
  const renderedGamesList = games_slice
    .map(
      (
        {
          name,
          image_url,
          tags,
          platform,
          hours_played,
          user_rating,
          rawg_rating,
        },
        index,
      ) => {
        return `<li class="game-info" data-index="${index}">
                <img class="game-cover" src="${image_url}">
                <div class="game-details">
                    <h3 class="game-title">${name}</h3>
                    <div class="game-details-one">
                        <p>${platform}</p>
                        <p>${tags?.[0] ?? ""}</p>
                    </div>
                    <div class="game-details-two">
                        <p>${hours_played}</p>
                        <p>${user_rating ?? rawg_rating ?? "No rating"}</p>
                    </div>
                </div>
            </li>`;
      },
    )
    .join("");

  // if there are more than 5 games, adds a 6th card linking to the full library
  const seeAllGamesItem =
    games.length > 5 ? `<li class="see-all-games-item"></li>` : "";

  currentlyPlaying.innerHTML = renderedGamesList + seeAllGamesItem;

  const gameItems = document.querySelectorAll(".game-info");

  // one dot per displayed game, plus an extra dot if the "see all" card exists
  const gamesListDots = games_slice
    .map((_, index) => {
      return `<span class="games-list-dot" data-index="${index}"></span>`;
    })
    .join("");

  const extraDot =
    games.length > 5
      ? `<span class="games-list-dot" data-index="5"></span>`
      : "";

  dotsContainer.innerHTML = gamesListDots + extraDot;

  // tracks which game is currently centered in view and highlights its dot
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeIndex = entry.target.dataset.index;

        document.querySelectorAll(".games-list-dot").forEach((dot) => {
          dot.classList.remove("active");
        });

        document
          .querySelector(`.games-list-dot[data-index="${activeIndex}"]`)
          .classList.add("active");
      }
    });
  });

  gameItems.forEach((li) => {
    observer.observe(li);
  });

  // clicking a dot scrolls the carousel to the matching game
  dotsContainer.addEventListener("click", (event) => {
    const clickedIndex = event.target.dataset.index;
    const targetLi = document.querySelector(
      `.game-info[data-index="${clickedIndex}"]`,
    );

    targetLi.scrollIntoView({ behavior: "smooth", inline: "center" });
  });
}

renderCurrentlyPlaying();

// opens the auth modal and blocks interaction with the rest of the page
loginBtn.addEventListener("click", () => {
  modalOverlay.classList.add("visible");
  authModal.classList.add("visible");
  document.querySelector(".home-content").inert = true;
});

// switches between the login and signup forms
toggleBtn.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (event.target.dataset.target === "login") {
      signupForm.hidden = true;
      loginForm.hidden = false;
    } else {
      loginForm.hidden = true;
      signupForm.hidden = false;
    }
  });
});

// closes the modal and re-enables the rest of the page
closeAuthBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("visible");
  document.querySelector(".home-content").inert = false;
});

// handles login form submission and error treatment
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.hidden = true;

  const email = loginEmail.value;
  const password = loginPassword.value;

  const result = await login(email, password);

  if (!result.ok) {
    loginError.textContent = result.data.error;
    loginError.hidden = false;
    return;
  }

  modalOverlay.classList.remove("visible");
  authModal.classList.remove("visible");
  document.querySelector(".home-content").inert = false;
  renderCurrentlyPlaying();
});

loginForm.addEventListener("input", () => {
  loginError.hidden = true;
});

// handles signup form submission and error treatment
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  emailError.hidden = true;
  usernameError.hidden = true;
  signupError.hidden = true;

  const username = signupUsername.value;
  const email = signupEmail.value;
  const password = signupPassword.value;

  const result = await signup(username, email, password);

  if (!result.ok) {
    if (result.data.error.includes("Email")) {
      emailError.textContent = result.data.error;
      emailError.hidden = false;
    } else if (result.data.error.includes("Username")) {
      usernameError.textContent = result.data.error;
      usernameError.hidden = false;
    } else if (result.data.error.includes("Missing")) {
      signupError.textContent = result.data.error;
      signupError.hidden = false;
    }
    return;
  }

  modalOverlay.classList.remove("visible");
  authModal.classList.remove("visible");
  document.querySelector(".home-content").inert = false;

  await login(email, password);
  renderCurrentlyPlaying();
});

signupForm.addEventListener("input", () => {
  emailError.hidden = true;
  usernameError.hidden = true;
  signupError.hidden = true;
});
