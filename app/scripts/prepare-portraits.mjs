// Turns generated portrait images into the room's four .webp frames.
//
//   node app/scripts/prepare-portraits.mjs <input-dir> [options]
//
// <input-dir> holds four images per founder, named <key>-<frame>.<ext>:
//   musk-base.png  musk-mid.png  musk-open.png  musk-blink.png
// (png, jpg, jpeg, webp, heic). Every founder found there is processed.
//
// For each founder it removes the background if the image has none removed
// yet (macOS Vision), lines the bust up like the existing portraits (560 x 560,
// transparent, top of the head 39 px from the top, figure about 500 px wide,
// centered), uses the base frame's position for all four frames so the face
// does not jump, and writes app/public/portraits/<key>-<frame>.webp.
//
// Options:
//   --only <key>     process one founder
//   --out <dir>      output folder (default app/public/portraits)
//   --bg <mode>      auto (default): remove background only if the image is opaque
//                    remove: always run background removal; keep: never
//   --width <px>     figure width on the canvas (default 500)
//   --quality <n>    webp quality 0-100 (default 82)
//   --force          overwrite portraits that already exist
//
// Needs macOS 14+, the Xcode Command Line Tools (swiftc) and a webp encoder:
// cwebp (brew install webp) or ffmpeg built with libwebp.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRAMES = ["base", "mid", "open", "blink"];
const SIZE = 560;
const TOP = 39;
const EXTS = ["png", "jpg", "jpeg", "webp", "heic"];

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { out: resolve(HERE, "../public/portraits"), bg: "auto", width: 500, quality: 82, force: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i] ?? die(`${a} needs a value`);
    if (a === "--only") opts.only = val();
    else if (a === "--out") opts.out = resolve(val());
    else if (a === "--bg") opts.bg = val();
    else if (a === "--width") opts.width = Number(val());
    else if (a === "--quality") opts.quality = Number(val());
    else if (a === "--force") opts.force = true;
    else if (a === "-h" || a === "--help") { console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n\n")[0]); process.exit(0); }
    else if (a.startsWith("--")) die(`unknown option ${a}`);
    else rest.push(a);
  }
  if (rest.length !== 1) die("usage: node app/scripts/prepare-portraits.mjs <input-dir> [--only key] [--out dir] [--bg auto|remove|keep] [--force]");
  if (!["auto", "remove", "keep"].includes(opts.bg)) die("--bg must be auto, remove or keep");
  if (!(opts.width > 0 && opts.width <= SIZE)) die(`--width must be between 1 and ${SIZE}`);
  if (!(opts.quality >= 0 && opts.quality <= 100)) die("--quality must be between 0 and 100");
  opts.input = resolve(rest[0]);
  return opts;
}

function has(cmd) {
  return spawnSync("/bin/sh", ["-c", `command -v ${cmd}`]).status === 0;
}

// Compiles portrait-tool.swift once and caches the binary by source hash.
function tool() {
  const src = join(HERE, "portrait-tool.swift");
  const hash = createHash("sha1").update(readFileSync(src)).digest("hex").slice(0, 12);
  const bin = join(tmpdir(), `businessroom-portrait-tool-${hash}`);
  if (!existsSync(bin)) {
    if (!has("swiftc")) die("swiftc not found. Install the Xcode Command Line Tools: xcode-select --install");
    console.log("Compiling the image helper (first run only, about a minute)...");
    const r = spawnSync("swiftc", ["-O", src, "-o", bin], { stdio: "inherit" });
    if (r.status !== 0) die("could not compile portrait-tool.swift");
  }
  return bin;
}

function encoder() {
  if (has("cwebp")) return (png, webp, q) => execFileSync("cwebp", ["-quiet", "-q", String(q), "-m", "6", "-alpha_q", "100", png, "-o", webp]);
  if (has("ffmpeg") && /libwebp/.test(spawnSync("ffmpeg", ["-hide_banner", "-encoders"]).stdout)) {
    return (png, webp, q) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-c:v", "libwebp", "-pix_fmt", "yuva420p", "-quality", String(q), webp]);
  }
  die("No webp encoder found. Install one with: brew install webp");
}

// key -> { frame: path }
function findInputs(dir, only) {
  if (!existsSync(dir)) die(`input folder not found: ${dir}`);
  const found = {};
  for (const name of readdirSync(dir)) {
    const m = /^([a-z]+)-(base|mid|open|blink)\.([a-z]+)$/i.exec(name);
    if (!m || !EXTS.includes(m[3].toLowerCase())) continue;
    const key = m[1].toLowerCase();
    if (only && key !== only) continue;
    (found[key] ||= {})[m[2].toLowerCase()] = join(dir, name);
  }
  return found;
}

const opts = parseArgs(process.argv.slice(2));
const inputs = findInputs(opts.input, opts.only);
const keys = Object.keys(inputs).sort();
if (!keys.length) die(`No images named <key>-<frame>.png in ${opts.input}${opts.only ? ` for ${opts.only}` : ""}.`);

const bin = tool();
const encode = encoder();
const run = (...a) => execFileSync(bin, a.map(String), { encoding: "utf8" }).trim();
mkdirSync(opts.out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "businessroom-portraits-"));
let failed = 0;

try {
  for (const key of keys) {
    const missing = FRAMES.filter((f) => !inputs[key][f]);
    if (missing.length) { console.error(`${key}: skipped, missing ${missing.join(", ")}`); failed++; continue; }
    const exists = FRAMES.filter((f) => existsSync(join(opts.out, `${key}-${f}.webp`)));
    if (exists.length && !opts.force) { console.error(`${key}: skipped, ${key}-${exists[0]}.webp already exists (use --force to overwrite)`); failed++; continue; }

    try {
      // The base frame sets the size and position for all four frames.
      const base = run("cutout", inputs[key].base, join(work, `${key}-base.png`), opts.bg).split(" ");
      const [w, h, x0, y0, x1] = base.slice(0, 5).map(Number);
      const notes = [`base ${w}x${h} (${base[6]})`];
      for (const f of FRAMES.slice(1)) {
        const r = run("cutout", inputs[key][f], join(work, `${key}-${f}.png`), opts.bg, w, h).split(" ");
        if (r[6] !== base[6]) notes.push(`${f} ${r[6]}`);
      }
      if (base[6] === "opaque") notes.push("WARNING: background kept, image has no transparency");

      const scale = opts.width / (x1 - x0 + 1);
      const tx = SIZE / 2 - ((x0 + x1 + 1) / 2) * scale;
      const ty = TOP - y0 * scale;
      for (const f of FRAMES) {
        const png = join(work, `${key}-${f}-560.png`);
        run("place", join(work, `${key}-${f}.png`), png, SIZE, scale, tx, ty);
        encode(png, join(opts.out, `${key}-${f}.webp`), opts.quality);
      }
      console.log(`${key}: wrote ${FRAMES.map((f) => `${key}-${f}.webp`).join(", ")}  [${notes.join("; ")}]`);
    } catch (e) {
      console.error(`${key}: failed. ${(e.stderr || e.message || "").toString().trim()}`);
      failed++;
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(`Output: ${opts.out}`);
process.exit(failed ? 1 : 0);
