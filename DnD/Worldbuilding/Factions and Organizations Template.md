---
tags:
  - dnd
  - worldbuilding
  - srd
  - factions
  - organizations
created: 2026-09-27
status: template
sources:
  - "[[SRD_CC_v5.2.1]]"
  - "[[Free Resources Directory]]"
---

# Factions and Organizations Template

Who holds power, how the party talks to them, and how to make an organization behave like a rules-legal NPC.

> [!warning] The big [GAP]
> **SRD 5.2.1 has no faction rules.** The word "faction" appears zero times in all 364 pages; there is no renown system, no reputation tracker, no organization math, no stronghold table. The only occurrences of "organization" are the character-creation question below and the sentient-item rules. You must supply the structure — this note supplies the SRD hooks it can hang on.

## What the SRD actually gives you

| Hook | SRD cite | Substance |
| --- | --- | --- |
| **The organization question** | SRD p. 20 | *"Did you join an organization, such as a guild or religion? If so, are you still a member of it?"* — one of six official "Imagine Your Past and Present" prompts |
| **Secret and planar languages** | SRD p. 20 | Standard: Common, Common Sign Language, Draconic, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc. Rare (secret or planar): Abyssal, Celestial, Deep Speech, Druidic, Infernal, Primordial, Sylvan, **Thieves' Cant**, Undercommon — Thieves' Cant is the ready-made faction cipher (see also Rogue, SRD pp. 61–64) |
| **Guildhalls get teleportation circles** | SRD p. 169 | *"Many major temples, guildhalls, and other important places have permanent teleportation circles."* A faction with a circle is a faction with logistics |
| **Four faction-ready backgrounds** | SRD p. 83 | Acolyte (Insight, Religion) · Criminal (Sleight of Hand, Stealth) · Sage (Arcana, History) · Soldier (Athletics, Intimidation) |
| **Custom backgrounds** | SRD p. 192 | *Creating a Background*: pick 3 ability scores (+2/+1 or +1/+1/+1), one Origin feat, two skills, one tool, 50 GP of gear — build "Guild Artisan," "Faction Agent," etc. as raw rules |
| **NPC attitude** | SRD p. 177 | Every monster/NPC starts Friendly, Indifferent, or Hostile toward a PC |
| **Influence action** | SRD p. 10 | Charisma (Deception, Intimidation, Performance, Persuasion) or Wisdom (Animal Handling) check **to alter a creature's attitude** |
| **Social interaction structure** | SRD pp. 10–11 | Roleplaying first, dice second; *"pay attention to an NPC's goals… offer NPCs something they want or play on their sympathies, fears, or goals"* |
| **Hirelings** | SRD p. 102 | Skilled 2 GP/day · Untrained 2 SP/day · Messenger 2 CP/mile — the floor price of organized muscle |
| **Bodyguard-grade stat blocks** | SRD pp. 260–337 | Cultist (CR 1/8), Cultist Fanatic (CR 2), Guard (CR 1/8), Guard Captain (CR 4), Bandit Captain (CR 2), Spy (CR 1), Assassin (CR 8), Knight (CR 3), Noble (CR 1/8), Scout (CR 1/2), Mage/Archmage — plus Tough Boss, Pirate Captain, Warrior Veteran — see [[NPC Framework#SRD humanoid roster]] |
| **Settlement tier gates** | SRD pp. 102, 205, 207 | What a local faction can plausibly source: spellcasting level, magic items, raw materials |

> [!src] SRD p. 20 — Imagine Your Past and Present
> "Did you join an organization, such as a guild or religion? If so, are you still a member of it?"

## Faction sheet (fill in)

```markdown
## Faction: <name>
- **Type:** guild / temple / military / crime / scholarly / planar / other
- **Public goal (say this out loud):** <one sentence>
- **Real goal (private):** <one sentence — should conflict with 1–2 other factions>
- **Attitude toward the party (SRD p. 177):** Friendly / Indifferent / Hostile — and what would move it one step (Influence, SRD p. 10)
- **Leader (NPC):** <name, role, stat block — see [[NPC Framework]]>
- **Reach:** village / town / city / regional / planar (gates per SRD pp. 102, 205, 207)
- **Asset the PCs want:** <a spellcaster (p. 102), a teleportation circle (p. 169), rare materials (p. 207), a holy symbol (p. 97)>
- **Price:** <GP/day per hireling table, p. 102 — or a favour>
- **Language / cipher:** <Common Sign Language, Thieves' Cant, Druidic, or a rare language — SRD p. 20>
- **Weakness:** <one sentence, findable with a Study or Search action (SRD p. 10)>
- **Member hook:** <background the PCs can take — SRD pp. 83, 192>
```

## Relationship matrix (fill in)

Build once, update after every session. Attitudes are per-NPC (SRD p. 177), but track the faction's default toward the party too.

| Faction ↓ / Faction → | A | B | C | D | Party |
| --- | --- | --- | --- | --- | --- |
| A | — | | | | Friendly / Indifferent / Hostile |
| B | | — | | | |
| C | | | — | | |
| D | | | | — | |
| Party | | | | | — |

## Generator tables

### d6 — What the faction wants (*homebrew*)

| d6 | Prompt |
| --- | --- |
| 1 | A monopoly on one spellcasting service (price it from SRD p. 102) |
| 2 | Control of a raw-material source (75% in a city, 25% elsewhere — SRD p. 207) |
| 3 | Custody of a planar portal (→ [[Cosmology and Planes]]) |
| 4 | The removal of a rival temple (→ [[Pantheon and Deities Template]]) |
| 5 | A charter from a nation the party has never visited (→ [[Nations and Politics Template]]) |
| 6 | Silence about something in [[History and Timelines]] |

### d6 — What they can pay with (*homebrew*)

| d6 | Payment | SRD anchor |
| --- | --- | --- |
| 1 | Coin | hireling rates (SRD p. 102) |
| 2 | A service, not a fee | "a seller might ask for a service rather than coin" (SRD p. 205) |
| 3 | Access to city-only services | spellcasting 6th–9th level only in cities (SRD p. 102) |
| 4 | Raw materials at a discount | raw materials = half purchase cost (SRD p. 103) |
| 5 | Passage on a ship | Airship 40,000 GP … Rowboat 50 GP (SRD p. 101) |
| 6 | Pardon or paperwork | law hook: poison possession laws (SRD p. 197) |

### d6 — How the party meets them (*homebrew*)

| d6 | Prompt |
| --- | --- |
| 1 | A hireling they hired turns out to be a member (SRD p. 102) |
| 2 | The party's background already connects them (SRD p. 83 / custom p. 192) |
| 3 | The faction owns the only local *Teleportation Circle* (SRD p. 169) |
| 4 | A *Priest* or *Noble* stat block NPC sends a letter (SRD pp. 316, 312) |
| 5 | The faction is hiring: untrained 2 SP/day, skilled 2 GP/day (SRD p. 102) |
| 6 | Two factions want the same thing from the party, and both ask first |

## Running factions at the table

1. **Factions are NPCs wearing an institution's clothes.** Use [[NPC Framework]] for the person, the sheet above for the logo. Attitude changes happen through Influence (SRD p. 10) — not a reputation counter you invent silently.
2. **Give each faction a schedule, not just a goal.** What they do between sessions decides whether the party feels a living world. SRD hooks that run on clocks: ship repair 20 GP/HP per day (halved in a city shipyard, SRD p. 101), magic-item crafting 5 days/50 GP (Common) up to 250 days/100,000 GP (Legendary) (SRD p. 207), raw-material re-check after 7 days (SRD p. 207).
3. **Make their power legible through services.** A faction that can cast 5th-level spells is a town-or-city faction by definition (SRD p. 102); a faction that can only field Guards is a village faction (Guard: CR 1/8, SRD p. 296).
4. **Language is access.** Common Sign Language, Thieves' Cant, Druidic, and the rare languages (SRD p. 20) are the cheapest way to make a faction feel exclusive without inventing a rank system.
5. **Escalate with the tier.** Tier 1 factions threaten villages, tier 2 cities and kingdoms, tier 3 regions, tier 4 the multiverse (SRD pp. 23–24).

## Confirmed [GAP]s in this area

1. **No renown, reputation, or faction-rank mechanics.**
2. **No organization downtime activities**, base-building, or stronghold rules.
3. **No NPC loyalty, morale, or betrayal rules** — *Running a Monster* (SRD p. 255) covers tactics only.
4. **No membership benefits** beyond what a background gives (SRD p. 83) and the custom-background rules (SRD p. 192).
5. **No "guild" entry in the glossary** — guildhalls appear once, as *Teleportation Circle* destinations (SRD p. 169).

## Related notes

- [[NPC Framework]] — the people inside the faction
- [[Nations and Politics Template]] — who charts the factions' territory
- [[Settlements and Locations Template]] — where their assets sit
- [[Economy and Downtime]] — what their services cost
- [[3.5e-to-5.5e-Conversion]] — if you are converting an older organization, note that 3.5e's organization and reputation rules are absent from the SRD (see its *Known Gaps*)
- [[Worldbuilding MOC]] — the hub
