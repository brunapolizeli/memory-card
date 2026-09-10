[🇺🇸 English](README.md) | [🇧🇷 Português](README.pt-BR.md)

# Memory Card

A personal video game tracker built with vanilla JavaScript, Node.js, Express, and PostgreSQL.

[**Live Demo — memcard-log.vercel.app**](https://memcard-log.vercel.app/)

---

## ⚠️ Current Status

Memory Card is under **active development** and is currently being built mobile-first. Desktop breakpoints will be added once the mobile experience is complete.

For the best experience at this stage, open the project on a mobile device, use your browser's mobile emulation mode, or resize the window to ~375–425px.

---

## Project Overview

Memory Card is a solo full-stack video game tracker with custom authentication, a normalized PostgreSQL database, a REST API, and integration with the RAWG API.

The project is being developed with a Frutiger Aero (2004–2013) inspired visual identity and a mobile-first approach.

---

## Features

- Custom signup and login with bcrypt password hashing
- JWT-based sessions stored in httpOnly cookies
- Login/signup modal with field-specific validation and error messages
- Shared header and footer rendered through a reusable JavaScript module
- Mobile hamburger navigation
- **Currently Playing** carousel populated from the user's library
  - Scroll-snap navigation with pagination dots synced via IntersectionObserver
  - Up to 5 games, with a link to the full library when more are available
  - Separate states for logged-out users, empty libraries, and populated libraries
- Game search powered by the RAWG API through a backend proxy
- **Add Game** flow for adding RAWG games to a user's library
  - Existing entries in the shared `games` catalog are reused instead of duplicated
- Normalized database structure using shared `games` and `user_games` tables

---

## Planned Features

- **Library** page with filtering and sorting by status, platform, genre/tag, completion, playtime, and rating
- **Game detail** page with status, platform, playtime, rating, difficulty, completion, platinum tracking, dates, and notes
- **Profile** page with statistics and charts
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
│   └── library.html
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

The initial frontend concept was based on a Scrimba project prompt and [Figma reference](https://www.figma.com/design/hE5klIn1AEQ9XWZWmurs7y/Learning-Journal-Blog?node-id=0-1&t=5IRAjYyGX68SigMk-1). The backend, database architecture, authentication, API integration, and subsequent feature and design decisions were developed independently.

Game data and cover images are provided by the [RAWG API](https://rawg.io).

Icons used throughout the interface were generated with ChatGPT.

---

## License

Licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Free to view and evaluate; modification, redistribution, and commercial use are not permitted.
