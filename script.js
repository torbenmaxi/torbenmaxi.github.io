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
