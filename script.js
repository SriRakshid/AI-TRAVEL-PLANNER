const form = document.getElementById("planner-form");
const resultsCard = document.getElementById("results-card");
const resultsEmpty = document.getElementById("results-empty");
const results = document.getElementById("results");
const summaryTitle = document.getElementById("summary-title");
const summarySubtitle = document.getElementById("summary-subtitle");
const summaryChips = document.getElementById("summary-chips");
const costBreakdown = document.getElementById("cost-breakdown");
const itineraryTimeline = document.getElementById("itinerary-timeline");
const cityHero = document.getElementById("city-hero");
const cityImage = document.getElementById("city-image");
const cityImageLabel = document.getElementById("city-image-label");
const startDateInput = document.getElementById("start-date");
const templatesRow = document.getElementById("templates-row");

const CITY_COST_INDEX = {
  paris: 1.35,
  london: 1.4,
  "new york": 1.5,
  tokyo: 1.45,
  dubai: 1.3,
  singapore: 1.35,
  bali: 0.8,
  bangkok: 0.8,
  istanbul: 0.85,
  lisbon: 0.95,
  barcelona: 1.1,
  rome: 1.15,
};

const CITY_IMAGE_PRESETS = {
  paris: "paris skyline sunset",
  london: "london city skyline dusk",
  "new york": "new york city skyline night",
  tokyo: "tokyo city skyline night",
  dubai: "dubai marina skyline night",
  singapore: "singapore marina bay skyline night",
  bali: "bali rice terraces sunset",
  bangkok: "bangkok skyline temple sunset",
  istanbul: "istanbul skyline bosphorus sunset",
  lisbon: "lisbon city sunset viewpoint",
  barcelona: "barcelona skyline sagrada familia sunset",
  rome: "rome skyline colosseum sunset",
};

const BASE_PER_DAY = {
  stay: 80,
  food: 45,
  activities: 35,
};

function parseStartDate(value) {
  if (!value) return null;
  const d = new Date(value + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function normaliseCity(city) {
  return (city || "").trim().toLowerCase();
}

function getCostIndex(city) {
  const key = normaliseCity(city);
  return CITY_COST_INDEX[key] ?? 1;
}

function estimateCosts({ city, days, budget, style }) {
  const idx = getCostIndex(city);
  let stay = BASE_PER_DAY.stay * idx;
  let food = BASE_PER_DAY.food * idx;
  let activities = BASE_PER_DAY.activities * idx;

  if (style === "budget") {
    stay *= 0.7;
    food *= 0.8;
    activities *= 0.75;
  } else if (style === "premium") {
    stay *= 1.55;
    food *= 1.35;
    activities *= 1.5;
  }

  const perDay = stay + food + activities;
  const tripCore = perDay * days;
  const flights = 180 * idx + (style === "premium" ? 120 : style === "budget" ? -40 : 0);
  const buffer = tripCore * 0.08;

  const total = Math.round(tripCore + flights + buffer);

  const gap = budget > 0 ? budget - total : null;

  return {
    stayPerNight: Math.round(stay),
    foodPerDay: Math.round(food),
    activitiesPerDay: Math.round(activities),
    perDay: Math.round(perDay),
    coreTotal: Math.round(tripCore),
    flights: Math.round(flights),
    buffer: Math.round(buffer),
    total,
    gap,
  };
}

const BASE_ACTIVITIES = {
  morning: [
    "Neighbourhood walking tour",
    "Local café breakfast & people-watching",
    "Iconic viewpoint or city panorama",
    "Old town photo walk",
  ],
  afternoon: [
    "Key museum or gallery",
    "Food market & street snacks",
    "Boat or river cruise (if available)",
    "Hidden-gem neighbourhood exploration",
  ],
  evening: [
    "Sunset spot or rooftop view",
    "Dinner at a recommended local spot",
    "Night market or riverside walk",
    "Historic quarter by night",
  ],
};

function pick(list, seed) {
  if (!list.length) return "Explore at your own pace";
  const index = seed % list.length;
  return list[index];
}

function buildMapsLink(city, activity) {
  const q = encodeURIComponent(`${city} ${activity}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function getCityImageInfo(city) {
  const key = normaliseCity(city);
  const query = CITY_IMAGE_PRESETS[key] || `${city} city skyline`;
  const url = `https://source.unsplash.com/featured/?${encodeURIComponent(query)}`;
  return {
    url,
    label: `${city} · Inspiration photo`,
  };
}

function generateItinerary({ city, days, style, startDate }) {
  const plan = [];
  const factors = {
    budget: { morning: 0.85, afternoon: 0.9, evening: 0.9 },
    balanced: { morning: 1, afternoon: 1, evening: 1 },
    premium: { morning: 1.1, afternoon: 1.15, evening: 1.1 },
  };
  const factor =
    style === "budget" ? factors.budget : style === "premium" ? factors.premium : factors.balanced;

  for (let day = 1; day <= days; day++) {
    const slots = [];
    const calendarDate = startDate ? addDays(startDate, day - 1) : null;

    const morningTitle = pick(BASE_ACTIVITIES.morning, day + 1);
    const afternoonTitle = pick(BASE_ACTIVITIES.afternoon, day + 3);
    const eveningTitle = pick(BASE_ACTIVITIES.evening, day + 5);

    const morning = {
      timeOfDay: "Morning",
      title: morningTitle,
      mapUrl: buildMapsLink(city, morningTitle),
      intensity: factor.morning,
    };

    const afternoon = {
      timeOfDay: "Afternoon",
      title: afternoonTitle,
      mapUrl: buildMapsLink(city, afternoonTitle),
      intensity: factor.afternoon,
    };

    const evening = {
      timeOfDay: "Evening",
      title: eveningTitle,
      mapUrl: buildMapsLink(city, eveningTitle),
      intensity: factor.evening,
    };

    slots.push(morning, afternoon, evening);

    plan.push({
      day,
      label: day === 1 ? "Arrival & first impressions" : day === days ? "Farewell day" : "Explore deeper",
      calendarDate,
      slots,
    });
  }

  return plan;
}

function clearElement(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function formatCurrency(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

function renderSummary({ city, days, budget, style, cost, startDate }) {
  summaryTitle.textContent = `Trip to ${city}`;
  const styleLabel = style[0].toUpperCase() + style.slice(1);
  const parts = [`${days} day itinerary`];

  if (startDate instanceof Date && !Number.isNaN(startDate.getTime())) {
    const endDate = addDays(startDate, days - 1);
    parts.push(`${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`);
  }

  parts.push(`${styleLabel} travel style`);
  summarySubtitle.textContent = parts.join(" · ");

  clearElement(summaryChips);

  const chipConfigs = [
    { label: `${days} days`, accent: false },
    { label: budget ? `Budget: ${formatCurrency(budget)}` : "Budget not specified", accent: !!budget },
    { label: `Est. total: ${formatCurrency(cost.total)}`, accent: true },
  ];

  chipConfigs.forEach((chip) => {
    const span = document.createElement("span");
    span.className = `chip${chip.accent ? " accent" : ""}`;
    span.textContent = chip.label;
    summaryChips.appendChild(span);
  });
}

function renderCosts({ days, cost }) {
  clearElement(costBreakdown);

  const rows = [
    ["Stay (per night)", formatCurrency(cost.stayPerNight)],
    ["Food (per day)", formatCurrency(cost.foodPerDay)],
    ["Activities (per day)", formatCurrency(cost.activitiesPerDay)],
    ["Core trip (x" + days + ")", formatCurrency(cost.coreTotal)],
    ["Flights (est.)", formatCurrency(cost.flights)],
    ["Buffer & extras", formatCurrency(cost.buffer)],
    ["Total estimate", formatCurrency(cost.total)],
  ];

  for (const [label, value] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    costBreakdown.appendChild(dt);
    costBreakdown.appendChild(dd);
  }

  const highlight = document.createElement("p");
  highlight.className = "cost-highlight";

  if (typeof cost.gap === "number") {
    if (cost.gap >= 200) {
      highlight.textContent = `Your budget is about ${formatCurrency(cost.gap)} above this estimate – you could upgrade a hotel night or add a special experience.`;
    } else if (cost.gap >= 0) {
      highlight.textContent = `Your budget is roughly aligned with this plan. Always keep a small buffer for surprises.`;
    } else {
      highlight.textContent = `This plan is about ${formatCurrency(Math.abs(cost.gap))} above your budget. Consider removing a paid activity or shortening the trip by a day.`;
    }
  } else {
    highlight.textContent = "Adjust the sliders and budget to see how the estimate moves.";
  }

  costBreakdown.parentElement.appendChild(highlight);
}

function renderItinerary(plan, { city }) {
  clearElement(itineraryTimeline);

  plan.forEach((day) => {
    const wrapper = document.createElement("article");
    wrapper.className = "day-block";

    const header = document.createElement("div");
    header.className = "day-header";

    const titleWrap = document.createElement("div");
    titleWrap.className = "day-title";
    const title = document.createElement("span");
    title.textContent = `Day ${day.day}`;
    const subtitle = document.createElement("span");
    if (day.calendarDate instanceof Date && !Number.isNaN(day.calendarDate.getTime())) {
      subtitle.textContent = `${formatDisplayDate(day.calendarDate)} · ${day.label}`;
    } else {
      subtitle.textContent = day.label;
    }
    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const budgetPill = document.createElement("span");
    budgetPill.className = "day-budget";
    budgetPill.textContent = "Flexible day";

    header.appendChild(titleWrap);
    header.appendChild(budgetPill);

    const list = document.createElement("div");
    list.className = "slot-list";

    day.slots.forEach((slot) => {
      const item = document.createElement("div");
      item.className = "slot";

      const time = document.createElement("div");
      time.className = "slot-time";
      time.textContent = slot.timeOfDay;

      const titleEl = document.createElement("div");
      titleEl.className = "slot-title";
      titleEl.textContent = slot.title;

      const meta = document.createElement("div");
      meta.className = "slot-meta";

      const tag = document.createElement("span");
      tag.className = "slot-tag";
      tag.textContent = `Pace: ${slot.intensity < 0.9 ? "light" : slot.intensity > 1.05 ? "full" : "easy"}`;

      const link = document.createElement("a");
      link.className = "slot-link";
      link.href = slot.mapUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View on Maps";

      meta.appendChild(tag);
      meta.appendChild(link);

      item.appendChild(time);
      item.appendChild(titleEl);
      item.appendChild(meta);

      list.appendChild(item);
    });

    wrapper.appendChild(header);
    wrapper.appendChild(list);

    itineraryTimeline.appendChild(wrapper);
  });
}

function showResults() {
  resultsEmpty.hidden = true;
  results.hidden = false;
  results.classList.add("results-visible");
  if (resultsCard && typeof resultsCard.scrollIntoView === "function") {
    resultsCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderCityHero(city) {
  if (!cityHero || !cityImage || !cityImageLabel) return;
  const info = getCityImageInfo(city);
  cityImage.src = info.url;
  cityImage.alt = `Inspiration photo of ${city}`;
  cityImageLabel.textContent = info.label;
  cityHero.hidden = false;
  cityHero.classList.remove("city-hero--visible");
  // Force reflow so animation can replay
  void cityHero.offsetWidth;
  cityHero.classList.add("city-hero--visible");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cityRaw = form.city.value.trim();
  const days = Number(form.days.value) || 0;
  const budget = Number(form.budget.value) || 0;
  const style = form.style.value || "balanced";
  const startDateValue = form["start-date"].value;
  const startDate = parseStartDate(startDateValue);

  if (!cityRaw || days <= 0) {
    alert("Please provide at least a city and a valid number of days.");
    return;
  }

  const safeCity = cityRaw
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const cost = estimateCosts({ city: safeCity, days, budget, style });
  const plan = generateItinerary({ city: safeCity, days, style, startDate });

  renderSummary({ city: safeCity, days, budget, style, cost, startDate });
  renderCosts({ days, cost });
  renderItinerary(plan, { city: safeCity });
  renderCityHero(safeCity);
  showResults();
});

if (templatesRow) {
  templatesRow.querySelectorAll(".template-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const city = btn.getAttribute("data-city") || "";
      const days = btn.getAttribute("data-days") || "";
      const budget = btn.getAttribute("data-budget") || "";
      const style = btn.getAttribute("data-style") || "balanced";

      form.city.value = city;
      form.days.value = days;
      form.budget.value = budget;
      form.style.value = style;

      if (typeof form.requestSubmit === "function") {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    });
  });
}

if (startDateInput) {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  startDateInput.min = iso;
}
