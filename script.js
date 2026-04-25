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

function setFormStatus(message, type = "") {
  if (!formStatus) return;

  formStatus.className = type ? `form-status ${type}` : "form-status";
  formStatus.textContent = message;
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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

      if (typeof turnstile !== "undefined") {
        turnstile.reset();
      }
    } catch {
      setFormStatus("Hat leider nicht geklappt. Versuch es bitte nochmal.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
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
  modeSelect: document.getElementById("gameMode"),

  board: ["", "", "", "", "", "", "", "", ""],
  currentPlayer: "X",
  gameOver: false,
  computerThinking: false,

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

    if (this.modeSelect) {
      const savedMode = localStorage.getItem("tttMode");

      if (savedMode === "human" || savedMode === "computer") {
        this.modeSelect.value = savedMode;
      }

      this.modeSelect.addEventListener("change", () => {
        localStorage.setItem("tttMode", this.getMode());
        this.resetGame();
      });
    }

    this.updateScoreDisplay();
    this.resetGame();
  },

  getMode() {
    return this.modeSelect?.value || "human";
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
      this.board[index] !== "" ||
      Number.isNaN(index)
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
