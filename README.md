# Memory Card

A personal video game tracker, with a Frutiger Aero (2004-2013) visual identity planned once core functionality is complete.

---

## ⚠️ Current Status

This project is being built mobile-first and is still under **active development**; not all features are implemented yet, and only a handful are described below. New commits are added regularly, so check back to see progress. Desktop breakpoints will be added only after the full mobile experience is complete.

To preview progress correctly, use your browser's mobile emulation mode (DevTools → Toggle device toolbar) or resize the window to a narrow width (~375-425px).

---

## Project Overview

Memory Card is a personal video game tracker, built solo, from the ground up, as part of the Scrimba Full Stack Path.

The mobile-first frontend layout is based on Scrimba's own [Learning Journal Blog Figma design](https://www.figma.com/design/hE5klIn1AEQ9XWZWmurs7y/Learning-Journal-Blog?node-id=0-1&t=5IRAjYyGX68SigMk-1), used as a starting reference. From there, the theme was swapped from a learning journal to a game tracker, and a Frutiger Aero (2004-2013) visual identity is planned to replace Scrimba's original style once the core functionality is complete. A backend is also being built from scratch on top of the frontend brief Scrimba provides: custom authentication, a normalized PostgreSQL schema, and a REST API, paired with a vanilla JS frontend with no framework.

---

## Features (implemented so far)

- Custom authentication (signup & login) with bcrypt password hashing
- JWT-based sessions stored in httpOnly cookies
- Login/signup modal with toggling forms and field-specific error messages (email vs. username conflicts, missing fields, invalid credentials)
- Shared header and footer, dynamically rendered and reused across pages via a JS module
- Mobile hamburger navigation menu
- "Currently Playing" carousel on the Home page, pulling live data from the user's library
  - Scroll-snap carousel with clickable pagination dots synced via IntersectionObserver
  - Capped at 5 games, with a linked card to the full library when there are more
  - Distinct states for logged-out, empty library, and populated library
- Game search powered by the RAWG API, proxied through the backend to keep the API key private
- Normalized database schema: a shared `games` catalog table plus a `user_games` join table, avoiding duplicate game data across users

---

## Planned Features

- **My Library page**: full grid of the user's games, with multi-select filters (status, platform, genre/tag, completion, playtime, rating) and sorting options
- **Add Game flow**: search RAWG and add a game to the library, reusing an existing catalog entry when one already exists instead of duplicating it
- **Game detail page**: status, platform, hours played, rating, a water-drop difficulty scale, completion and platinum tracking (each with optional date and notes)
- **Profile page**: stats dashboard, including a donut chart of hours by platform
- Desktop breakpoints, added once the full mobile experience is complete
- **V1**: Steam API integration for automatic library and playtime import
- **V2**: social features (public profiles, following, comments)

---

## Project Structure

```
memory-card/
├── client/
│   ├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── shared/
│   │   │   └── layout.js
│   │   ├── render/
│   │   │   └── home.js
│   │   ├── api.js
│   │   └── config.js
│   ├── index.html
│   └── library.html
├── server/
│   ├── db/
│   │   └── pool.js
│   ├── middleware/
│   │   └── authenticate.js
│   ├── migrations/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── games.js
│   │   └── library.js
│   ├── server.js
│   └── package.json
└── README.md
```

---

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Grid, Flexbox, scroll-snap)
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech)), via `node-pg-migrate` for schema migrations
- **Auth**: bcrypt for password hashing, JSON Web Tokens for sessions
- **External API**: [RAWG Video Games Database API](https://rawg.io/apidocs)
- **Deployment**: Vercel (frontend as a static site, backend as Serverless Functions)

---

## Credits

Game data and cover images provided by the [RAWG API](https://rawg.io).

---

## License

This project is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Free to use, share, and adapt for non-commercial purposes, with attribution.
