"use strict";

const bootText = document.getElementById("bootText");
const recommendedSystemLink = document.getElementById("recommendedSystemLink");
const recommendedSystemIcon = document.getElementById("recommendedSystemIcon");
const recommendedSystemName = document.getElementById("recommendedSystemName");
const recommendedSystemDescription = document.getElementById("recommendedSystemDescription");

const prefersMiniOS = window.matchMedia("(max-width: 820px)").matches;

if (prefersMiniOS) {
  recommendedSystemLink.href = "/minios/";
  recommendedSystemIcon.textContent = "📱";
  recommendedSystemName.textContent = "miniOS";
  recommendedSystemDescription.textContent = "Touchbasierte Oberfläche für kleine Bildschirme.";
}

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

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function typeBootText() {
  let output = "";

  for (const line of lines) {
    output += `${line}\n`;
    bootText.innerHTML = `${output}<span class="boot-cursor"></span>`;

    await wait(line === "" ? 120 : 260);
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    window.location.href = "/maxios/";
  }

  if (event.key === "2") {
    window.location.href = "/minios/";
  }

  if (event.key === "Enter") {
    window.location.href = recommendedSystemLink.href;
  }
});

typeBootText();
