const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

function updateThemeButton() {
  if (!themeToggle) return;

  const isDark = document.body.classList.contains("dark");

  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Lightmode aktivieren" : "Darkmode aktivieren"
  );
}

updateThemeButton();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeButton();
  });
}

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);

    formStatus.className = "form-status";
    formStatus.textContent = "Wird gesendet...";

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

      if (response.ok) {
        contactForm.reset();
        formStatus.className = "form-status success";
        formStatus.textContent = "Nachricht gesendet. Danke dir.";

        if (typeof turnstile !== "undefined") {
          turnstile.reset();
        }
      } else {
        formStatus.className = "form-status error";
        formStatus.textContent = "Hat leider nicht geklappt. Versuch es bitte nochmal.";
      }
    } catch (error) {
      formStatus.className = "form-status error";
      formStatus.textContent = "Verbindung fehlgeschlagen. Versuch es bitte nochmal.";
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Nachricht senden";
    }
  });
}

const boardElement = document.getElementById("board");
const cells = document.querySelectorAll(".ttt-cell");
const currentPlayerElement = document.getElementById("currentPlayer");
const gameStatus = document.getElementById("gameStatus");
const resetGameButton = document.getElementById("resetGame");
const resetScoreButton = document.getElementById("resetScore");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const scoreDrawElement = document.getElementById("scoreDraw");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function getScore() {
  const savedScore = localStorage.getItem("tttScore");

  if (!savedScore) {
    return {
      X: 0,
      O: 0,
      draw: 0
    };
  }

  try {
    return JSON.parse(savedScore);
  } catch {
    return {
      X: 0,
      O: 0,
      draw: 0
    };
  }
}

function saveScore(score) {
  localStorage.setItem("tttScore", JSON.stringify(score));
}

function updateScoreDisplay() {
  if (!scoreXElement || !scoreOElement || !scoreDrawElement) return;

  const score = getScore();

  scoreXElement.textContent = score.X;
  scoreOElement.textContent = score.O;
  scoreDrawElement.textContent = score.draw;
}

function updateGameDisplay() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.disabled = gameOver || board[index] !== "";
    cell.classList.remove("winner");
  });

  if (currentPlayerElement) {
    currentPlayerElement.textContent = currentPlayer;
  }
}

function checkWinner() {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combination;
    }
  }

  return null;
}

function finishGame(winnerCombination) {
  gameOver = true;

  const winner = board[winnerCombination[0]];
  const score = getScore();

  score[winner] += 1;
  saveScore(score);
  updateScoreDisplay();

  winnerCombination.forEach((index) => {
    cells[index].classList.add("winner");
  });

  cells.forEach((cell) => {
    cell.disabled = true;
  });

  if (gameStatus) {
    gameStatus.textContent = `${winner} gewinnt. Stark gespielt.`;
  }
}

function finishDraw() {
  gameOver = true;

  const score = getScore();
  score.draw += 1;
  saveScore(score);
  updateScoreDisplay();

  cells.forEach((cell) => {
    cell.disabled = true;
  });

  if (gameStatus) {
    gameStatus.textContent = "Unentschieden. Sehr diplomatisch.";
  }
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (gameOver || board[index] !== "") return;

  board[index] = currentPlayer;

  const winnerCombination = checkWinner();

  if (winnerCombination) {
    updateGameDisplay();
    finishGame(winnerCombination);
    return;
  }

  if (board.every((cell) => cell !== "")) {
    updateGameDisplay();
    finishDraw();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (gameStatus) {
    gameStatus.textContent = `${currentPlayer} ist dran.`;
  }

  updateGameDisplay();
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameOver = false;

  if (gameStatus) {
    gameStatus.textContent = "X beginnt.";
  }

  updateGameDisplay();
}

function resetScore() {
  saveScore({
    X: 0,
    O: 0,
    draw: 0
  });

  updateScoreDisplay();
}

if (boardElement) {
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });

  if (resetGameButton) {
    resetGameButton.addEventListener("click", resetGame);
  }

  if (resetScoreButton) {
    resetScoreButton.addEventListener("click", resetScore);
  }

  updateScoreDisplay();
  updateGameDisplay();
}
