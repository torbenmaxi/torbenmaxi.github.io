"use strict";

const miniosElement = document.getElementById("minios");
const clockElement = document.getElementById("miniosClock");
const appTriggers = document.querySelectorAll("[data-app]");
const musicApp = document.getElementById("musicApp");
const musicAppClose = document.getElementById("musicAppClose");
const musicHomeIndicator = document.getElementById("musicHomeIndicator");
const themeToggle = document.getElementById("themeToggle");
const musicFrame = document.getElementById("musicFrame");

const musicPlaylistUrl =
  "https://embed.music.apple.com/de/playlist/seventeen/pl.u-8aAVXG9hmx2x65x";

/* Clock */

function updateClock() {
  if (!clockElement) return;

  const now = new Date();

  clockElement.textContent = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* Theme */

function getSavedMiniOSTheme() {
  return localStorage.getItem("miniosTheme") || localStorage.getItem("maxiosTheme") || "dark";
}

function applyMiniOSTheme(theme) {
  if (!miniosElement) return;

  const normalizedTheme = theme === "light" ? "light" : "dark";
  const isLight = normalizedTheme === "light";

  miniosElement.classList.toggle("theme-light", isLight);
  document.documentElement.classList.toggle("minios-light", isLight);

  localStorage.setItem("miniosTheme", normalizedTheme);

  if (musicFrame) {
    musicFrame.src = `${musicPlaylistUrl}?theme=${normalizedTheme}`;
  }
}

function toggleMiniOSTheme() {
  const currentTheme = getSavedMiniOSTheme();
  const nextTheme = currentTheme === "light" ? "dark" : "light";

  applyMiniOSTheme(nextTheme);
}

/* Apps */

function openMusicApp() {
  if (!musicApp) return;

  musicApp.classList.add("is-open");
  musicApp.setAttribute("aria-hidden", "false");
}

function closeMusicApp() {
  if (!musicApp) return;

  musicApp.classList.remove("is-open");
  musicApp.setAttribute("aria-hidden", "true");
}

appTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (trigger.dataset.app === "music") {
      openMusicApp();
    }
  });
});

musicAppClose?.addEventListener("click", closeMusicApp);
musicHomeIndicator?.addEventListener("click", closeMusicApp);
themeToggle?.addEventListener("click", toggleMiniOSTheme);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMusicApp();
  }
});

/* Init */

applyMiniOSTheme(getSavedMiniOSTheme());

updateClock();
window.setInterval(updateClock, 1000);
