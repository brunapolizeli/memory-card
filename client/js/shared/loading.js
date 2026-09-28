export function renderLoadingOverlay() {
  return `<div class="loading-overlay" hidden>
          <img class="loading-dolphin" src="assets/shared/loading-dolphin.gif" alt="Loading" />
        </div>`;
}

export function showLoadingOverlay() {
  document.querySelector(".loading-overlay").hidden = false;
  document.body.inert = true;
}

export function hideLoadingOverlay() {
  document.querySelector(".loading-overlay").hidden = true;
  document.body.inert = false;
}
