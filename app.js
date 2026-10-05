const NAV = [
  { href: "jackets.html", label: "Jackets" },
  { href: "tops.html", label: "Tops" },
  { href: "bottoms.html", label: "Bottoms" },
  { href: "footwear.html", label: "Footwear" },
  { href: "accessories.html", label: "Accessories" },
  { href: "designers.html", label: "Designers" },
];

function currentFile() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  return file === "" ? "index.html" : file;
}

function renderNav() {
  const page = currentFile();
  const linkItems = NAV.map((item) => {
    const current = page === item.href ? ' aria-current="page"' : "";
    return `<li><a href="${item.href}"${current}>${item.label}</a></li>`;
  });
  const tools = `<li class="nav-tools">
      <form class="nav-search" action="search.html" method="get" role="search">
        <span class="nav-search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>
        </span>
        <input type="search" name="q" placeholder="Search" aria-label="Search" />
      </form>
      <a class="nav-icon" href="account.html" aria-label="Sign in" title="Sign in">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14Z"/></svg>
      </a>
      <a class="nav-icon" href="bag.html" aria-label="Bag" title="Bag">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-.8 11.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8Zm3 0V6.5A3 3 0 0 1 12 3.5 3 3 0 0 1 15 6.5V8"/></svg>
      </a>
    </li>`;
  const links = [tools, ...linkItems].join("");

  document.getElementById("site-nav").innerHTML = `
    <div class="announce">Sydney warehouse · AUD · noEmosen drop 01 - 04 </div>
    <a class="skip" href="#main">Skip to content</a>
    <header class="nav">
      <div class="nav-side">
        <a href="designers.html">Designers</a>
      </div>
      <a class="logo" href="index.html">CN2000</a>
      <ul class="nav-links">${links}</ul>
      <div class="nav-side nav-side-right">AU</div>
    </header>
  `;
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `
    <footer class="site-footer">
      <div>
        <strong>CN2000</strong>
        <p>Taobao labels, picked in Australia. Prototype for MQBS1000 — not a live checkout.</p>
      </div>
      <div>
        <strong>This drop</strong>
        <p>Two houses, ten SKUs. Edit photos by changing the img src on each HTML page.</p>
      </div>
      <div>
        <strong>Ask CN2000</strong>
        <p>Gemini dock: ship ETA, size from height/weight/body type, and a stylist across noEmosen and DetW.</p>
      </div>
    </footer>
  `;
}

function bindProductGallery() {
  const gallery = document.querySelector(".pdp-gallery");
  if (!gallery) return;

  const media = gallery.querySelector(".pdp-media");
  const hero = gallery.querySelector(".pdp-hero-img");
  const thumbs = Array.from(gallery.querySelectorAll(".pdp-thumb"));
  if (!media || !hero || !thumbs.length) return;

  if (!media.querySelector(".pdp-arrow")) {
    hero.insertAdjacentHTML(
      "beforebegin",
      `<button type="button" class="pdp-arrow pdp-arrow-prev" aria-label="Previous image">‹</button>`
    );
    hero.insertAdjacentHTML(
      "afterend",
      `<button type="button" class="pdp-arrow pdp-arrow-next" aria-label="Next image">›</button>`
    );
  }

  const showAt = (index) => {
    const next = (index + thumbs.length) % thumbs.length;
    const shot = thumbs[next].querySelector("img");
    if (!shot) return;
    hero.src = shot.src;
    hero.alt = shot.alt || hero.alt;
    thumbs.forEach((item) => item.classList.remove("is-active"));
    thumbs[next].classList.add("is-active");
  };

  const currentIndex = () => {
    const active = thumbs.findIndex((item) => item.classList.contains("is-active"));
    return active < 0 ? 0 : active;
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => showAt(index));
  });

  media.querySelector(".pdp-arrow-prev").addEventListener("click", (event) => {
    event.preventDefault();
    showAt(currentIndex() - 1);
  });
  media.querySelector(".pdp-arrow-next").addEventListener("click", (event) => {
    event.preventDefault();
    showAt(currentIndex() + 1);
  });
}

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
];
let geminiModel = GEMINI_MODELS[0];
const AGENT_STORE = "cn2000-agent-turns";
const AGENT_NAME = "CN2000AGENT:";

function normalizeTurns(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item && (item.role === "user" || item.role === "model") && item.parts && item.parts[0] && item.parts[0].text)
    .slice(-12)
    .map((item) => ({ role: item.role, parts: [{ text: String(item.parts[0].text) }] }));
}

function readAgentPayload(raw) {
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return { turns: normalizeTurns(data), open: false };
  return {
    turns: normalizeTurns(data && data.turns),
    open: !!(data && data.open),
  };
}

function loadAgentState() {
  try {
    const stored = localStorage.getItem(AGENT_STORE);
    if (stored) return readAgentPayload(stored);
  } catch (err) {}
  try {
    if (window.name.indexOf(AGENT_NAME) === 0) return readAgentPayload(window.name.slice(AGENT_NAME.length));
  } catch (err) {}
  return { turns: [], open: false };
}

function saveAgentState() {
  const json = JSON.stringify({ turns: agentTurns, open: agentOpen });
  try {
    localStorage.setItem(AGENT_STORE, json);
  } catch (err) {}
  window.name = AGENT_NAME + json;
}

const agentState = loadAgentState();
let agentTurns = agentState.turns;
let agentOpen = agentState.open;

function geminiKey() {
  return String(window.CN2000_GEMINI_KEY || "").trim();
}

function isBusyStatus(status) {
  return status === 404 || status === 429 || status === 503;
}

function agentSystemPrompt() {
  return [
    "You are the CN2000 shop agent for a Sydney Taobao reseller prototype (MQBS1000, not live checkout).",
    "Three jobs only: (1) shipping ETA, (2) sizing from height cm, weight kg, body type, and foot length for shoes, (3) aesthetic styling.",
    "Catalogue has two houses: noEmosen and DetW. Ten products. Use only the catalogue JSON. Do not invent SKUs, prices, or size rows.",
    "If a chart is missing a row, say so and ask one follow-up.",
    "Shipping: In Sydney = warehouse AU now (2–5 business days AU, or Sydney pickup). Inbound China = 12–21 days to Sydney then 2–5 days AU.",
    "Sizing: map height/weight onto that SKU's brand chart. Body type (slim / regular / broad) may shift one size. Shoes use foot length in cm. Name the brand when sizes differ across houses.",
    "Stylist: pair looks from these ten pieces only. You may mix houses. Mention AUD and warehouse status.",
    "Keep answers short. AUD only. No Taobao URLs.",
    "Catalogue JSON:",
    JSON.stringify(typeof CN2000_CATALOGUE !== "undefined" ? CN2000_CATALOGUE : {}),
  ].join("\n");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderAgent() {
  if (document.getElementById("agent-dock")) return;
  const dock = document.createElement("div");
  dock.id = "agent-dock";
  dock.innerHTML = `
    <button type="button" class="agent-toggle" aria-expanded="false">Ask CN2000</button>
    <div class="agent-panel" hidden>
      <div class="agent-head">
        <strong>Ask CN2000</strong>
        <span>Ship · size · stylist</span>
      </div>
      <div class="agent-log" id="agent-log"></div>
      <div class="agent-chips">
        <button type="button" data-prompt="When will the ice-blue jeans arrive in Sydney?">Ship</button>
        <button type="button" data-prompt="I am 173 cm, 62 kg, regular build. What size hoodie and jeans?">Size</button>
        <button type="button" data-prompt="Style a night look from this drop under AUD 250. I already like leopard.">Style</button>
      </div>
      <form id="agent-form">
        <input id="agent-input" name="message" autocomplete="off" placeholder="Height, weight, or a look…" aria-label="Message" />
        <button type="submit">Send</button>
      </form>
    </div>
  `;
  document.body.appendChild(dock);

  const toggle = dock.querySelector(".agent-toggle");
  const panel = dock.querySelector(".agent-panel");

  function setAgentOpen(open) {
    agentOpen = open;
    if (open) panel.removeAttribute("hidden");
    else panel.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    saveAgentState();
  }

  if (agentOpen) setAgentOpen(true);

  toggle.addEventListener("click", () => {
    setAgentOpen(panel.hasAttribute("hidden"));
  });

  dock.querySelectorAll(".agent-chips button").forEach((chip) => {
    chip.addEventListener("click", () => sendAgent(chip.getAttribute("data-prompt")));
  });

  document.getElementById("agent-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("agent-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendAgent(text);
  });

  if (!geminiKey()) {
    pushAgentLine(
      "agent",
      "Add your Gemini key in config.local.js (same folder as index.html), then hard-refresh. Do not paste the key into chat."
    );
  } else if (!agentTurns.length) {
    pushAgentLine("agent", "Ask about shipping, size (height cm + weight kg + body type), or a look from noEmosen and DetW.");
  } else {
    agentTurns.forEach((turn) => {
      pushAgentLine(turn.role === "user" ? "you" : "agent", turn.parts[0].text);
    });
  }
}

function pushAgentLine(who, text) {
  const log = document.getElementById("agent-log");
  if (!log) return;
  const row = document.createElement("p");
  row.className = "agent-line agent-" + who;
  row.innerHTML = "<span>" + (who === "you" ? "You" : "CN2000") + "</span>" + escapeHtml(text);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
}

async function sendAgent(text) {
  if (!geminiKey()) {
    pushAgentLine("agent", "No Gemini key loaded. Put it in config.local.js and hard-refresh.");
    return;
  }
  pushAgentLine("you", text);
  agentTurns.push({ role: "user", parts: [{ text }] });
  saveAgentState();
  pushAgentLine("agent", "…");
  const log = document.getElementById("agent-log");
  const pending = log ? log.lastElementChild : null;
  try {
    const reply = await callGemini(agentTurns);
    agentTurns.push({ role: "model", parts: [{ text: reply }] });
    if (agentTurns.length > 12) agentTurns.splice(0, agentTurns.length - 12);
    saveAgentState();
    if (pending) {
      pending.innerHTML = "<span>CN2000</span>" + escapeHtml(reply);
    } else {
      pushAgentLine("agent", reply);
    }
  } catch (err) {
    const message = err && err.message ? err.message : "Gemini request failed.";
    if (pending) pending.innerHTML = "<span>CN2000</span>" + escapeHtml(message);
    else pushAgentLine("agent", message);
    agentTurns.pop();
    saveAgentState();
  }
}

async function callGemini(turns) {
  const key = geminiKey();
  let lastError = "Gemini request failed.";
  const payload = {
    system_instruction: { parts: [{ text: agentSystemPrompt() }] },
    contents: turns,
    generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
  };
  const order = [geminiModel, ...GEMINI_MODELS.filter((item) => item !== geminiModel)];

  for (const model of order) {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent?key=" +
      encodeURIComponent(key);
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      lastError = "Could not reach Gemini (network or file:// block). Try again, or open the site through a local server.";
      continue;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      lastError = (data.error && data.error.message) || "HTTP " + res.status + " from Gemini.";
      if (isBusyStatus(res.status)) continue;
      throw new Error(lastError);
    }
    const text =
      data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map((part) => part.text || "").join("").trim()
        : "";
    if (!text) {
      lastError = "Gemini returned an empty reply.";
      continue;
    }
    geminiModel = model;
    return text;
  }
  throw new Error(lastError);
}

renderNav();
renderFooter();
bindProductGallery();
renderAgent();
