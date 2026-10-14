// Starts the room if it is not running, then opens it in the default browser.
// The skill runs this first, so one command takes the user from install to an open room.
//
//   node app/scripts/open-room.mjs            start if needed, open the browser
//   node app/scripts/open-room.mjs --no-open  start if needed, print the URL only
//   node app/scripts/open-room.mjs --stop     stop the room this script started
//
// Prints KEY=value lines (ROOM_URL, SESSIONS_DIR, COMPANY_FILE, UPLOADS_DIR, STATUS) for the skill to read.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { APP_ROOT, DATA_DIR, SESSIONS_DIR, PORT, VERSION } from "../lib/env.mjs";

const URL_ = `http://localhost:${PORT}`;
const PID_FILE = path.join(DATA_DIR, "room.pid");
const LOG_FILE = path.join(DATA_DIR, "room.log");
const args = new Set(process.argv.slice(2));

async function health() {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/api/health`, { signal: AbortSignal.timeout(1000) });
    if (!r.ok) return { other: true };
    const j = await r.json();
    return j.app === "business-room" ? j : { other: true };
  } catch (e) {
    // Nothing listening is the normal "not started" case; anything else on the port is not ours.
    return e?.cause?.code === "ECONNREFUSED" || e?.name === "TimeoutError" ? null : { other: true };
  }
}

function stop() {
  try {
    const pid = Number(fs.readFileSync(PID_FILE, "utf8"));
    process.kill(pid);
    fs.rmSync(PID_FILE, { force: true });
    return true;
  } catch {
    return false;
  }
}

function start() {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  const log = fs.openSync(LOG_FILE, "a");
  // Detached in its own process group, so the room outlives the command that started it.
  const child = spawn(process.execPath, [path.join(APP_ROOT, "server.mjs")], { detached: true, stdio: ["ignore", log, log] });
  child.unref();
  fs.writeFileSync(PID_FILE, String(child.pid));
}

function openBrowser() {
  const [cmd, cmdArgs] =
    process.platform === "darwin" ? ["open", [URL_]] :
    process.platform === "win32" ? ["cmd", ["/c", "start", "", URL_]] :
    ["xdg-open", [URL_]];
  try { spawn(cmd, cmdArgs, { detached: true, stdio: "ignore" }).unref(); } catch {}
}

const out = (status) => {
  console.log(`ROOM_URL=${URL_}`);
  console.log(`SESSIONS_DIR=${SESSIONS_DIR}`);
  console.log(`COMPANY_FILE=${path.join(DATA_DIR, "company.md")}`);
  console.log(`UPLOADS_DIR=${path.join(DATA_DIR, "uploads")}`);
  console.log(`STATUS=${status}`);
};

if (args.has("--stop")) {
  console.log(`STATUS=${stop() ? "stopped" : "not-running"}`);
  process.exit(0);
}

let h = await health();
let status = "already-running";
if (h?.other) {
  console.error(`Port ${PORT} is taken by another app. Set BUSINESS_ROOM_PORT to a free port and try again.`);
  process.exit(1);
}
if (h && h.version !== VERSION) {
  // A room from an older version of the plugin is still up: replace it.
  stop();
  await new Promise((r) => setTimeout(r, 500));
  h = await health();
  if (h) {
    console.error(`An older room (v${h.version}) is running on port ${PORT} and could not be stopped. Close it and try again.`);
    process.exit(1);
  }
}
if (!h) {
  start();
  status = "started";
  for (let i = 0; i < 40 && !(await health()); i++) await new Promise((r) => setTimeout(r, 250));
  if (!(await health())) {
    console.error(`The room did not start. See ${LOG_FILE}.`);
    process.exit(1);
  }
}
if (!args.has("--no-open")) openBrowser();
out(status);
