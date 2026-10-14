// The Chair's side of the room's chat box. The skill runs these commands.
//
//   node app/scripts/chat.mjs say "text"        post a message from the Chair to the room
//   node app/scripts/chat.mjs wait [seconds]    wait for the founder's next message (default 540s)
//   node app/scripts/chat.mjs reset             start a fresh conversation
//
// wait prints the new message text after a "MESSAGE" line, or "TIMEOUT" if none arrived,
// so the skill can run it again. It stays under Claude Code's 10 minute command limit.
import * as chat from "../lib/chat.mjs";

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "say") {
  const msg = chat.append("chair", rest.join(" "));
  console.log(`SENT ${msg.id}`);
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
    console.log("MESSAGE");
    console.log(got.map((m) => m.text).join("\n\n"));
  } else {
    console.log("TIMEOUT");
  }
} else {
  console.error('Usage: chat.mjs say "text" | wait [seconds] | reset');
  process.exit(1);
}
