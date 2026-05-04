"use strict";

const bootText = document.getElementById("bootText");
const recommendedSystemLink = document.getElementById("recommendedSystemLink");
const recommendedSystemIcon = document.getElementById("recommendedSystemIcon");
const recommendedSystemName = document.getElementById("recommendedSystemName");

const prefersMiniOS = window.matchMedia("(max-width: 820px)").matches;
const recommendedSystemUrl = prefersMiniOS ? "/minios/" : "/maxios/";

const lines = [
  "Maxi by Torben",
  "",
  "Systemstart wird vorbereitet...",
  "Anzeigeprofil wird erkannt...",
  prefersMiniOS ? "empfohlenes System: miniOS" : "empfohlenes System: MaxiOS",
  "verfügbare Systeme geladen",
  "",
  "System auswählen:"
];

/* Recommended system */

function updateRecommendedSystem() {
  if (!recommendedSystemLink || !recommendedSystemIcon || !recommendedSystemName) return;

  recommendedSystemLink.href = recommendedSystemUrl;

  if (prefersMiniOS) {
    recommendedSystemIcon.textContent = "📱";
    recommendedSystemName.textContent = "miniOS";
    return;
  }

  recommendedSystemIcon.textContent = "🖥️";
  recommendedSystemName.textContent = "MaxiOS";
}

/* Terminal typing */

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function typeBootText() {
  if (!bootText) return;

  let output = "";

  for (const line of lines) {
    for (const character of line) {
      output += character;
      bootText.innerHTML = `${output}<span class="boot-cursor"></span>`;

      await wait(25);
    }

    output += "\n";
    bootText.innerHTML = `${output}<span class="boot-cursor"></span>`;

    await wait(line === "" ? 120 : 260);
  }
}

/* Keyboard shortcuts */

document.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    window.location.href = "/maxios/";
    return;
  }

  if (event.key === "2") {
    window.location.href = "/minios/";
    return;
  }

  if (event.key === "Enter") {
    window.location.href = recommendedSystemUrl;
  }
});

/* Init */

updateRecommendedSystem();
typeBootText();
