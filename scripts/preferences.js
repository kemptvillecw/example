document.addEventListener("DOMContentLoaded", async () => {
  const m = document.getElementById("pref-message");
  const s = document.getElementById("pref-status");
  const f = document.getElementById("preferences-form");
  const e = document.getElementById("pref-email-display");
  const w = document.getElementById("pref-weekly");

  const c = new URLSearchParams(location.search).get("code");
  const base =
    "https://script.google.com/macros/s/AKfycbwnZQsalwFQ1PxqV7UMCoCZz2032czonZH-1CRhcKAU-V-7r0tbhkOlCTF9N5r1L3ON/exec";

  if (!c || c.length < 10) {
    m.textContent = "Invalid preferences link.";
    s.textContent = "The link you followed is missing or expired.";
    s.className = "form-message error";
    f.style.display = "none";
    return;
  }

  try {
    const r = await fetch(
      base + "?action=update_preferences&code=" + encodeURIComponent(c)
    );
    const j = await r.json();

    if (j.status !== "ok") throw 0;

    e.textContent = "Email: " + (j.email || "");
    w.checked = j.weekly_calendar === "Yes";
    m.textContent = "Update your newsletter preferences below.";
  } catch (_) {
    m.textContent = "Unable to load preferences.";
    s.textContent = "Please try again later.";
    s.className = "form-message error";
    f.style.display = "none";
    return;
  }

  f.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    s.className = "form-message";

    const b = f.querySelector("button");
    b.disabled = true;

    try {
      const d = new URLSearchParams({
        action: "save_preferences",
        code: c,
        weekly_calendar: w.checked ? "Yes" : "No",
      });

      const r = await fetch(base, {
        method: "POST",
        body: d,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const j = await r.json();

      if (j.status === "updated") {
        s.textContent = "Your preferences have been updated.";
        s.className = "form-message success";
      } else {
        throw 0;
      }
    } catch (_) {
      s.textContent = "Unable to update preferences.";
      s.className = "form-message error";
    }

    b.disabled = false;
  });
});
