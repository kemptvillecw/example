(function () {
  const events = Array.isArray(window.KCW_EVENTS) ? window.KCW_EVENTS : [];

  function parseLocalDate(date, time) {
    return new Date(`${date}T${time || "00:00"}:00`);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(parseLocalDate(date));
  }

  function formatShortDate(date) {
    return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric" }).format(parseLocalDate(date));
  }

  function formatDay(date) {
    return new Intl.DateTimeFormat("en-CA", { day: "2-digit" }).format(parseLocalDate(date));
  }

  function formatMonth(date) {
    return new Intl.DateTimeFormat("en-CA", { month: "short" }).format(parseLocalDate(date)).toUpperCase();
  }

  function formatTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(2000, 0, 1, hours, minutes);
    return new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit" }).format(date);
  }

  function typeClass(type) {
    return type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  function isPublished(event) { return event.status === "Published"; }

  function isFeatured(event, today) {
    if (!event.featured || !isPublished(event)) return false;
    if (event.featureStart && today < event.featureStart) return false;
    if (event.featureEnd && today > event.featureEnd) return false;
    return true;
  }

  function upcomingEvents(today) {
    return events.filter((event) => isPublished(event) && event.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  }

  function selectedHomepageEvent(today) {
    return events.find((event) => isFeatured(event, today)) || upcomingEvents(today)[0] || null;
  }

  function speakerMarkup(event, className) {
    if (!event.speaker) return "";
    const name = event.speakerUrl
      ? `<a href="${event.speakerUrl}" target="_blank" rel="noopener">${event.speaker}</a>`
      : event.speaker;
    return `<p class="${className}"><strong>${name}</strong>${event.speakerRole ? ` <span>· ${event.speakerRole}</span>` : ""}</p>`;
  }

  function renderEventMeta(event) {
    return `<div class="event-meta">
      <div><strong>Date</strong>${formatDate(event.date)}</div>
      <div><strong>Time</strong>${formatTime(event.startTime)}–${formatTime(event.endTime)}</div>
      <div><strong>Where</strong>${event.location}<br>${event.address}</div>
    </div>`;
  }

  function calendarUrl(event) {
    const start = event.date.replace(/-/g, "") + "T" + event.startTime.replace(":", "") + "00";
    const end = event.date.replace(/-/g, "") + "T" + event.endTime.replace(":", "") + "00";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${start}/${end}`,
      location: `${event.location}, ${event.address}`,
      details: event.description,
      ctz: event.timezone || "America/Toronto"
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function eventCard(event) {
    return `<article class="event-card">
      <div class="event-card-date" aria-label="${formatDate(event.date)}">
        <span>${formatMonth(event.date)}</span><strong>${formatDay(event.date)}</strong><small>${event.date.slice(0, 4)}</small>
      </div>
      <div class="event-card-body">
        <span class="event-type event-type-${typeClass(event.type)}">${event.type}</span>
        <h3>${event.eventTitle || event.title}</h3>
        ${speakerMarkup(event, "event-speaker")}
        <p>${event.description}</p>
        <div class="event-card-meta">${formatTime(event.startTime)}–${formatTime(event.endTime)} · ${event.location}</div>
        <a class="home-link" href="schedule.html#${event.id}">Event details →</a>
      </div>
    </article>`;
  }

  function renderFeatured() {
    const target = document.querySelector("[data-featured-event]");
    if (!target) return;
    const today = new Date().toISOString().slice(0, 10);
    const event = selectedHomepageEvent(today);

    if (!event) {
      target.innerHTML = `<div class="empty-event"><p class="eyebrow">What's next</p><h2>Our next event is being planned.</h2><p>Please check back soon or join the newsletter for updates.</p><a class="button button-primary" href="#newsletter">Join the newsletter</a></div>`;
      return;
    }

    target.dataset.eventId = event.id;
    target.innerHTML = `<div class="featured-event-date" aria-hidden="true">
        <span>${formatMonth(event.date)}</span><strong>${formatDay(event.date)}</strong><small>${event.date.slice(0, 4)}</small>
      </div>
      <div class="featured-event-content">
        <div class="featured-event-intro${event.image ? " featured-event-intro--with-image" : ""}">
          ${event.image ? `<img class="featured-event-photo" src="${event.image}" alt="${event.imageAlt || ""}" loading="lazy" decoding="async">` : ""}
          <div>
        <span class="event-type event-type-${typeClass(event.type)}">${isFeatured(event, today) ? "Featured Event · " + event.type : event.type}</span>
        ${speakerMarkup(event, "featured-speaker")}
        <h2>${event.eventTitle || event.title}</h2>
        <p class="featured-event-description">${event.description}</p>
          </div>
        </div>
        ${renderEventMeta(event)}
        <div class="event-actions">
          <a class="button button-primary" href="${calendarUrl(event)}" target="_blank" rel="noopener">Add to Calendar</a>
          <a class="button" href="${event.directions}" target="_blank" rel="noopener">Directions</a>
          <a class="button" href="schedule.html#${event.id}">Event Details</a>
        </div>
      </div>`;

    const photo = target.querySelector(".featured-event-photo");
    if (photo) {
      const usesSpeakerName = event.type === "Guest Speaker" || event.type === "Author" || event.speakerRole === "Author";
      const hoverText = usesSpeakerName ? event.speaker : event.hoverText;
      if (hoverText) photo.title = hoverText;
    }
  }

  function renderLearningOutcomes() {
    const target = document.querySelector("[data-event-outcomes]");
    if (!target) return;
    const today = new Date().toISOString().slice(0, 10);
    const event = selectedHomepageEvent(today);
    if (!event || (!event.learningTopic && !event.learningOutcome && !event.format)) {
      target.hidden = true;
      return;
    }
    const title = target.querySelector("[data-outcomes-title]");
    if (title) title.textContent = `What to expect: ${event.eventTitle || event.title}`;
    const explore = target.querySelector("[data-outcome-explore]");
    const leave = target.querySelector("[data-outcome-leave]");
    const format = target.querySelector("[data-outcome-format]");
    if (explore) explore.textContent = event.learningTopic || "Details will be added soon.";
    if (leave) leave.textContent = event.learningOutcome || "Details will be added soon.";
    if (format) format.textContent = event.format || "Details will be added soon.";
  }

  function renderUpcoming() {
    const target = document.querySelector("[data-upcoming-events]");
    if (!target) return;
    const today = new Date().toISOString().slice(0, 10);
    const selected = selectedHomepageEvent(today);
    const upcoming = upcomingEvents(today).filter((event) => !selected || event.id !== selected.id);
    const section = target.closest(".upcoming-section");
    if (!upcoming.length) {
      if (section) section.hidden = true;
      return;
    }
    target.innerHTML = upcoming.slice(0, 3).map(eventCard).join("");
  }

  function renderSchedule() {
    const target = document.querySelector("[data-schedule-events]");
    if (!target) return;
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = upcomingEvents(today);
    target.innerHTML = upcoming.length ? upcoming.map((event) => `<article class="schedule-event" id="${event.id}">
      <div class="schedule-event-date"><span>${formatMonth(event.date)}</span><strong>${formatDay(event.date)}</strong><small>${event.date.slice(0, 4)}</small></div>
      <div class="schedule-event-main">
        <span class="event-type event-type-${typeClass(event.type)}">${event.type}</span>
        <h2>${event.eventTitle || event.title}</h2>
        ${speakerMarkup(event, "event-speaker")}
        <p>${event.description}</p>
        <div class="schedule-details">
          <div><strong>When</strong>${formatDate(event.date)}<br>${formatTime(event.startTime)}–${formatTime(event.endTime)}</div>
          <div><strong>Where</strong>${event.location}<br>${event.address}</div>
          <div><strong>Learning focus</strong>${event.learningTopic || "Details to come"}</div>
        </div>
        <div class="event-actions"><a class="button button-primary" href="${calendarUrl(event)}" target="_blank" rel="noopener">Add to Calendar</a><a class="button" href="${event.directions}" target="_blank" rel="noopener">Directions</a></div>
      </div>
    </article>`).join("") : `<p class="empty-state panel">No upcoming events are currently published. Please check back soon.</p>`;
  }

  function renderArchive() {
    const target = document.querySelector("[data-event-archive]");
    if (!target) return;
    const today = new Date().toISOString().slice(0, 10);
    const past = events.filter((event) => isPublished(event) && event.date < today).sort((a, b) => b.date.localeCompare(a.date));
    target.innerHTML = past.length ? past.map(eventCard).join("") : `<div class="empty-state panel"><h2>The archive is ready to grow.</h2><p>Past workshops, guest speakers, craft talks, and special events will appear here automatically after their event dates.</p></div>`;
  }

  function renderAnnouncements() {
    const announcements = Array.isArray(window.KCW_ANNOUNCEMENTS) ? window.KCW_ANNOUNCEMENTS : [];
    const today = new Date().toISOString().slice(0, 10);
    const active = announcements.filter((item) => item.startDate <= today && item.endDate >= today);
    document.querySelectorAll("[data-announcements]").forEach((target) => {
      const location = target.dataset.announcements;
      const items = active.filter((item) => item.displayLocation === location || item.displayLocation === "both");
      target.innerHTML = items.map((item) => `<div class="announcement"><strong>Announcement</strong><span>${item.message}</span></div>`).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderFeatured();
    renderLearningOutcomes();
    renderUpcoming();
    renderSchedule();
    renderArchive();
    renderAnnouncements();
  });
})();
