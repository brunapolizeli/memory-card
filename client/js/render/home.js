import { login, signup } from "../api.js";
import { updateHeaderAuthState } from "../shared/layout.js";

// --- DOM references ---
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
  updateHeaderAuthState();
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
  updateHeaderAuthState();
});

signupForm.addEventListener("input", () => {
  emailError.hidden = true;
  usernameError.hidden = true;
  signupError.hidden = true;
});
