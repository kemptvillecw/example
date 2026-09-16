(function (root) {
  const ICAL = typeof module === "object" && module.exports ? require("./vendor/ical.min.js") : root.ICAL;

  function upcoming(text, options = {}) {
    if (!/^BEGIN:VCALENDAR\s*$/m.test(text)) throw new Error("Invalid calendar feed");
    const calendar = new ICAL.Component(ICAL.parse(text));
    ICAL.TimezoneService.reset();
    calendar.getAllSubcomponents("vtimezone").forEach((component) => {
      const tzid = component.getFirstPropertyValue("tzid");
      ICAL.TimezoneService.register(new ICAL.Timezone({ component, tzid }));
    });
    const now = options.now || new Date();
    const until = new Date(now);
    until.setUTCDate(until.getUTCDate() + (options.daysAhead || 21));
    const dayFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: options.timezone || "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit"
    });
    const today = dayFormatter.format(now);
    const cutoffDay = dayFormatter.format(until);
    const events = calendar.getAllSubcomponents("vevent").map((component) => new ICAL.Event(component));
    const output = new Map();
    function add(item, startDate, endDate) {
      if (item.component.getFirstPropertyValue("status") === "CANCELLED") return;
      if (!startDate || !endDate) throw new Error("Missing event date");
      const allDay = startDate.isDate;
      const start = allDay ? Date.parse(startDate.toString()) : startDate.toJSDate().getTime();
      const end = allDay ? Date.parse(endDate.toString()) : endDate.toJSDate().getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error("Invalid event date");
      if (allDay ? endDate.toString() <= today || startDate.toString() >= cutoffDay : end <= now.getTime() || start >= until.getTime()) return;
      output.set(`${item.uid}/${start}`, {
        title: item.summary || "", description: item.description || "", location: item.location || "", start, end, allDay
      });
    }
    let iterations = 0;
    events.forEach((event) => {
      if (event.isRecurrenceException()) return;
      if (event.component.getFirstPropertyValue("status") === "CANCELLED") return;
      if (!event.isRecurring()) {
        add(event, event.startDate, event.endDate);
        return;
      }
      const iterator = event.iterator();
      let occurrence;
      while ((occurrence = iterator.next())) {
        if (++iterations > 50000) throw new Error("Calendar recurrence limit exceeded");
        if (occurrence.toJSDate().getTime() >= until.getTime()) break;
        const detail = event.getOccurrenceDetails(occurrence);
        add(detail.item, detail.startDate, detail.endDate);
      }
    });
    // Also include an occurrence moved into the window from outside its original range.
    events.filter((event) => event.isRecurrenceException()).forEach((event) => add(event, event.startDate, event.endDate));
    return Array.from(output.values()).sort((a, b) => a.start - b.start || a.title.localeCompare(b.title));
  }
  if (typeof module === "object" && module.exports) module.exports = { upcoming };
  else root.KCWCalendarFeed = { upcoming };
})(typeof globalThis === "object" ? globalThis : this);
