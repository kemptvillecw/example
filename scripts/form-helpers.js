document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  const started = document.getElementById("form_started");

  if (!form) return;

  if (started) {
    started.value = String(Date.now());
  }

  form.addEventListener("input", () => {
    const interacted = form.querySelector('input[name="interacted"]');
    if (interacted) interacted.value = "yes";
  });
});
