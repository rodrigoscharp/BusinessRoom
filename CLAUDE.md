# BusinessRoom

This repo is the BusinessRoom Claude Code plugin: a table of simulated founders that debates a startup decision, played live in a local web room. It started as a fork of Roast Room. The v1 plan is in `docs/SCOPE.md`.

This file is for working on the plugin. Installed users never see it; anything the Chair must follow at runtime belongs in `skills/business-room/SKILL.md`.

- Layout: `.claude-plugin/` (manifests), `skills/business-room/` (the skill, references, brains, quote checker), `agents/` (seat agents), `app/` (the room), `sessions/` (shipped examples only).
- Load this checkout as the plugin with `claude --plugin-dir .`. Inside the plugin, seat agents are named `business-room:council-<seat>`.
- User councils are written to `~/.business-room/sessions/` (override with `BUSINESS_ROOM_HOME`), never into the plugin folder, because an update replaces it.
- `npm start` starts and opens the room on http://localhost:4740 (`BUSINESS_ROOM_PORT` overrides), `npm stop` stops it. Run `claude plugin validate .` after changing a manifest, skill, or agent.
- The live-room file contract is `skills/business-room/references/live-room.md`. The app's watcher (`app/lib/watch.mjs`) depends on it, so change both together.
- The seats are simulations built from public work. Never present a seat's words as something the real person said unless it is a verbatim quote with a source id from that seat's brain.
