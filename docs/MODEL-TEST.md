# Sonnet vs Opus for the seats

Since 0.5.0 the seats run on Sonnet by default, and `--deep` runs them on Opus. This test checks that the cheaper model does not change what the table decides.

## The test

- **Case:** MyHub, a real pitch. A solo founder with a finished personal productivity app at R$ 19,99 a month, close to zero paying users, 10 hours a week, and 11 weeks to reach 100 paying users. Four options: A (keep the price, broad leads), B (MEI niche with its own offer), C (cheaper or freemium), D (don't sell now).
- **Run:** the same Round 1 prompt, the same brief, and the same brains for all seven seats, once on Sonnet and once on Opus (14 runs, 2026-10-14). Then the Sonnet seats finished the council (Round 2, Shark Tank).

## Round 1 scores

| Seat | Weight | Sonnet A · B · C · D | Opus A · B · C · D | Stance (Sonnet / Opus) |
|---|---|---|---|---|
| Hormozi | 3 | 4 · 8 · 2 · 3 | 4 · 8 · 3 · 2 | Yes / Yes |
| Ek | 2 | 5 · 8 · 3 · 2 | 3 · 8 · 4 · 2 | Yes / Yes |
| Musk | 1 | 4 · 8 · 3 · 3 | 3 · 8 · 3 · 4 | Yes / Strong yes |
| Zuckerberg | 2 | 4 · 8 · 3 · 1 | 4 · 8 · 5 · 2 | Yes / Yes |
| Huang | 1 | 4 · 7 · 3 · 4 | 3 · 7 · 4 · 4 | Conditional yes / Yes |
| Graham | 3 | 3 · 8 · 3 · 2 | 3 · 8 · 4 · 2 | Yes / Strong yes |
| Bezos | 1 | 4 · 8 · 4 · 3 | 4 · 8 · 5 · 3 | Yes / Yes |
| **Weighted** | | **3.9 · 7.9 · 2.8 · 2.4** | **3.5 · 7.9 · 3.9 · 2.4** | |

## What we found

- **Same call.** Both models put all seven seats on B, with the same weighted score (7.9). No seat changed its recommended option between models. No single score moved by more than 2 points.
- **Same arguments.** Each seat used the same frameworks on both models: Hormozi's offer before leads, Ek's freemium math (about 3,300 free users for 100 paying), Musk's "delete before you speed up", Huang's strategic retreat, Graham's "do things that don't scale", and Bezos's two-way door.
- **Opus is a bit sharper in voice.** It was more decisive (two Strong yes against none on Sonnet) and closer to the voice notes. One example: Musk gave an aggressive target and an honest one, the way the brain says he does.
- **Quotes are where Sonnet slipped.** One Sonnet card (Graham) put a free Portuguese translation of a brain line in quotes. `check_quotes.py` caught it, and the Chair left it out of the verdict. Opus quoted the same line verbatim in English.
- **Tokens per run were about the same** (20k to 33k per seat on both). The saving comes from Sonnet's lower price per token and from the two-round council, not from shorter runs.

## Decision

Keep Sonnet as the default and Opus for `--deep`. The quote checker stays a required step, because it is what catches the one weakness we saw.

## Re-running it

Run Round 1 from `skills/business-room/references/round-prompts.md` for each seat twice, once with the Agent tool's `model` left out (Sonnet) and once with `model: "opus"`, on the same `brief.md`. Compare the `OPTION SCORES` lines and run `check_quotes.py` on both sets.
