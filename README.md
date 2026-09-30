[English](README.md) | [Português](README.pt-BR.md)

## ⚠️ Current Status

Under active development, mobile-first. Desktop is not yet supported.

For the best experience, view on a mobile device, use your browser's mobile emulation mode, or resize your window to ~375–425px.

---

# Memory Card

A personal video game tracker built with vanilla JavaScript, Node.js, Express.js, and PostgreSQL.

[**Live Demo: memcard-log.vercel.app**](https://memcard-log.vercel.app/)

---

## Project Overview

Memory Card is a full-stack video game tracker with custom authentication, a normalized PostgreSQL database, a REST API, and integration with the RAWG API.

The project is being developed with a Frutiger Aero (2004–2013) inspired visual identity and a mobile-first approach.

---

## Features

- Custom signup/login with bcrypt and JWT sessions in httpOnly cookies
- Game search and metadata via the RAWG API
- Add games to your library, with duplicate detection against a shared catalog
- Library page with combinable filters (status, platform, genre, progress, playtime, rating), debounced name search, and sortable columns
- Game details page covering progress, status, multi-platform tracking with per-platform playtime, user rating, difficulty, completion dates, and freeform notes
- Normalized PostgreSQL schema, with a database trigger keeping aggregate playtime in sync across platforms

---

## Planned Features

- Dashboard page with library-wide statistics and charts
- Profile page with account settings (avatar, email, password)
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
│   ├── dashboard.html
│   ├── game.html
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
- **Backend:** Node.js, Express.js
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
