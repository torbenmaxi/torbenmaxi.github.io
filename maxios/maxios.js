"use strict";

const clockElement = document.getElementById("maxiosClock");
const windowLayer = document.getElementById("maxiosWindowLayer");
const maxiosElement = document.getElementById("maxios");
const appearanceMenuButton = document.getElementById("appearanceMenuButton");
const appearanceMenu = document.getElementById("appearanceMenu");
const themeOptionButtons = document.querySelectorAll("[data-theme-option]");

let topZIndex = 10;

const apps = {
  welcome: {
    title: "Willkommen",
    x: 170,
    y: 68,
    width: 560,
    content: `
      <h2>Willkommen bei MaxiOS.</h2>
      <p>Ein kleiner Ort im Internet.</p>

      <div class="maxios-app-grid">
        <a class="maxios-app-card" href="/tic-tac-toe/">
          <span>Projekt 01</span>
          <h3>Tic Tac Toe</h3>
          <p>Zwei Spieler, neun Felder, ein Gewinner.</p>
        </a>

        <a class="maxios-app-card" href="/memory/">
          <span>Projekt 02</span>
          <h3>Memory</h3>
          <p>Finde alle Paare.</p>
        </a>
      </div>
    `
  },

  projects: {
    title: "Projekte",
    x: 220,
    y: 130,
    width: 560,
    content: `
      <h2>Projekte</h2>
      <p>Öffne deine kleinen Webprojekte direkt aus MaxiOS.</p>

      <div class="maxios-app-grid">
        <a class="maxios-app-card" href="/tic-tac-toe/">
          <span>01</span>
          <h3>Tic Tac Toe</h3>
          <p>Zwei Spieler, neun Felder, ein Gewinner.</p>
        </a>

        <a class="maxios-app-card" href="/memory/">
          <span>02</span>
          <h3>Memory</h3>
          <p>Finde alle Paare.</p>
        </a>
      </div>
    `
  },

  music: {
    title: "Musik",
    x: 760,
    y: 84,
    width: 620,
    content: `
      <h2>Musik</h2>
      <p>Eine Playlist für nebenbei.</p>

      <iframe
        class="maxios-music-frame"
        allow="autoplay *; encrypted-media *;"
        title="Apple Music Playlist Seventeen"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        src="https://embed.music.apple.com/de/playlist/seventeen/pl.u-8aAVXG9hmx2x65x?theme=dark"
      ></iframe>
    `
  },

  stats: {
    title: "Stats",
    x: 390,
    y: 430,
    width: 430,
    content: `
      <h2>Stats</h2>
      <p>Ein paar kleine Zahlen.</p>

      <div class="maxios-stats-list">
        <div class="maxios-stats-row">
          <span>Website</span>
          <strong>Maxi by Torben</strong>
        </div>

        <div class="maxios-stats-row">
          <span>Projekte</span>
          <strong>2</strong>
        </div>

        <div class="maxios-stats-row">
          <span>Avocado-Energie</span>
          <strong>stabil</strong>
        </div>

        <div class="maxios-stats-row">
          <span>Chaos-Level</span>
          <strong>73%</strong>
        </div>
      </div>
    `
  },

  terminal: {
    title: "Terminal",
    x: 900,
    y: 470,
    width: 520,
    content: `
      <div class="maxios-terminal">
        <p>maxi@maxios ~ % help</p>
        <br>
        <p>help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— zeigt diese Hilfe an</p>
        <p>projects&nbsp;— öffnet die Projekte</p>
        <p>music&nbsp;&nbsp;&nbsp;&nbsp;— öffnet die Musik</p>
        <p>stats&nbsp;&nbsp;&nbsp;&nbsp;— öffnet die Statistiken</p>
        <p>about&nbsp;&nbsp;&nbsp;&nbsp;— über MaxiOS</p>
        <br>
        <p>maxi@maxios ~ % ▌</p>
      </div>
    `
  }
};

function updateClock() {
  if (!clockElement) return;

  const now = new Date();

  const date = now.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

  const time = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  clockElement.textContent = `${date} ${time}`;
}

function getSavedMaxiosTheme() {
  return localStorage.getItem("maxiosTheme") || localStorage.getItem("theme") || "dark";
}

function applyMaxiosTheme(theme) {
  if (!maxiosElement) return;

  const isLight = theme === "light";

  maxiosElement.classList.toggle("theme-light", isLight);
  localStorage.setItem("maxiosTheme", isLight ? "light" : "dark");

  themeOptionButtons.forEach((button) => {
    const isActive = button.dataset.themeOption === (isLight ? "light" : "dark");

    button.setAttribute("aria-pressed", String(isActive));
  });
}

function closeAppearanceMenu() {
  appearanceMenuButton?.parentElement?.classList.remove("is-open");
  appearanceMenu?.setAttribute("aria-hidden", "true");
}

function bringToFront(windowElement) {
  topZIndex += 1;
  windowElement.style.zIndex = String(topZIndex);
}

function createWindow(appKey) {
  const app = apps[appKey];

  if (!app || !windowLayer) return;

  const existingWindow = windowLayer.querySelector(`[data-window="${appKey}"]`);

  if (existingWindow) {
    bringToFront(existingWindow);
    return;
  }

  const windowElement = document.createElement("article");

  windowElement.className = "maxios-window";
  windowElement.dataset.window = appKey;
  windowElement.style.left = `${app.x}px`;
  windowElement.style.top = `${app.y}px`;
  windowElement.style.width = `${app.width}px`;

  windowElement.innerHTML = `
    <div class="maxios-window-bar">
      <div class="maxios-window-controls">
        <button class="maxios-window-control maxios-window-close" type="button" aria-label="Fenster schließen"></button>
        <button class="maxios-window-control maxios-window-minimize" type="button" aria-label="Fenster minimieren"></button>
        <button class="maxios-window-control maxios-window-zoom" type="button" aria-label="Fenster maximieren"></button>
      </div>

      <strong class="maxios-window-title">${app.title}</strong>
      <span></span>
    </div>

    <div class="maxios-window-content">
      ${app.content}
    </div>
  `;

  windowLayer.appendChild(windowElement);
  bringToFront(windowElement);
  makeWindowDraggable(windowElement);

  windowElement.querySelector(".maxios-window-close")?.addEventListener("click", () => {
    windowElement.remove();
  });

  windowElement.addEventListener("pointerdown", () => {
    bringToFront(windowElement);
  });
}

function makeWindowDraggable(windowElement) {
  const dragHandle = windowElement.querySelector(".maxios-window-bar");

  if (!dragHandle) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  dragHandle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;

    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    initialLeft = windowElement.offsetLeft;
    initialTop = windowElement.offsetTop;

    bringToFront(windowElement);
    dragHandle.setPointerCapture(event.pointerId);
  });

  dragHandle.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const nextLeft = initialLeft + event.clientX - startX;
    const nextTop = initialTop + event.clientY - startY;
    const maxLeft = window.innerWidth - windowElement.offsetWidth - 12;
    const maxTop = window.innerHeight - windowElement.offsetHeight - 110;

    windowElement.style.left = `${Math.max(12, Math.min(nextLeft, maxLeft))}px`;
    windowElement.style.top = `${Math.max(12, Math.min(nextTop, maxTop))}px`;
  });

  dragHandle.addEventListener("pointerup", (event) => {
    isDragging = false;
    dragHandle.releasePointerCapture(event.pointerId);
  });
}

appTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    createWindow(trigger.dataset.app);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const topWindow = Array.from(document.querySelectorAll(".maxios-window"))
    .sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))[0];

  topWindow?.remove();
});

applyMaxiosTheme(getSavedMaxiosTheme());

appearanceMenuButton?.addEventListener("click", (event) => {
  event.stopPropagation();

  const menu = appearanceMenuButton.parentElement;
  const isOpen = menu?.classList.toggle("is-open");

  appearanceMenu?.setAttribute("aria-hidden", String(!isOpen));
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

updateClock();
window.setInterval(updateClock, 1000);
