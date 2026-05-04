"use strict";

const bootCode = document.getElementById("bootCode");
const bootPreview = document.getElementById("bootPreview");
const bootStatus = document.getElementById("bootStatus");
const bootFileName = document.getElementById("bootFileName");

const typingSpeed = 2;

const maxiosCss = `
.maxios {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: #f4f1ea;
  background:
    radial-gradient(circle at 20% 10%, rgba(81, 147, 161, 0.42), transparent 28%),
    radial-gradient(circle at 78% 22%, rgba(111, 83, 126, 0.36), transparent 30%),
    linear-gradient(180deg, #0a1d2a 0%, #071018 48%, #020508 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.maxios::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent 52%),
    radial-gradient(circle at 50% 115%, rgba(255, 255, 255, 0.1), transparent 44%);
}

.maxios-topbar {
  position: absolute;
  inset: 0 0 auto;
  z-index: 20;
  height: 38px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(3, 8, 12, 0.72);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  font-size: 14px;
  font-weight: 650;
}

.maxios-topbar-left,
.maxios-topbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.maxios-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: inherit;
  text-decoration: none;
  font-weight: 800;
}

.maxios-brand-dot {
  width: 14px;
  height: 14px;
  display: inline-block;
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 35%, #e8f3a7 0 28%, transparent 29%),
    linear-gradient(135deg, #b8df7a, #4d8f64);
  box-shadow: 0 0 18px rgba(184, 223, 122, 0.42);
}

.maxios-desktop {
  position: absolute;
  inset: 38px 0 0;
  padding: 32px 24px 112px;
}

.maxios-icons {
  position: relative;
  z-index: 3;
  width: 96px;
  display: grid;
  gap: 22px;
}

.maxios-icon {
  width: 88px;
  min-height: 86px;
  padding: 0;
  display: grid;
  justify-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font: inherit;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
}

.maxios-icon-symbol {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 14px 35px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(16px);
  font-size: 30px;
  transition: transform 0.18s ease;
}

.maxios-icon:hover .maxios-icon-symbol,
.maxios-dock-item:hover {
  transform: translateY(-3px) scale(1.04);
}

.maxios-icon span:last-child {
  font-size: 13px;
  font-weight: 650;
}

.maxios-window-layer {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
}

.maxios-window {
  position: absolute;
  width: min(560px, calc(100% - 32px));
  min-height: 240px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  background: rgba(10, 15, 19, 0.78);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
  pointer-events: auto;
  animation: maxios-window-in 0.18s ease;
}

@keyframes maxios-window-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.maxios-window-bar {
  height: 42px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: grab;
  user-select: none;
}

.maxios-window-controls {
  display: inline-flex;
  gap: 8px;
}

.maxios-window-control {
  width: 13px;
  height: 13px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.maxios-window-close {
  background: #ff5f57;
}

.maxios-window-minimize {
  background: #ffbd2e;
}

.maxios-window-zoom {
  background: #28c840;
}

.maxios-window-title {
  justify-self: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 700;
}

.maxios-window-content {
  padding: 26px;
}

.maxios-window-content h2 {
  margin-bottom: 10px;
  color: #fff;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1;
  letter-spacing: -0.06em;
}

.maxios-window-content h3 {
  margin-bottom: 10px;
  color: #fff;
  font-size: 22px;
  letter-spacing: -0.04em;
}

.maxios-window-content p {
  color: rgba(244, 241, 234, 0.72);
}

.maxios-app-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.maxios-app-card {
  min-height: 128px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.075);
  color: #fff;
  text-decoration: none;
}

.maxios-app-card:hover {
  background: rgba(255, 255, 255, 0.12);
}

.maxios-app-card span {
  color: rgba(244, 241, 234, 0.58);
  font-size: 13px;
}

.maxios-music-frame {
  width: 100%;
  height: 330px;
  display: block;
  margin-top: 18px;
  border: 0;
  border-radius: 16px;
  background: transparent;
}

.maxios-terminal {
  color: #a7f59d;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 15px;
  line-height: 1.6;
}

.maxios-terminal p {
  color: #a7f59d;
}

.maxios-dock {
  position: absolute;
  left: 50%;
  bottom: 24px;
  z-index: 20;
  height: 72px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.11);
  box-shadow:
    0 20px 70px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(22px);
  transform: translateX(-50%);
}

.maxios-dock-item {
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  text-decoration: none;
  font-size: 25px;
  transition: transform 0.18s ease;
}

@media (max-width: 760px) {
  .maxios-topbar-left span:not(:first-child),
  .maxios-topbar-right span:first-child,
  .maxios-topbar-right span:nth-child(2) {
    display: none;
  }

  .maxios-desktop {
    padding: 24px 14px 108px;
  }

  .maxios-icons {
    width: 100%;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .maxios-icon {
    width: auto;
  }

  .maxios-window {
    left: 14px !important;
    right: 14px;
    width: auto !important;
  }

  .maxios-app-grid {
    grid-template-columns: 1fr;
  }

  .maxios-dock {
    max-width: calc(100% - 28px);
    overflow-x: auto;
  }
}
`;

const maxiosHtml = `
<div class="maxios" id="maxios">
  <header class="maxios-topbar">
    <div class="maxios-topbar-left">
      <a class="maxios-brand" href="/" aria-label="Zurück zur Startseite">
        <span class="maxios-brand-dot"></span>
        MaxiOS
      </a>

      <span>Datei</span>
      <span>Bearbeiten</span>
      <span>Darstellung</span>
      <span>Gehe zu</span>
      <span>Hilfe</span>
    </div>

    <div class="maxios-topbar-right">
      <span aria-hidden="true">⌁</span>
      <span aria-hidden="true">◐</span>
      <span id="maxiosClock">--:--</span>
    </div>
  </header>

  <section class="maxios-desktop" aria-label="MaxiOS Desktop">
    <div class="maxios-icons" aria-label="Apps">
      <button class="maxios-icon" type="button" data-app="welcome">
        <span class="maxios-icon-symbol">🥑</span>
        <span>Willkommen</span>
      </button>

      <button class="maxios-icon" type="button" data-app="projects">
        <span class="maxios-icon-symbol">🕹️</span>
        <span>Projekte</span>
      </button>

      <button class="maxios-icon" type="button" data-app="music">
        <span class="maxios-icon-symbol">🎵</span>
        <span>Musik</span>
      </button>

      <button class="maxios-icon" type="button" data-app="terminal">
        <span class="maxios-icon-symbol">⌨️</span>
        <span>Terminal</span>
      </button>

      <a class="maxios-icon" href="/tic-tac-toe/">
        <span class="maxios-icon-symbol">❌</span>
        <span>Tic Tac Toe</span>
      </a>

      <a class="maxios-icon" href="/memory/">
        <span class="maxios-icon-symbol">🧠</span>
        <span>Memory</span>
      </a>
    </div>

    <div class="maxios-window-layer" id="maxiosWindowLayer"></div>

    <nav class="maxios-dock" aria-label="Dock">
      <button class="maxios-dock-item" type="button" data-app="welcome">🥑</button>
      <button class="maxios-dock-item" type="button" data-app="projects">🕹️</button>
      <button class="maxios-dock-item" type="button" data-app="music">🎵</button>
      <button class="maxios-dock-item" type="button" data-app="terminal">⌨️</button>
      <a class="maxios-dock-item" href="/tic-tac-toe/">❌</a>
      <a class="maxios-dock-item" href="/memory/">🧠</a>
    </nav>
  </section>
</div>
`;

const maxiosJs = `
(() => {
  const clock = document.getElementById("maxiosClock");
  const windowLayer = document.getElementById("maxiosWindowLayer");
  const appTriggers = document.querySelectorAll("[data-app]");

  let topZIndex = 10;

  const apps = {
    welcome: {
      title: "Willkommen",
      x: 150,
      y: 54,
      width: 560,
      content: \`
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
      \`
    },

    projects: {
      title: "Projekte",
      x: 210,
      y: 130,
      width: 560,
      content: \`
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
      \`
    },

    music: {
      title: "Musik",
      x: 520,
      y: 78,
      width: 620,
      content: \`
        <h2>Musik</h2>
        <p>Eine Playlist für nebenbei.</p>

        <iframe
          class="maxios-music-frame"
          allow="autoplay *; encrypted-media *;"
          title="Apple Music Playlist Seventeen"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src="https://embed.music.apple.com/de/playlist/seventeen/pl.u-8aAVXG9hmx2x65x?theme=dark"
        ></iframe>
      \`
    },

    terminal: {
      title: "Terminal",
      x: 360,
      y: 360,
      width: 520,
      content: \`
        <div class="maxios-terminal">
          <p>maxi@maxios ~ % help</p>
          <br>
          <p>help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— zeigt diese Hilfe an</p>
          <p>projects&nbsp;— öffnet die Projekte</p>
          <p>music&nbsp;&nbsp;&nbsp;&nbsp;— öffnet die Musik</p>
          <p>about&nbsp;&nbsp;&nbsp;&nbsp;— über MaxiOS</p>
          <br>
          <p>maxi@maxios ~ % ▌</p>
        </div>
      \`
    }
  };

  function updateClock() {
    if (!clock) return;

    clock.textContent = new Date().toLocaleString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function bringToFront(windowElement) {
    topZIndex += 1;
    windowElement.style.zIndex = String(topZIndex);
  }

  function createWindow(appKey) {
    const app = apps[appKey];

    if (!app || !windowLayer) return;

    const existingWindow = windowLayer.querySelector(\`[data-window="\${appKey}"]\`);

    if (existingWindow) {
      bringToFront(existingWindow);
      return;
    }

    const windowElement = document.createElement("article");

    windowElement.className = "maxios-window";
    windowElement.dataset.window = appKey;
    windowElement.style.left = \`\${app.x}px\`;
    windowElement.style.top = \`\${app.y}px\`;
    windowElement.style.width = \`\${app.width}px\`;

    windowElement.innerHTML = \`
      <div class="maxios-window-bar">
        <div class="maxios-window-controls">
          <button class="maxios-window-control maxios-window-close" type="button" aria-label="Fenster schließen"></button>
          <button class="maxios-window-control maxios-window-minimize" type="button" aria-label="Fenster minimieren"></button>
          <button class="maxios-window-control maxios-window-zoom" type="button" aria-label="Fenster maximieren"></button>
        </div>

        <strong class="maxios-window-title">\${app.title}</strong>
        <span></span>
      </div>

      <div class="maxios-window-content">
        \${app.content}
      </div>
    \`;

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

      const stage = document.getElementById("bootPreview");
      const stageRect = stage.getBoundingClientRect();
      const nextLeft = initialLeft + event.clientX - startX;
      const nextTop = initialTop + event.clientY - startY;
      const maxLeft = stageRect.width - windowElement.offsetWidth - 12;
      const maxTop = stageRect.height - windowElement.offsetHeight - 24;

      windowElement.style.left = \`\${Math.max(12, Math.min(nextLeft, maxLeft))}px\`;
      windowElement.style.top = \`\${Math.max(12, Math.min(nextTop, maxTop))}px\`;
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

  updateClock();
  window.setInterval(updateClock, 30000);

  createWindow("welcome");
  createWindow("music");
  createWindow("terminal");
})();
`;

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function setStatus(message) {
  if (!bootStatus) return;

  bootStatus.textContent = message;
}

function setFileName(fileName) {
  if (!bootFileName) return;

  bootFileName.textContent = fileName;
}

async function typeText(text) {
  if (!bootCode) return;

  for (const character of text) {
    bootCode.textContent += character;
    bootCode.parentElement.scrollTop = bootCode.parentElement.scrollHeight;

    await wait(character === "\n" ? typingSpeed * 8 : typingSpeed);
  }
}

async function typeSection(fileName, code, callback) {
  setFileName(fileName);
  setStatus(`writing ${fileName}`);

  bootCode.textContent += `\n/* ${fileName} */\n\n`;

  await typeText(code.trim());
  await wait(220);

  callback();

  setStatus(`applied ${fileName}`);
  await wait(420);
}

function applyCss(css) {
  const styleElement = document.createElement("style");

  styleElement.textContent = css;
  document.head.appendChild(styleElement);
}

function applyHtml(html) {
  bootPreview.innerHTML = html;
}

function applyJs(js) {
  const scriptElement = document.createElement("script");

  scriptElement.textContent = js;
  document.body.appendChild(scriptElement);
}

async function bootMaxios() {
  setStatus("booting");

  await typeText(`maxi@boot ~ % create maxios --live\n`);
  await wait(400);

  await typeSection("maxios.css", maxiosCss, () => {
    applyCss(maxiosCss);
  });

  await typeSection("maxios.html", maxiosHtml, () => {
    applyHtml(maxiosHtml);
  });

  await typeSection("maxios.js", maxiosJs, () => {
    applyJs(maxiosJs);
  });

  setFileName("MaxiOS ready");
  setStatus("ready");

  await typeText(`\n\n✓ MaxiOS ready.\n`);
}

bootMaxios();
