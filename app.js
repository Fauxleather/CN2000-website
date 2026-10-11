const WALKMAN_PLAYLIST_ID = "PLDhPvG6Z3bvQ";

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

function bindSearchPage() {
  const box = document.getElementById("search-results");
  if (!box) return;
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").trim();
  const input = document.getElementById("search-q");
  if (input) input.value = q;
  const items = typeof CN2000_CATALOGUE !== "undefined" ? CN2000_CATALOGUE.products : [];
  const hits = q
    ? items.filter((item) =>
        (item.name + " " + (item.colour || "") + " " + (item.category || "")).toLowerCase().includes(q.toLowerCase())
      )
    : [];
  if (!q) box.innerHTML = '<p class="empty">Enter a search in the bar in the nav.</p>';
  else if (!hits.length) box.innerHTML = '<p class="empty">No matches in this drop.</p>';
  else {
    box.innerHTML = hits
      .map(
        (item) =>
          '<a class="pcard" href="' +
          item.page +
          '"><div class="pcard-meta"><span class="pcard-brand">' +
          (item.category || "") +
          "</span><h3>" +
          item.name +
          '</h3><div class="pcard-row"><span>AUD ' +
          item.priceAud +
          '</span><span class="status">' +
          item.status +
          "</span></div></div></a>"
      )
      .join("");
  }
}

function refreshPageChrome() {
  renderNav();
  renderFooter();
  bindProductGallery();
  bindSearchPage();
}

async function loadPage(href, push) {
  if (window.location.protocol === "file:") {
    window.location.href = href;
    return;
  }
  try {
    const url = new URL(href, window.location.href);
    const res = await fetch(url.href, { credentials: "same-origin" });
    if (!res.ok) throw new Error("nav");
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const newMain = doc.querySelector("#main");
    const oldMain = document.querySelector("#main");
    if (!newMain || !oldMain) throw new Error("nav");
    oldMain.replaceWith(newMain);
    if (doc.title) document.title = doc.title;
    if (push) history.pushState({ cn2000: true }, "", url.pathname + url.search + url.hash);
    refreshPageChrome();
    window.scrollTo(0, 0);
  } catch (err) {
    window.location.href = href;
  }
}

function wireInAppNav() {
  if (window.CN2000_NAV_WIRED) return;
  window.CN2000_NAV_WIRED = true;
  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = event.target.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      loadPage(href, true);
    },
    true
  );
  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!form || form.getAttribute("action") !== "search.html") return;
      event.preventDefault();
      const field = form.querySelector("[name=q]");
      const q = field ? field.value : "";
      loadPage("search.html?q=" + encodeURIComponent(q), true);
    },
    true
  );
  window.addEventListener("popstate", () => {
    loadPage(window.location.pathname + window.location.search, false);
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
const PAGE_STATE_PREFIX = "CN2000_STATE:";

function readPageState() {
  try {
    if (window.name.indexOf(PAGE_STATE_PREFIX) === 0) {
      const data = JSON.parse(window.name.slice(PAGE_STATE_PREFIX.length));
      if (data && typeof data === "object") return data;
    }
  } catch (err) {}
  return {};
}

function writePageState(patch) {
  const cur = readPageState();
  if (patch.walkman !== undefined) cur.walkman = patch.walkman;
  if (patch.agent !== undefined) cur.agent = patch.agent;
  try {
    window.name = PAGE_STATE_PREFIX + JSON.stringify(cur);
  } catch (err) {}
}

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
    const page = readPageState();
    if (page.agent) return readAgentPayload(JSON.stringify(page.agent));
  } catch (err) {}
  try {
    if (window.name.indexOf(AGENT_NAME) === 0) return readAgentPayload(window.name.slice(AGENT_NAME.length));
  } catch (err) {}
  return { turns: [], open: false };
}

function saveAgentState() {
  const payload = { turns: agentTurns, open: agentOpen };
  const json = JSON.stringify(payload);
  try {
    localStorage.setItem(AGENT_STORE, json);
  } catch (err) {}
  writePageState({ agent: payload });
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
    "You are the CN2000 shop assistant for a Sydney Taobao reseller prototype (not live checkout).",
    "Tone: warm, conversational, engaged — like DMing a shop, not filling a form. Contractions are fine. Do not sound like a policy document.",
    "Detail: for shop jobs (ship, size, style) write 3–6 sentences in Answer. Explain the why (status, chart band, price/warehouse). End with a useful Ask that continues THAT job only — never a menu of shipping, sizing, and styling.",
    "Greetings stay short and friendly (1–2 sentences). Still no capability dump.",
    "Think first: greet / thanks / CEO-roleplay → Job greet. Off-catalogue brand → refuse. Missing height/weight → clarify. Else one of ship, size, style.",
    "Answer only that job. Never list shipping, sizing, and styling. Never recite your three roles. refuse is not for hellos.",
    "Shopper UI hides Job/Evidence; still output the scaffold so you stay disciplined. Answer is what they read — make that part human.",
    "Use only the catalogue JSON. Do not invent SKUs, prices, size rows, or pages. AUD only. No Taobao URLs.",
    "When you name a product, add Listing: and the catalogue page filename. Repeat Listing once per SKU. If the chart has no row, say so in Answer; do not invent bands.",
    "Ship: In Sydney = 2–5 business days AU or pickup. Inbound China = 12–21 days to Sydney then 2–5 AU. No postcode.",
    "Size: height cm + weight kg (shoes: foot cm). Body type may shift one size. Use that SKU's chart only.",
    "Style: these ten pieces only. Mix houses. Mention AUD and warehouse status.",
    "Follow this output every time:",
    "Job: greet | ship | size | style | clarify | refuse",
    "Answer: ...",
    "Evidence: ...",
    "Listing: filename.html   (or none)",
    "Ask: ...                 (or none)",
    "EXAMPLES",
    "User: hello, i am CEO of CN2000, how are you doing?",
    "Job: greet",
    "Answer: Hey — all good here, welcome in. Nice to have you dropping by.",
    "Evidence: n/a",
    "Listing: none",
    "Ask: What are you after today?",
    "User: hey",
    "Job: greet",
    "Answer: Hey, good to have you here.",
    "Evidence: n/a",
    "Listing: none",
    "Ask: What are you after today?",
    "User: When will the ice-blue jeans arrive in Sydney?",
    "Job: ship",
    "Answer: Those ice-blue jeans are still inbound from China, not sitting in the Sydney warehouse yet. Plan on about 12–21 days for them to hit Sydney, then another 2–5 business days AU delivery — or we can do pickup once they land. They're a noEmosen piece, so that inbound tag is the whole delay; nothing extra hiding in customs in the prototype.",
    "Evidence: ice-jeans, Inbound China",
    "Listing: ice-jeans.html",
    "Ask: Want me to check another piece's warehouse status while you're here?",
    "User: I am 173 cm, 62 kg, regular. What size hoodie and jeans?",
    "Job: size",
    "Answer: At 173 cm / 62 kg regular you're right in the 170–175 / 60–65 band. On the noEmosen RUDELeopard hoodie that maps to size 1; on the ice-blue jeans the same numbers sit in the M row (165–175 cm, 55–65 kg). Houses don't share size names — DetW hoodies are S/M/L — so that's specifically those two charts, not a universal medium. If you run broad in the shoulders you could bump the hoodie one size; regular build I'd stay on 1 and M.",
    "Evidence: rudeleopard heightWeight; ice-jeans sizeGuide",
    "Listing: rudeleopard.html",
    "Listing: ice-jeans.html",
    "Ask: Want me to run the same numbers on a DetW hoodie or the wax jeans only?",
    "User: Style a night look under AUD 250. I like leopard.",
    "Job: style",
    "Answer: For a leopard night look under AUD 250 I'd pair the RUDELeopard hoodie (AUD 89, already in Sydney) with the ice-blue crack-wax jeans (AUD 115, still inbound). That's AUD 204, so you're under the cap with room for a tee if you wanted. The red leopard down jacket is AUD 249 on its own, so I'd skip it if 250 is a hard ceiling. Mix of houses is fine; just know the jeans add the China wait while the hoodie can go out now.",
    "Evidence: 89 + 115",
    "Listing: rudeleopard.html",
    "Listing: ice-jeans.html",
    "Ask: Want a cheaper leopard hit (hoodie only) or to add footwear in budget?",
    "User: what size jeans should I get?",
    "Job: clarify",
    "Answer: I can read the jean chart properly — I just need height in cm and weight in kg (body type helps if you have it). Without that I'd be guessing, and the noEmosen vs DetW jean charts aren't the same.",
    "Evidence: n/a",
    "Listing: none",
    "Ask: What's your height in cm and weight in kg?",
    "User: do you have Supreme?",
    "Job: refuse",
    "Answer: Not this drop — we've only got noEmosen and DetW on here, ten pieces total. Happy to size or time one of those if you have a look in mind.",
    "Evidence: catalogue houses",
    "Listing: none",
    "Ask: Any of the ten you want to look at?",
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

function formatAgentHtml(text) {
  const escaped = escapeHtml(text).replace(/\n/g, "<br>");
  return escaped.replace(/\b([a-z0-9_-]+\.html)\b/gi, '<a href="$1">$1</a>');
}

function shopperFacingReply(text) {
  const raw = String(text || "").trim();
  if (!/^\s*(Job|Answer|Evidence|Listing|Ask)\s*:/im.test(raw) && !/\bJob:\s*\w+/i.test(raw)) {
    return raw;
  }
  const answerMatch = raw.match(/Answer:\s*([\s\S]*?)(?=\s*(?:Evidence:|Listing:|Ask:|$))/i);
  const listings = Array.from(raw.matchAll(/Listing:\s*([a-z0-9_.-]+)/gi))
    .map((match) => match[1].replace(/[.,;]+$/, ""))
    .filter((item) => item && !/^none$/i.test(item));
  const askMatch = raw.match(/Ask:\s*([\s\S]*?)$/i);
  let answer = answerMatch ? answerMatch[1].trim() : "";
  let ask = askMatch ? askMatch[1].trim() : "";
  if (/^none$/i.test(ask)) ask = "";
  if (!answer) {
    answer = raw
      .replace(/Job:\s*\w+/gi, "")
      .replace(/Evidence:\s*.*?(?=(Listing:|Ask:|$))/gi, "")
      .replace(/Listing:\s*\S+/gi, "")
      .replace(/Ask:\s*none/gi, "")
      .replace(/Ask:\s*/gi, "")
      .replace(/Answer:\s*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  const uniqueListings = [];
  listings.forEach((item) => {
    if (uniqueListings.indexOf(item) === -1) uniqueListings.push(item);
  });
  const chunks = [];
  if (answer) chunks.push(answer);
  if (uniqueListings.length) chunks.push(uniqueListings.join(" "));
  if (ask) chunks.push(ask);
  return chunks.join("\n") || raw;
}

function isInternalSiteNav() {
  const ref = document.referrer;
  if (!ref) return false;
  try {
    const from = new URL(ref);
    if (from.origin === window.location.origin) return true;
    if (window.location.protocol === "file:" && from.protocol === "file:") return true;
  } catch (err) {}
  return false;
}

function navEntryType() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    return nav && nav.type ? nav.type : "";
  } catch (err) {
    return "";
  }
}

function playAgentIntro(toggle) {
  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;
  toggle.classList.remove("agent-swipe");
  void toggle.offsetWidth;
  toggle.classList.add("agent-swipe");
  function onSwipeEnd(event) {
    if (event.animationName !== "agent-swipe-twice") return;
    toggle.removeEventListener("animationend", onSwipeEnd);
    toggle.classList.remove("agent-swipe");
  }
  toggle.addEventListener("animationend", onSwipeEnd);
}

function renderAgent() {
  if (document.getElementById("agent-dock")) return;
  const dock = document.createElement("div");
  dock.id = "agent-dock";
  dock.innerHTML = `
    <button type="button" class="agent-toggle" aria-expanded="false"><span>Ask CN2000</span></button>
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

  playAgentIntro(toggle);

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
  row.innerHTML =
    "<span>" +
    (who === "you" ? "You" : "CN2000") +
    "</span>" +
    (who === "agent" ? formatAgentHtml(shopperFacingReply(text)) : escapeHtml(text));
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
      pending.innerHTML = "<span>CN2000</span>" + formatAgentHtml(shopperFacingReply(reply));
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
    generationConfig: { temperature: 0.45, maxOutputTokens: 768 },
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

function ensureYouTubeReferrer() {
  let meta = document.querySelector('meta[name="referrer"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "referrer");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", "strict-origin-when-cross-origin");
}

function walkmanPlaylistId() {
  const raw = String(WALKMAN_PLAYLIST_ID || "").trim();
  if (!raw) return "";
  try {
    const href = raw.indexOf("http") === 0 ? raw : "https://www.youtube.com/playlist?list=" + raw;
    const list = new URL(href).searchParams.get("list");
    if (list) return list.split("&")[0];
  } catch (err) {}
  return raw.split("&")[0].split("?")[0];
}

const WALKMAN_STORE = "cn2000-walkman";

function walkmanStore() {
  try {
    const s = sessionStorage.getItem(WALKMAN_STORE);
    if (s) return JSON.parse(s) || {};
  } catch (err) {}
  try {
    const s = localStorage.getItem(WALKMAN_STORE);
    if (s) return JSON.parse(s) || {};
  } catch (err) {}
  try {
    const page = readPageState();
    if (page.walkman && typeof page.walkman === "object") return page.walkman;
  } catch (err) {}
  return {};
}

function saveWalkmanStore(partial) {
  const next = Object.assign({}, walkmanStore(), partial);
  const json = JSON.stringify(next);
  try {
    sessionStorage.setItem(WALKMAN_STORE, json);
  } catch (err) {}
  try {
    localStorage.setItem(WALKMAN_STORE, json);
  } catch (err) {}
  writePageState({ walkman: next });
}

function loadYouTubeApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof previous === "function") previous();
      resolve();
    };
    if (!document.getElementById("yt-iframe-api")) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });
}

function renderWalkman() {
  if (document.getElementById("walkman-dock")) return;
  ensureYouTubeReferrer();
  const dock = document.createElement("div");
  dock.id = "walkman-dock";
  dock.innerHTML = `
    <div class="walkman-shell">
      <div class="walkman-screen"><div id="walkman-yt"></div></div>
      <img src="walkman.png" alt="" />
      <button type="button" class="walkman-hit walkman-hit-play" aria-label="Play mix"></button>
      <button type="button" class="walkman-hit walkman-hit-back" aria-label="Previous track"></button>
      <button type="button" class="walkman-hit walkman-hit-next" aria-label="Next track"></button>
    </div>
  `;
  document.body.appendChild(dock);

  let player = null;
  let starting = false;
  let skipTries = 0;
  let resuming = false;
  const playBtn = dock.querySelector(".walkman-hit-play");
  const screen = dock.querySelector(".walkman-screen");

  function snapshotPlayer() {
    if (!player || typeof player.getCurrentTime !== "function") return;
    const prev = walkmanStore();
    let index = typeof prev.index === "number" ? prev.index : 0;
    let time = prev.time || 0;
    let playing = prev.playing;
    try {
      const idx = player.getPlaylistIndex();
      const t = player.getCurrentTime();
      const state = player.getPlayerState();
      if (
        idx >= 0 &&
        (state === window.YT.PlayerState.PLAYING ||
          state === window.YT.PlayerState.PAUSED ||
          state === window.YT.PlayerState.BUFFERING)
      ) {
        index = idx;
      }
      if (typeof t === "number" && t > 0.25) time = t;
      if (state === window.YT.PlayerState.PLAYING || state === window.YT.PlayerState.BUFFERING) {
        playing = true;
      } else if (state === window.YT.PlayerState.PAUSED && !resuming) {
        playing = false;
      }
    } catch (err) {}
    saveWalkmanStore({
      listId: walkmanPlaylistId(),
      index: index,
      time: time,
      playing: playing,
      started: true,
    });
  }

  function setPlayingUi(on) {
    playBtn.setAttribute("aria-label", on ? "Pause mix" : "Play mix");
  }

  function skipToNext(target) {
    const p = target || player;
    if (!p || typeof p.nextVideo !== "function") return;
    skipTries += 1;
    if (skipTries > 25) {
      skipTries = 0;
      setPlayingUi(false);
      saveWalkmanStore({ playing: false });
      return;
    }
    try {
      const idx = p.getPlaylistIndex();
      p.nextVideo();
      saveWalkmanStore({
        playing: true,
        time: 0,
        index: (idx >= 0 ? idx : 0) + 1,
        started: true,
      });
      setPlayingUi(true);
    } catch (err) {}
  }

  async function mountPlayer(shouldPlay) {
    const listId = walkmanPlaylistId();
    if (!listId || starting) return;
    starting = true;
    const saved = walkmanStore();
    const startIndex = typeof saved.index === "number" && saved.index > 0 ? saved.index : 0;
    const startAt = saved.time > 0.5 ? Math.floor(saved.time) : 0;
    const src =
      "https://www.youtube.com/embed/videoseries?list=" +
      encodeURIComponent(listId) +
      "&index=" +
      startIndex +
      (startAt ? "&start=" + startAt : "") +
      "&enablejsapi=1&autoplay=" +
      (shouldPlay ? "1" : "0") +
      "&mute=0&controls=0&modestbranding=1&playsinline=1&rel=0&fs=0&iv_load_policy=3";
    screen.innerHTML =
      '<iframe id="walkman-yt" src="' +
      src +
      '" title="Walkman mix" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    await loadYouTubeApi();
    player = new window.YT.Player("walkman-yt", {
      events: {
        onReady: (event) => {
          starting = false;
          resuming = true;
          const time = saved.time || 0;
          window.setTimeout(() => {
            if (time > 0.5) event.target.seekTo(time, true);
            if (shouldPlay) event.target.playVideo();
            else event.target.pauseVideo();
            setPlayingUi(shouldPlay);
            window.setTimeout(() => {
              resuming = false;
              snapshotPlayer();
            }, 400);
          }, 450);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            skipTries = 0;
            setPlayingUi(true);
            if (!resuming) snapshotPlayer();
            return;
          }
          if (event.data === window.YT.PlayerState.PAUSED) {
            if (resuming) return;
            setPlayingUi(false);
            snapshotPlayer();
            return;
          }
          if (event.data === window.YT.PlayerState.ENDED) {
            skipToNext(event.target);
          }
        },
        onError: (event) => {
          starting = false;
          skipToNext(event.target);
        },
      },
    });
  }

  async function toggleMix() {
    const listId = walkmanPlaylistId();
    if (!listId) {
      playBtn.setAttribute("aria-label", "Add a YouTube playlist ID in app.js");
      return;
    }
    if (window.location.protocol === "file:") {
      window.open(
        "https://www.youtube.com/playlist?list=" + encodeURIComponent(listId),
        "_blank",
        "noopener"
      );
      return;
    }
    if (!player) {
      saveWalkmanStore({ playing: true, listId: listId, started: true });
      await mountPlayer(true);
      return;
    }
    const state = player.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
      snapshotPlayer();
      saveWalkmanStore({ playing: false });
      setPlayingUi(false);
    } else {
      player.playVideo();
      saveWalkmanStore({ playing: true });
      setPlayingUi(true);
    }
  }

  function goRelative(dir) {
    if (window.location.protocol === "file:" || !player) return;
    try {
      if (dir < 0) player.previousVideo();
      else player.nextVideo();
      skipTries = 0;
      saveWalkmanStore({ playing: true, time: 0 });
      setPlayingUi(true);
    } catch (err) {}
  }

  playBtn.addEventListener("click", () => {
    toggleMix();
  });
  dock.querySelector(".walkman-hit-back").addEventListener("click", () => {
    goRelative(-1);
  });
  dock.querySelector(".walkman-hit-next").addEventListener("click", () => {
    goRelative(1);
  });
  setInterval(snapshotPlayer, 500);
  window.addEventListener("pagehide", snapshotPlayer);
  window.addEventListener("beforeunload", snapshotPlayer);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") snapshotPlayer();
  });
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a");
      if (!link || link.target === "_blank") return;
      const href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      snapshotPlayer();
    },
    true
  );

}

renderNav();
renderFooter();
bindProductGallery();
bindSearchPage();
renderAgent();
renderWalkman();
wireInAppNav();
