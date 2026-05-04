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

const homeIconButtons = document.querySelectorAll("[data-home-icon]");

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

homeIconButtons.forEach((icon) => {
  restoreHomeIconPosition(icon);
  makeHomeIconDraggable(icon);
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

function getHomeIconStorageKey(icon) {
  return `miniosIconPosition:${icon.dataset.app}`;
}

function restoreHomeIconPosition(icon) {
  const savedPosition = localStorage.getItem(getHomeIconStorageKey(icon));

  if (!savedPosition) return;

  try {
    const { left, top } = JSON.parse(savedPosition);

    if (Number.isFinite(left) && Number.isFinite(top)) {
      icon.style.left = `${left}px`;
      icon.style.top = `${top}px`;
      icon.style.setProperty("--icon-x", `${left}px`);
      icon.style.setProperty("--icon-y", `${top}px`);
    }
  } catch {
    localStorage.removeItem(getHomeIconStorageKey(icon));
  }
}

function saveHomeIconPosition(icon, left, top) {
  localStorage.setItem(
    getHomeIconStorageKey(icon),
    JSON.stringify({
      left,
      top
    })
  );
}

function makeHomeIconDraggable(icon) {
  const holdDelay = 220;
  const gridSizeX = 86;
  const gridSizeY = 108;
  const gridOffsetX = 22;
  const gridOffsetY = 42;

  let isDragging = false;
  let didDrag = false;
  let holdTimer = null;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  function getPosition() {
    const computedStyle = window.getComputedStyle(icon);

    return {
      left: parseFloat(computedStyle.left) || 0,
      top: parseFloat(computedStyle.top) || 0
    };
  }

  function snapToGrid(value, gridSize, offset) {
    return Math.round((value - offset) / gridSize) * gridSize + offset;
  }

  function clampPosition(left, top) {
    const grid = icon.closest(".minios-app-grid");
    const gridRect = grid.getBoundingClientRect();

    const maxLeft = gridRect.width - icon.offsetWidth;
    const maxTop = gridRect.height - icon.offsetHeight;

    return {
      left: Math.max(0, Math.min(left, maxLeft)),
      top: Math.max(0, Math.min(top, maxTop))
    };
  }

  icon.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    const position = getPosition();

    startX = event.clientX;
    startY = event.clientY;
    initialLeft = position.left;
    initialTop = position.top;
    didDrag = false;

    holdTimer = window.setTimeout(() => {
      isDragging = true;
      icon.classList.add("is-dragging");
      icon.setPointerCapture(event.pointerId);
    }, holdDelay);
  });

  icon.addEventListener("pointermove", (event) => {
    const distanceX = event.clientX - startX;
    const distanceY = event.clientY - startY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance > 6) {
      didDrag = true;
    }

    if (!isDragging) return;

    const nextPosition = clampPosition(
      initialLeft + distanceX,
      initialTop + distanceY
    );

    icon.style.left = `${nextPosition.left}px`;
    icon.style.top = `${nextPosition.top}px`;
  });

  icon.addEventListener("pointerup", (event) => {
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }

    if (!isDragging) {
      if (!didDrag) {
        openApp(icon.dataset.app);
      }

      return;
    }

    const currentPosition = getPosition();

    const snappedPosition = clampPosition(
      snapToGrid(currentPosition.left, gridSizeX, gridOffsetX),
      snapToGrid(currentPosition.top, gridSizeY, gridOffsetY)
    );

    icon.style.left = `${snappedPosition.left}px`;
    icon.style.top = `${snappedPosition.top}px`;
    icon.style.setProperty("--icon-x", `${snappedPosition.left}px`);
    icon.style.setProperty("--icon-y", `${snappedPosition.top}px`);

    saveHomeIconPosition(icon, snappedPosition.left, snappedPosition.top);

    icon.classList.remove("is-dragging");
    isDragging = false;

    icon.releasePointerCapture(event.pointerId);
  });

  icon.addEventListener("pointercancel", () => {
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }

    icon.classList.remove("is-dragging");
    isDragging = false;
  });
}

/* Init */

applyMiniOSTheme(getSavedMiniOSTheme());

updateClock();
window.setInterval(updateClock, 1000);
