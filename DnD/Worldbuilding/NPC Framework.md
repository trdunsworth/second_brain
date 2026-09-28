---
tags:
  - dnd
  - worldbuilding
  - srd
  - npcs
created: 2026-09-27
status: template
sources:
  - "[[SRD_CC_v5.2.1]]"
---

# NPC Framework

The SRD hands you exactly two things for people: a **social procedure** — attitude → roleplay → Influence action → ability check (SRD pp. 10, 177, 182–184) — and **26 humanoid stat blocks** (SRD pp. 260–337). It hands you no personality tables, no morale rule, and no renown system. Those are marked **[GAP]** below, and the generator tables in this note are *homebrew* seeders.

> [!tip] Two layers, one NPC
> Every NPC has a **social layer** (attitude, goals, Influence) and a **physical layer** (a stat block, or none at all). Decide them separately. A noble needs an attitude and a want; a bodyguard needs a block and a gear line; a named villain needs both.

## The social procedure

### Step 1 — Start with attitude (SRD p. 177)

> [!src] SRD p. 177 — Attitude
> "A monster has a starting attitude toward a player character: Friendly, Hostile, or Indifferent. See also 'Friendly,' 'Hostile,' 'Indifferent,' and 'Influence.'"

| Attitude | What it means | Effect on Influence attempts | Cite |
| --- | --- | --- | --- |
| **Friendly** | "A Friendly creature views you favorably." | **Advantage** on an ability check to influence it | SRD p. 182 |
| **Indifferent** | "No desire to help or hinder you" — **the default attitude of a monster** | Neither Advantage nor Disadvantage | SRD p. 184 |
| **Hostile** | "A Hostile creature views you unfavorably." | **Disadvantage** on an ability check to influence it | SRD p. 183 |

The three attitudes are defined once, in the Rules Glossary, and they only ever do one mechanical thing: shift the die. Everything else about "warm," "bribable," or "terrified" is *your* roleplaying, which the SRD explicitly says can change the outcome before dice are rolled.

### Step 2 — Roleplay first, dice second (SRD pp. 10–11)

> [!src] SRD pp. 10–11 — Social Interaction
> "Social interactions progress in two ways: through roleplaying and ability checks… The GM uses an NPC's personality and your character's actions and attitudes to determine how an NPC reacts. A cowardly bandit might buckle under threats of imprisonment. A stubborn merchant refuses to help if the characters badger her. A vain dragon laps up flattery."
>
> "Your roleplaying efforts can alter an NPC's attitude, but there might still be an element of chance if the GM wants dice to play a role… the GM will typically ask you to take the Influence action."

Two useful consequences for a GM who is *playing* an NPC:

- **Offers and insults are inputs.** "If you offer NPCs something they want or play on their sympathies, fears, or goals, you can form friendships, ward off violence, or learn a key piece of information" (SRD p. 11).
- **Skill proficiencies should drive the approach.** The SRD's own example: to trick a guard, the Rogue proficient in Deception leads the conversation (SRD p. 11).

### Step 3 — Call for the Influence action (SRD p. 184)

> [!src] SRD p. 184 — Influence [Action]
> "With the Influence action, you urge a monster to do something. Describe or roleplay how you're communicating with the monster. Are you trying to deceive, intimidate, amuse, or gently persuade? The GM then determines whether the monster feels willing, unwilling, or hesitant."

The GM's determination decides whether dice are even needed:

| Monster's stance | Does it require a check? | Result |
| --- | --- | --- |
| **Willing** — the urging aligns with its desires | **No** | It fulfills the request "in a way it prefers" |
| **Unwilling** — repugnant to it, or counter to its alignment | **No** | It doesn't comply |
| **Hesitant** — it could be talked into it | **Yes** | See the DC and the failure cost below |

**The hesitant check (SRD p. 184):**

- **DC:** the GM chooses the check; its **default DC equals 15 or the monster's Intelligence score, whichever is higher**.
- **Modified by attitude:** Friendly → Advantage, Indifferent → straight, Hostile → Disadvantage.
- **Success:** the monster does as urged.
- **Failure:** "you must wait 24 hours (or a duration set by the GM) before urging it in the same way again." That 24-hour lockout is the SRD's built-in pacing brake — use it, and tell your players why.

### Step 4 — Pick the check that matches the approach (SRD p. 184)

> [!src] SRD p. 184 — Influence Checks
> | Ability Check | Interaction |
> | --- | --- |
> | Charisma (Deception) | Deceiving a monster that understands you |
> | Charisma (Intimidation) | Intimidating a monster |
> | Charisma (Performance) | Amusing a monster |
> | Charisma (Persuasion) | Persuading a monster that understands you |
> | Wisdom (Animal Handling) | Gently coaxing a Beast or Monstrosity |

Note what the table quietly tells you: **two of the five rows require a shared language** ("that understands you"), and one is for Beasts and Monstrosities only. A door sealed by language or by creature type is a real design tool.

**Quick procedure**

1. Set attitude at first contact (Indifferent unless there is a reason otherwise — SRD p. 184).
2. Roleplay the exchange; let the players offer something (SRD pp. 10–11).
3. Classify the target as willing, unwilling, or hesitant (SRD p. 184).
4. If hesitant: pick the check from the table, apply the attitude modifier, DC 15-or-Int whichever is higher, roll it.
5. On a failure, mark 24 hours on the session clock before the same approach can be tried again (SRD p. 184).

## The physical layer: stat block anatomy (SRD p. 254)

> [!src] SRD p. 254 — Parts of a Stat Block
> Name and flavor line → type/size/alignment → combat highlights (AC, Initiative, HP, Speed) → ability scores → other details (Skills, Senses, Languages) → **Challenge Rating and Experience Points** → Traits → Actions → Bonus Actions → Reactions / Legendary Actions.

Three rules worth stealing for *any* person you invent:

- **Alignment is a suggestion, not a cage.** "The alignment specified in a monster's stat block is a default suggestion of how to roleplay the monster… Change a monster's alignment to suit your storytelling needs" (SRD p. 254).
- **Humanoid is a category, not a personality.** "Humanoids are people defined by their roles and professions, such as mages, pirates, and warriors" (SRD p. 254). Roles are the design hook; the block is just the stat line.
- **Gear is swappable.** You may equip monsters with additional gear "however you like" (SRD pp. 255–256) — see below.

## SRD humanoid roster

Twenty-six blocks, every one with a Humanoid type line, sorted by page. CR and XP are read directly from each block.

| Block | Page | CR | XP | PB | Best used as |
| --- | --- | --- | --- | --- | --- |
| Assassin | 260 | 8 | 3,900 | +3 | A contract, not a monster — one block, one plot |
| Bandit | 261 | 1/8 | 25 | +2 | Road-level pressure; speaks **Thieves' Cant** (SRD p. 261) |
| Bandit Captain | 261–262 | 2 | 450 | +2 | Names the leader above the Bandits |
| Berserker | 263 | 2 | 450 | +2 | The one who doesn't negotiate |
| Commoner | 275 | 0 | 10 | +2 | The townsfolk; a **Training** trait lets the GM give it one skill |
| Cultist | 278 | 1/8 | 25 | +2 | Rank and file of a faction |
| Cultist Fanatic | 278 | 2 | 450 | +2 | Who the rank and file answer to |
| Druid | 282 | 2 | 450 | +2 | Spellcaster ally or rival (Humanoid (Druid)) |
| Gladiator | 289 | 5 | 1,800 | +3 | Arena champion; has **Parry** |
| Guard | 296 | 1/8 | 25 | +2 | The checkpoint, the gate, the watch |
| Guard Captain | 296 | 4 | 1,100 | +2 | Who signs the party's paperwork — or denies it |
| Knight | 302 | 3 | 700 | +2 | Noble warrior; **Parry**, heavy crossbow, greatsword |
| Mage | 305 | 6 | 2,300 | +3 | A working spellcaster (Humanoid (Wizard)) |
| Archmage | 305 | 12 | 8,000 | +4 | The power behind a city's largest institution |
| Noble | 312 | 1/8 | 25 | +2 | Quest-giver, patron, host |
| Pirate | 314 | 1 | 200 | +2 | Crew of a ship-based faction |
| Pirate Captain | 314 | 6 | 2,300 | +3 | Who owes money, and to whom |
| Priest | 316 | 2 | 450 | +2 | Temple authority (Humanoid (Cleric)) |
| Priest Acolyte | 316 | 1/4 | 50 | +2 | Temple staff; the person the party actually meets |
| Scout | 322 | 1/2 | 100 | +2 | Guide, tracker, outrider |
| Spy | 329 | 1 | 200 | +2 | Intrigue, counterspying, the informant |
| Tough | 332 | 1/2 | 100 | +2 | Street enforcement |
| Tough Boss | 332 | 4 | 1,100 | +2 | Who the enforcement answers to |
| Vampire Familiar | 334 | 3 | 700 | +2 | Humanoid (Neutral Evil) — a servant with a master |
| Warrior Infantry | 336 | 1/8 | 25 | +2 | Rank-and-file soldier; **Pack Tactics** |
| Warrior Veteran | 337 | 3 | 700 | +2 | Drill-sergeant and professional soldier; Greatsword, Heavy Crossbow, Splint Armor |

> [!warning] Blocks that do **not** exist in SRD 5.2.1
> Full-text search returns **zero** hits for `Thug` and `Tribal Warrior`, and there is no standalone **Acolyte** stat block (the Acolyte *background* is at SRD p. 83; the block is "Priest Acolyte," SRD p. 316). If you came from a 5.1-era roster, those three are the ones you have to invent or re-skin.

**Quick math from SRD p. 256** (needed when you rebuild or re-CR a block):

| CR | XP | — | CR | XP | — | CR range | Proficiency Bonus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0 or 10 | | 10 | 5,900 | | 0–4 | +2 |
| 1/8 | 25 | | 12 | 8,400 | | 5–8 | +3 |
| 1/4 | 50 | | 15 | 13,000 | | 9–12 | +4 |
| 1/2 | 100 | | 17 | 18,000 | | 13–16 | +5 |
| 1 | 200 | | 20 | 25,000 | | 17–20 | +6 |
| 2 | 450 | | 24 | 62,000 | | 21–24 | +7 |
| 3 | 700 | | 27 | 105,000 | | 25–28 | +8 |
| 4 | 1,100 | | 30 | 155,000 | | 29–30 | +9 |

XP is "awarded for defeating the monster in combat **or otherwise neutralizing it**" (SRD p. 256) — which means talking a Noble out of a bad decision can be worth exactly as much as stabbing it, if you say so.

## Running a person in play (SRD pp. 255–256)

> [!src] SRD p. 255 — Running a Monster
> The section covers special abilities, Multiattack, Bonus Actions, immunities, gear, and ammunition — i.e. **tactics and logistics, not personality**.

Practical takeaways:

1. **Re-equip freely.** Swap the guard's spear for a crossbow, add chain mail, hand a captured weapon back to its owner (SRD pp. 255–256).
2. **Give every block one job in the fight.** The SRD's structure (Traits → Actions → Bonus Actions → Reactions) is a prompt: pick which of those the NPC actually uses this round.
3. **Ammunition is a real cost.** The section calls it out; a crossbow guard without bolts is a different encounter 12 rounds later (SRD p. 255).
4. **Send the CR to the encounter math.** "Guidance on using CR to plan potential combat encounters is in 'Gameplay Toolbox'" (SRD p. 256) → [[Encounter and Adventure Design]].

## NPC sheet (fill in)

```markdown
## NPC: <name>
- **Public role:** <guard captain / priest / merchant — SRD p. 254 says Humanoids are "defined by their roles and professions">
- **Starting attitude:** Friendly / Indifferent / Hostile (SRD p. 177) — and why
- **What they want right now:** <one sentence — see d8 below>
- **Willing / Unwilling / Hesitant** about the party's ask (SRD p. 184):
- **If hesitant:** check = <Deception / Intimidation / Performance / Persuasion / Animal Handling>, DC = max(15, their Int) (SRD p. 184)
- **Voice / mannerism:** <one habit — *homebrew*>
- **Stat block:** <one of the 26, above — or "Commoner with a swapped weapon">
- **Gear swap:** <per SRD pp. 255–256>
- **Secret:** <see d6 below>
- **Faction tie:** <see [[Factions and Organizations Template]]>
- **Price they quote:** <from [[Economy and Downtime]]>
- **What changes if the check fails:** 24 hours before the same approach works (SRD p. 184)
```

## Generator tables (*homebrew*)

### d8 — What the NPC wants (each row points at an SRD rule)

| d8 | Want | Make it bite with |
| --- | --- | --- |
| 1 | Coin above all | A quote from [[Economy and Downtime]]; lifestyle tier (SRD p. 101) |
| 2 | A spell they can't buy here | Spellcasting Services availability by settlement tier (SRD p. 102) |
| 3 | One specific magic item | Rarity gate: Uncommon and Rare "usually found only in cities" (SRD p. 205) |
| 4 | Knowledge of an old event | History check, SRD pp. 9, 189 — see [[History and Timelines]] |
| 5 | Revenge or rescue | A Narrative Curse hook: broken vow, defiled tomb, murdered innocent (SRD p. 193) |
| 6 | Safe passage | A Travel Terrain row: foraging/navigation/search DC (SRD p. 192) |
| 7 | A title recognized somewhere | A trinket as proof — deed, receipt, or silver bell (SRD pp. 26–27) |
| 8 | To be left alone | Refuses on principle: Unwilling, no check needed (SRD p. 184) |

### d6 — How they react when the party pushes (maps to SRD p. 184)

| d6 | Reaction |
| --- | --- |
| 1 | **Willing** — it wanted this anyway; no check, and it does it "in a way it prefers" |
| 2 | **Unwilling** — repugnant or against their alignment; no check, no compliance |
| 3 | **Hesitant, and the attitude is Friendly** — roll with Advantage |
| 4 | **Hesitant, Indifferent** — roll straight; DC 15-or-Int |
| 5 | **Hesitant, Hostile** — roll with Disadvantage; failure locks the tactic for 24 hours |
| 6 | **Hesitant, but no shared language** — the Deception and Persuasion rows require an NPC "that understands you" (SRD p. 184); find a translator first |

### d6 — Mannerism (*homebrew*)

| d6 | Mannerism |
| --- | --- |
| 1 | Never finishes a sentence; answers the question they expected |
| 2 | Quotes prices before anything else (SRD p. 101 lifestyle tiers as their whole worldview) |
| 3 | Checks a weapon or tool mid-conversation (SRD pp. 93–94 tools) |
| 4 | Uses "we" for an institution, never "I" — faction tell |
| 5 | Asks about the party's god, then changes the subject (Religion, SRD p. 9) |
| 6 | Watches the door, not the speakers (Perception, SRD p. 9) |

## Confirmed [GAP]s in this area

1. **No morale rule.** Full-text search: **0 hits** for `morale`. "Running a Monster" (SRD p. 255) covers tactics, not when a fight is quit — so a surrendering Bandit is a house rule.
2. **No personality, motivation, or mannerism tables anywhere in the SRD.** The closest thing is sentient magic items: "When you make a sentient magic item, you create the item's persona much as you would create an NPC" (SRD p. 207) — and even that ships with random tables for abilities, alignment, communication, senses, and purpose (SRD pp. 207–208).
3. **No renown, reputation, or standing rules.** 0 hits for `reputation`; `renown` appears once, as a sentient item's *purpose* ("Glory Seeker. The item seeks renown," SRD p. 208). Faction rank is yours to design → [[Factions and Organizations Template]].
4. **No NPC-building procedure.** You can re-CR a monster with the SRD p. 256 tables, but there is no "build an NPC from a role" ruleset.
5. **No link between lifestyle and attitude.** Lifestyle Expenses (SRD p. 101) and Attitude (SRD p. 177) never reference each other.
6. **No Acolyte, Thug, or Tribal Warrior block** (see the warning box above), and no NPC-only appendix — every block lives in the alphabetical monster list, SRD pp. 258–364.

## Related notes

- [[Encounter and Adventure Design]] — where a block's CR gets spent (SRD p. 202)
- [[Factions and Organizations Template]] — who the NPC answers to
- [[Economy and Downtime]] — what they charge, what they can afford
- [[Settlements and Locations Template]] — where they stand when the party walks in
- [[History and Timelines]] — what they remember (History, SRD pp. 9, 189)
- [[Worldbuilding MOC]] — the hub
