export function renderHeader() {
  return `<header>
        <h1>Memory Card</h1>
        <div class="header-components">
          <button type="button" class="login-btn">Login</button>
          <nav>
            <input type="checkbox" id="menu-toggle" />
            <label for="menu-toggle" class="hamburger">
              <span class="line"></span>
              <span class="line"></span>
              <span class="line"></span>
            </label>
            <ul class="menu">
              <li><a href="#">Home</a></li>
              <li><a href="#">Profile</a></li>
              <li><a href="#">My Library</a></li>
            </ul>
          </nav>
        </div>
      </header>`;
}

export function renderFooter() {
  return `<footer>Games data via <a href="https://rawg.io">RAWG API.</a></footer>`;
}
