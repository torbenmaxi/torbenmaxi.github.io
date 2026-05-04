"use strict";

const miniosElement = document.getElementById("minios");
const clockElement = document.getElementById("miniosClock");
const appTriggers = document.querySelectorAll("[data-app]");
const closeAppButtons = document.querySelectorAll("[data-close-app]");
const themeOptionButtons = document.querySelectorAll("[data-theme-option]");

const musicApp = document.getElementById("musicApp");
const settingsApp = document.getElementById("settingsApp");
const musicFrame = document.getElementById("musicFrame");

const musicPlaylistUrl =
  "https://embed.music.apple.com/de/playlist/seventeen/pl.u-8aAVXG9hmx2x65x";

/* Clock */

function updateClock() {
  if (!clockElement) return;

  clockElement.textContent = new Date().toLocaleTimeString("de-DE", {
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

  themeOptionButtons.forEach((button) => {
    const isActive = button.dataset.themeOption === normalizedTheme;

    button.setAttribute("aria-pressed", String(isActive));
  });

  if (musicFrame) {
    musicFrame.src = `${musicPlaylistUrl}?theme=${normalizedTheme}`;
  }
}

/* Apps */

function getAppElement(appName) {
  if (appName === "music") return musicApp;
  if (appName === "settings") return settingsApp;

  return null;
}

function openApp(appName) {
  const appElement = getAppElement(appName);

  if (!appElement) return;

  appElement.classList.add("is-open");
  appElement.setAttribute("aria-hidden", "false");
}

function closeApps() {
  [musicApp, settingsApp].forEach((appElement) => {
    if (!appElement) return;

    appElement.classList.remove("is-open");
    appElement.setAttribute("aria-hidden", "true");
  });
}

appTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openApp(trigger.dataset.app);
  });
});

closeAppButtons.forEach((button) => {
  button.addEventListener("click", closeApps);
});

themeOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyMiniOSTheme(button.dataset.themeOption);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeApps();
  }
});

/* Init */

applyMiniOSTheme(getSavedMiniOSTheme());

updateClock();
window.setInterval(updateClock, 1000);
