document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("unsubscribe-status");
  const message = document.getElementById("unsubscribe-message");
  const heading = document.getElementById("unsubscribe-heading");

  const hash = window.location.hash;
  const code = hash.replace("#code=", "").trim();

  if (!code || code.length < 10) {
    heading.textContent = "Invalid unsubscribe link.";
    message.textContent = "The link you followed is missing or expired.";
    statusBox.classList.add("error");
    return;
  }

  const scriptUrl =
    "https://script.google.com/macros/s/AKfycbwTZO8G9_h2HiB-vw16-BrZLPtT-78m-_AX-te3QnlldN-gNptHR0tjAMz7IL9UwbkAXg/exec?action=unsubscribe&code=" +
    encodeURIComponent(code);

  try {
    fetch(scriptUrl).catch(() => {});
  } catch (_) {}

  heading.textContent = "You’ve been unsubscribed.";
  message.textContent =
    "You will no longer receive newsletter updates from Kemptville Creative Writers.";
  statusBox.classList.add("success");
});
