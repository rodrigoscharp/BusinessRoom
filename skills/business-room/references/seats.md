# Seats

| Seat | Agent | Pillar | Owns the question | Brain |
|---|---|---|---|---|
| Bezos | `council-bezos` | Strategy and decisions | Is this the right bet, and how reversible is it? | `brains/jeff-bezos/` |
| Graham | `council-graham` | Product and startups | Is this something people actually want, and is it growing? | `brains/paul-graham/` |
| Hormozi | `council-hormozi` | Offers, pricing, metrics, and cash | Will people pay, do the unit economics work, and does the cash last? | `brains/alex-hormozi/` |
| Musk | `council-musk` | First principles and execution | What do physics and cost really allow, and how fast can this actually ship? | `brains/elon-musk/` |
| Zuckerberg | `council-zuckerberg` | Growth and scale | Does this grow on its own, and how fast are we learning what users want? | `brains/mark-zuckerberg/` |
| Huang | `council-huang` | Long bets and market creation | Does this create a market that does not exist yet, and can the company endure until it pays? | `brains/jensen-huang/` |
| Ek | `council-ek` | Distribution and business model | How does this reach millions, and does the revenue model hold up per user? | `brains/daniel-ek/` |

Brain paths are relative to the skill folder (`<plugin root>/skills/business-room/`). In the plugin, agent types carry the plugin prefix: `business-room:council-<seat>`.

Hormozi also owns cash, runway, and ruin risk: there is no separate money seat.

## Relevance weights

The Chair sets a weight per seat for each decision, before Round 1, and writes the reason in one line. Weights make the final score honest: a pricing call should lean on Hormozi, a distribution call on Ek.

| Weight | Meaning |
|---|---|
| 3 | This decision lives in the seat's pillar |
| 2 | The pillar is materially affected |
| 1 | The pillar is touched at the edges |

Every seat is at least 1. Exactly one or two seats get a 3.

## Quick council

`--quick` seats four: the two highest-weight seats, Hormozi or Bezos (whichever is not already in, as the downside check on cash and reversibility), and the seat most likely to disagree with the others (the Chair names why). Use quick for reversible, low-stakes calls. Full council for anything a founder cannot easily undo.

## Natural tensions to expect

- Bezos and Huang (long horizon, patient bets) against Hormozi and Musk (cash this month, speed now).
- Graham (do things that don't scale, talk to users) against Zuckerberg (test at scale, let data decide).
- Ek (lower the entry price, even to zero, to win reach) against Hormozi (raise the price, never discount).
- Huang (create a new market, ignore today's size) against Graham and Ek (is there demand and distribution today?).
- Musk (aggressive timelines, volume over margin) against Bezos (sort the door first) and Hormozi (does the cash survive the ramp?).

If Round 1 comes back unanimous, the Chair should be suspicious and press the seat whose pillar is most at risk in Round 2.
