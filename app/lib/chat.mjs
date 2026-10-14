// The bridge between the room's chat box and Claude Code.
// The page appends the founder's messages; the Chair (Claude Code, through
// app/scripts/chat.mjs) appends its replies and waits for the next message.
// Everything lives in one JSON-lines file so both sides can read it without a server.
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./env.mjs";

export const CHAT_FILE = path.join(DATA_DIR, "chat.jsonl");
const CURSOR_FILE = path.join(DATA_DIR, "chat.cursor");
const LISTENER_FILE = path.join(DATA_DIR, "chat.listener");
const MAX_TEXT = 4000;

export function readAll() {
  try {
    return fs.readFileSync(CHAT_FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export function append(from, text, lang, options) {
  const t = String(text || "").trim().slice(0, MAX_TEXT);
  if (!t) throw new Error("empty message");
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const all = readAll();
  const msg = { id: (all.at(-1)?.id || 0) + 1, at: new Date().toISOString(), from, text: t, ...(lang ? { lang } : {}), ...(options?.length ? { options: options.slice(0, 4).map((o) => String(o).slice(0, 80)) } : {}) };
  fs.appendFileSync(CHAT_FILE, JSON.stringify(msg) + "\n");
  return msg;
}

/** Start a fresh conversation: keep the old one next to it for reference. */
export function reset() {
  if (fs.existsSync(CHAT_FILE)) fs.renameSync(CHAT_FILE, path.join(DATA_DIR, `chat-${Date.now()}.jsonl`));
  fs.rmSync(CURSOR_FILE, { force: true });
}

/** The last message id the Chair has already read. */
export function cursor() {
  try { return Number(fs.readFileSync(CURSOR_FILE, "utf8")) || 0; } catch { return 0; }
}
export function setCursor(id) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CURSOR_FILE, String(id));
}

/** The Chair's wait loop touches this so the page can say whether Claude Code is listening. */
/** The language the room is shown in, so the Chair greets in the right one. */
const LANG_FILE = path.join(DATA_DIR, "room.lang");
export function setRoomLang(l) { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(LANG_FILE, l === "pt" ? "pt" : "en"); }
export function roomLang() { try { return fs.readFileSync(LANG_FILE, "utf8").trim() || "en"; } catch { return "en"; } }

export function heartbeat() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LISTENER_FILE, String(Date.now()));
}
export function listening() {
  try { return Date.now() - Number(fs.readFileSync(LISTENER_FILE, "utf8")) < 15000; } catch { return false; }
}
export function stopListening() {
  fs.rmSync(LISTENER_FILE, { force: true });
}
