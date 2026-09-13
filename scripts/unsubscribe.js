document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("unsubscribe-status");
  const messageEl = document.getElementById("unsubscribe-message");

  const code = window.location.hash.replace("#code=", "").trim();

  if (!code || code.length < 10) {
    messageEl.textContent = "Invalid unsubscribe link.";
    statusEl.textContent = "The link you followed is missing or expired.";
    statusEl.className = "form-message error";
    return;
  }

  fetch(
    "https://script.google.com/macros/s/AKfycbwnZQsalwFQ1PxqV7UMCoCZz2032czonZH-1CRhcKAU-V-7r0tbhkOlCTF9N5r1L3ON/exec" +
      "?action=unsubscribe&code=" +
      encodeURIComponent(code)
  ).catch(() => {});

  messageEl.textContent = "You’ve been unsubscribed.";
  statusEl.textContent =
    "You will no longer receive updates from Kemptville Creative Writers.";
  statusEl.className = "form-message success";
});
