"use strict";

/* Theme */

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

function updateThemeToggle() {
  if (!themeToggle) return;

  const isDark = document.body.classList.contains("dark");

  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Lightmode aktivieren" : "Darkmode aktivieren"
  );
}

if (themeToggle) {
  updateThemeToggle();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeToggle();
  });
}

/* Contact form */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const turnstileBox = document.getElementById("turnstileBox");

const turnstileSiteKey = "0x4AAAAAADDEUylFGy2boS8x";

let turnstileLoading = false;
let turnstileLoaded = false;
let turnstileWidgetId = null;
let contactSubmitPending = false;

function setFormStatus(message, type = "") {
  if (!formStatus) return;

  formStatus.className = type ? `form-status ${type}` : "form-status";
  formStatus.textContent = message;
}

function loadTurnstileScript() {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      turnstileLoaded = true;
      resolve();
      return;
    }

    if (turnstileLoading) {
      const checkTurnstile = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(checkTurnstile);
          turnstileLoaded = true;
          resolve();
        }
      }, 100);

      window.setTimeout(() => {
        window.clearInterval(checkTurnstile);
        reject(new Error("Turnstile loading timeout"));
      }, 8000);

      return;
    }

    turnstileLoading = true;

    const script = document.createElement("script");

    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      turnstileLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Turnstile failed to load"));
    };

    document.head.appendChild(script);
  });
}

function getTurnstileToken() {
  const tokenField = contactForm?.querySelector('[name="cf-turnstile-response"]');
  return tokenField?.value || "";
}

async function sendContactForm() {
  if (!contactForm) return;

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || "Nachricht senden";
  const formData = new FormData(contactForm);

  setFormStatus("Wird gesendet...");

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sendet...";
  }

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Form submit failed");
    }

    contactForm.reset();
    setFormStatus("Nachricht gesendet. Danke dir.", "success");

    if (window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
  } catch {
    setFormStatus("Hat leider nicht geklappt. Versuch es bitte nochmal.", "error");
  } finally {
    contactSubmitPending = false;

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

async function prepareTurnstileAndSubmit() {
  if (!turnstileBox) {
    await sendContactForm();
    return;
  }

  setFormStatus("Sicherheitsprüfung wird geladen...");

  try {
    await loadTurnstileScript();

    if (turnstileWidgetId === null) {
      turnstileWidgetId = window.turnstile.render(turnstileBox, {
        sitekey: turnstileSiteKey,
        callback: async () => {
          if (!contactSubmitPending) return;

          await sendContactForm();
        },
        "expired-callback": () => {
          contactSubmitPending = false;
          setFormStatus("Sicherheitsprüfung abgelaufen. Bitte nochmal senden.", "error");
        },
        "error-callback": () => {
          contactSubmitPending = false;
          setFormStatus("Sicherheitsprüfung fehlgeschlagen. Bitte nochmal versuchen.", "error");
        }
      });
    }

    const existingToken = getTurnstileToken();

    if (existingToken) {
      await sendContactForm();
      return;
    }

    contactSubmitPending = true;
    setFormStatus("Bitte kurz die Sicherheitsprüfung bestätigen.");
  } catch {
    contactSubmitPending = false;
    setFormStatus("Sicherheitsprüfung konnte nicht geladen werden.", "error");
  }
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await prepareTurnstileAndSubmit();
  });
}

/* Tic Tac Toe */

const ticTacToe = {
  boardElement: document.getElementById("board"),
  cells: Array.from(document.querySelectorAll(".ttt-cell")),
  currentPlayerElement: document.getElementById("currentPlayer"),
  statusElement: document.getElementById("gameStatus"),
  resetGameButton: document.getElementById("resetGame"),
  resetScoreButton: document.getElementById("resetScore"),
  scoreXElement: document.getElementById("scoreX"),
  scoreOElement: document.getElementById("scoreO"),
  scoreDrawElement: document.getElementById("scoreDraw"),
  modeButtons: Array.from(document.querySelectorAll(".ttt-mode-option")),

  board: ["", "", "", "", "", "", "", "", ""],
  currentPlayer: "X",
  gameOver: false,
  computerThinking: false,
  mode: "human",

  humanPlayer: "X",
  computerPlayer: "O",

  winningCombinations: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ],

  init() {
    if (!this.boardElement) return;

    this.cells.forEach((cell) => {
      cell.addEventListener("click", (event) => this.handleCellClick(event));
    });

    this.resetGameButton?.addEventListener("click", () => this.resetGame());
    this.resetScoreButton?.addEventListener("click", () => this.resetScore());

    const savedMode = localStorage.getItem("tttMode");

    if (savedMode === "human" || savedMode === "computer") {
      this.setMode(savedMode);
    } else {
      this.setMode("human");
    }

    this.modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;

        if (mode !== "human" && mode !== "computer") return;

        this.setMode(mode);
        localStorage.setItem("tttMode", mode);
        this.resetGame();
      });
    });

    this.updateScoreDisplay();
    this.resetGame();
  },

  getMode() {
    return this.mode;
  },

  setMode(mode) {
    this.mode = mode;

    this.modeButtons.forEach((button) => {
      const isActive = button.dataset.mode === mode;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  },

  getScore() {
    const fallbackScore = {
      X: 0,
      O: 0,
      draw: 0
    };

    const savedScore = localStorage.getItem("tttScore");

    if (!savedScore) {
      return fallbackScore;
    }

    try {
      return {
        ...fallbackScore,
        ...JSON.parse(savedScore)
      };
    } catch {
      return fallbackScore;
    }
  },

  saveScore(score) {
    localStorage.setItem("tttScore", JSON.stringify(score));
  },

  updateScoreDisplay() {
    const score = this.getScore();

    if (this.scoreXElement) this.scoreXElement.textContent = score.X;
    if (this.scoreOElement) this.scoreOElement.textContent = score.O;
    if (this.scoreDrawElement) this.scoreDrawElement.textContent = score.draw;
  },

  updateDisplay() {
    this.cells.forEach((cell, index) => {
      const isComputerTurn =
        this.getMode() === "computer" &&
        this.currentPlayer === this.computerPlayer;

      cell.textContent = this.board[index];
      cell.disabled =
        this.gameOver ||
        this.computerThinking ||
        this.board[index] !== "" ||
        isComputerTurn;
    });

    if (this.currentPlayerElement) {
      this.currentPlayerElement.textContent = this.currentPlayer;
    }
  },

  setStatus(message) {
    if (!this.statusElement) return;
    this.statusElement.textContent = message;
  },

  checkWinner() {
    for (const combination of this.winningCombinations) {
      const [a, b, c] = combination;

      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return combination;
      }
    }

    return null;
  },

  finishGame(winnerCombination) {
    this.gameOver = true;

    const winner = this.board[winnerCombination[0]];
    const score = this.getScore();

    score[winner] += 1;
    this.saveScore(score);
    this.updateScoreDisplay();

    winnerCombination.forEach((index) => {
      this.cells[index].classList.add("winner");
    });

    this.cells.forEach((cell) => {
      cell.disabled = true;
    });

    if (this.getMode() === "computer" && winner === this.computerPlayer) {
      this.setStatus("Computer gewinnt.");
      return;
    }

    if (this.getMode() === "computer" && winner === this.humanPlayer) {
      this.setStatus("Du gewinnst.");
      return;
    }

    this.setStatus(`${winner} gewinnt.`);
  },

  finishDraw() {
    this.gameOver = true;

    const score = this.getScore();
    score.draw += 1;

    this.saveScore(score);
    this.updateScoreDisplay();

    this.cells.forEach((cell) => {
      cell.disabled = true;
    });

    this.setStatus("Unentschieden.");
  },

  endTurn() {
    const winnerCombination = this.checkWinner();

    if (winnerCombination) {
      this.updateDisplay();
      this.finishGame(winnerCombination);
      return;
    }

    if (this.board.every(Boolean)) {
      this.updateDisplay();
      this.finishDraw();
      return;
    }

    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";

    if (this.getMode() === "computer" && this.currentPlayer === this.computerPlayer) {
      this.setStatus("Computer denkt nach...");
    } else {
      this.setStatus(`${this.currentPlayer} ist dran.`);
    }

    this.updateDisplay();

    if (
      this.getMode() === "computer" &&
      this.currentPlayer === this.computerPlayer &&
      !this.gameOver
    ) {
      this.computerThinking = true;
      this.updateDisplay();

      window.setTimeout(() => {
        this.makeComputerMove();
        this.computerThinking = false;
        this.updateDisplay();
      }, 450);
    }
  },

  handleCellClick(event) {
    const index = Number(event.currentTarget.dataset.index);

    if (
      this.gameOver ||
      this.computerThinking ||
      Number.isNaN(index) ||
      this.board[index] !== ""
    ) {
      return;
    }

    if (this.getMode() === "computer" && this.currentPlayer === this.computerPlayer) {
      return;
    }

    this.board[index] = this.currentPlayer;
    this.endTurn();
  },

  getAvailableMoves() {
    return this.board
      .map((value, index) => (value === "" ? index : null))
      .filter((index) => index !== null);
  },

  findWinningMove(player) {
    for (const move of this.getAvailableMoves()) {
      this.board[move] = player;

      const winner = this.checkWinner();

      this.board[move] = "";

      if (winner) {
        return move;
      }
    }

    return null;
  },

  makeComputerMove() {
    if (this.gameOver) return;

    let move = this.findWinningMove(this.computerPlayer);

    if (move === null) {
      move = this.findWinningMove(this.humanPlayer);
    }

    if (move === null && this.board[4] === "") {
      move = 4;
    }

    const corners = [0, 2, 6, 8].filter((index) => this.board[index] === "");

    if (move === null && corners.length > 0) {
      move = corners[Math.floor(Math.random() * corners.length)];
    }

    const availableMoves = this.getAvailableMoves();

    if (move === null && availableMoves.length > 0) {
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (move !== null) {
      this.board[move] = this.computerPlayer;
      this.endTurn();
    }
  },

  resetGame() {
    this.board = ["", "", "", "", "", "", "", "", ""];
    this.currentPlayer = "X";
    this.gameOver = false;
    this.computerThinking = false;

    this.cells.forEach((cell) => {
      cell.classList.remove("winner");
    });

    this.setStatus(
      this.getMode() === "computer" ? "Du beginnst als X." : "X beginnt."
    );

    this.updateDisplay();
  },

  resetScore() {
    this.saveScore({
      X: 0,
      O: 0,
      draw: 0
    });

    this.updateScoreDisplay();
  }
};

ticTacToe.init();

/* Memory */

const supabaseUrl = "https://ubjthqzvxzqmqiqxdxog.supabase.co";
const supabaseKey = "sb_publishable_2b1qOP4_bp0wsNcWPvY5gA_GnH8bw5m";
const supabaseClient = window.supabase?.createClient(supabaseUrl, supabaseKey);

const memory = {
  boardElement: document.getElementById("memoryBoard"),
  statusElement: document.getElementById("memoryStatus"),
  movesElement: document.getElementById("memoryMoves"),
  pairsElement: document.getElementById("memoryPairs"),
  bestElement: document.getElementById("memoryBest"),
  leaderboardElement: document.getElementById("memoryLeaderboard"),
  playerNameElement: document.getElementById("memoryPlayerName"),
  saveScoreButton: document.getElementById("saveMemoryScore"),
  resetButton: document.getElementById("resetMemory"),

  symbols: ["🍎", "🍐", "🍌", "🍇", "🍓", "🥕", "🥦", "🍅"],
  cards: [],
  openCards: [],
  moves: 0,
  matchedPairs: 0,
  lockBoard: false,
  scoreSaved: false,
  pendingScore: null,

  init() {
    if (!this.boardElement) return;

    this.resetButton?.addEventListener("click", () => this.startGame());
    this.saveScoreButton?.addEventListener("click", () => this.savePendingScore());

    this.playerNameElement?.addEventListener("input", () => {
      const playerName = this.getPlayerName();

      if (playerName) {
        localStorage.setItem("memoryPlayerName", playerName);
      }

      this.updateSaveButton();
    });

    const savedPlayerName = localStorage.getItem("memoryPlayerName");

    if (this.playerNameElement && savedPlayerName) {
      this.playerNameElement.value = savedPlayerName;
    }

    this.startGame();
    this.loadLeaderboard();
  },

  startGame() {
    this.cards = this.shuffleCards();
    this.openCards = [];
    this.moves = 0;
    this.matchedPairs = 0;
    this.lockBoard = false;
    this.scoreSaved = false;
    this.pendingScore = null;

    this.renderBoard();
    this.updateDisplay();
    this.updateSaveButton();
    this.setStatus("Finde das erste Paar.");
  },

  shuffleCards() {
    const cardValues = [...this.symbols, ...this.symbols];

    return cardValues
      .map((symbol, index) => ({
        id: index,
        symbol,
        isOpen: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);
  },

  renderBoard() {
    this.boardElement.innerHTML = "";

    this.cards.forEach((card, index) => {
      const button = document.createElement("button");

      button.className = "memory-card";
      button.type = "button";
      button.dataset.index = String(index);
      button.setAttribute("aria-label", "Karte aufdecken");

      button.addEventListener("click", () => this.handleCardClick(index));

      this.boardElement.appendChild(button);
    });

    this.updateCards();
  },

  updateCards() {
    const cardButtons = this.boardElement.querySelectorAll(".memory-card");

    cardButtons.forEach((button, index) => {
      const card = this.cards[index];
      const isVisible = card.isOpen || card.isMatched;

      button.textContent = isVisible ? card.symbol : "";
      button.disabled = this.lockBoard || card.isOpen || card.isMatched;

      button.classList.toggle("is-open", card.isOpen);
      button.classList.toggle("is-matched", card.isMatched);
    });
  },

  handleCardClick(index) {
    const card = this.cards[index];

    if (this.lockBoard || card.isOpen || card.isMatched) return;

    card.isOpen = true;
    this.openCards.push(card);

    this.updateCards();

    if (this.openCards.length === 2) {
      this.moves += 1;
      this.checkPair();
      this.updateDisplay();
    }
  },

  checkPair() {
    const [firstCard, secondCard] = this.openCards;

    if (firstCard.symbol === secondCard.symbol) {
      firstCard.isMatched = true;
      secondCard.isMatched = true;

      this.matchedPairs += 1;
      this.openCards = [];

      this.setStatus("Paar gefunden.");
      this.updateCards();

      if (this.matchedPairs === this.symbols.length) {
        this.finishGame();
      }

      return;
    }

    this.lockBoard = true;
    this.setStatus("Leider kein Paar.");

    window.setTimeout(() => {
      firstCard.isOpen = false;
      secondCard.isOpen = false;

      this.openCards = [];
      this.lockBoard = false;

      this.setStatus("Weiter geht’s.");
      this.updateCards();
    }, 800);
  },

  finishGame() {
    const bestScore = this.getBestScore();

    if (!bestScore || this.moves < bestScore) {
      localStorage.setItem("memoryBest", String(this.moves));
    }

    this.pendingScore = this.moves;

    this.updateDisplay();
    this.updateSaveButton();
    this.setStatus("Geschafft. Du kannst deinen Score jetzt speichern.");
  },

  getPlayerName() {
    const playerName = this.playerNameElement?.value.trim() || "";
    return playerName.slice(0, 18);
  },

  getBestScore() {
    const savedScore = localStorage.getItem("memoryBest");
    return savedScore ? Number(savedScore) : null;
  },

  updateSaveButton() {
    if (!this.saveScoreButton) return;

    const playerName = this.getPlayerName();
    const canSave = Boolean(this.pendingScore && playerName && !this.scoreSaved);

    this.saveScoreButton.disabled = !canSave;
  },

  async savePendingScore() {
    const playerName = this.getPlayerName();

    if (!this.pendingScore || !playerName || this.scoreSaved) {
      return;
    }

    await this.saveScore(playerName, this.pendingScore);
    this.pendingScore = null;
    this.updateSaveButton();
  },

  async saveScore(playerName, moves) {
    if (!supabaseClient || this.scoreSaved) return;

    this.scoreSaved = true;
    this.updateSaveButton();
    this.setStatus("Score wird gespeichert...");

    const { error } = await supabaseClient
      .from("memory_scores")
      .insert({
        player_name: playerName,
        moves
      });

    if (error) {
      this.setStatus("Score konnte nicht gespeichert werden.");
      this.scoreSaved = false;
      this.updateSaveButton();
      return;
    }

    this.setStatus("Score gespeichert.");
    await this.loadLeaderboard();
  },

  async loadLeaderboard() {
    if (!supabaseClient || !this.leaderboardElement) return;

    this.leaderboardElement.innerHTML = `
      <li class="memory-leaderboard-empty">Lädt...</li>
    `;

    const { data, error } = await supabaseClient
      .from("memory_scores")
      .select("player_name, moves, created_at")
      .order("moves", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      this.leaderboardElement.innerHTML = `
        <li class="memory-leaderboard-empty">Bestenliste nicht verfügbar.</li>
      `;
      return;
    }

    if (!data || data.length === 0) {
      this.leaderboardElement.innerHTML = `
        <li class="memory-leaderboard-empty">Noch keine Scores.</li>
      `;
      return;
    }

    const bestScoresByName = new Map();

    data.forEach((score) => {
      const normalizedName = score.player_name.trim().toLowerCase();

      if (!bestScoresByName.has(normalizedName)) {
        bestScoresByName.set(normalizedName, score);
      }
    });

    const leaderboardScores = Array.from(bestScoresByName.values()).slice(0, 5);

    this.leaderboardElement.innerHTML = "";

    leaderboardScores.forEach((score) => {
      const item = document.createElement("li");

      item.innerHTML = `
        <span>${this.escapeHtml(score.player_name)}</span>
        <strong>${score.moves}</strong>
      `;

      this.leaderboardElement.appendChild(item);
    });
  },

  updateDisplay() {
    const bestScore = this.getBestScore();

    if (this.movesElement) {
      this.movesElement.textContent = String(this.moves);
    }

    if (this.pairsElement) {
      this.pairsElement.textContent = `${this.matchedPairs}/${this.symbols.length}`;
    }

    if (this.bestElement) {
      this.bestElement.textContent = bestScore ? String(bestScore) : "–";
    }
  },

  setStatus(message) {
    if (!this.statusElement) return;
    this.statusElement.textContent = message;
  },

  escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};

memory.init();

/* Fake account modal */

const accountOpen = document.getElementById("accountOpen");
const accountModal = document.getElementById("accountModal");
const accountClose = document.getElementById("accountClose");
const accountCloseButton = document.getElementById("accountCloseButton");
const accountForm = document.getElementById("accountForm");
const accountPassword = document.getElementById("accountPassword");
const passwordToggle = document.getElementById("passwordToggle");
const accountStatus = document.getElementById("accountStatus");
const passwordRulesElement = document.getElementById("passwordRules");

const passwordRules = [
  {
    text: "Mindestens 8 Zeichen.",
    test: (value) => value.length >= 8
  },
  {
    text: "Enthält mindestens eine Zahl.",
    test: (value) => /\d/.test(value)
  },
  {
    text: "Enthält mindestens einen Großbuchstaben.",
    test: (value) => /[A-ZÄÖÜ]/.test(value)
  },
  {
    text: "Die Summe aller Zahlen muss genau 10 ergeben.",
    test: (value) => {
      const numbers = value.match(/\d/g) || [];
      const sum = numbers.reduce((total, number) => total + Number(number), 0);

      return sum === 10;
    }
  },
  {
    text: "Enthält mindestens eine 1.",
    test: (value) => value.includes("1")
  },
  {
    text: "Enthält eine Obstsorte.",
    test: (value) => {
      const fruits = [
        "apfel",
        "banane",
        "birne",
        "orange",
        "mandarine",
        "clementine",
        "zitrone",
        "limette",
        "grapefruit",
        "mango",
        "ananas",
        "kiwi",
        "papaya",
        "melone",
        "wassermelone",
        "honigmelone",
        "erdbeere",
        "himbeere",
        "brombeere",
        "heidelbeere",
        "blaubeere",
        "johannisbeere",
        "stachelbeere",
        "cranberry",
        "weintraube",
        "traube",
        "kirsche",
        "pfirsich",
        "nektarine",
        "aprikose",
        "pflaume",
        "zwetschge",
        "granatapfel",
        "maracuja",
        "passionsfrucht",
        "litschi",
        "lychee",
        "kaki",
        "physalis",
        "feige",
        "dattel",
        "kokosnuss",
        "avocado"
      ];

      return fruits.some((fruit) => value.toLowerCase().includes(fruit));
    }
  },
  {
    text: "Enthält das Wort Maxi, aber nicht am Anfang.",
    test: (value) => /maxi/i.test(value) && !/^maxi/i.test(value)
  },
  {
    text: "Die Länge des Passworts muss eine Primzahl sein.",
    test: (value) => {
      const length = value.length;

      if (length < 2) return false;

      for (let i = 2; i < length; i += 1) {
        if (length % i === 0) return false;
      }

      return true;
    }
  },
  {
    text: "Enthält ein Satzzeichen, aber kein Ausrufezeichen.",
    test: (value) => /[.,;:?]/.test(value) && !value.includes("!")
  }
];

function openAccountModal() {
  if (!accountModal) return;

  accountModal.classList.add("is-open");
  accountModal.setAttribute("aria-hidden", "false");
  renderPasswordRules();
}

function closeAccountModal() {
  if (!accountModal) return;

  accountModal.classList.remove("is-open");
  accountModal.setAttribute("aria-hidden", "true");
}

function renderPasswordRules() {
  if (!passwordRulesElement || !accountPassword) return;

  const value = accountPassword.value;
  const visibleRules = passwordRules.filter((rule, index) => {
    if (index < 2) return true;

    return passwordRules
      .slice(0, index)
      .every((previousRule) => previousRule.test(value));
  });

  passwordRulesElement.innerHTML = "";

  visibleRules.forEach((rule) => {
    const item = document.createElement("div");

    item.className = "password-rule";
    item.textContent = rule.text;

    if (rule.test(value)) {
      item.classList.add("is-valid");
    }

    passwordRulesElement.appendChild(item);
  });
}

accountOpen?.addEventListener("click", openAccountModal);
accountClose?.addEventListener("click", closeAccountModal);
accountCloseButton?.addEventListener("click", closeAccountModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAccountModal();
  }
});

accountPassword?.addEventListener("input", () => {
  renderPasswordRules();

  if (accountStatus) {
    accountStatus.textContent = "";
    accountStatus.className = "form-status";
  }
});

accountForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!accountPassword || !accountStatus) return;

  const isValid = passwordRules.every((rule) => rule.test(accountPassword.value));

  if (!isValid) {
    accountStatus.className = "form-status error";
    accountStatus.textContent = "Das Passwort erfüllt noch nicht alle Anforderungen.";
    return;
  }

  accountStatus.className = "form-status error";
  accountStatus.textContent = "Account konnte nicht erstellt werden. Das Passwort ist zu sicher.";
});

passwordToggle?.addEventListener("click", () => {
  if (!accountPassword) return;

  const isHidden = accountPassword.type === "password";

  accountPassword.type = isHidden ? "text" : "password";
  passwordToggle.textContent = isHidden ? "Verbergen" : "Anzeigen";
  passwordToggle.setAttribute(
    "aria-label",
    isHidden ? "Passwort verbergen" : "Passwort anzeigen"
  );
});

/* Like button */

const likeButton = document.getElementById("likeButton");
const likeText = document.getElementById("likeText");
const likeCount = document.getElementById("likeCount");
const likeWidget = document.querySelector(".like-widget");

const likeSlug = "home";

function getLocalLikeState() {
  return localStorage.getItem("websiteLiked") === "true";
}

function setLocalLikeState(isLiked) {
  localStorage.setItem("websiteLiked", String(isLiked));
}

function updateLikeButton(isLiked) {
  if (!likeButton || !likeText) return;

  likeWidget?.classList.toggle("is-liked", isLiked);
  likeText.textContent = isLiked ? "Gefällt dir" : "Gefällt mir";

  likeButton.setAttribute(
    "aria-label",
    isLiked ? "Like entfernen" : "Website liken"
  );
}

async function loadLikeCount() {
  if (!supabaseClient || !likeCount) return;

  const { data, error } = await supabaseClient
    .from("site_likes")
    .select("like_count")
    .eq("slug", likeSlug)
    .single();

  if (error || !data) {
    console.error("Like-Anzahl konnte nicht geladen werden:", error);
    return;
  }

  likeCount.textContent = String(data.like_count);
}

async function changeLikeCount(delta) {
  if (!supabaseClient || !likeCount) return;

  const { data, error } = await supabaseClient.rpc("change_site_like", {
    target_slug: likeSlug,
    delta
  });

  if (error || data === null) {
    console.error("Like konnte nicht gespeichert werden:", error);
    return;
  }

  likeCount.textContent = String(data);
}

if (likeButton) {
  updateLikeButton(getLocalLikeState());
  loadLikeCount();

  likeButton.addEventListener("click", async () => {
    const wasLiked = getLocalLikeState();
    const isLiked = !wasLiked;
    const delta = isLiked ? 1 : -1;
  
    setLocalLikeState(isLiked);
    updateLikeButton(isLiked);
  
    likeButton.classList.remove("is-popping");
    void likeButton.offsetWidth;
    likeButton.classList.add("is-popping");
  
    await changeLikeCount(delta);
  });
}

/* Active visitors */

const activeVisitors = document.getElementById("activeVisitors");

function getActiveVisitorId() {
  let visitorId = sessionStorage.getItem("activeVisitorId");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    sessionStorage.setItem("activeVisitorId", visitorId);
  }

  return visitorId;
}

async function updateActiveVisitors() {
  if (!supabaseClient || !activeVisitors) return;

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
    console.error("Aktive Besucher konnten nicht geladen werden:", error);
    return;
  }

  activeVisitors.textContent = `Aktiv: ${count}`;
}

if (activeVisitors) {
  updateActiveVisitors();
  window.setInterval(updateActiveVisitors, 30000);
}

/* Secret admin console */

const adminTrigger = document.getElementById("adminTrigger");
const adminConsole = document.getElementById("adminConsole");
const adminClose = document.getElementById("adminClose");
const adminCloseButton = document.getElementById("adminCloseButton");
const adminChaos = document.getElementById("adminChaos");
const adminTiny = document.getElementById("adminTiny");
const adminRain = document.getElementById("adminRain");
const adminReset = document.getElementById("adminReset");
const adminStatus = document.getElementById("adminStatus");

let adminClickCount = 0;
let adminClickTimer = null;

function openAdminConsole() {
  if (!adminConsole) return;

  adminConsole.classList.add("is-open");
  adminConsole.setAttribute("aria-hidden", "false");

  if (adminStatus) {
    adminStatus.textContent = "Zugriff gewährt.";
  }
}

function closeAdminConsole() {
  if (!adminConsole) return;

  adminConsole.classList.remove("is-open");
  adminConsole.setAttribute("aria-hidden", "true");
}

function setAdminStatus(message) {
  if (!adminStatus) return;
  adminStatus.textContent = message;
}

function resetSecretEffects() {
  document.body.classList.remove("chaos-mode", "tiny-mode", "rain-mode");
  stopRain();
  setAdminStatus("Alles wieder normal.");
}

adminTrigger?.addEventListener("click", () => {
  adminClickCount += 1;

  window.clearTimeout(adminClickTimer);

  adminClickTimer = window.setTimeout(() => {
    adminClickCount = 0;
  }, 1200);

  if (adminClickCount >= 5) {
    adminClickCount = 0;
    openAdminConsole();
  }
});

adminClose?.addEventListener("click", closeAdminConsole);
adminCloseButton?.addEventListener("click", closeAdminConsole);

adminChaos?.addEventListener("click", () => {
  document.body.classList.toggle("chaos-mode");
  setAdminStatus("Chaos-Modus umgeschaltet.");
});

adminTiny?.addEventListener("click", () => {
  document.body.classList.toggle("tiny-mode");
  setAdminStatus("Mini-Seite umgeschaltet.");
});

adminRain?.addEventListener("click", () => {
  document.body.classList.toggle("rain-mode");

  if (document.body.classList.contains("rain-mode")) {
    startRain();
    setAdminStatus("Regen aktiviert.");
  } else {
    stopRain();
    setAdminStatus("Regen deaktiviert.");
  }
});

adminReset?.addEventListener("click", resetSecretEffects);

/* Rain effect */

const rainCanvas = document.getElementById("rainCanvas");
const rainContext = rainCanvas?.getContext("2d");

let rainDrops = [];
let rainAnimationFrame = null;

function resizeRainCanvas() {
  if (!rainCanvas || !rainContext) return;

  const pixelRatio = window.devicePixelRatio || 1;

  rainCanvas.width = window.innerWidth * pixelRatio;
  rainCanvas.height = window.innerHeight * pixelRatio;

  rainCanvas.style.width = `${window.innerWidth}px`;
  rainCanvas.style.height = `${window.innerHeight}px`;

  rainContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createRainDrops() {
  const dropCount = Math.min(180, Math.floor(window.innerWidth / 6));

  rainDrops = Array.from({ length: dropCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    length: 12 + Math.random() * 22,
    speed: 7 + Math.random() * 9,
    opacity: 0.12 + Math.random() * 0.28,
    width: 0.7 + Math.random() * 1.1,
    drift: -1.8 + Math.random() * 0.8
  }));
}

function drawRain() {
  if (!rainCanvas || !rainContext) return;

  rainContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

  rainDrops.forEach((drop) => {
    rainContext.beginPath();
    rainContext.strokeStyle = `rgba(170, 190, 210, ${drop.opacity})`;
    rainContext.lineWidth = drop.width;
    rainContext.moveTo(drop.x, drop.y);
    rainContext.lineTo(drop.x + drop.drift * drop.length, drop.y + drop.length);
    rainContext.stroke();

    drop.x += drop.drift;
    drop.y += drop.speed;

    if (drop.y > window.innerHeight + drop.length) {
      drop.x = Math.random() * window.innerWidth;
      drop.y = -drop.length;
    }

    if (drop.x < -40) {
      drop.x = window.innerWidth + 40;
    }
  });

  rainAnimationFrame = window.requestAnimationFrame(drawRain);
}

function startRain() {
  if (!rainCanvas || rainAnimationFrame) return;

  resizeRainCanvas();
  createRainDrops();
  drawRain();
}

function stopRain() {
  if (!rainAnimationFrame || !rainContext) return;

  window.cancelAnimationFrame(rainAnimationFrame);
  rainAnimationFrame = null;
  rainContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", () => {
  if (!document.body.classList.contains("rain-mode")) return;

  resizeRainCanvas();
  createRainDrops();
});

/* Page loader */

const pageLoader = document.getElementById("pageLoader");

function hidePageLoader() {
  if (!pageLoader) return;

  pageLoader.classList.add("is-hidden");
}

window.addEventListener("load", () => {
  window.setTimeout(hidePageLoader, 350);
});

window.setTimeout(hidePageLoader, 4000);
