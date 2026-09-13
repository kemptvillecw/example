document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("confirm-status");
  const messageEl = document.getElementById("confirm-message");

  const code = window.location.hash.replace("#code=", "").trim();
  console.log("[confirm.js] Extracted code:", code);
  console.log("[confirm.js] Code length:", code.length);


  console.log("[confirm.js] Page loaded");
  console.log("[confirm.js] Code from URL hash:", code);
  console.log("[confirm.js] Code length:", code.length);

  if (!code || code.length < 10) {
    console.error("[confirm.js] Invalid or missing code");
    messageEl.textContent = "Invalid confirmation link.";
    statusEl.textContent = "The link you followed is missing or expired.";
    statusEl.className = "form-message error";
    return;
  }

  try {
    const url = "https://script.google.com/macros/s/AKfycbwnZQsalwFQ1PxqV7UMCoCZz2032czonZH-1CRhcKAU-V-7r0tbhkOlCTF9N5r1L3ON/exec?code=" +
      encodeURIComponent(code);

    console.log("[confirm.js] Fetching URL:", url);

    const response = await fetch(url);

    console.log("[confirm.js] Fetch response status:", response.status);
    console.log("[confirm.js] Fetch response headers content-type:", response.headers.get("content-type"));

    const responseText = await response.text();
    console.log("[confirm.js] Raw response text:", responseText);

    let json;
    try {
      json = JSON.parse(responseText);
      console.log("[confirm.js] Parsed JSON:", json);
    } catch (parseErr) {
      console.error("[confirm.js] Failed to parse JSON:", parseErr);
      throw parseErr;
    }

    console.log("[confirm.js] json.status =", json.status);

    if (json.status === "confirmed") {
      console.log("[confirm.js] Status is CONFIRMED - showing success message");
      messageEl.textContent = "Subscription Confirmed!";
      statusEl.textContent =
        "Thanks for joining Kemptville Creative Writers. You'll soon receive a welcome e-mail and then periodic newsletters.";
      statusEl.className = "form-message success";
      return;
    }

    if (json.status === "already_confirmed") {
      console.log("[confirm.js] Status is ALREADY_CONFIRMED");
      messageEl.textContent = "Already Confirmed";
      statusEl.textContent =
        "Your subscription was already confirmed earlier. You're all set!";
      statusEl.className = "form-message success";
      return;
    }

    if (json.status === "invalid_code") {
      console.error("[confirm.js] Status is INVALID_CODE");
      messageEl.textContent = "Invalid Code";
      statusEl.textContent = "The confirmation code is invalid or expired.";
      statusEl.className = "form-message error";
      return;
    }

    if (json.status === "error") {
      console.error("[confirm.js] Backend returned error:", json.message);
      messageEl.textContent = "Error";
      statusEl.textContent = json.message || "Something went wrong.";
      statusEl.className = "form-message error";
      return;
    }

    // Fallback if status is unexpected
    console.warn("[confirm.js] Unexpected status:", json.status);
    messageEl.textContent = "Subscription Confirmed!";
    statusEl.textContent =
      "Thanks for joining Kemptville Creative Writers. You'll soon receive a welcome e-mail and then periodic newsletters.";
    statusEl.className = "form-message success";

  } catch (err) {
    console.error("[confirm.js] Caught exception:", err);
    console.error("[confirm.js] Error stack:", err.stack);
    messageEl.textContent = "Error";
    statusEl.textContent = "Could not reach the confirmation service. Please try again.";
    statusEl.className = "form-message error";
  }
});