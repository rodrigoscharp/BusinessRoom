import { downloadVerdictPdf } from "./pdf.js";
import { startI18n, LANG } from "./i18n.js";
import { drawShareImage } from "./share.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const SAMPLES = [
  ["Raise my prices?", "I run a coaching business doing $30k a month with 15 active clients at $2,000 each. I want to raise the price to $3,500. Options: raise for everyone now, raise for new clients only, or keep $2,000. Close rate is about 50% on sales calls. I'm leaning toward raising for everyone because I'm underpaid."],
  ["First salesperson?", "I'm a solo founder of a B2B SaaS at $25k MRR growing 5% a month. I do every sales call myself (about 20 hours a week) and I'm burning out. Should I hire a full-time account executive at $120k base, hire a part-time commission-only closer, or keep selling myself for six more months? I have $150k in the bank."],
  ["Second product?", "My agency makes $80k a month building AI automations for dentists. A few clients asked for an AI receptionist product. Should I build the receptionist as a separate SaaS, offer it as an add-on to existing clients only, or stay focused on the agency? Team of 6, about $200k cash."],
  ["Quit my job?", "I make $180k a year at a tech company. My side business (a paid newsletter) makes $6k a month and grew 8% a month this year. I have 9 months of expenses saved. Should I quit now, quit in 6 months, or keep both and hire a writer?"],
];

const EXAMPLE = "I run a coaching business at $30k a month with 15 clients at $2,000 each. Should I raise to $3,500 for everyone, raise for new clients only, or keep $2,000? Close rate is about 50% and I have $40k in the bank. Success is $45k a month by March. I'm leaning toward raising for everyone because I'm underpaid.";

// The how-to, shown in "How it works".
const GUIDE = `
  <div class="guide">
    <div class="guide-sec">
      <h4>How to use the BusinessRoom</h4>
      <ol>
        <li><span>In Claude Code, run <code>/business-room open</code>. It opens this room and listens to the chat.</span></li>
        <li><span>Pick <b>Bring your pitch</b> and paste a few lines, or attach a deck with the clip.</span></li>
        <li><span>Answer the Chair's questions in the chat. Then watch the founders argue it out here.</span></li>
        <li><span>When the verdict lands, download it as a PDF.</span></li>
      </ol>
    </div>
    <div class="guide-sec">
      <h4>What to put in your question</h4>
      <ul>
        <li><span><b>The decision</b> in one line.</span></li>
        <li><span><b>Your options.</b> Two or three. "Keep doing what I do now" counts.</span></li>
        <li><span><b>Your numbers.</b> Revenue, cash, and team size.</span></li>
        <li><span><b>Your limits.</b> Deadline, hours, and budget.</span></li>
        <li><span><b>What success looks like</b>, and by when.</span></li>
        <li><span><b>Which way you're leaning</b>, and why. The council tests it.</span></li>
      </ul>
      <p class="note" style="margin-top:8px">Left something out? The Chair asks before the council starts.</p>
    </div>
    <div class="guide-sec">
      <h4>Example</h4>
      <div class="example">
        <p><code>/business-room</code> ${EXAMPLE.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>
        <button class="ghost" type="button" data-copy-example>Copy this example</button>
      </div>
    </div>
    <div class="guide-sec">
      <h4>Good to know</h4>
      <ul>
        <li><span><b>Council:</b> all 7 founders, 2 rounds: opening, then debate.</span></li>
        <li><span><b>Deep:</b> add <code>--deep</code> for a third round where they vote. Uses far more of your plan.</span></li>
        <li><span><b>Shark Tank:</b> after your pitch, each founder says if they're in or out, and on what terms.</span></li>
        <li><span><b>Ask one founder:</b> click a founder, then "Ask". One founder answers, quick and cheap.</span></li>
        <li><span><b>Jump in:</b> write during the debate and the Chair brings it to the next round.</span></li>
        <li><span><b>The Chair remembers your company</b> and checks in on past decisions, so you don't repeat your numbers.</span></li>
        <li><span><b>Every council is saved.</b> Open Past sessions to replay one, download its PDF, or share an image.</span></li>
      </ul>
    </div>
  </div>`;

const SHAPES = ["base", "open", "mid", "blink"];
const portrait = (key, shape = "base") => `/portraits/${key}-${shape}.webp`;
const ROUND_NAME = ["", "Opening", "Debate", "Vote"];
const MODEL_NAME = { sonnet: "Sonnet", opus: "Opus", haiku: "Haiku" };
// What each founder wears, for the hand that lifts the cup.
const OUTFIT = {
  bezos: { skin: "#e6ad8b", sleeve: "#1f2a44", cuff: "#bcd3ee" },
  graham: { skin: "#efbf9f", sleeve: "#3f6fb0" },
  hormozi: { skin: "#d8a07a", sleeve: "#1b1b1d", bare: true },
  musk: { skin: "#f0c09f", sleeve: "#1b1b1d", bare: true },
  zuckerberg: { skin: "#f3d4c2", sleeve: "#8c8c90", bare: true },
  huang: { skin: "#e0ae8a", sleeve: "#161616" },
  ek: { skin: "#f0c3a6", sleeve: "#2c2c2f" },
};

// A cartoon hand around the mug's handle, with the founder's sleeve running off below.
const handSvg = (o) => `<g class="hand">
    <path d="M44 47 L66 86" stroke="${o.bare ? o.skin : o.sleeve}" stroke-width="12" stroke-linecap="round"/>
    ${o.bare ? `<path d="M58 72 L70 92" stroke="${o.sleeve}" stroke-width="14" stroke-linecap="round"/>` : `<path d="M47 52 L51 59" stroke="${o.cuff || o.sleeve}" stroke-width="13" stroke-linecap="butt" opacity=".9"/>`}
    <ellipse cx="42" cy="40" rx="7.5" ry="9" fill="${o.skin}"/>
    <path d="M36 36 q-3 2 0 4 M36 41 q-3 2 0 4" stroke="rgba(0,0,0,.18)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  </g>`;


// A cup of coffee on a saucer. The saucer stays on the table; the mug (with its steam)
// is the part that lifts when a founder takes a sip.
const CUP_SVG = `<svg class="saucer" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="cupSaucer" cx="50%" cy="35%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e7e4df"/><stop offset="1" stop-color="#b9b4ad"/></radialGradient>
  </defs>
  <ellipse cx="24" cy="54" rx="22" ry="5.6" fill="rgba(0,0,0,.35)"/>
  <ellipse cx="24" cy="52" rx="22" ry="5.6" fill="url(#cupSaucer)"/>
  <ellipse cx="24" cy="51.2" rx="13" ry="3" fill="#cfcac3"/>
</svg>
<svg class="mug" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="cupBody" x1="0" x2="1"><stop offset="0" stop-color="#d9d5cf"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".75" stop-color="#f1eee9"/><stop offset="1" stop-color="#bdb8b0"/></linearGradient>
    <radialGradient id="cupCoffee" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#9a6a42"/><stop offset=".55" stop-color="#5b3a22"/><stop offset="1" stop-color="#2e1c10"/></radialGradient>
  </defs>
  <g class="steam" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.8" stroke-linecap="round">
    <path d="M18 22 C14 17, 22 14, 18 8 C15 4, 20 2, 18 -2"/>
    <path d="M24 22 C20 16, 28 13, 24 7 C21 3, 26 1, 24 -3"/>
    <path d="M30 22 C26 17, 34 14, 30 8 C27 4, 32 2, 30 -2"/>
  </g>
  <path d="M36 32 c7 -1 10 3 9 8 c-1 6 -6 8 -11 7" fill="none" stroke="#e9e5df" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M36 32 c7 -1 10 3 9 8 c-1 6 -6 8 -11 7" fill="none" stroke="#bdb8b0" stroke-width="1" stroke-linecap="round" transform="translate(.8 .8)" opacity=".6"/>
  <path d="M10 27 h28 l-2.6 18.5 q-.7 4.5 -5.2 4.5 h-12.4 q-4.5 0 -5.2 -4.5 z" fill="url(#cupBody)"/>
  <ellipse cx="24" cy="27" rx="14" ry="3.6" fill="#f7f5f1"/>
  <ellipse cx="24" cy="27.4" rx="12" ry="2.8" fill="url(#cupCoffee)"/>
  <ellipse cx="21" cy="26.8" rx="4" ry=".9" fill="rgba(255,240,220,.35)"/>
  __HAND__
</svg>`;
const CHAIR_ICON = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#f2f2f3"/><ellipse cx="16" cy="16" rx="10" ry="6" fill="#1a1a1c"/></svg>');

// The company line under a founder's role: logo and name per company.
const companyLine = (s) => !s.companies?.length ? "" : `<span class="co">${s.companies.map((c) => `<span class="co-item">${c.logo ? `<i class="co-logo" style="--logo:url('/logos/${c.logo}.svg')" aria-hidden="true"></i>` : ""}${esc(c.name)}</span>`).join("")}</span>`;

// Seats without portrait art yet get an initials badge in their color.
const placeholder = (key) => {
  const s = state.byKey[key];
  const c = s?.color || "#4c6a92";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M30 200 C30 150 60 132 100 132 C140 132 170 150 170 200 Z" fill="${c}" opacity="0.85"/><circle cx="100" cy="80" r="44" fill="${c}"/><text x="100" y="93" font-family="Sora,Arial,sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">${esc(s?.initials || "?")}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
};
document.addEventListener("error", (e) => {
  const img = e.target;
  const m = img.tagName === "IMG" && !img.dataset.placeholder && /\/portraits\/([a-z]+)-/.exec(img.getAttribute("src") || "");
  if (!m) return;
  img.dataset.placeholder = "1";
  img.src = placeholder(m[1]);
}, true);

const state = {
  seats: [], byKey: {}, session: null, options: [], weights: {}, active: [], round: 0,
  cards: { 1: {}, 2: {}, 3: {} }, replaying: false, verdict: null, links: [], geo: {}, setup: null, wait: null,
};

// ------------------------------------------------------------- boot
async function boot() {
  startI18n();
  fetch("/api/lang", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lang: LANG }) }).catch(() => {});
  const r = await fetch("/api/seats").then((x) => x.json());
  state.seats = r.seats;
  state.byKey = Object.fromEntries(r.seats.map((s) => [s.key, s]));
  state.runner = r.runner;
  if (r.runner === "api" && !r.hasKey) toast("No ANTHROPIC_API_KEY found in .env. Add it and restart the server.");
  renderSeats();
  renderSamples();
  bindUI();
  new ResizeObserver(() => { layoutStage(); drawLinks(); }).observe($("#stage"));
  startBlinking();
  startSipping();
  reset();
  typeIn($("#composer h2"));
  typeIn($("#waiting h2"));
  const ss = await fetch("/api/sessions").then((x) => x.json());
  if (ss.running) attach(ss.running);
  else if (ss.live) attach(ss.live);
  refreshUsage();
  setInterval(watchForLive, 2500);
  await refreshCompany();
  pollChat();
  setInterval(pollChat, 1500);
  setInterval(refreshCompany, 15000);
  setInterval(tickWait, 1000);
}

// a council started in Claude Code shows up here on its own
const seenLive = new Set();
async function watchForLive() {
  const ss = await fetch("/api/sessions").then((x) => x.json()).catch(() => null);
  const id = ss?.live || ss?.running;
  if (!id || seenLive.has(id) || id === state.session) return;
  seenLive.add(id);
  attach(id);
}

// arrival: a heading types in a character at a time, blur to sharp
function typeIn(el) {
  if (!el) return;
  const text = el.textContent;
  el.classList.add("typein");
  // characters sit inside a nowrap span per word, so lines only break between words
  let i = 0;
  el.innerHTML = text.split(" ").map((word) => `<span class="wd">${[...word].map((c) => `<span class="ch" style="animation-delay:${i++ * 22}ms">${esc(c)}</span>`).join("")}</span>`).join(" ");
  el.setAttribute("aria-label", text);
}

function renderSamples() {
  $("#samples").innerHTML = SAMPLES.map(([t], i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join("");
  $("#samples").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $("#prompt").value = SAMPLES[b.dataset.i][1];
    $("#prompt").focus();
  });
}

function renderSeats() {
  $("#seats").innerHTML = state.seats.map((s, i) => `
    <div class="seat" id="seat-${s.key}" data-seat="${s.key}" style="--d:-${(i * 1.7) % 6}s" tabindex="0" role="button" aria-label="${esc(s.name)}, ${esc(s.pillar)}. Open card.">
      <div class="think" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="bust" data-shape="base">${SHAPES.map((sh) => `<img class="${sh}" src="${portrait(s.key, sh)}" alt="" draggable="false">`).join("")}</div>
    </div>`).join("");
  $("#cups").innerHTML = state.seats.map((s, i) => `<div class="cup" id="cup-${s.key}" style="--d:-${(i * 0.9) % 3}s" aria-hidden="true">${CUP_SVG.replace("__HAND__", handSvg(OUTFIT[s.key] || OUTFIT.ek))}</div>`).join("");
  $("#plates").innerHTML = state.seats.map((s) => `
    <div class="nameplate" id="plate-${s.key}" data-seat="${s.key}">
      <b>${esc(s.name)}</b>
      <small>${esc(s.role || s.pillar)}</small>
      ${companyLine(s)}
      <div class="meta"><span class="pips" title="Weight on this decision"></span><span class="chip" hidden></span><span class="score" hidden></span></div>
    </div>`).join("");
  layoutStage();
}

// The table is an ellipse seen from the front. Seats sit along its far edge: the
// middle seat is farthest (higher, smaller), the end seats nearest (lower, bigger).
function layoutStage() {
  const stage = $("#stage");
  const W = stage.clientWidth;
  const narrow = matchMedia("(max-width: 820px)").matches;
  const H = narrow ? Math.round(W * 0.62) : stage.clientHeight;
  // Full screen: the seats sit on the far edge of the table, the conversation fills the
  // table's middle, and the chat box floats at the bottom (CHAT_H keeps clear of it).
  const CHAT_H = 118;
  const cx = W / 2, cy = narrow ? H * 0.98 : H * 0.64, rx = narrow ? W * 0.48 : Math.min(W * 0.46, H * 1.15), ry = H * (narrow ? 0.46 : 0.3);
  const t = $("#table");
  Object.assign(t.style, { left: `${cx - rx}px`, top: `${cy - ry}px`, width: `${rx * 2}px`, height: `${ry * 2}px` });
  const edge = (x) => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const xs = [0.085, 0.222, 0.361, 0.5, 0.639, 0.778, 0.915];
  state.seats.forEach((s, i) => {
    const x = narrow ? W * xs[i] : cx + (xs[i] - 0.5) * 2 * rx * 0.92;
    const d = ((x - cx) / rx) ** 2;
    const size = H * (narrow ? 0.5 : 0.29); // one size for every seat, so the founders read as equals
    const bottom = edge(x) + size * 0.2;
    const el = $(`#seat-${s.key}`);
    Object.assign(el.style, { left: `${x - size / 2}px`, top: `${bottom - size}px`, width: `${size}px`, height: `${size}px`, zIndex: 10 + Math.round(d * 10) });
    // the cup sits on the table right in front of the founder, beside the nameplate.
    // --sx/--sy carry it to the founder's mouth for a sip (see startSipping).
    const cup = $(`#cup-${s.key}`);
    const cs = H * (narrow ? 0.07 : 0.06);
    const cupX = x + size * 0.27, cupTop = edge(x) - cs * 0.55;
    const mouthY = bottom - size * 0.47;
    Object.assign(cup.style, { left: `${cupX - cs / 2}px`, top: `${cupTop}px`, width: `${cs}px`, height: `${cs * 1.25}px` });
    cup.style.setProperty("--sx", `${x + size * 0.04 - cupX}px`);
    cup.style.setProperty("--sy", `${mouthY - (cupTop + cs * 0.5)}px`);
    const pl = $(`#plate-${s.key}`);
    pl.style.left = `${x}px`;
    pl.style.top = `${edge(x) + H * 0.01}px`; // straddles the table edge, over the chest
    state.geo[s.key] = { x, head: bottom - size * 0.72, top: bottom - size * 0.9, size };
  });
  const c = $("#center");
  if (narrow) {
    stage.style.paddingTop = `${H}px`; // the scene sits on top; captions flow below it
  } else {
    stage.style.paddingTop = "";
    // the captions start below the lowest nameplate they could collide with
    const inner = [1, 2, 3, 4, 5].map((i) => $(`#plate-${state.seats[i].key}`));
    const top = Math.max(...inner.map((p) => p.offsetTop + p.offsetHeight / 2)) + H * 0.035;
    const w = Math.min(rx * 1.3, 760);
    Object.assign(c.style, { left: `${cx - w / 2}px`, width: `${w}px`, top: `${top}px`, height: `${H - CHAT_H - top}px` });
  }
  const sp = state.speaking ? state.geo[state.speaking] : null;
  if (sp) moveSpot(state.speaking);
}

function moveSpot(key) {
  const g = state.geo[key]; const spot = $("#spot");
  if (!g) { spot.classList.remove("on"); return; }
  spot.style.left = `${g.x}px`;
  spot.style.top = `${g.head}px`;
  spot.style.width = spot.style.height = `${g.size * 1.9}px`;
  spot.classList.add("on");
}

function bindUI() {
  $("#composer").addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = $("#prompt").value.trim();
    if (prompt.length < 10) return toast("Give the council a real decision, at least a sentence.");
    const mode = $('input[name="mode"]:checked').value;
    $("#convene").disabled = true;
    const r = await fetch("/api/council", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, mode }) });
    const j = await r.json();
    $("#convene").disabled = false;
    if (!r.ok) return toast(j.error || "Could not start the council.");
    attach(j.id);
  });
  const openFrom = (e) => { const b = e.target.closest("[data-seat]"); if (b) openCard(b.dataset.seat); };
  $("#seats").addEventListener("click", openFrom);
  $("#plates").addEventListener("click", openFrom);
  $("#seats").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFrom(e); } });
  $("#feed").addEventListener("click", (e) => { const c = e.target.closest(".feed-card"); if (c) openCard(c.dataset.seat, Number(c.dataset.round)); });
  $("#chatForm").addEventListener("submit", sendChat);
  $("#chatAttach").addEventListener("click", () => $("#chatFile").click());
  $("#chatFile").addEventListener("change", (e) => attachFile(e.target.files[0]));
  $("#voiceBtn").addEventListener("click", () => setVoice(!voice.on));
  setVoice(voice.on);
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ask]");
    if (!b) return;
    $("#cardDialog").close();
    $("#chatInput").value = `@${state.byKey[b.dataset.ask].short} `;
    $("#chatInput").focus();
  });
  $("#chatInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatForm").requestSubmit(); } });
  $("#chatInput").addEventListener("input", (e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; });
  $("#waitHistory").addEventListener("click", openHistory);
  $("#wcLeave").addEventListener("click", leaveCouncil);
  $("#waitGuide").addEventListener("click", openGuide);
  $("#guideBtn").addEventListener("click", openGuide);
  document.addEventListener("click", async (e) => {
    if (e.target.closest("[data-copy-example]")) {
      try { await navigator.clipboard.writeText("/business-room " + EXAMPLE); toast("Copied. Paste it into Claude Code."); }
      catch { toast("Copy didn't work here. Select the text and copy it."); }
    }
    if (e.target.closest("[data-pdf]")) savePdf(e.target.closest("[data-pdf]"));
    if (e.target.closest("[data-share]")) shareImage(e.target.closest("[data-share]"));
  });
  $("#historyBtn").addEventListener("click", openHistory);
  $("#newBtn").addEventListener("click", reset);
  $("#verdictSheet").addEventListener("click", (e) => { if (e.target.id === "verdictSheet" || e.target.closest("[data-close]")) $("#verdictSheet").hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#verdictSheet").hidden = true; });
  $$(".speed button").forEach((b) => b.addEventListener("click", () => {
    player.speed = Number(b.dataset.speed);
    $$(".speed button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  $("#skipBtn").addEventListener("click", () => player.skip());
}

// ------------------------------------------------------------- the chat
// The founder talks to the Chair here. In viewer mode the message goes to Claude Code
// (it waits on chat.jsonl through app/scripts/chat.mjs); with the API runner it convenes
// the council directly.
const HELLO = '<div class="empty">Write your decision below: the options, a few numbers (revenue, customers, cash), and which way you are leaning.</div>';
const chatState = { last: 0, listening: false, primed: false, company: "" };

// A message with an attachment carries a "FILE: <path>" line for the Chair; the room shows a chip instead.
function bubbleHtml(text) {
  const file = text.match(/^FILE: (.+)$/m);
  const body = esc(text.replace(/^FILE: .+$/m, "").replace(/^Attached: .+$/m, "").trim()).replace(/\n/g, "<br>");
  return (file ? `<span class="file">📎 ${esc(file[1].split("/").pop().replace(/^\d+-/, ""))}</span>${body ? "<br>" : ""}` : "") + body;
}

function chatMessage(m) {
  const d = document.createElement("div");
  const seat = state.byKey[m.from];
  d.className = `msg ${m.from === "user" ? "user" : seat ? "chair founder" : "chair"}`;
  const av = m.from === "user" ? "" : `<img class="av" src="${seat ? portrait(m.from) : CHAIR_ICON}" alt="">`;
  d.innerHTML = `${av}<div class="bubble">${seat ? `<b class="who">${esc(seat.name)}</b>` : ""}${bubbleHtml(m.text)}</div>`;
  feedAppend(d);
  // a founder answering a direct question says it at the table too, when the table is free
  if (seat && chatState.primed && !player.busy && !player.q.length) {
    player.push({ type: "say", seat: m.from, text: firstSentences(clean(m.text), 220) });
  }
  // quick replies: one tap sends the option as the founder's message
  if (m.options?.length) {
    const row = document.createElement("div");
    row.className = "msg quick";
    row.innerHTML = m.options.map((o) => `<button type="button" class="ghost">${esc(o)}</button>`).join("");
    row.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $("#chatInput").value = b.textContent;
      row.remove();
      $("#chatForm").requestSubmit();
    });
    feedAppend(row);
  }
}

async function pollChat() {
  const j = await fetch(`/api/chat?after=${chatState.last}`).then((x) => x.json()).catch(() => null);
  if (!j) return;
  for (const m of j.messages) { chatState.last = Math.max(chatState.last, m.id); chatMessage(m); }
  chatState.primed = true;
  chatState.listening = j.listening;
  const status = state.runner === "api" ? "The room runs the council itself (API mode)."
    : j.listening ? "Claude Code is listening."
    : j.live ? "The council is in session."
    : "Claude Code is not listening. Run /business-room open in Claude Code.";
  $("#chatStatus").textContent = status + (chatState.company ? ` · Remembers ${chatState.company}` : "");
  $("#chatStatus").dataset.on = String(state.runner === "api" || j.listening || Boolean(j.live));
}

async function sendChat(e) {
  e.preventDefault();
  const input = $("#chatInput");
  const text = input.value.trim();
  if (!text) return;
  $("#chatSend").disabled = true;
  try {
    if (state.runner === "api" && !state.session) {
      if (text.length < 10) return toast("Give the council a real decision, at least a sentence.");
      chatMessage({ from: "user", text });
      const r = await fetch("/api/council", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: text, mode: "standard" }) });
      const j = await r.json();
      if (!r.ok) return toast(j.error || "Could not start the council.");
      attach(j.id);
    } else {
      const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, lang: LANG }) });
      if (!r.ok) return toast((await r.json()).error || "Could not send.");
      await pollChat();
      // mid-council the Chair is busy with the seats; it reads the chat between rounds
      if (state.session && !state.verdict && !state.replaying && state.runner !== "api") {
        const n = document.createElement("div");
        n.className = "feed-note aside";
        n.textContent = "The Chair brings this to the table before the next round.";
        feedAppend(n);
      }
    }
    input.value = "";
    input.style.height = "auto";
  } finally {
    $("#chatSend").disabled = false;
  }
}

// A file for the Chair to read: upload it, then send a chat message that carries its path.
async function attachFile(file) {
  if (!file) return;
  if (state.runner === "api") return toast("Attachments go to Claude Code. Run /business-room open there.");
  if (file.size > 15e6) return toast("That file is over 15 MB.");
  $("#chatAttach").disabled = true;
  try {
    const r = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
    const j = await r.json();
    if (!r.ok) return toast(j.error || "Could not attach the file.");
    const note = $("#chatInput").value.trim();
    const text = `Attached: ${j.name}\nFILE: ${j.path}${note ? "\n\n" + note : ""}`;
    const s = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, lang: LANG }) });
    if (!s.ok) return toast("Could not send.");
    $("#chatInput").value = "";
    await pollChat();
  } finally {
    $("#chatAttach").disabled = false;
    $("#chatFile").value = "";
  }
}

async function refreshCompany() {
  const c = await fetch("/api/company").then((x) => x.json()).catch(() => null);
  chatState.company = c?.name || "";
}

// ------------------------------------------------------------- voice
// The founders' lines read out loud with the browser's own voices. Off by default.
const voice = {
  on: (() => { try { return localStorage.getItem("businessroom-voice") === "on"; } catch { return false; } })(),
  pick(key) {
    const lang = LANG === "pt" ? "pt" : "en";
    const all = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
    if (!all.length) return null;
    const i = state.seats.findIndex((s) => s.key === key);
    return all[Math.max(0, i) % all.length];
  },
  say(key, text) {
    if (!this.on || !("speechSynthesis" in window) || player.fast) return Promise.resolve();
    return new Promise((res) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG === "pt" ? "pt-BR" : "en-US";
      const v = this.pick(key); if (v) u.voice = v;
      const i = Math.max(0, state.seats.findIndex((s) => s.key === key));
      u.pitch = 0.8 + (i % 4) * 0.12;
      u.rate = 1.05 * Math.min(player.speed, 1.6);
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 30000);
    });
  },
  stop() { if ("speechSynthesis" in window) speechSynthesis.cancel(); },
};
function setVoice(on) {
  voice.on = on;
  try { localStorage.setItem("businessroom-voice", on ? "on" : "off"); } catch {}
  $("#voiceBtn").textContent = on ? "Voice on" : "Voice off";
  $("#voiceBtn").setAttribute("aria-pressed", String(on));
  if (!on) voice.stop();
}

// ------------------------------------------------------------- the player
// Every event goes through one ordered queue. Seats speak one at a time, at a
// readable pace, even though the API answers them in parallel. Skip ahead drains
// whatever is queued instantly; new events after that animate again.
const player = {
  q: [], busy: false, epoch: 0, speed: 1, fast: false, timers: new Set(),
  push(ev) { this.q.push(ev); this.info(); this.pump(); },
  async pump() {
    if (this.busy) return;
    this.busy = true;
    const my = this.epoch;
    while (this.q.length && my === this.epoch) {
      const ev = this.q.shift();
      this.info();
      hideWait();
      try { await handle(ev); } catch (e) { console.error(e); }
    }
    if (my === this.epoch) { this.busy = false; this.fast = false; this.info(); }
  },
  sleep(ms) {
    if (this.fast || ms <= 0) return Promise.resolve();
    return new Promise((res) => { const t = setTimeout(() => { this.timers.delete(o); res(); }, ms / this.speed); const o = { t, res }; this.timers.add(o); });
  },
  flushTimers() { for (const o of this.timers) { clearTimeout(o.t); o.res(); } this.timers.clear(); },
  skip() { this.fast = true; this.flushTimers(); voice.stop(); },
  reset() { this.epoch++; this.q.length = 0; this.fast = true; this.flushTimers(); this.busy = false; this.fast = false; this.info(); },
  info() {
    const waiting = this.q.filter((e) => e.type === "seat_done").length;
    $("#queueInfo").textContent = waiting ? `${waiting} lines up next` : "";
  },
};

// ------------------------------------------------------------- session wiring
function reset() {
  state.es?.close();
  player.reset();
  Object.assign(state, { session: null, options: [], weights: {}, active: [], round: 0, cards: { 1: {}, 2: {}, 3: {} }, replaying: false, verdict: null, links: [], speaking: null, setup: null, wait: null });
  hideWait();
  $("#stage").classList.remove("live");
  $("#topic").hidden = true;
  $("#composer").hidden = true;
  $("#waiting").hidden = false;
  $("#stepper").hidden = true;
  $("#caption").hidden = true;
  $("#cruxes").hidden = true;
  $("#plate").hidden = true;
  $("#playbar").hidden = true;
  $("#newBtn").hidden = true;
  $("#verdictSheet").hidden = true;
  $$("#feed > :not(.msg)").forEach((n) => n.remove());
  if (!$("#feed .msg")) $("#feed").innerHTML = HELLO;
  $$(".vote, .deal").forEach((b) => b.remove());
  $$(".seat").forEach((el) => { el.classList.remove("absent", "speaking", "thinking", "addressed"); $(".bust", el).dataset.shape = "base"; });
  $$(".nameplate").forEach((el) => { el.classList.remove("absent", "speaking"); $(".chip", el).hidden = true; $(".score", el).hidden = true; $(".pips", el).innerHTML = ""; });
  $("#spot").classList.remove("on");
  $$(".stepper li").forEach((li) => li.classList.remove("active", "done"));
  drawLinks();
}

function begin(id) {
  reset();
  state.session = id;
  $("#composer").hidden = true;
  $("#waiting").hidden = true;
  $("#newBtn").hidden = false;
  $("#playbar").hidden = false;
  $("#stepper").hidden = false;
  $$("#feed > :not(.msg)").forEach((n) => n.remove());
  feedPhase("The council");
  $("#stage").classList.add("live");
  chairSays("The council is taking their seats", { dots: true });
}

function attach(id) {
  begin(id);
  const es = new EventSource(`/api/stream/${id}`);
  state.es = es;
  es.onmessage = (m) => {
    const ev = JSON.parse(m.data);
    if (ev.type === "end") { es.close(); refreshUsage(); return; }
    if (ev.type === "delta") return; // seats speak from their finished cards
    if (ev.type === "usage") return refreshUsage();
    if (ev.type === "seat_error") return toast(`${state.byKey[ev.seat].short} hit an error: ${ev.error}`);
    player.push(ev);
  };
  es.onerror = () => { /* the browser retries; the server replays from the start */ };
}

// ------------------------------------------------------------- event handling
const STEP_OF = { setup: "setup", round1: "round1", cruxes: "cruxes", round2: "round2", draft: "round3", round3: "round3", skip3: "round3", verdict: "verdict" };
const ORDER = ["setup", "round1", "cruxes", "round2", "round3", "verdict"];

function setStep(step) {
  const idx = ORDER.indexOf(step);
  $$(".stepper li").forEach((li) => {
    const i = ORDER.indexOf(li.dataset.step);
    li.classList.toggle("done", i < idx);
    li.classList.toggle("active", i === idx);
  });
}

async function handle(ev) {
  switch (ev.type) {
    case "phase": {
      state.wait = { phase: ev.phase, at: ev.at || Date.now() };
      if (ev.phase !== "resumed") setStep(STEP_OF[ev.phase] || "setup");
      feedPhase(ev.label);
      const thinking = ["setup", "cruxes", "draft", "verdict"].includes(ev.phase);
      if (thinking || ev.phase === "skip3") {
        chairSays(ev.label.replace(/^The Chair is /, "").replace(/^./, (c) => c.toUpperCase()), { dots: thinking });
        await player.sleep(1400);
      }
      break;
    }
    case "setup": state.setup = ev; onSetup(ev); await player.sleep(1800); break;
    case "round_start": onRoundStart(ev.round); break;
    case "seat_start": $(`#seat-${ev.seat}`)?.classList.add("thinking"); break;
    case "say":
      await speak(ev.seat, ev.text, { tag: "Answers you" });
      setSpeaker(null);
      // with no council on the table, the answer stays in the chat and the caption steps aside
      if (!state.session) setTimeout(() => { if (!state.session && !player.busy) $("#caption").hidden = true; }, 3500);
      break;
    case "seat_done": await onSeatDone(ev); break;
    case "round_done": state.wait = null; updateOptions(ev.scores); break;
    case "cruxes": await onCruxes(ev); break;
    case "draft": await onDraft(ev.draft); break;
    case "verdict": state.wait = null; onVerdict(ev); break;
    case "error": state.wait = null; toast(`The council stopped: ${ev.error}`); chairSays(`The council stopped: ${ev.error}`); break;
    case "stopped": await onStopped(); break;
  }
}

// A council nobody is running any more (dropped, replaced by a new conversation, or idle):
// clear the table instead of leaving everyone "thinking", and let a resumed one attach again.
async function onStopped() {
  if (state.replaying) return;
  const id = state.session;
  state.wait = null;
  $$(".seat").forEach((el) => el.classList.remove("thinking", "musing"));
  chairSays("This council stopped before the verdict. Bring your pitch in the chat to start a new one.");
  await player.sleep(2600);
  if (state.session === id) { seenLive.delete(id); reset(); }
}

async function leaveCouncil() {
  const id = state.session;
  if (!id) return;
  $("#wcLeave").disabled = true;
  try { await fetch(`/api/sessions/${encodeURIComponent(id)}/stop`, { method: "POST" }); } catch {}
  $("#wcLeave").disabled = false;
  state.es?.close();
  reset();
}

function onSetup(ev) {
  state.options = ev.options;
  state.weights = ev.weights;
  state.active = ev.seats;
  $("#topic").hidden = false;
  $("#topicTitle").textContent = ev.title;
  typeIn($("#topicTitle"));
  $("#options").innerHTML = ev.options.map((o) => `
    <div class="opt" data-opt="${o.id}"><span class="id">${o.id}</span><span class="label">${esc(o.label)}</span><span class="val">-</span><span class="bar"><i></i></span></div>`).join("");
  for (const s of state.seats) {
    const absent = !ev.seats.includes(s.key);
    $(`#seat-${s.key}`).classList.toggle("absent", absent);
    $(`#cup-${s.key}`)?.classList.toggle("absent", absent);
    const pl = $(`#plate-${s.key}`);
    pl.classList.toggle("absent", absent);
    // a council with named seats leaves the others out; say so on them instead of leaving them just greyed out
    pl.querySelector(".sat-out")?.remove();
    if (absent) pl.insertAdjacentHTML("beforeend", '<span class="sat-out">Not in this council</span>');
    const w = ev.weights[s.key]?.weight || 1;
    pl.title = `Weight ${w} of 3: ${ev.weights[s.key]?.reason || ""}`;
  }
  // only a deep council has a vote round
  $('.stepper li[data-step="round3"]').style.display = ev.mode === "deep" ? "" : "none";
  chairSays(ev.title, { tag: ev.mode === "deep" ? "Deep council" : "Council" });
}

function updateOptions(scores) {
  const best = Object.entries(scores).sort((a, b) => (b[1].score ?? 0) - (a[1].score ?? 0))[0]?.[0];
  for (const [id, v] of Object.entries(scores)) {
    const el = $(`.opt[data-opt="${id}"]`); if (!el) continue;
    $(".val", el).textContent = v.score ?? "-";
    $(".bar i", el).style.width = `${(v.score || 0) * 10}%`;
    el.classList.toggle("lead", id === best);
    el.title = v.math;
  }
}

function onRoundStart(round) {
  state.round = round;
  state.links = [];
  drawLinks();
  $("#cruxes").hidden = true;
  chairSays(`${["", "Round 1: opening positions", "Round 2: the debate", "Round 3: the vote"][round]}`, { dots: true, tag: "The floor is open" });
}

// ------------------------------------------------------------- talking
const clean = (t) => String(t || "").replace(/\s*\((?:S\d+|source[^)]*)[^)]*\)/gi, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function firstSentences(t, max) {
  const parts = t.match(/[^.!?]+[.!?]+["”)]?\s*|[^.!?]+$/g) || [t];
  let out = "";
  for (const p of parts) { if (out && (out + p).length > max) break; out += p; }
  return shorten(out.trim(), max + 40);
}

/** The line a seat says out loud: the headline of its card, not the whole card. */
function lineFor(round, p, max = 170) {
  if (round === 1) return firstSentences(clean(p.call || p.stance), max);
  if (round === 2) {
    let t = clean(p.disagreeLine || p.stance);
    // "Graham. His argument..." reads as talking to him: "Graham, his argument..."
    t = t.replace(/^([A-Za-z][\w.' ]{0,24})[.:,]\s+(\S+)/, (m, name, next) => !seatKey(name) ? m : `${state.byKey[seatKey(name)].short}, ${/^I('|$)/.test(next) ? next : next[0].toLowerCase() + next.slice(1)}`);
    return firstSentences(t, max);
  }
  return firstSentences(clean(p.oneLine || p.amendment), max);
}

function shapesFor(word) {
  const out = [];
  for (const ch of word.toLowerCase()) {
    const s = "aei".includes(ch) ? "open" : "ouwy".includes(ch) ? "mid" : "mbpf".includes(ch) ? "base" : null;
    if (s && s !== out[out.length - 1]) out.push(s);
  }
  return out.length ? out : ["mid"];
}

function setShape(key, shape) { const b = $(`#seat-${key} .bust`); if (b) b.dataset.shape = shape; }

function setSpeaker(key, target) {
  state.speaking = key;
  if (key) lastActive[key] = Date.now();
  if (target) lastActive[target] = Date.now();
  $$(".seat").forEach((el) => { el.classList.toggle("speaking", el.dataset.seat === key); el.classList.toggle("addressed", el.dataset.seat === target); });
  $$(".nameplate").forEach((el) => el.classList.toggle("speaking", el.dataset.seat === key));
  const el = key && $(`#seat-${key}`);
  if (el) {
    el.classList.remove("thinking");
    // lean toward whoever they're answering
    // the speaker turns toward whoever they answer; everyone else turns to watch the speaker.
    // The portraits face front, so a perspective rotateY fakes the head turn.
    const g = state.geo[key], tg = target && state.geo[target];
    const dir = tg ? Math.sign(tg.x - g.x) : 0;
    el.style.transform = `perspective(900px) translateX(${dir * g.size * 0.04}px) rotateY(${dir * 20}deg) rotate(${dir * 2}deg) scale(1.05)`;
    $$(".seat").forEach((s) => {
      if (s.dataset.seat === key) return;
      const sg = state.geo[s.dataset.seat];
      const look = sg ? Math.sign(g.x - sg.x) : 0;
      s.style.transform = `perspective(900px) rotateY(${look * (s.dataset.seat === target ? 18 : 9)}deg)`;
    });
    moveSpot(key);
  } else {
    $("#spot").classList.remove("on");
    $$(".seat").forEach((s) => { s.style.transform = ""; });
  }
}

function captionFor(who) {
  $("#cruxes").hidden = true;
  $("#plate").hidden = true;
  const c = $("#caption");
  c.hidden = false;
  c.style.animation = "none"; void c.offsetWidth; c.style.animation = "";
  const s = state.byKey[who];
  $("#capAv").className = `cap-av${s ? "" : " chair"}`;
  $("#capAv").innerHTML = `<img src="${s ? portrait(who) : CHAIR_ICON}" alt="">`;
  $("#capWho").textContent = s ? s.name : "The Chair";
}

function chairSays(text, { dots = false, tag = "" } = {}) {
  setSpeaker(null);
  captionFor(null);
  $("#capTag").textContent = tag;
  const p = $("#capText");
  p.className = "cap-text chair";
  p.innerHTML = esc(text) + (dots ? '<span class="dots"><i></i><i></i><i></i></span>' : "");
  $("#capSub").textContent = "";
}

async function speak(key, text, { tag = "", target = null, sub = "" } = {}) {
  setSpeaker(key, target);
  captionFor(key);
  $("#capTag").textContent = tag;
  $("#capSub").textContent = "";
  const p = $("#capText");
  p.className = "cap-text";
  const words = text.split(" ").filter(Boolean);
  p.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span> `).join("");
  const spans = $$(".w", p);
  const said = voice.say(key, text);
  for (let i = 0; i < words.length; i++) {
    if (player.fast) break;
    const w = words[i];
    spans[i].classList.add("on");
    const shapes = shapesFor(w.replace(/[^a-z]/gi, ""));
    const dur = Math.max(170, w.length * 52);
    const per = dur / (shapes.length + 1);
    for (const sh of shapes) { setShape(key, sh); await player.sleep(per); }
    setShape(key, "base");
    await player.sleep(per + (/[.!?]["”)]?$/.test(w) ? 340 : /[,;:]$/.test(w) ? 170 : 25));
  }
  spans.forEach((s) => s.classList.add("on"));
  setShape(key, "base");
  $("#capSub").innerHTML = sub;
  await said;
  await player.sleep(voice.on ? 500 : 1300);
}

// idle blinking for everyone, so the room feels alive between lines
// Now and then a founder who has been quiet for a while lifts the cup and takes a sip.
const lastActive = {};
function startSipping() {
  const tick = () => {
    const now = Date.now();
    const quiet = state.seats.filter((s) => s.key !== state.speaking && now - (lastActive[s.key] || 0) > 20000
      && !$(`#seat-${s.key}`)?.classList.contains("absent") && !$(`#cup-${s.key}`)?.classList.contains("sip"));
    if (quiet.length && Math.random() < 0.6) {
      const s = quiet[Math.floor(Math.random() * quiet.length)];
      const cup = $(`#cup-${s.key}`);
      lastActive[s.key] = now;
      cup.classList.add("sip");
      const bust = $(`#seat-${s.key} .bust`);
      setTimeout(() => { if (state.speaking !== s.key && bust) bust.dataset.shape = "blink"; }, 950);
      setTimeout(() => { if (bust?.dataset.shape === "blink") bust.dataset.shape = "base"; }, 2050);
      setTimeout(() => cup.classList.remove("sip"), 3200);
    }
    setTimeout(tick, 6000 + Math.random() * 6000);
  };
  setTimeout(tick, 5000);
}

function startBlinking() {
  const blink = (key) => {
    const b = $(`#seat-${key} .bust`);
    if (b && b.dataset.shape === "base") {
      b.dataset.shape = "blink";
      setTimeout(() => { if (b.dataset.shape === "blink") b.dataset.shape = "base"; }, 130);
    }
    setTimeout(() => blink(key), 2400 + Math.random() * 4200);
  };
  state.seats.forEach((s, i) => setTimeout(() => blink(s.key), 600 + i * 530));
}

async function onSeatDone(ev) {
  const { round, seat, text, parsed, quotes } = ev;
  state.cards[round][seat] = { text, parsed, quotes };
  const s = state.byKey[seat];
  const top = topOption(parsed.optionScores);
  const line = lineFor(round, parsed);
  let tag = ROUND_NAME[round], sub = "", target = null;
  if (round === 1) {
    tag = `${stanceWord(parsed.stance)}${top ? ` · backs ${top.id} (${top.v}/10)` : ""}`;
  } else if (round === 2) {
    const tgt = parsed.disagreeWith ? state.byKey[parsed.disagreeWith] : null;
    if (tgt) {
      target = tgt.key;
      tag = `Pushes back on ${tgt.short}`;
      state.links = state.links.filter((l) => l.from !== seat);
      state.links.push({ from: seat, to: tgt.key });
      drawLinks();
    }
    sub = /^yes/i.test(parsed.moved) ? "Changed position" : "";
  } else {
    const v = parsed.vote || "endorse";
    tag = `Votes ${v}`;

  }
  // Shark Tank: the last round's card says whether this founder is in, and on what terms
  const deal = state.setup?.shark && parsed.deal && round === (state.setup.mode === "deep" ? 3 : 2) ? parsed.deal : "";
  if (deal) tag = deal === "in" ? `In${parsed.terms ? ": " + shorten(clean(parsed.terms), 60) : ""}` : "Out";
  feedCard(round, seat, parsed);
  await speak(seat, line || "I'll put it in my card.", { tag, target, sub });
  if (deal) {
    $(`#seat-${seat} .deal`)?.remove();
    const st = document.createElement("div");
    st.className = `deal ${deal}`;
    st.textContent = deal === "in" ? "I'M IN" : "I'M OUT";
    $(`#seat-${seat}`).appendChild(st);
  }

  const pl = $(`#plate-${seat}`);
  const chip = $(".chip", pl);
  chip.hidden = round === 3; // the vote stamp says it
  chip.className = "chip";
  if (round === 3) {
    const v = parsed.vote || "endorse";
    chip.textContent = v;
    chip.classList.add(v);
    $(`#seat-${seat} .vote`)?.remove();
    const stamp = document.createElement("div");
    stamp.className = `vote ${v}`;
    stamp.textContent = v.toUpperCase();
    $(`#seat-${seat}`).appendChild(stamp);
  } else chip.textContent = stanceWord(parsed.stance);
  if (top) { const sc = $(".score", pl); sc.hidden = false; sc.textContent = `${top.id} ${top.v}`; sc.title = `Highest score: option ${top.id}`; }
  setSpeaker(null);
  void s;
}

function stanceWord(t = "") {
  const m = t.match(/strong yes|conditional yes|strong no|yes|no/i);
  if (!m) return "Spoke";
  const w = m[0].toLowerCase();
  return w === "conditional yes" ? "Yes, if" : w[0].toUpperCase() + w.slice(1);
}

function topOption(scores = {}) {
  const e = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return e ? { id: e[0], v: e[1] } : null;
}
const shorten = (t, n) => (t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t);
const face = (k) => `<img src="${portrait(k)}" alt="${esc(state.byKey[k]?.short || k)}" title="${esc(state.byKey[k]?.short || k)}">`;

async function onCruxes(ev) {
  setSpeaker(null);
  $("#caption").hidden = true;
  const c = $("#cruxes");
  c.hidden = false;
  c.innerHTML = `<div class="head">${ev.unanimous ? "Too much agreement. The Chair pushes back." : "What they're fighting about"}</div>` +
    ev.cruxes.map((x, i) => `<div class="crux" style="animation-delay:${i * 0.18}s"><b>${esc(x.question)}</b><div class="sides">${x.sides.map((sd) => `<span class="side"><span class="faces">${sd.seats.filter((k) => state.byKey[k]).map(face).join("")}</span>${esc(shorten(sd.position, 48))}</span>`).join("")}</div></div>`).join("");
  const f = document.createElement("div");
  f.className = "feed-note";
  f.innerHTML = `<b>The fight:</b> ${ev.cruxes.map((x) => esc(x.question)).join(" ")}`;
  feedAppend(f);
  await player.sleep(3500 + 1800 * ev.cruxes.length);
}

async function onDraft(d) {
  chairSays(`Proposal: ${d.label} on option ${d.option}. ${firstSentences(clean(d.recommendation), 140)}`, { tag: "Up for a vote" });
  const f = document.createElement("div");
  f.className = "feed-note";
  f.innerHTML = `<b>Up for a vote:</b> ${esc(d.label)} on option ${esc(d.option)}.`;
  feedAppend(f);
  await player.sleep(4200);
}

// ------------------------------------------------------------- rebuttal arcs
function drawLinks() {
  const svg = $("#links");
  const stage = $("#stage");
  const w = stage.clientWidth, h = stage.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const links = state.links || [];
  const col = "#38bdf8";
  svg.innerHTML = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${col}"/></marker></defs>` +
    links.map(({ from, to }, i) => {
      const a = state.geo[from], b = state.geo[to];
      if (!a || !b) return "";
      const y1 = a.top - 6, y2 = b.top - 6;
      const mx = (a.x + b.x) / 2, my = Math.min(y1, y2) - Math.min(90, Math.abs(a.x - b.x) * 0.22) - 10;
      return `<path class="${i < links.length - 1 ? "old" : ""}" d="M${a.x},${y1} Q${mx},${my} ${b.x},${y2}" stroke="${col}" marker-end="url(#arrow)"/>`;
    }).join("");
}

// ------------------------------------------------------------- feed + cards
function feedAppend(node) {
  const feed = $("#feed");
  $(".empty", feed)?.remove();
  feed.appendChild(node);
  feed.scrollTop = feed.scrollHeight;
}
function feedPhase(label) {
  const d = document.createElement("div");
  d.className = "feed-phase";
  d.textContent = label.replace(/^The Chair is /, "Chair: ");
  feedAppend(d);
}
function feedCard(round, seat, parsed) {
  const s = state.byKey[seat];
  const d = document.createElement("div");
  d.className = "feed-card";
  d.dataset.seat = seat;
  d.dataset.round = round;
  const top = topOption(parsed.optionScores);
  const tgt = parsed.disagreeWith ? state.byKey[parsed.disagreeWith]?.short : "";
  const what = round === 1 ? `${stanceWord(parsed.stance)}${top ? `, backs ${top.id}` : ""}` : round === 2 ? (tgt ? `vs ${tgt}` : "Debate") : `Votes ${parsed.vote || "endorse"}`;
  d.innerHTML = `<img class="av" src="${portrait(seat)}" alt=""><div><div class="h">${esc(s.short)}<span class="r">${esc(what)}</span></div><p>${esc(lineFor(round, parsed, 105))}</p></div>`;
  feedAppend(d);
}

function openCard(seat, round) {
  const s = state.byKey[seat];
  const rounds = [3, 2, 1].filter((r) => state.cards[r][seat]);
  const r = round || rounds[0];
  const c = state.cards[r]?.[seat];
  $("#cardBody").innerHTML = `
    <div class="card-head"><img src="${portrait(seat)}" alt=""><div><div class="label">${esc(s.pillar)}</div><h3>${esc(s.name)}</h3><p class="muted" style="margin:0">Owns the question: ${esc(s.question)}</p></div></div>
    ${rounds.length > 1 ? `<p style="margin:0 0 6px">${rounds.slice().reverse().map((x) => `<button class="ghost" data-r="${x}" style="margin-right:6px">${ROUND_NAME[x]}</button>`).join("")}</p>` : ""}
    ${c ? `<pre>${esc(c.text)}</pre>${c.quotes.length ? `<ul class="qcheck">${c.quotes.map((q) => `<li class="${q.verified ? "" : "bad"}">"${esc(shorten(q.quote, 110))}" (${q.source}) ${q.verified ? "verified in the brain" : "not found in the brain"}</li>`).join("")}</ul>` : ""}` : `<p class="muted">This seat has not spoken yet.</p>`}
    <p class="ask-seat"><button class="pill" type="button" data-ask="${seat}">Ask ${esc(s.short)} a question</button></p>
    <p class="muted" style="font-size:12px">A simulated advisor built from ${esc(s.name)}'s public work. Not the person.</p>`;
  $$("#cardBody [data-r]").forEach((b) => b.addEventListener("click", () => openCard(seat, Number(b.dataset.r))));
  const dlg = $("#cardDialog");
  if (!dlg.open) dlg.showModal();
}

// ------------------------------------------------------------- verdict
// the Chair should write display names; map any raw seat key just in case
const seatKey = (x) => { const k = String(x).toLowerCase().replace(/\s+/g, ""); return state.byKey[k] ? k : state.seats.find((s) => s.short.toLowerCase() === String(x).toLowerCase() || s.name.toLowerCase() === String(x).toLowerCase())?.key; };
const seatName = (x) => state.byKey[seatKey(x)]?.short || x;

function labelClass(l) { return /DON'T/.test(l) ? "dont" : /RESHAPE/.test(l) ? "reshape" : /WAIT/.test(l) ? "wait" : "go"; }

function onVerdict(ev) {
  const v = ev.verdict;
  state.verdict = ev;
  setStep("verdict");
  setSpeaker(null);
  $("#caption").hidden = true;
  $("#cruxes").hidden = true;
  state.links = [];
  drawLinks();
  $("#stage").classList.remove("live");
  updateOptions(v.scores);
  const opt = (id) => state.options.find((o) => o.id === id)?.label || id;
  const seats = ev.seats;
  const mk = seatKey(v.minority.seat);
  const short = (t, n) => esc(shorten(clean(t || ""), n));
  const html = `
    <div class="v-top">
      <div><div class="label">The council's verdict</div><span class="v-label ${labelClass(v.label)}">${esc(v.label)}</span></div>
      <div class="actions"><button class="pill" type="button" data-pdf>Download PDF</button><button class="ghost" type="button" data-share>Share image</button><button class="ghost" data-close>Back to the table</button></div>
    </div>
    <p class="v-call">${esc(v.call)}</p>
    <div class="v-grid">
      <div class="v-sec"><h3>Scores</h3><div class="v-opts">${state.options.map((o) => `
        <div class="opt ${o.id === v.recommended ? "lead" : ""}"><span class="id">${o.id}</span><span class="label">${esc(o.label)}</span><span class="val">${v.scores[o.id]?.score ?? "-"}</span><span class="bar"><i style="width:${(v.scores[o.id]?.score || 0) * 10}%"></i></span></div>`).join("")}</div>
        <p class="v-meta">Confidence ${v.confidence ?? "-"}/10${v.votes ? ` · ${v.votes.endorse || 0} endorse, ${v.votes.amend || 0} amend, ${v.votes.dissent || 0} dissent` : ""}</p>
        ${ev.runs ? `<p class="v-meta">${ev.runs} seat runs on ${esc(MODEL_NAME[ev.model] || ev.model || "Claude")}</p>` : ""}
      </div>
      ${ev.shark ? `<div class="v-sec"><h3>The deals</h3><p class="v-meta">${seats.filter((x) => x.deal === "in").length} in, ${seats.filter((x) => x.deal === "out").length} out</p><ul class="v-deals">${seats.filter((x) => x.deal).map((x) => `<li><span class="tag ${x.deal}">${x.deal === "in" ? "IN" : "OUT"}</span><span><b>${esc(state.byKey[x.key].short)}</b> ${short(x.terms, 110)}</span></li>`).join("")}</ul></div>` : ""}
      <div class="v-sec"><h3>Why</h3><ul class="v-why">${v.why.slice(0, 3).map((w) => { const k = seatKey(w.seat); return `<li>${k ? `<img class="av" src="${portrait(k)}" alt="">` : ""}<span>${short(w.point, 150)}</span></li>`; }).join("")}</ul></div>
      <div class="v-sec"><h3>Watch out</h3><div class="minority"><div class="who">${mk ? `<img class="av" src="${portrait(mk)}" alt="">` : ""}${esc(seatName(v.minority.seat))}</div><q>${short(v.minority.quote, 170)}</q></div></div>
      <div class="v-sec"><h3>Next steps</h3><ul class="v-steps">${v.next_steps.slice(0, 3).map((n) => `<li><b>${esc(n.when)}</b> ${short(n.action, 120)}</li>`).join("")}</ul>
        <p class="v-meta"><b>Kill it if:</b> ${short(v.kill_criteria, 140)}</p></div>
    </div>
    <details class="v-more"><summary>Full detail</summary>
      <div class="v-grid">
        <div class="v-sec"><h3>Where they fought</h3><ul>${v.fights.map((f) => `<li><b>${esc(f.crux)}</b> ${esc(f.story)}</li>`).join("")}</ul></div>
        <div class="v-sec"><h3>Conditions</h3><ol>${v.conditions.map((c) => `<li>${esc(c)}</li>`).join("")}</ol></div>
        <div class="v-sec v-wide"><h3>Scorecard</h3>
          <table class="scorecard"><thead><tr><th>Seat</th><th>Weight</th>${state.options.map((o) => `<th>${o.id}</th>`).join("")}<th>Their line</th></tr></thead><tbody>
          ${seats.map((x) => { const s = state.byKey[x.key]; return `<tr><td><span class="who"><img class="av" src="${portrait(x.key)}" alt="">${esc(s.short)}</span></td><td class="n">${x.weight}</td>${state.options.map((o) => `<td class="n">${x.optionScores?.[o.id] ?? "-"}</td>`).join("")}<td class="line">${short(x.oneLine, 150)}</td></tr>`; }).join("")}
          </tbody></table>
          <p class="muted" style="font-size:11.5px;margin-top:8px">Weighted by how much each pillar matters here. ${state.options.map((o) => `${o.id}: ${esc(v.scores[o.id]?.math || "")}`).join(" · ")}</p></div>
        <div class="v-sec"><h3>Cheapest test</h3><p>${esc(v.cheapest_test)}</p><h3>Revisit</h3><p>${esc(v.revisit)}</p></div>
        <div class="v-sec"><h3>The strongest objection in full</h3><p>${esc(v.minority.quote)}</p><p class="muted">For this to be right: ${esc(v.minority.would_have_to_be_true)}</p></div>
        ${v.amendments?.length ? `<div class="v-sec v-wide"><h3>Amendments</h3><ul>${v.amendments.map((a) => `<li><b>${esc(seatName(a.seat))}:</b> ${esc(a.amendment)} <span class="tag">${a.adopted ? "Adopted" : "Not adopted"}: ${esc(a.reason)}</span></li>`).join("")}</ul></div>` : ""}
      </div>
    </details>
    <div class="v-foot"><span class="muted">${esc(v.disclaimer)}</span><button class="ghost" data-close>Back to the table</button></div>`;
  $("#verdictBody").innerHTML = html;
  const plate = $("#plate");
  plate.hidden = false;
  plate.innerHTML = `<div class="label">The council's verdict</div><span class="v-label ${labelClass(v.label)}">${esc(v.label)}</span><p>${esc(firstSentences(clean(v.call), 150))}</p><div class="row"><button type="button" id="plateOpen">Read the verdict</button><button type="button" data-pdf>Download PDF</button><button type="button" data-share>Share image</button><button type="button" class="alt" id="plateReplay">Replay this council</button></div>`;
  $("#plateOpen").addEventListener("click", () => ($("#verdictSheet").hidden = false));
  $("#plateReplay").addEventListener("click", () => replay(state.session));
  $("#playbar").hidden = true;
  const f = document.createElement("div");
  f.className = "feed-note";
  f.innerHTML = `<b>Verdict: ${esc(v.label)}.</b> ${esc(firstSentences(clean(v.call), 160))}`;
  feedAppend(f);
  setTimeout(() => { if (state.verdict === ev) $("#verdictSheet").hidden = false; }, 1600);
}

// ------------------------------------------------------------- history + replay
async function openHistory() {
  const { sessions } = await fetch("/api/sessions").then((x) => x.json());
  $("#historyList").innerHTML = sessions.length
    ? sessions.map((s) => `<li><button data-id="${esc(s.id)}"><b>${esc(s.title)}</b><small>${esc(s.id.slice(0, 10))} · ${esc(s.mode)} · ${esc(s.status)}</small></button>${s.status === "done" ? `<button class="pdf" type="button" data-pdf="${esc(s.id)}" title="Download the verdict as a PDF">PDF</button>` : ""}</li>`).join("")
    : '<li class="muted">No sessions yet. Convene the council once and it shows up here.</li>';
  $$("#historyList button[data-id]").forEach((b) => b.addEventListener("click", () => { $("#historyDialog").close(); replay(b.dataset.id); }));
  $("#historyDialog").showModal();
}

async function replay(id) {
  const j = await fetch(`/api/sessions/${encodeURIComponent(id)}`).then((x) => x.json());
  begin(id);
  state.replaying = true;
  for (const ev of j.events) {
    if (["delta", "usage", "seat_error", "end"].includes(ev.type)) continue;
    player.push(ev);
  }
}

// ------------------------------------------------------------- waiting on Claude Code
// A live council goes quiet for minutes while the seats write in parallel. Instead of a
// frozen table, say what is happening, how long it has been, and what each seat is weighing.
const SAME_TIME = "The advisors all write at the same time in Claude Code. Their lines play here as soon as the round is in.";
function waitCopy(phase) {
  const n = state.setup?.mode === "deep" ? 3 : 2;
  return {
    setup: ["Setting the table", "The Chair is seating the council.", ""],
    round1: ["Round 1 of " + n, "The advisors are writing their opening positions.", SAME_TIME],
    round2: ["Round 2 of " + n, "The advisors are reading each other's openings and firing back.", SAME_TIME],
    round3: ["Round 3 of " + n, "The advisors are voting on the Chair's proposal.", SAME_TIME],
    cruxes: ["Between rounds", "The Chair is reading the openings and finding where they disagree.", "The fight shows up here next, then the debate starts."],
    draft: ["Between rounds", "The Chair is turning the debate into a proposal for the vote.", "Next, every advisor votes on it."],
    skip3: ["Last step", "The Chair is scoring the room and writing the verdict.", "When it lands, you can download it as a PDF."],
    verdict: ["Last step", "The Chair is scoring the room and writing the verdict.", "When it lands, you can download it as a PDF."],
  }[phase] || ["Working", "The council is working.", ""];
}
const clock = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

function hideWait() {
  const w = $("#waitcard");
  if (w.hidden) return;
  w.hidden = true;
  $$(".seat.musing").forEach((e) => e.classList.remove("musing"));
  if (state.capWasShown) $("#caption").hidden = false;
  if (state.playbarWasShown) $("#playbar").hidden = false;
}

function tickWait() {
  const w = state.wait;
  const idle = !player.busy && !player.q.length;
  if (!w || !idle || state.replaying || !state.session || state.verdict) return hideWait();
  const card = $("#waitcard");
  if (card.hidden) {
    state.capWasShown = !$("#caption").hidden;
    $("#caption").hidden = true;
    $("#cruxes").hidden = true;
    // speed controls do nothing while the room waits, and they would cover the card
    state.playbarWasShown = !$("#playbar").hidden;
    $("#playbar").hidden = true;
    card.hidden = false;
    state.museAt = 0;
  }
  const [step, head, sub] = waitCopy(w.phase);
  const elapsed = Date.now() - w.at;
  $("#wcStep").textContent = step;
  $("#wcTime").textContent = clock(elapsed);
  $("#wcHead").textContent = head;
  $("#wcSub").textContent = sub;
  $("#wcNudge").hidden = elapsed < 4 * 60 * 1000;
  const round = Number((w.phase.match(/^round(\d)$/) || [])[1]) || 0;
  const bar = $("#wcBar").parentElement;
  const muse = $("#wcMuse");
  if (round) {
    const seats = state.active.length ? state.active : state.seats.map((s) => s.key);
    const done = seats.filter((k) => state.cards[round][k]).length;
    bar.classList.toggle("indeterminate", done === 0);
    $("#wcBar").style.width = done ? Math.round((done / seats.length) * 100) + "%" : "";
    // every few seconds, show what one of the still-thinking seats is weighing
    const pending = seats.filter((k) => !state.cards[round][k]);
    if (pending.length && Date.now() - (state.museAt || 0) > 5200) {
      state.museAt = Date.now();
      state.museIdx = ((state.museIdx ?? -1) + 1) % pending.length;
      const s = state.byKey[pending[state.museIdx]];
      muse.classList.add("fade");
      setTimeout(() => {
        muse.innerHTML = "<b>" + esc(s.short) + "</b> is weighing: " + esc(s.question.replace(/^./, (c) => c.toLowerCase())) + (done ? " · " + done + " of " + seats.length + " in" : "");
        muse.classList.remove("fade");
        $$(".seat").forEach((el) => el.classList.toggle("musing", el.dataset.seat === s.key));
      }, 300);
    }
  } else {
    bar.classList.add("indeterminate");
    $("#wcBar").style.width = "";
    muse.textContent = "";
    $$(".seat.musing").forEach((e) => e.classList.remove("musing"));
  }
}

function openGuide() {
  $("#guideBody").innerHTML = GUIDE;
  const d = $("#guideDialog");
  if (!d.open) d.showModal();
}

// ------------------------------------------------------------- PDF
async function savePdf(btn) {
  const id = btn.dataset.pdf;
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = "Making PDF...";
  try {
    let setup = state.setup, verdict = state.verdict;
    if (id) { // a past session from the history list
      const j = await fetch("/api/sessions/" + encodeURIComponent(id)).then((x) => x.json());
      setup = j.events.find((e) => e.type === "setup");
      verdict = [...j.events].reverse().find((e) => e.type === "verdict");
    }
    if (!setup || !verdict) throw new Error("This council has no verdict yet.");
    await downloadVerdictPdf({ setup, verdict, byKey: state.byKey, id: id || state.session });
  } catch (e) {
    console.error(e);
    toast("Couldn't make the PDF: " + (e.message || e));
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

// ------------------------------------------------------------- share image
async function shareImage(btn) {
  const ev = state.verdict;
  if (!ev) return toast("This council has no verdict yet.");
  btn.disabled = true;
  try {
    const v = ev.verdict;
    const deals = ev.shark ? `${ev.seats.filter((x) => x.deal === "in").length} in, ${ev.seats.filter((x) => x.deal === "out").length} out` : "";
    const blob = await drawShareImage({
      title: state.setup?.title, label: v.label, labelClass: labelClass(v.label), call: firstSentences(clean(v.call), 220),
      option: v.recommended, score: v.scores[v.recommended]?.score, deals, seats: state.seats.map((s) => s.key),
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `businessroom-${(state.session || "verdict").slice(0, 60)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch (e) {
    console.error(e);
    toast("Couldn't make the image.");
  } finally { btn.disabled = false; }
}

// ------------------------------------------------------------- misc
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 6000);
}
async function refreshUsage() {
  const u = await fetch("/api/usage").then((x) => x.json()).catch(() => null);
  if (!u || !u.calls) { $("#usage").textContent = ""; return; }
  const k = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1000)}k`);
  $("#usage").textContent = `${u.calls} calls · ${k(u.input + u.cacheRead + u.cacheWrite)} in · ${k(u.output)} out`;
}

boot();
