document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-navigation");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");
  const contactStarted = document.getElementById("contact-form-started");

  if (contactForm && contactStarted) {
    contactStarted.value = String(Date.now());

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      contactStatus.className = "form-message error";
      contactStatus.textContent =
        "The contact form is ready for your preferred delivery service. Connect it to your mailbox before publishing this page.";
    });
  }
});
