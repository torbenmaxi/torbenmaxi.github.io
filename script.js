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
