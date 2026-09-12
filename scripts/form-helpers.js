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
        redirect: "manual"
      });

      let result;
      try {
        result = await response.json();
      } catch {
        result = { status: "success" };
      }

      if (result.status === "success" || result.status === "ok") {
        messageBox.textContent =
          "Thanks! Please check your inbox for a confirmation link.";
        messageBox.classList.add("success");

        if (submitButton) {
          submitButton.disabled = result.disable === true;
        }

        form.reset();
        restoreSpamFields();
      } else if (result.status === "error") {
        messageBox.textContent =
          result.message || "Unable to complete your subscription. Please try again.";
        messageBox.classList.add("error");
        if (submitButton) submitButton.disabled = false;
      } else {
        messageBox.textContent =
          "Thanks! Please check your inbox for a confirmation link.";
        messageBox.classList.add("success");
        if (submitButton) submitButton.disabled = false;
        form.reset();
        restoreSpamFields();
      }
    } catch (err) {
      messageBox.textContent =
        "We couldn't reach the newsletter service right now. Please try again later.";
      messageBox.classList.add("error");
      if (submitButton) submitButton.disabled = false;
    } finally {
      if (submitButton && !submitButton.disabled) {
        submitButton.textContent = defaultButtonText;
      }
    }
  });
});
