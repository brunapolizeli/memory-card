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

// hero carousel
getCurrentlyPlaying().then((games) => {
  const renderedGamesList = games
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

  currentlyPlaying.innerHTML = renderedGamesList;

  const gameItems = document.querySelectorAll(".game-info");

  const gamesListDots = games
    .map((_, index) => {
      return `<span class="games-list-dot" data-index="${index}"></span>`;
    })
    .join("");

  dotsContainer.innerHTML = gamesListDots;

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

  dotsContainer.addEventListener("click", (event) => {
    const clickedIndex = event.target.dataset.index;
    const targetLi = document.querySelector(
      `.game-info[data-index="${clickedIndex}"]`,
    );

    targetLi.scrollIntoView({ behavior: "smooth", inline: "center" });
  });
});

loginBtn.addEventListener("click", () => {
  modalOverlay.classList.add("visible");
  authModal.classList.add("visible");
  document.querySelector(".home-content").inert = true;
});

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

closeAuthBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("visible");
  document.querySelector(".home-content").inert = false;
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = loginEmail.value;
  const password = loginPassword.value;

  const result = await login(email, password);
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  emailError.hidden = true;
  usernameError.hidden = true;

  const username = signupUsername.value;
  const email = signupEmail.value;
  const password = signupPassword.value;

  const result = await signup(username, email, password);

  if (result.data.error.includes("Email")) {
    emailError.textContent = result.data.error;
    emailError.hidden = false;
  } else if (result.data.error.includes("Username")) {
    usernameError.textContent = result.data.error;
    usernameError.hidden = false;
  }
});
