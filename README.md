[🇺🇸 English](README.md) | [🇧🇷 Português](README.pt-BR.md)

## ⚠️ Current Status

Under active development, mobile-first. Desktop is not yet supported.

For the best experience, view on a mobile device, use your browser's mobile emulation mode, or resize your window to ~375–425px.

---

# Memory Card

A personal video game tracker built with vanilla JavaScript, Node.js, Express, and PostgreSQL.

[**Live Demo: memcard-log.vercel.app**](https://memcard-log.vercel.app/)

---

## Project Overview

Memory Card is a full-stack video game tracker with custom authentication, a normalized PostgreSQL database, a REST API, and integration with the RAWG API.

The project is being developed with a Frutiger Aero (2004–2013) inspired visual identity and a mobile-first approach.

---

## Features

- Custom signup and login with bcrypt password hashing
- JWT-based sessions stored in httpOnly cookies
- Login/signup modal with field-specific validation and error messages
- Shared header and footer rendered through a reusable JavaScript module, with live login/logout state
- Mobile hamburger navigation
- **Currently Playing** carousel populated from the user's library
  - Scroll-snap navigation with pagination dots synced via IntersectionObserver
  - Up to 5 games, with a link to the full library when more are available
  - Separate states for logged-out users, empty libraries, and populated libraries
- Game search powered by the RAWG API through a backend proxy
- **Add Game** flow for adding RAWG games to a user's library
  - Existing entries in the shared `games` catalog are reused instead of duplicated
- **Library** page with:
  - Paginated grid of the user's games
  - Game removal with a confirmation modal
  - Navigation to a game's details page
- **Game details** page with:
  - Progress tracking (not started / started / completed / platinum)
  - Status selection across 7 states (Wishlist, Backlog, Playing, On Hold, Finished, Replaying, Dropped)
  - Platform selection via a searchable list sourced from the RAWG platforms API
  - Editable hours and minutes played, with input sanitization
  - User rating on a 6-star scale, with a dynamic, color-coded label
- Normalized database structure using shared `games` and `user_games` tables

---

## Planned Features

- Library filtering and sorting by status, platform, genre/tag, completion, playtime, and rating
- Difficulty rating, completion/platinum dates, and notes on the game details page
- Profile page with statistics and charts
- Desktop responsive layout

---

## Project Structure

```text
memory-card/
├── client/
│   ├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── render/
│   │   ├── shared/
│   │   ├── api.js
│   │   ├── config.js
│   │   └── main.js
│   ├── index.html
│   ├── library.html
│   └── game.html
├── server/
│   ├── db/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   ├── package.json
│   └── server.js
├── README.md
└── README.pt-BR.md
```

---

## Technologies

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js, Express
- **Database:** PostgreSQL hosted on [Neon](https://neon.tech)
- **Migrations:** `node-pg-migrate`
- **Authentication:** bcrypt, JSON Web Tokens, httpOnly cookies
- **External API:** [RAWG Video Games Database API](https://rawg.io/apidocs)
- **Deployment:** Vercel

---

## Credits

The project is being built from scratch based on a Scrimba project prompt and [Figma reference](https://www.figma.com/design/hE5klIn1AEQ9XWZWmurs7y/Learning-Journal-Blog?node-id=0-1&t=5IRAjYyGX68SigMk-1), which provided the initial frontend concept and layout reference. The backend, database architecture, authentication, API integration, and subsequent feature and design decisions were developed beyond the original Scrimba brief.

Game data and cover images are provided by the [RAWG API](https://rawg.io).

Icons used throughout the interface were generated with ChatGPT.

---

## License

Licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Free to view and evaluate; modification, redistribution, and commercial use are not permitted.
