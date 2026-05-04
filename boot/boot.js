"use strict";

const bootText = document.getElementById("bootText");
const bootOptions = document.getElementById("bootOptions");
const bootFooter = document.getElementById("bootFooter");
const bootSwitchButton = document.getElementById("bootSwitchButton");

const prefersMiniOS = window.matchMedia("(max-width: 820px)").matches;
const recommendedSystemUrl = prefersMiniOS ? "/minios/" : "/maxios/";
const recommendedSystemName = prefersMiniOS ? "miniOS" : "MaxiOS";

let autoStartEnabled = true;

const lines = [
  "Maxi by Torben",
  "",
  "System wird erkannt...",
  `${recommendedSystemName} ausgewählt`,
  "Start wird vorbereitet..."
];

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

      await wait(24);
    }

    output += "\n";
    bootText.innerHTML = `${output}<span class="boot-cursor"></span>`;

    await wait(line === "" ? 100 : 220);
  }
}

/* System selection */

function showSystemOptions() {
  autoStartEnabled = false;

  bootOptions?.classList.remove("is-hidden");
  bootFooter?.classList.remove("is-hidden");
  bootSwitchButton?.setAttribute("aria-expanded", "true");
}

function startRecommendedSystem() {
  if (!autoStartEnabled) return;

  window.location.href = recommendedSystemUrl;
}

bootSwitchButton?.addEventListener("click", showSystemOptions);

document.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    autoStartEnabled = false;
    window.location.href = "/maxios/";
    return;
  }

  if (event.key === "2") {
    autoStartEnabled = false;
    window.location.href = "/minios/";
    return;
  }

  if (event.key === "Enter") {
    window.location.href = recommendedSystemUrl;
  }

  if (event.key === "Escape") {
    showSystemOptions();
  }
});

/* Init */

typeBootText();
window.setTimeout(startRecommendedSystem, 3200);
