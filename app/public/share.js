// A 1200x630 image of the verdict, sized for LinkedIn and X: the seven founders,
// the label, the call, and the winning option. Drawn on a canvas, saved as a PNG.
import { tr } from "./i18n.js";

const W = 1200, H = 630;
const LABEL_BG = { go: "#16a34a", reshape: "#d97706", wait: "#2563eb", dont: "#dc2626" };

const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

function wrap(ctx, text, x, y, maxW, lineH, maxLines) {
  const words = String(text || "").split(/\s+/);
  let line = "", n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      n++;
      if (n === maxLines) { ctx.fillText(line.replace(/[,.;:]?$/, "…"), x, y); return y + lineH; }
      ctx.fillText(line, x, y);
      y += lineH; line = words[i];
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lineH; }
  return y;
}

export async function drawShareImage({ title, label, labelClass, call, option, score, deals, seats }) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  await document.fonts?.ready;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#f4f4f5"); g.addColorStop(0.55, "#52525b"); g.addColorStop(1, "#0b0b0c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // the table edge and the founders behind it
  ctx.fillStyle = "#2b2420";
  ctx.beginPath(); ctx.ellipse(W / 2, 470, 640, 190, 0, Math.PI, 0); ctx.fill();
  const imgs = await Promise.all(seats.map((k) => loadImg(`/portraits/${k}-base.webp`)));
  const size = 168, gap = (W - 60) / seats.length;
  imgs.forEach((im, i) => { if (im) ctx.drawImage(im, 30 + gap * i + (gap - size) / 2, 92, size, size); });

  ctx.fillStyle = "#0b0b0c";
  ctx.font = "600 22px Sora, Inter, sans-serif";
  ctx.fillText("BusinessRoom", 40, 52);
  ctx.textAlign = "right";
  ctx.font = "500 18px Inter, sans-serif";
  ctx.fillStyle = "#3f3f46";
  ctx.fillText(String(title || "").slice(0, 70), W - 40, 52);
  ctx.textAlign = "left";

  // the verdict panel
  ctx.fillStyle = "rgba(10,10,12,0.86)";
  ctx.beginPath(); ctx.roundRect(40, 290, W - 80, 290, 18); ctx.fill();
  ctx.font = "800 26px Sora, Inter, sans-serif";
  const lw = ctx.measureText(label).width + 36;
  ctx.fillStyle = LABEL_BG[labelClass] || LABEL_BG.go;
  ctx.beginPath(); ctx.roundRect(72, 322, lw, 46, 10); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText(label, 90, 355);
  if (option) {
    ctx.font = "600 20px Inter, sans-serif"; ctx.fillStyle = "#d4d4d8";
    ctx.fillText(`${tr("Option")} ${option}${score != null ? ` · ${score}/10` : ""}${deals ? ` · ${deals}` : ""}`, 72 + lw + 20, 353);
  }
  ctx.font = "500 30px Inter, sans-serif"; ctx.fillStyle = "#fafafa";
  wrap(ctx, call, 72, 420, W - 144, 40, 3);
  ctx.font = "400 16px Inter, sans-serif"; ctx.fillStyle = "#a1a1aa";
  ctx.fillText(tr("Simulated founders built from public work. Not the people."), 72, 560);
  ctx.textAlign = "right";
  ctx.fillText("github.com/rodrigoscharp/BusinessRoom", W - 72, 560);
  return new Promise((res) => c.toBlob(res, "image/png"));
}
