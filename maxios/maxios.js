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
}

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
