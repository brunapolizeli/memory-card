import { getCurrentUser, logOut } from "../api.js";

export function renderHeader() {
  return `<header>
        <h1>Memory Card</h1>
        <div class="header-components">
          <p class="welcome-message" hidden>Welcome, <span class="username-display"></span>!</p>
          <button type="button" class="login-btn">Login</button>
          <button type="button" class="logout-btn" hidden>Logout</button>
          <nav>
            <input type="checkbox" id="menu-toggle" />
            <label for="menu-toggle" class="hamburger">
              <span class="line"></span>
              <span class="line"></span>
              <span class="line"></span>
            </label>
            <ul class="menu">
              <li><a href="index.html">Home</a></li>
              <li><a href="#">Profile</a></li>
              <li><a href="library.html">Library</a></li>
            </ul>
          </nav>
        </div>
      </header>`;
}

export function initHeaderListeners() {
  const logoutBtn = document.querySelector(".logout-btn");

  logoutBtn.addEventListener("click", async () => {
    const result = await logOut();

    if (result.ok) {
      window.location.href = "index.html";
    }
  });
}

export async function updateHeaderAuthState() {
  const { ok, data } = await getCurrentUser();

  const loginBtn = document.querySelector(".login-btn");
  const logoutBtn = document.querySelector(".logout-btn");
  const welcomeMessage = document.querySelector(".welcome-message");
  const usernameDisplay = document.querySelector(".username-display");

  if (ok) {
    loginBtn.hidden = true;
    logoutBtn.hidden = false;
    welcomeMessage.hidden = false;
    usernameDisplay.textContent = data.username;
  } else {
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    welcomeMessage.hidden = true;
  }
}

export function renderFooter() {
  return `<footer>Games data via <a href="https://rawg.io">RAWG API.</a></footer>`;
}
