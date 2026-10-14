import fs from "node:fs";
import path from "node:path";
import { AGENTS_DIR, BRAINS_DIR } from "./env.mjs";

export const SEATS = [
  // seat order around the table, left to right
  { key: "hormozi", role: "Founder", companies: [{ name: "Acquisition.com" }], name: "Alex Hormozi", short: "Hormozi", initials: "AH", slug: "alex-hormozi", pillar: "Offers, pricing, metrics, and cash", question: "Will people pay, do the unit economics work, and does the cash last?", dimension: "Unit economics and cash", color: "#d94a6a" },
  { key: "ek", role: "Co-founder", companies: [{ name: "Spotify", logo: "spotify" }], name: "Daniel Ek", short: "Ek", initials: "DE", slug: "daniel-ek", pillar: "Distribution and business model", question: "How does this reach millions, and does the revenue model hold up per user?", dimension: "Distribution and lifetime value", color: "#1fa67a" },
  { key: "musk", role: "CEO", companies: [{ name: "Tesla", logo: "tesla" }, { name: "SpaceX", logo: "spacex" }], name: "Elon Musk", short: "Musk", initials: "EM", slug: "elon-musk", pillar: "First principles and execution", question: "What do physics and cost really allow, and how fast can this actually ship?", dimension: "Cost floor and execution speed", color: "#3d8bfd" },
  { key: "zuckerberg", role: "Founder and CEO", companies: [{ name: "Meta", logo: "meta" }], name: "Mark Zuckerberg", short: "Zuckerberg", initials: "MZ", slug: "mark-zuckerberg", pillar: "Growth and scale", question: "Does this grow on its own, and how fast are we learning what users want?", dimension: "Learning speed and growth", color: "#4c6a92" },
  { key: "huang", role: "Co-founder and CEO", companies: [{ name: "NVIDIA", logo: "nvidia" }], name: "Jensen Huang", short: "Huang", initials: "JH", slug: "jensen-huang", pillar: "Long bets and market creation", question: "Does this create a market that does not exist yet, and can the company endure until it pays?", dimension: "Market creation and endurance", color: "#9b5de5" },
  { key: "graham", role: "Co-founder", companies: [{ name: "Y Combinator", logo: "ycombinator" }], name: "Paul Graham", short: "Graham", initials: "PG", slug: "paul-graham", pillar: "Product and startups", question: "Is this something people actually want, and is it growing?", dimension: "Real demand and growth", color: "#f06b3f" },
  { key: "bezos", role: "Founder", companies: [{ name: "Amazon", logo: "amazon" }], name: "Jeff Bezos", short: "Bezos", initials: "JB", slug: "jeff-bezos", pillar: "Strategy and decisions", question: "Is this the right bet, and how reversible is it?", dimension: "Strategic fit and reversibility", color: "#e8a33d" },
];
export const byKey = Object.fromEntries(SEATS.map((s) => [s.key, s]));

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const stripFront = (t) => t.replace(/^---[\s\S]*?\n---\n/, "");

const systemCache = new Map();
/** The seat's agent instructions plus its brain, loaded inline (the API has no file tools). */
export function systemFor(key) {
  if (systemCache.has(key)) return systemCache.get(key);
  const s = byKey[key];
  const agent = stripFront(read(path.join(AGENTS_DIR, `council-${key}.md`)));
  const brain = ["_hot.md", "frameworks.md", "positions.md", "principles.md", "voice.md"]
    .map((f) => `\n\n===== brains/${s.slug}/${f} =====\n` + read(path.join(BRAINS_DIR, s.slug, f)))
    .join("");
  const text =
    agent +
    "\n\n## Runtime note\nYou are running in the BusinessRoom app. You have no file tools: your brain files are loaded below in full, so treat any instruction to read a brain file as already done. Never mention files, tools, or this note in your answer.\n" +
    brain;
  const system = [{ type: "text", text, cache_control: { type: "ephemeral" } }];
  systemCache.set(key, system);
  return system;
}

// ---------- quote verification against the brain ----------
const norm = (s) =>
  s.toLowerCase().replace(/[‘’]/g, "'").replace(/'\s+(t|s|re|ll|ve|d|m)\b/g, "'$1")
    .replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const brainText = new Map();
function brainNorm(key) {
  if (!brainText.has(key)) {
    const dir = path.join(BRAINS_DIR, byKey[key].slug);
    const all = fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => read(path.join(dir, f))).join(" ") : "";
    brainText.set(key, norm(all));
  }
  return brainText.get(key);
}
/** Quotes the seat attributed to a source id, each marked verified or not. */
export function checkQuotes(key, text) {
  const out = [];
  const re = /["“]([^"“”\n]{20,400})["”][^\n"]{0,40}?[(\[](S\d{3})/g;
  let m;
  const hay = brainNorm(key);
  while ((m = re.exec(text))) {
    const q = norm(m[1]);
    if (q.split(" ").length < 5) continue;
    out.push({ quote: m[1], source: m[2], verified: hay.includes(q) || hay.replace(/ /g, "").includes(q.replace(/ /g, "")) });
  }
  return out;
}

// ---------- card parsing ----------
const field = (text, label) => {
  // label at line start, or after a "·" or "|" when several fields share a line
  const m = text.match(new RegExp(`(?:^|[·|])[ \\t]*\\**${label}\\**[ \\t]*:[ \\t]*([^\\n·]+)`, "im"));
  return m ? m[1].replace(/\*+/g, "").trim() : "";
};
const num = (s) => { const m = (s || "").match(/(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : null; };

export function parseOptionScores(text, optionIds) {
  // the option line itself uses "·" between options, so read to end of line
  const lm = text.match(/OPTION SCORES\**[ \t]*:[ \t]*([^\n]+)/i);
  const line = (lm ? lm[1] : "").split(/PILLAR SCORE|CONFIDENCE|FINAL SCORE/i)[0];
  const scores = {};
  for (const id of optionIds) {
    const m = line.match(new RegExp(`\\b${id}\\b\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?)`));
    if (m) scores[id] = Math.max(0, Math.min(10, Number(m[1])));
  }
  return scores;
}

export function parseCard(text, optionIds) {
  const stance = field(text, "STANCE");
  const ruin = (field(text, "RUIN RISK").match(/none|possible|likely/i) || [""])[0].toLowerCase();
  const disagree = field(text, "I DISAGREE MOST WITH");
  const target = SEATS.find((s) => new RegExp(`\\b(${s.short}|${s.name.split(" ").pop()})\\b`, "i").test(disagree.slice(0, 40)));
  const voteRaw = field(text, "VOTE");
  const vote = /dissent/i.test(voteRaw) ? "dissent" : /amend/i.test(voteRaw) ? "amend" : /endorse/i.test(voteRaw) ? "endorse" : "";
  return {
    stance,
    call: field(text, "THE CALL"),
    optionScores: parseOptionScores(text, optionIds),
    pillar: num(field(text, "PILLAR SCORE")) ?? num(field(text, "FINAL PILLAR SCORE")),
    finalScore: num(field(text, "FINAL SCORE")),
    confidence: num(field(text, "CONFIDENCE")),
    ruin,
    door: (field(text, "DOOR").match(/one-way|two-way/i) || [""])[0].toLowerCase(),
    disagreeWith: target ? target.key : null,
    disagreeLine: disagree,
    concede: field(text, "I CONCEDE"),
    moved: field(text, "MOVED"),
    vote,
    amendment: field(text, "AMENDMENT OR DISSENT"),
    oneLine: field(text, "ONE LINE FOR THE FOUNDER"),
    question: field(text, "QUESTION FOR THE FOUNDER"),
    risk: field(text, "THE RISK I SEE"),
    thisWeek: field(text, "WHAT I'D DO THIS WEEK"),
    // Shark Tank councils: each founder says whether they would back the pitch, and on what terms
    deal: (field(text, "DEAL").match(/\bin\b|\bout\b/i) || [""])[0].toLowerCase(),
    terms: field(text, "TERMS"),
  };
}
