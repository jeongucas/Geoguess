/* ============================= DATA ============================= */
const LOCATIONS = {
  easy: [
    { name: "Paris, France", lat: 48.8584, lng: 2.2945 },
    { name: "New York City, USA", lat: 40.758, lng: -73.9855 },
    { name: "Sydney, Australia", lat: -33.8568, lng: 151.2153 },
    { name: "Rome, Italy", lat: 41.8902, lng: 12.4922 },
    { name: "London, UK", lat: 51.5007, lng: -0.1246 },
    { name: "San Francisco, USA", lat: 37.8199, lng: -122.4783 },
    { name: "Tokyo, Japan", lat: 35.6595, lng: 139.7005 },
    { name: "Moscow, Russia", lat: 55.7539, lng: 37.6208 },
    { name: "Berlin, Germany", lat: 52.5163, lng: 13.3777 },
    { name: "Rio de Janeiro, Brazil", lat: -22.9711, lng: -43.1822 },
    { name: "Singapore", lat: 1.2834, lng: 103.8607 },
    { name: "Dubai, UAE", lat: 25.1972, lng: 55.2744 },
    { name: "Toronto, Canada", lat: 43.6426, lng: -79.3871 },
    { name: "Los Angeles, USA", lat: 34.1016, lng: -118.3269 },
    { name: "Las Vegas, USA", lat: 36.1147, lng: -115.1728 },
    { name: "Niagara Falls, Canada", lat: 43.0962, lng: -79.0377 },
    { name: "Amsterdam, Netherlands", lat: 52.3676, lng: 4.9041 },
    { name: "Barcelona, Spain", lat: 41.3851, lng: 2.1734 },
  ],
  medium: [
    { name: "Prague, Czechia", lat: 50.0875, lng: 14.4213 },
    { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681 },
    { name: "Cape Town, South Africa", lat: -33.9028, lng: 18.4187 },
    { name: "Reykjavik, Iceland", lat: 64.1466, lng: -21.9426 },
    { name: "Marrakech, Morocco", lat: 31.6295, lng: -7.9811 },
    { name: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816 },
    { name: "Vienna, Austria", lat: 48.2082, lng: 16.3738 },
    { name: "Dublin, Ireland", lat: 53.3498, lng: -6.2603 },
    { name: "Seoul, South Korea", lat: 37.4979, lng: 127.0276 },
    { name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018 },
    { name: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332 },
    { name: "Lisbon, Portugal", lat: 38.7223, lng: -9.1393 },
    { name: "Budapest, Hungary", lat: 47.4979, lng: 19.0402 },
    { name: "Melbourne, Australia", lat: -37.8136, lng: 144.9631 },
    { name: "Warsaw, Poland", lat: 52.2297, lng: 21.0122 },
    { name: "Edinburgh, Scotland", lat: 55.9533, lng: -3.1883 },
    { name: "Krakow, Poland", lat: 50.0647, lng: 19.945 },
    { name: "Wellington, New Zealand", lat: -41.2865, lng: 174.7762 },
  ],
  hard: [
    { name: "Rural Iowa, USA", lat: 42.0329, lng: -93.62 },
    { name: "Patagonia, Argentina", lat: -49.3312, lng: -72.8867 },
    { name: "Provence, France", lat: 43.9352, lng: 4.8956 },
    { name: "Fiordland, New Zealand", lat: -45.4167, lng: 167.7167 },
    { name: "Western Norway", lat: 61.0, lng: 6.6 },
    { name: "Hokkaido, Japan", lat: 43.2203, lng: 142.8635 },
    { name: "Karoo, South Africa", lat: -32.2968, lng: 22.1234 },
    { name: "Scottish Highlands", lat: 57.2, lng: -4.5 },
    { name: "Saskatchewan, Canada", lat: 51.0, lng: -106.0 },
    { name: "Rural Poland", lat: 51.9, lng: 19.1 },
    { name: "Rajasthan, India", lat: 27.0, lng: 74.0 },
    { name: "Minas Gerais, Brazil", lat: -19.9, lng: -43.9 },
    { name: "Rural Victoria, Australia", lat: -37.55, lng: 143.85 },
    { name: "Montana, USA", lat: 46.5, lng: -110.0 },
    { name: "Bavaria, Germany", lat: 48.5, lng: 11.5 },
    { name: "Rural Wales", lat: 52.3, lng: -3.6 },
    { name: "Rural Finland", lat: 62.5, lng: 26.0 },
    { name: "Rural Chile (Atacama)", lat: -23.65, lng: -70.4 },
  ],
};

const DIFF_CONFIG = {
  easy: {
    radius: 8000,
    scale: 2000,
    roadLabels: true,
    links: true,
    clickToGo: true,
    zoom: 1.4,
    timeLimit: 0,
  },
  medium: {
    radius: 20000,
    scale: 1400,
    roadLabels: false,
    links: true,
    clickToGo: true,
    zoom: 1.7,
    timeLimit: 60,
  },
  hard: {
    radius: 60000,
    scale: 900,
    roadLabels: false,
    links: false,
    clickToGo: false,
    zoom: 2.0,
    timeLimit: 45,
  },
};

/* ============================= STATE ============================= */
let state = {
  apiKey: null,
  username: null,
  difficulty: null,
  round: 0,
  totalScore: 0,
  usedNames: [],
  roundResults: [],
  currentLocation: null,
  currentGuess: null,
  panorama: null,
  guessMap: null,
  guessMarker: null,
  resultMap: null,
  roundTimerId: null,
  timeLeft: 0,
  timerExpired: false,
};

/* ============================= STORAGE (safe wrapper) ============================= */
// window.storage only exists inside the claude.ai artifact environment, where it's
// shared across everyone who plays there. When it's missing OR it exists but fails
// (e.g. the feature isn't enabled for this session), fall back to localStorage so
// data (including the leaderboard) still persists permanently on that device/browser.
// If even localStorage is blocked (e.g. sandboxed iframe), fall back to in-memory
// (works for the current tab only, resets on reload).
const _memoryStore = {};
const LS_PREFIX = "geodispatch:";
function lsAvailable() {
  try {
    const t = "__geodispatch_test__";
    window.localStorage.setItem(t, "1");
    window.localStorage.removeItem(t);
    return true;
  } catch (e) {
    return false;
  }
}

let _storageMode = null; // 'cloud' | 'local' | 'memory' — decided once, used consistently
async function detectStorageMode() {
  if (window.storage) {
    try {
      const probe = "__geodispatch_probe__";
      await window.storage.set(probe, "1", false);
      await window.storage.get(probe, false);
      await window.storage.delete(probe, false);
      return "cloud";
    } catch (e) {
      /* cloud storage present but not working — fall through */
    }
  }
  return lsAvailable() ? "local" : "memory";
}

const storageAPI = {
  async get(key, shared) {
    if (_storageMode === "cloud") return window.storage.get(key, !!shared);
    const k = (shared ? "s:" : "p:") + key;
    if (_storageMode === "local") {
      const v = window.localStorage.getItem(LS_PREFIX + k);
      if (v === null) throw new Error("not found");
      return { key, value: v, shared: !!shared };
    }
    if (!(k in _memoryStore)) throw new Error("not found");
    return { key, value: _memoryStore[k], shared: !!shared };
  },
  async set(key, value, shared) {
    if (_storageMode === "cloud")
      return window.storage.set(key, value, !!shared);
    const k = (shared ? "s:" : "p:") + key;
    if (_storageMode === "local") {
      window.localStorage.setItem(LS_PREFIX + k, value);
    } else {
      _memoryStore[k] = value;
    }
    return { key, value, shared: !!shared };
  },
  async delete(key, shared) {
    if (_storageMode === "cloud") return window.storage.delete(key, !!shared);
    const k = (shared ? "s:" : "p:") + key;
    if (_storageMode === "local") {
      window.localStorage.removeItem(LS_PREFIX + k);
    } else {
      delete _memoryStore[k];
    }
    return { key, deleted: true, shared: !!shared };
  },
  async list(prefix, shared) {
    if (_storageMode === "cloud") return window.storage.list(prefix, !!shared);
    const pre = (shared ? "s:" : "p:") + (prefix || "");
    if (_storageMode === "local") {
      const fullPre = LS_PREFIX + pre;
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const lk = window.localStorage.key(i);
        if (lk && lk.startsWith(fullPre))
          keys.push(lk.slice(LS_PREFIX.length + 2));
      }
      return { keys, prefix, shared: !!shared };
    }
    const keys = Object.keys(_memoryStore)
      .filter((k) => k.startsWith(pre))
      .map((k) => k.slice(2));
    return { keys, prefix, shared: !!shared };
  },
};

/* ============================= UTIL ============================= */
function show(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sanitizeKey(s) {
  return s.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60);
}
function ratingFor(score) {
  if (score >= 4600)
    return { label: "Bullseye", note: "Practically standing on the spot." };
  if (score >= 3800)
    return { label: "Excellent", note: "That's a trained eye." };
  if (score >= 2800)
    return { label: "Great", note: "Solid read of the terrain." };
  if (score >= 1800)
    return { label: "Good", note: "In the right neighborhood." };
  if (score >= 800) return { label: "Fair", note: "Right region, wrong spot." };
  return { label: "Way Off", note: "Back to the atlas with you." };
}
function calcScore(distanceKm, difficulty) {
  const scale = DIFF_CONFIG[difficulty].scale;
  const raw = 5000 * Math.exp(-distanceKm / scale);
  return Math.max(0, Math.min(5000, Math.round(raw)));
}
function fmtKm(km) {
  if (km < 1) return Math.round(km * 1000) + " m";
  if (km < 100) return km.toFixed(1) + " km";
  return Math.round(km) + " km";
}

function updateTimeDisplay() {
  const hud = document.getElementById("hudTime");
  if (!hud) return;
  const limit = DIFF_CONFIG[state.difficulty].timeLimit;
  hud.textContent = limit > 0 ? `${state.timeLeft}s` : "∞";
}

function stopRoundTimer() {
  if (state.roundTimerId) {
    clearInterval(state.roundTimerId);
    state.roundTimerId = null;
  }
}

function startRoundTimer() {
  stopRoundTimer();
  state.timerExpired = false;
  const limit = DIFF_CONFIG[state.difficulty].timeLimit;
  state.timeLeft = limit;
  updateTimeDisplay();
  if (limit <= 0) return;

  state.roundTimerId = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      stopRoundTimer();
      state.timeLeft = 0;
      state.timerExpired = true;
      updateTimeDisplay();
      const submitBtn = document.getElementById("submitGuessBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Time’s Up";
      submitGuess({ timedOut: true });
      return;
    }
    updateTimeDisplay();
  }, 1000);
}

/* ============================= EMBEDDED API KEY ============================= */
// Baked in so anyone opening this file can play without entering a key.
// NOTE: anyone with this file can read this key out of the source. Restrict it
// by HTTP referrer in Google Cloud Console to limit where it can be used.
const EMBEDDED_API_KEY = "AIzaSyBK8Gk-_t3YMh5L-E96Vj7j7T-PL09C1rA";

/* ============================= GOOGLE MAPS LOADING ============================= */
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    window.__gmapsReady = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=geometry&callback=__gmapsReady`;
    script.async = true;
    script.onerror = () =>
      reject(
        new Error(
          "Could not load Google Maps. Check the API key and that the required APIs are enabled.",
        ),
      );
    document.head.appendChild(script);
  });
}

/* ============================= SETUP / LOGIN FLOW ============================= */
async function init() {
  let storedProfile = null;
  try {
    const r = await storageAPI.get("profile", false);
    storedProfile = r ? JSON.parse(r.value) : null;
  } catch (e) {}

  state.apiKey = EMBEDDED_API_KEY;
  try {
    await loadGoogleMaps(EMBEDDED_API_KEY);
    if (storedProfile && storedProfile.username) {
      state.username = storedProfile.username;
      goToMenu();
    } else {
      show("screen-login");
    }
  } catch (e) {
    document.getElementById("setupError").style.display = "block";
    document.getElementById("setupError").textContent = e.message;
    show("screen-setup");
  }
}

document.getElementById("retryBtn").addEventListener("click", () => init());

document.getElementById("loginBtn").addEventListener("click", async () => {
  const name = document.getElementById("usernameInput").value.trim();
  if (!name) return;
  state.username = name;
  try {
    await storageAPI.set("profile", JSON.stringify({ username: name }), false);
  } catch (e) {}
  goToMenu();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  state.username = null;
  document.getElementById("usernameInput").value = "";
  try {
    await storageAPI.delete("profile", false);
  } catch (e) {}
  show("screen-login");
});

function goToMenu() {
  document.getElementById("menuGreeting").textContent =
    `Field Dispatch · Welcome back, ${state.username}`;
  show("screen-menu");
}

document.querySelectorAll(".diff-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    startGame(btn.dataset.diff);
  });
});

document
  .getElementById("viewLeaderboardBtn")
  .addEventListener("click", () => openLeaderboard());
document
  .getElementById("finalLeaderboardBtn")
  .addEventListener("click", () => openLeaderboard());
document
  .getElementById("lbBackBtn")
  .addEventListener("click", () => goToMenu());
document
  .getElementById("finalMenuBtn")
  .addEventListener("click", () => goToMenu());

/* ============================= GAME FLOW ============================= */
function startGame(difficulty) {
  state.difficulty = difficulty;
  state.round = 0;
  state.totalScore = 0;
  state.usedNames = [];
  state.roundResults = [];
  document.getElementById("hudDiff").textContent = difficulty.toUpperCase();
  document.getElementById("hudDiff").className = "badge diff-" + difficulty;
  nextRound();
}

async function nextRound() {
  state.round += 1;
  state.currentGuess = null;
  document.getElementById("submitGuessBtn").disabled = true;
  document.getElementById("submitGuessBtn").textContent = "Submit Guess";
  document.getElementById("hudRound").textContent = `${state.round} / 5`;
  document.getElementById("hudScore").textContent = state.totalScore;
  show("screen-game");

  const loc = await pickLocation(state.difficulty);
  state.currentLocation = loc;
  setupPanorama(loc);
  setupGuessMap();
  startRoundTimer();
}

async function pickLocation(difficulty) {
  const cfg = DIFF_CONFIG[difficulty];
  const pool = shuffle(
    LOCATIONS[difficulty].filter((l) => !state.usedNames.includes(l.name)),
  );
  const svService = new google.maps.StreetViewService();

  for (const loc of pool) {
    const panoLatLng = await new Promise((resolve) => {
      svService.getPanorama(
        {
          location: { lat: loc.lat, lng: loc.lng },
          radius: cfg.radius,
          source: google.maps.StreetViewSource.OUTDOOR,
        },
        (data, status) => {
          if (status === "OK") {
            resolve(data.location.latLng);
          } else resolve(null);
        },
      );
    });
    if (panoLatLng) {
      state.usedNames.push(loc.name);
      return { name: loc.name, lat: panoLatLng.lat(), lng: panoLatLng.lng() };
    }
  }
  // Fallback: reuse first pool entry's raw coords even without confirmed panorama
  const fallback = pool[0] || LOCATIONS[difficulty][0];
  state.usedNames.push(fallback.name);
  return { name: fallback.name, lat: fallback.lat, lng: fallback.lng };
}

function setupPanorama(loc) {
  const cfg = DIFF_CONFIG[state.difficulty];
  state.panorama = new google.maps.StreetViewPanorama(
    document.getElementById("pano"),
    {
      position: { lat: loc.lat, lng: loc.lng },
      pov: { heading: Math.floor(Math.random() * 360), pitch: 0 },
      zoom: 0,
      addressControl: false,
      showRoadLabels: cfg.roadLabels,
      linksControl: cfg.links,
      clickToGo: cfg.clickToGo,
      panControl: true,
      zoomControl: true,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
    },
  );
}

function setupGuessMap() {
  const cfg = DIFF_CONFIG[state.difficulty];
  const container = document.getElementById("guessMap");
  container.innerHTML = "";
  state.guessMarker = null;
  state.guessMap = new google.maps.Map(container, {
    center: { lat: 15, lng: 10 },
    zoom: cfg.zoom,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    clickableIcons: false,
  });
  state.guessMap.addListener("click", (e) => {
    if (state.timerExpired) return;
    if (state.guessMarker) state.guessMarker.setMap(null);
    state.guessMarker = new google.maps.Marker({
      position: e.latLng,
      map: state.guessMap,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#14D6C0",
        fillOpacity: 1,
        strokeColor: "#1A0F3D",
        strokeWeight: 2,
      },
    });
    state.currentGuess = e.latLng;
    document.getElementById("submitGuessBtn").disabled = false;
  });

  const panel = document.getElementById("guessPanel");
  panel.addEventListener("click", () => panel.classList.toggle("expanded"));
}

document
  .getElementById("submitGuessBtn")
  .addEventListener("click", submitGuess);

function submitGuess({ timedOut = false } = {}) {
  if (!state.currentGuess && !timedOut) return;
  stopRoundTimer();
  const actual = new google.maps.LatLng(
    state.currentLocation.lat,
    state.currentLocation.lng,
  );
  let distKm = null;
  let score = 0;

  if (state.currentGuess) {
    const distMeters = google.maps.geometry.spherical.computeDistanceBetween(
      state.currentGuess,
      actual,
    );
    distKm = distMeters / 1000;
    score = calcScore(distKm, state.difficulty);
  }

  state.totalScore += score;

  state.roundResults.push({
    round: state.round,
    name: state.currentLocation.name,
    distanceKm: distKm,
    score: score,
    timedOut: timedOut && !state.currentGuess,
  });

  showRoundResult(distKm, score, actual);
}

function showRoundResult(distKm, score, actualLatLng) {
  const rating = ratingFor(score);
  document.getElementById("rrScore").textContent = score;
  document.getElementById("rrRating").textContent = rating.label;
  document.getElementById("rrDistance").textContent =
    distKm === null
      ? "No guess submitted"
      : `${fmtKm(distKm)} from the true spot`;
  document.getElementById("rrLocation").textContent = "Locating…";

  const container = document.getElementById("resultMap");
  container.innerHTML = "";
  const rmap = new google.maps.Map(container, {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
  });
  const bounds = new google.maps.LatLngBounds();
  new google.maps.Marker({
    position: state.currentGuess,
    map: rmap,
    label: { text: "G", color: "#fff", fontSize: "11px" },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#14D6C0",
      fillOpacity: 1,
      strokeColor: "#1A0F3D",
      strokeWeight: 2,
    },
  });
  new google.maps.Marker({
    position: actualLatLng,
    map: rmap,
    label: { text: "A", color: "#fff", fontSize: "11px" },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#FF6B6B",
      fillOpacity: 1,
      strokeColor: "#1A0F3D",
      strokeWeight: 2,
    },
  });
  new google.maps.Polyline({
    path: [state.currentGuess, actualLatLng],
    geodesic: true,
    strokeColor: "#9B6BFF",
    strokeOpacity: 0.9,
    strokeWeight: 2.5,
    icons: [
      {
        icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
        offset: "0",
        repeat: "12px",
      },
    ],
    map: rmap,
  });
  bounds.extend(state.currentGuess);
  bounds.extend(actualLatLng);
  rmap.fitBounds(bounds, 60);

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: actualLatLng }, (results, status) => {
    let label = state.currentLocation.name;
    if (status === "OK" && results && results[0]) {
      const comps = results[0].address_components || [];
      const country = comps.find((c) => c.types.includes("country"));
      const admin = comps.find((c) =>
        c.types.includes("administrative_area_level_1"),
      );
      const locality = comps.find((c) => c.types.includes("locality"));
      label =
        [
          locality && locality.long_name,
          admin && admin.long_name,
          country && country.long_name,
        ]
          .filter(Boolean)
          .join(", ") || label;
    }
    document.getElementById("rrLocation").textContent =
      `You were dropped near ${label}`;
  });

  show("screen-round-result");
}

document.getElementById("nextRoundBtn").addEventListener("click", () => {
  if (state.round >= 5) {
    showFinal();
  } else {
    nextRound();
  }
});

/* ============================= FINAL SCREEN ============================= */
async function showFinal() {
  document.getElementById("finalScore").textContent = state.totalScore;
  const rating = ratingFor(Math.round(state.totalScore / 5));
  document.getElementById("finalRating").textContent =
    rating.label + " Field Agent";
  document.getElementById("finalSub").textContent = rating.note;

  const tbody = document.getElementById("breakdownBody");
  tbody.innerHTML = "";
  state.roundResults.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.round}</td><td>${r.name}</td><td>${fmtKm(r.distanceKm)}</td><td>${r.score}</td>`;
    tbody.appendChild(tr);
  });

  show("screen-final");

  const key = `leaderboard:${Date.now()}_${sanitizeKey(state.username)}`;
  try {
    await storageAPI.set(
      key,
      JSON.stringify({
        username: state.username,
        difficulty: state.difficulty,
        score: state.totalScore,
        date: new Date().toISOString(),
      }),
      true,
    );
  } catch (e) {
    /* leaderboard save is best-effort */
  }
}

document
  .getElementById("playAgainBtn")
  .addEventListener("click", () => goToMenu());

/* ============================= LEADERBOARD ============================= */
let lbFilter = "all";
async function openLeaderboard() {
  show("screen-leaderboard");
  const note = document.getElementById("lbScopeNote");
  if (_storageMode === "cloud") {
    note.textContent =
      "Shared across everyone who plays this dispatch. Filter by terrain.";
  } else if (_storageMode === "local") {
    note.textContent =
      "Saved permanently in this browser on this device. Filter by terrain.";
  } else {
    note.textContent =
      "Saved for this session only (this browser blocked persistent storage). Filter by terrain.";
  }
  await renderLeaderboard();
}
document.querySelectorAll(".lb-tab").forEach((tab) => {
  tab.addEventListener("click", async () => {
    document
      .querySelectorAll(".lb-tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    lbFilter = tab.dataset.diff;
    await renderLeaderboard();
  });
});

async function renderLeaderboard() {
  const listEl = document.getElementById("lbList");
  listEl.innerHTML = '<div class="lb-empty">Loading standings…</div>';
  try {
    const listing = await storageAPI.list("leaderboard:", true);
    const keys = listing && listing.keys ? listing.keys : [];
    const entries = [];
    for (const k of keys.slice(-200)) {
      try {
        const r = await storageAPI.get(k, true);
        if (r) entries.push(JSON.parse(r.value));
      } catch (e) {}
    }
    let filtered =
      lbFilter === "all"
        ? entries
        : entries.filter((e) => e.difficulty === lbFilter);
    filtered.sort((a, b) => b.score - a.score);
    filtered = filtered.slice(0, 10);

    if (filtered.length === 0) {
      listEl.innerHTML =
        '<div class="lb-empty">No dispatches logged yet for this terrain. Be the first.</div>';
      return;
    }
    listEl.innerHTML = "";
    filtered.forEach((e, i) => {
      const row = document.createElement("div");
      row.className = "lb-row";
      row.innerHTML = `<span class="lb-rank">#${i + 1}</span><span class="lb-name">${e.username}</span><span class="badge" style="margin-right:14px;">${e.difficulty}</span><span>${e.score} pts</span>`;
      listEl.appendChild(row);
    });
  } catch (e) {
    listEl.innerHTML =
      '<div class="lb-empty">Could not load the leaderboard right now.</div>';
  }
}

/* ============================= BOOT ============================= */
(async () => {
  _storageMode = await detectStorageMode();
  await init();
})();
