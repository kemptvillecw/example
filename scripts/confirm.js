document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("confirm-status");
  const messageEl = document.getElementById("confirm-message");
  const headingEl = document.getElementById("confirm-heading");
  const introEl = document.getElementById("confirm-intro");
  const retryEl = document.getElementById("confirm-retry");

  function showInvalidLink() {
    showResult("Invalid confirmation link",
      "This confirmation link is invalid or no longer active. Try the link in your most recent confirmation email, or sign up again to request a confirmation link. For pending subscriptions, confirmation emails can be requested once every 10 minutes.");
    retryEl.hidden = false;
  }

  function showResult(title, message, success = false) {
    headingEl.textContent = title;
    messageEl.textContent = title;
    introEl.textContent = success
      ? "Welcome to the Kemptville Creative Writers newsletter community."
      : "Your subscription could not be confirmed. See the details below.";
    statusEl.textContent = message;
    statusEl.className = "form-message " + (success ? "success" : "error");
  }

  const code = window.location.hash.replace("#code=", "").trim();
  if (!code || code.length < 10) {
    showInvalidLink();
    return;
  }

  try {
    const url = "https://script.google.com/macros/s/AKfycbwnZQsalwFQ1PxqV7UMCoCZz2032czonZH-1CRhcKAU-V-7r0tbhkOlCTF9N5r1L3ON/exec?code=" +
      encodeURIComponent(code);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Confirmation request failed");
    const json = await response.json();

    switch (json?.status) {
      case "confirmed":
        showResult("Subscription Confirmed!",
          "Thanks for joining Kemptville Creative Writers. You'll soon receive a welcome e-mail and then periodic newsletters.", true);
        break;
      case "already_confirmed":
        showResult("Already Confirmed",
          "Your subscription was already confirmed earlier. You're all set!", true);
        break;
      case "invalid_code":
        showInvalidLink();
        break;
      case "error":
        if (json.reason === "inactive_confirmation") {
          showInvalidLink();
          break;
        }
        showResult("Unable to confirm subscription", json.message || "Something went wrong. Please try again.");
        break;
      default:
        showResult("Unable to confirm subscription",
          "The confirmation service returned an unexpected response. Please try again later.");
    }
  } catch (_) {
    showResult("Unable to confirm subscription",
      "Could not confirm your subscription with the service. Please try again.");
  }
});
