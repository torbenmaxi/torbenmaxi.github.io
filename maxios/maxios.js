"use strict";

const clockElement = document.getElementById("maxiosClock");
const maxiosElement = document.getElementById("maxios");
const appearanceMenuButton = document.getElementById("appearanceMenuButton");
const appearanceMenu = document.getElementById("appearanceMenu");
const themeOptionButtons = document.querySelectorAll("[data-theme-option]");

const statsMenuButton = document.getElementById("statsMenuButton");
const statsMenu = document.getElementById("statsMenu");
const maxiosStatsLikes = document.getElementById("maxiosStatsLikes");
const maxiosStatsPageViews = document.getElementById("maxiosStatsPageViews");
const maxiosStatsActiveVisitors = document.getElementById("maxiosStatsActiveVisitors");
const maxiosStatsUpdated = document.getElementById("maxiosStatsUpdated");

const windowLayer = document.getElementById("maxiosWindowLayer");
const appTriggers = document.querySelectorAll("[data-app]");

let topZIndex = 10;

/* Clock */

function updateClock() {
  if (!clockElement) return;

  const now = new Date();

  const weekday = now
    .toLocaleDateString("de-DE", {
      weekday: "short"
    })
    .replace(".", "");

  const date = now.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short"
  });

  const time = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  clockElement.textContent = `${weekday}. ${date} | ${time}`;
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
  
  const musicFrame = document.querySelector(".maxios-music-frame");
  
  if (musicFrame) {
    musicFrame.src =
      `https://embed.music.apple.com/de/playlist/seventeen/pl.u-8aAVXG9hmx2x65x?theme=${normalizedTheme}`;
  }
}

/* Windows */

const apps = {
  music: {
    title: "Musik",
    x: 220,
    y: 82,
    width: 620,
    content: () => {
      const theme = getSavedMaxiosTheme() === "light" ? "light" : "dark";
  
      return `
        <h2>Musik</h2>
        <p>Eine Playlist für nebenbei.</p>
  
        <iframe
          class="maxios-music-frame"
          allow="autoplay *; encrypted-media *;"
          title="Apple Music Playlist Seventeen"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src="https://embed.music.apple.com/de/playlist/seventeen/pl.u-8aAVXG9hmx2x65x?theme=${theme}"
        ></iframe>
      `;
    }
  }
};

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
      ${typeof app.content === "function" ? app.content() : app.content}
    </div>
    
    <button
      class="maxios-window-resize"
      type="button"
      aria-label="Fenstergröße ändern"
    ></button>
  `;

  windowLayer.appendChild(windowElement);
  bringToFront(windowElement);
  makeWindowDraggable(windowElement);
  makeWindowResizable(windowElement);

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
    const maxTop = window.innerHeight - windowElement.offsetHeight - 96;

    windowElement.style.left = `${Math.max(12, Math.min(nextLeft, maxLeft))}px`;
    windowElement.style.top = `${Math.max(12, Math.min(nextTop, maxTop))}px`;
  });

  dragHandle.addEventListener("pointerup", (event) => {
    isDragging = false;
    dragHandle.releasePointerCapture(event.pointerId);
  });
}

function makeWindowResizable(windowElement) {
  const resizeHandle = windowElement.querySelector(".maxios-window-resize");

  if (!resizeHandle) return;

  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let initialWidth = 0;
  let initialHeight = 0;

  resizeHandle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    isResizing = true;
    startX = event.clientX;
    startY = event.clientY;
    initialWidth = windowElement.offsetWidth;
    initialHeight = windowElement.offsetHeight;

    bringToFront(windowElement);
    resizeHandle.setPointerCapture(event.pointerId);
  });

  resizeHandle.addEventListener("pointermove", (event) => {
    if (!isResizing) return;

    const minWidth = 320;
    const minHeight = 240;
    const maxWidth = window.innerWidth - windowElement.offsetLeft - 12;
    const maxHeight = window.innerHeight - windowElement.offsetTop - 12;

    const nextWidth = initialWidth + event.clientX - startX;
    const nextHeight = initialHeight + event.clientY - startY;

    windowElement.style.width = `${Math.max(minWidth, Math.min(nextWidth, maxWidth))}px`;
    windowElement.style.height = `${Math.max(minHeight, Math.min(nextHeight, maxHeight))}px`;
  });

  resizeHandle.addEventListener("pointerup", (event) => {
    isResizing = false;
    resizeHandle.releasePointerCapture(event.pointerId);
  });
}

appTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    createWindow(trigger.dataset.app);
  });
});

/* Stats */

const supabaseUrl = "https://ubjthqzvxzqmqiqxdxog.supabase.co";
const supabaseKey = "sb_publishable_2b1qOP4_bp0wsNcWPvY5gA_GnH8bw5m";
const supabaseClient = window.supabase?.createClient(supabaseUrl, supabaseKey);

const statsLikeSlug = "home";

function createVisitorId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getActiveVisitorId() {
  let visitorId = sessionStorage.getItem("activeVisitorId");

  if (!visitorId) {
    visitorId = createVisitorId();
    sessionStorage.setItem("activeVisitorId", visitorId);
  }

  return visitorId;
}

function getSessionId() {
  let sessionId = sessionStorage.getItem("siteSessionId");

  if (!sessionId) {
    sessionId = createVisitorId();
    sessionStorage.setItem("siteSessionId", sessionId);
  }

  return sessionId;
}

async function recordMaxiosPageView() {
  if (!supabaseClient) return;

  await supabaseClient.from("site_pageviews").insert({
    page: window.location.pathname,
    session_id: getSessionId()
  });
}

async function loadMaxiosLikeCount() {
  if (!supabaseClient || !maxiosStatsLikes) return;

  const { data, error } = await supabaseClient
    .from("site_likes")
    .select("like_count")
    .eq("slug", statsLikeSlug)
    .single();

  if (error || !data) {
    maxiosStatsLikes.textContent = "–";
    return;
  }

  maxiosStatsLikes.textContent = String(data.like_count);
}

async function loadMaxiosPageViews() {
  if (!supabaseClient || !maxiosStatsPageViews) return;

  const { count, error } = await supabaseClient
    .from("site_pageviews")
    .select("*", {
      count: "exact",
      head: true
    });

  if (error) {
    maxiosStatsPageViews.textContent = "–";
    return;
  }

  maxiosStatsPageViews.textContent = String(count || 0);
}

async function updateMaxiosActiveVisitors() {
  if (!supabaseClient || !maxiosStatsActiveVisitors) return;

  const visitorId = getActiveVisitorId();

  await supabaseClient
    .from("site_active_visitors")
    .upsert({
      visitor_id: visitorId,
      last_seen_at: new Date().toISOString()
    });

  const activeSince = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { count, error } = await supabaseClient
    .from("site_active_visitors")
    .select("*", {
      count: "exact",
      head: true
    })
    .gte("last_seen_at", activeSince);

  if (error) {
    maxiosStatsActiveVisitors.textContent = "–";
    return;
  }

  maxiosStatsActiveVisitors.textContent = String(count || 0);
}

async function updateMaxiosStats() {
  await Promise.all([
    loadMaxiosLikeCount(),
    loadMaxiosPageViews(),
    updateMaxiosActiveVisitors()
  ]);

  if (maxiosStatsUpdated) {
    maxiosStatsUpdated.textContent = `Aktualisiert: ${new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  }
}

/* Appearance menu */

function openAppearanceMenu() {
  const menu = appearanceMenuButton?.parentElement;

  if (!menu || !appearanceMenuButton || !appearanceMenu) return;

  closeStatsMenu();
  
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
    closeStatsMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAppearanceMenu();
    closeStatsMenu();
  }
});

/* Stats menu */

function openStatsMenu() {
  const menu = statsMenuButton?.parentElement;

  if (!menu || !statsMenuButton || !statsMenu) return;

  closeAppearanceMenu();

  menu.classList.add("is-open");
  statsMenuButton.setAttribute("aria-expanded", "true");
  statsMenu.setAttribute("aria-hidden", "false");

  updateMaxiosStats();
}

function closeStatsMenu() {
  const menu = statsMenuButton?.parentElement;

  if (!menu || !statsMenuButton || !statsMenu) return;

  menu.classList.remove("is-open");
  statsMenuButton.setAttribute("aria-expanded", "false");
  statsMenu.setAttribute("aria-hidden", "true");
}

function toggleStatsMenu() {
  const menu = statsMenuButton?.parentElement;

  if (!menu?.classList.contains("is-open")) {
    openStatsMenu();
    return;
  }

  closeStatsMenu();
}

statsMenuButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleStatsMenu();
});

/* Init */

applyMaxiosTheme(getSavedMaxiosTheme());

recordMaxiosPageView();
updateMaxiosStats();
window.setInterval(updateMaxiosActiveVisitors, 30000);

updateClock();
window.setInterval(updateClock, 1000);
