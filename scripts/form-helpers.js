document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  const messageBox = document.getElementById("newsletter-message");

  if (!form || !messageBox) return;

  const CHECKSUM = "abc123";
  const MIN_SUBMIT_MS = 3000;

  function restoreSpamFields() {
    const formStarted = form.querySelector("#form_started");
    if (formStarted) formStarted.value = Date.now();

    const interacted = form.querySelector('input[name="interacted"]');
    if (interacted) interacted.value = "no";

    const checksum = form.querySelector('input[name="checksum"]');
    if (checksum) checksum.value = CHECKSUM;

    const honeypot = form.querySelector("#middle_name");
    if (honeypot) honeypot.value = "";
  }

  function isBotSubmission() {
    const honeypot = form.querySelector("#middle_name");
    if (honeypot && honeypot.value.trim()) return true;

    const checksum = form.querySelector('input[name="checksum"]');
    if (checksum && checksum.value !== CHECKSUM) return true;

    return false;
  }

  function isTooFast() {
    const formStarted = form.querySelector("#form_started");
    if (!formStarted || !formStarted.value) return true;
    return Date.now() - Number(formStarted.value) < MIN_SUBMIT_MS;
  }

  function showFakeSuccess() {
    messageBox.textContent =
      "Thanks! Please check your inbox for a confirmation link.";
    messageBox.classList.add("success");
    form.reset();
    restoreSpamFields();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    messageBox.className = "form-message";
    messageBox.textContent = "";

    const submitButton = form.querySelector("button[type='submit']");
    const defaultButtonText = submitButton ? submitButton.textContent : "Join Newsletter";
    if (submitButton?.disabled) return;

    if (isBotSubmission()) {
      showFakeSuccess();
      return;
    }

    if (isTooFast()) {
      messageBox.textContent = "Please wait a moment before submitting.";
      messageBox.classList.add("error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Joining…";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        redirect: "follow"
      });

      if (!response.ok) throw new Error("Signup request failed");
      const result = await response.json();

      if (result.status === "success" || result.status === "ok") {
        messageBox.textContent =
          "Thanks! Please check your inbox for a confirmation link.";
        messageBox.classList.add("success");

        if (submitButton) {
          submitButton.disabled = result.disable === true;
        }

        form.reset();
        restoreSpamFields();
      } else if (result.status === "email_not_accepted") {
        const seconds = Number(result.retry_after_seconds);
        const minutes = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds / 60) : 10;
        messageBox.textContent = result.message ||
          "Your subscription is awaiting confirmation, but email acceptance could not be confirmed. Please try again in " +
          minutes + (minutes === 1 ? " minute." : " minutes.");
        messageBox.classList.add("error");
        if (submitButton) submitButton.disabled = false;
      } else if (result.status === "already_pending") {
        const seconds = Number(result.retry_after_seconds);
        const minutes = Number.isFinite(seconds) && seconds > 0
          ? Math.ceil(seconds / 60) : 10;
        messageBox.textContent = "Your subscription is awaiting confirmation. Check your inbox and spam folder. You can request another confirmation email in " +
          minutes + (minutes === 1 ? " minute." : " minutes.");
        if (submitButton) submitButton.disabled = false;
      } else if (result.status === "confirmation_resent" ||
                 result.status === "already_confirmed" ||
                 result.status === "resubscribed") {
        const messages = {
          confirmation_resent: "Your confirmation email has been resent. Please check your inbox and spam folder. You can request another email in 10 minutes.",
          already_confirmed: "You're already subscribed. No further confirmation is needed.",
          resubscribed: "Please check your inbox for a new confirmation link to reactivate your subscription.",
        };
        messageBox.textContent = messages[result.status];
        messageBox.classList.add("success");
        if (submitButton) submitButton.disabled = false;
        form.reset();
        restoreSpamFields();
      } else {
        messageBox.textContent = result.status === "error"
          ? result.message || "Unable to complete your subscription. Please try again."
          : "The newsletter service returned an unexpected response. Please try again later.";
        messageBox.classList.add("error");
        if (submitButton) submitButton.disabled = false;
      }
    } catch (err) {
      messageBox.textContent =
        "We couldn't reach the newsletter service right now. Please try again later.";
      messageBox.classList.add("error");
      if (submitButton) submitButton.disabled = false;
    } finally {
      if (submitButton) {
        submitButton.textContent = defaultButtonText;
      }
    }
  });
});
