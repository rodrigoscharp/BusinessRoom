import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// The plugin root: app/ sits beside skills/, agents/, and the example sessions.
// An installed plugin lives in Claude Code's plugin cache, which an update replaces,
// so the user's own councils are kept outside it, in DATA_DIR.
export const PLUGIN_ROOT = path.resolve(APP_ROOT, "..");
export const BRAINS_DIR = path.join(PLUGIN_ROOT, "skills", "business-room", "brains");
export const AGENTS_DIR = path.join(PLUGIN_ROOT, "agents");
export const EXAMPLES_DIR = path.join(PLUGIN_ROOT, "sessions");
export const DATA_DIR = path.resolve(process.env.BUSINESS_ROOM_HOME || path.join(os.homedir(), ".business-room"));
export const SESSIONS_DIR = path.join(DATA_DIR, "sessions");
export const PORT = Number(process.env.BUSINESS_ROOM_PORT || process.env.PORT) || 4740;
export const VERSION = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, ".claude-plugin", "plugin.json"), "utf8")).version;

/** Session folder name to its absolute path: the user's own councils, then the shipped examples. */
export function sessionFolders() {
  const out = new Map();
  for (const root of [EXAMPLES_DIR, SESSIONS_DIR]) {
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root)) {
      const dir = path.join(root, name);
      if (fs.statSync(dir).isDirectory()) out.set(name, dir); // the user's folder wins a name clash
    }
  }
  return out;
}

let cache = null;
export function env(key) {
  if (process.env[key]) return process.env[key];
  if (!cache) {
    cache = {};
    // The user's .env in DATA_DIR wins over one beside the code (a dev checkout).
    for (const p of [path.join(DATA_DIR, ".env"), path.join(PLUGIN_ROOT, ".env")]) {
      if (!fs.existsSync(p)) continue;
      for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !(m[1] in cache)) cache[m[1]] = m[2].trim();
      }
    }
  }
  return cache[key] || "";
}
