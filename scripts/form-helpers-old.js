document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  const message = document.getElementById("newsletter-message");

  if (!form || !message) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    message.className = "form-message";
    message.textContent = "";

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Joining…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
      });

      let json = null;

      try {
        json = await response.json();
      } catch (_) {
        json = { status: "ok" };
      }

      if (json.status === "error") {
        message.textContent =
          json.message ||
          "Unable to complete your subscription. Please try again.";
        message.classList.add("error");
      } else {
        message.textContent =
          "Thanks! Please check your inbox for a confirmation link.";
        message.classList.add("success");
        form.reset();
      }
    } catch (_) {
      message.textContent =
        "We couldn't reach the newsletter service right now. Please try again later.";
      message.classList.add("error");
    } finally {
      button.disabled = false;
      button.textContent = "Join Newsletter";
    }
  });
});
