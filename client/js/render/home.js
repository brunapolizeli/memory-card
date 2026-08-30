import { fakeGamesArr } from "../fake-games.js";

const currentlyPlaying = document.querySelector(".currently-playing");
const dotsContainer = document.querySelector(".dots-container");

const renderedGamesList = fakeGamesArr
  .map(
    (
      {
        title,
        image_url,
        genres,
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
                    <h3 class="game-title">${title}</h3>
                    <div class="game-details-one">
                        <p>${platform}</p>
                        <p>${genres[0]}</p>
                    </div>
                    <div class="game-details-two">
                        <p>${hours_played}</p>
                        <p>${user_rating ?? rawg_rating ?? "Sem nota"}</p>
                    </div>
                </div>
            </li>`;
    },
  )
  .join("");

currentlyPlaying.innerHTML = renderedGamesList;

const gameItems = document.querySelectorAll(".game-info");

const gamesListDots = fakeGamesArr
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
