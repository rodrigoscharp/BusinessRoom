// The Chair's side of the room's chat box. The skill runs these commands.
//
//   node app/scripts/chat.mjs say "text"        post a message from the Chair to the room
//   node app/scripts/chat.mjs ask "text" "A|B"  post a message with up to 4 reply buttons
//   node app/scripts/chat.mjs wait [seconds]    wait for the founder's next message (default 540s)
//   node app/scripts/chat.mjs peek              print new founder messages without waiting (between rounds)
//   node app/scripts/chat.mjs seat <key> "text" post a message as one founder (a direct question's answer)
//   node app/scripts/chat.mjs reset             start a fresh conversation
//   node app/scripts/chat.mjs lang              print the room's language (en or pt)
//
// wait prints "MESSAGE lang=<en|pt>" (the language the room is shown in) and then the
// new message text, or "TIMEOUT" if none arrived,
// so the skill can run it again. It stays under Claude Code's 10 minute command limit.
import * as chat from "../lib/chat.mjs";
import { SEATS } from "../lib/seats.mjs";

const SEAT_KEYS = SEATS.map((s) => s.key);

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "say") {
  const msg = chat.append("chair", rest.join(" "));
  console.log(`SENT ${msg.id}`);
} else if (cmd === "ask") {
  const msg = chat.append("chair", rest[0], undefined, String(rest[1] || "").split("|").map((o) => o.trim()).filter(Boolean));
  console.log(`SENT ${msg.id}`);
} else if (cmd === "seat") {
  const key = String(rest[0] || "").toLowerCase();
  if (!SEAT_KEYS.includes(key)) { console.error(`Unknown seat "${rest[0]}". Use one of: ${SEAT_KEYS.join(", ")}`); process.exit(1); }
  const msg = chat.append(key, rest.slice(1).join(" "));
  console.log(`SENT ${msg.id}`);
} else if (cmd === "peek") {
  const got = chat.readAll().filter((m) => m.from === "user" && m.id > chat.cursor());
  if (got.length) {
    chat.setCursor(got.at(-1).id);
    console.log(`MESSAGE lang=${got.at(-1).lang || "en"}`);
    console.log(got.map((m) => m.text).join("\n\n"));
  } else console.log("NONE");
} else if (cmd === "lang") {
  console.log(chat.roomLang());
} else if (cmd === "reset") {
  chat.reset();
  console.log("RESET");
} else if (cmd === "wait") {
  const limit = (Number(rest[0]) || 540) * 1000;
  const start = Date.now();
  const fresh = () => chat.readAll().filter((m) => m.from === "user" && m.id > chat.cursor());
  let got = fresh();
  while (!got.length && Date.now() - start < limit) {
    chat.heartbeat();
    await new Promise((r) => setTimeout(r, 1000));
    got = fresh();
  }
  if (got.length) {
    chat.setCursor(got.at(-1).id);
    chat.heartbeat();
    console.log(`MESSAGE lang=${got.at(-1).lang || "en"}`);
    console.log(got.map((m) => m.text).join("\n\n"));
  } else {
    console.log("TIMEOUT");
  }
} else {
  console.error('Usage: chat.mjs say "text" | ask "text" "A|B" | seat <key> "text" | wait [seconds] | peek | lang | reset');
  process.exit(1);
}
