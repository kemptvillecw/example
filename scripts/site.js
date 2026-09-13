document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open", !expanded);
    });
  }

  const formStarted = document.getElementById("form_started");
  if (formStarted) {
    formStarted.value = Date.now();
  }

  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("input", () => {
      const interacted = newsletterForm.querySelector('input[name="interacted"]');
      if (interacted) {
        interacted.value = "yes";
      }
    });
  }
});
