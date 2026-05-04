"use strict";

const maxios = document.getElementById("maxios");
const topbar = document.getElementById("maxiosTopbar");
const iconsContainer = document.getElementById("maxiosIcons");
const dock = document.getElementById("maxiosDock");
const windowLayer = document.getElementById("maxiosWindowLayer");

let topZIndex = 10;
let terminalOutput = null;

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

  terminal: {
    title: "Terminal",
    x: 360,
    y: 120,
    width: 720,
    content: `
      <div class="maxios-terminal">
        <div class="maxios-terminal-output" id="maxiosTerminalOutput"></div>
      </div>
    `
  }
};

const topbarParts = [
  `<div class="maxios-topbar-left">`,
  `<a class="maxios-brand" href="/" aria-label="Zurück zur Startseite"><span class="maxios-brand-dot"></span>MaxiOS</a>`,
  `<span>Datei</span>`,
  `<span>Bearbeiten</span>`,
  `<span>Darstellung</span>`,
  `<span>Gehe zu</span>`,
  `<span>Hilfe</span>`,
  `</div>`,
  `<div class="maxios-topbar-right">`,
  `<span aria-hidden="true">⌁</span>`,
  `<span aria-hidden="true">◐</span>`,
  `<span id="maxiosClock">--:--</span>`,
  `</div>`
];

const desktopIcons = [
  {
    type: "button",
    app: "welcome",
    icon: "🥑",
    label: "Willkommen"
  },
  {
    type: "button",
    app: "projects",
    icon: "🕹️",
    label: "Projekte"
  },
  {
    type: "button",
    app: "music",
    icon: "🎵",
    label: "Musik"
  },
  {
    type: "button",
    app: "terminal",
    icon: "⌨️",
    label: "Terminal"
  },
  {
    type: "link",
    href: "/tic-tac-toe/",
    icon: "❌",
    label: "Tic Tac Toe"
  },
  {
    type: "link",
    href: "/memory/",
    icon: "🧠",
    label: "Memory"
  }
];

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function bringToFront(windowElement) {
  topZIndex += 1;
  windowElement.style.zIndex = String(topZIndex);
}

function updateClock() {
  const clock = document.getElementById("maxiosClock");

  if (!clock) return;

  clock.textContent = new Date().toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createWindow(appKey) {
  const app = apps[appKey];

  if (!app || !windowLayer) return null;

  const existingWindow = windowLayer.querySelector(`[data-window="${appKey}"]`);

  if (existingWindow) {
    bringToFront(existingWindow);
    return existingWindow;
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

  if (appKey === "terminal") {
    terminalOutput = document.getElementById("maxiosTerminalOutput");
  }

  return windowElement;
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

async function typeTerminal(text, delay = 14) {
  if (!terminalOutput) return;

  for (const character of text) {
    const cursor = `<span class="maxios-terminal-cursor"></span>`;

    terminalOutput.innerHTML = `${terminalOutput.dataset.text || ""}${escapeHtml(character)}${cursor}`;

    terminalOutput.dataset.text = `${terminalOutput.dataset.text || ""}${character}`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    await wait(character === "\n" ? delay * 7 : delay);
  }
}

async function typeLine(text = "", delay = 14) {
  await typeTerminal(`${text}\n`, delay);
}

function attachAppTriggers(scope = document) {
  scope.querySelectorAll("[data-app]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      createWindow(trigger.dataset.app);
    });
  });
}

function createDesktopIcon(item) {
  const element = document.createElement(item.type === "link" ? "a" : "button");

  element.className = "maxios-icon";

  if (item.type === "link") {
    element.href = item.href;
  } else {
    element.type = "button";
    element.dataset.app = item.app;
  }

  element.innerHTML = `
    <span class="maxios-icon-symbol">${item.icon}</span>
    <span>${item.label}</span>
  `;

  iconsContainer.appendChild(element);
  attachAppTriggers(element);

  window.requestAnimationFrame(() => {
    element.classList.add("is-visible");
  });
}

function createDockItem(item) {
  const element = document.createElement(item.type === "link" ? "a" : "button");

  element.className = "maxios-dock-item";

  if (item.type === "link") {
    element.href = item.href;
  } else {
    element.type = "button";
    element.dataset.app = item.app;
  }

  element.textContent = item.icon;

  dock.appendChild(element);
  attachAppTriggers(element);
}

async function buildTopbar() {
  if (!topbar) return;

  await typeLine("maxi@maxios ~ % createTopbar()");
  topbar.classList.add("is-visible");

  for (const part of topbarParts) {
    topbar.insertAdjacentHTML("beforeend", part);
    updateClock();
    await typeLine(`render ${part.replaceAll("<", "&lt;").slice(0, 42)}...`, 4);
    await wait(120);
  }

  updateClock();
  window.setInterval(updateClock, 30000);
}

async function buildIcons() {
  await typeLine("");
  await typeLine("maxi@maxios ~ % createDesktopIcons()");

  for (const icon of desktopIcons) {
    createDesktopIcon(icon);
    await typeLine(`add icon: ${icon.label}`, 12);
    await wait(180);
  }
}

async function buildDock() {
  await typeLine("");
  await typeLine("maxi@maxios ~ % mountDock()");

  for (const icon of desktopIcons) {
    createDockItem(icon);
    await typeLine(`dock.add("${icon.label}")`, 10);
    await wait(110);
  }

  dock.classList.add("is-visible");
}

async function openBootedWindows() {
  await typeLine("");
  await typeLine("maxi@maxios ~ % openApps()");

  await wait(220);
  createWindow("welcome");
  await typeLine('openWindow("Willkommen")');

  await wait(260);
  createWindow("music");
  await typeLine('openWindow("Musik")');

  await wait(260);
  createWindow("projects");
  await typeLine('openWindow("Projekte")');
}

async function bootMaxios() {
  createWindow("terminal");

  await wait(260);

  await typeLine("maxi@maxios ~ % boot --live", 18);
  await typeLine("");
  await typeLine("initializing avocado kernel...");
  await typeLine("loading empty desktop...");
  await typeLine("ready.");

  await wait(300);

  await buildTopbar();
  await buildIcons();
  await buildDock();
  await openBootedWindows();

  await typeLine("");
  await typeLine("✓ MaxiOS ready.");
  await typeLine("maxi@maxios ~ % ");
}

bootMaxios();
