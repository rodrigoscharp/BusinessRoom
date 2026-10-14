# Roast Room

This project is the Roast Room: a council of seven simulated advisors (Bezos, Paul Graham, Hormozi, Gary Vaynerchuk, Dan Martell, Gino Wickman, Buffett) that debates a founder's business decision.

- When the user brings a decision ("should I...", pricing, hiring, raising money, a new product, a pivot), run `/roast-room`. For a quick question to one advisor, use `/roast-room ask <seat> ...`.
- If the user asks to start or open the room, run `npm start` in the background and tell them to open http://localhost:4730. It needs Node 20 or newer and nothing else.
- Councils are saved in `sessions/<date>-<decision>/`. The room plays them live as those files land. Follow `.claude/skills/roast-room/references/live-room.md` exactly so the room can read them.
- The seats are simulations built from public work. Never present a seat's words as something the real person said unless it is a verbatim quote with a source id from that seat's brain.
- Write the Chair's parts in plain English: short sentences, no hype, no filler. Keep the verdict in chat short enough to decide from at a glance; the full report goes in `verdict.md`, and the room's "Download PDF" button turns it into a branded PDF.
