document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("unsubscribe-status");
  const messageEl = document.getElementById("unsubscribe-message");
  const button = document.getElementById("unsubscribe-confirm");

  const code = (new URLSearchParams(location.hash.slice(1)).get("code") || "").trim();

  if (!code || code.length < 10) {
    messageEl.textContent = "Invalid unsubscribe link.";
    statusEl.textContent = "The link you followed is missing or expired.";
    statusEl.className = "form-message error";
    return;
  }

  button.hidden = false;
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    statusEl.className = "form-message";
    statusEl.textContent = "Unsubscribing…";
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwnZQsalwFQ1PxqV7UMCoCZz2032czonZH-1CRhcKAU-V-7r0tbhkOlCTF9N5r1L3ON/exec",
        { method: "POST", body: new URLSearchParams({ action: "unsubscribe", code }) }
      );
      if (!response.ok) throw new Error("Request failed");
      const result = await response.json();
      if (result.status !== "unsubscribed") throw new Error("Unsubscribe not confirmed");

      messageEl.textContent = "You’ve been unsubscribed.";
      statusEl.textContent =
        "You will no longer receive updates from Kemptville Creative Writers.";
      statusEl.className = "form-message success";
      button.hidden = true;
    } catch (_) {
      statusEl.textContent = "We could not confirm your unsubscribe request. Please try again.";
      statusEl.className = "form-message error";
      button.disabled = false;
    }
  });
});
