"use strict";

const clockElement = document.getElementById("maxiosClock");
const maxiosElement = document.getElementById("maxios");
const appearanceMenuButton = document.getElementById("appearanceMenuButton");
const appearanceMenu = document.getElementById("appearanceMenu");
const themeOptionButtons = document.querySelectorAll("[data-theme-option]");

/* Clock */

function updateClock() {
  if (!clockElement) return;

  const now = new Date();

  const weekday = now.toLocaleDateString("de-DE", {
    weekday: "short"
  });

  const date = now.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short"
  });

  const time = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  clockElement.textContent = `${weekday} ${date} ${time}`;
}

/* Theme */

function getSavedMaxiosTheme() {
  return localStorage.getItem("maxiosTheme") || localStorage.getItem("theme") || "dark";
}

function applyMaxiosTheme(theme) {
  if (!maxiosElement) return;

  const normalizedTheme = theme === "light" ? "light" : "dark";
  const isLight = normalizedTheme === "light";

  maxiosElement.classList.toggle("theme-light", isLight);
  document.documentElement.classList.toggle("maxios-light", isLight);

  localStorage.setItem("maxiosTheme", normalizedTheme);

  themeOptionButtons.forEach((button) => {
    const isActive = button.dataset.themeOption === normalizedTheme;

    button.setAttribute("aria-pressed", String(isActive));
  });
}

/* Appearance menu */

function openAppearanceMenu() {
  const menu = appearanceMenuButton?.parentElement;

  if (!menu || !appearanceMenuButton || !appearanceMenu) return;

  menu.classList.add("is-open");
  appearanceMenuButton.setAttribute("aria-expanded", "true");
  appearanceMenu.setAttribute("aria-hidden", "false");
}

function closeAppearanceMenu() {
  const menu = appearanceMenuButton?.parentElement;

  if (!menu || !appearanceMenuButton || !appearanceMenu) return;

  menu.classList.remove("is-open");
  appearanceMenuButton.setAttribute("aria-expanded", "false");
  appearanceMenu.setAttribute("aria-hidden", "true");
}

function toggleAppearanceMenu() {
  const menu = appearanceMenuButton?.parentElement;

  if (!menu?.classList.contains("is-open")) {
    openAppearanceMenu();
    return;
  }

  closeAppearanceMenu();
}

appearanceMenuButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleAppearanceMenu();
});

themeOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyMaxiosTheme(button.dataset.themeOption);
    closeAppearanceMenu();
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".maxios-menu")) {
    closeAppearanceMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAppearanceMenu();
  }
});

/* Init */

applyMaxiosTheme(getSavedMaxiosTheme());

updateClock();
window.setInterval(updateClock, 1000);
