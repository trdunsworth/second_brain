---
tags:
  - dnd
  - worldbuilding
  - srd
  - settlements
  - locations
created: 2026-09-27
status: template
sources:
  - "[[SRD_CC_v5.2.1]]"
---

# Settlements and Locations Template

The SRD's one hard settlement rule is a three-tier gate: **village, town, city.** Everything you need to make a place feel economically real is on four pages — SRD pp. 101–103, 205, 207.

> [!tip] The tier system is the whole design
> The SRD never defines a settlement's population or government, but it *does* define what a settlement can provide: which spell levels are castable there, whether magic items are sold, and how likely raw materials are to exist. Build outward from those three gates.

## The three gates (SRD evidence)

| What a settlement provides | Village | Town | City | Cite |
| --- | --- | --- | --- | --- |
| Spellcasting: cantrips, 1st, 2nd | ✅ | ✅ | ✅ | Spellcasting Services, SRD p. 102 |
| Spellcasting: 3rd, 4th, 5th | ❌ | ✅ | ✅ | SRD p. 102 |
| Spellcasting: 6th–8th | ❌ | ❌ | ✅ | SRD p. 102 |
| Spellcasting: 9th | ❌ | ❌ | ✅ | SRD p. 102 |
| Common magic items usually bought/sold | sometimes | ✅ | ✅ | *"Common magic items can often be bought in a town or city"* — SRD p. 205 |
| Uncommon and Rare magic items | ❌ | ❌ | ✅ | *"usually found only in cities"* — SRD p. 205 |
| Very Rare, Legendary, Artifact | ❌ | ❌ | only in *"wondrous locations"* (e.g. a city on another plane) | SRD p. 205 |
| Raw materials for crafting available | 25% | 25% | 75% | *"In a city, there is a 75 percent chance… in any other settlement, that chance is 25 percent"* — SRD p. 207 (re-check after 7 days) |
| Ship repair site | ❌ | ❌ | city shipyard halves time and cost | SRD p. 101 |
| Permanent teleportation circles | some temples/guildhalls have them, any tier | | | SRD p. 169 |

> [!src] SRD p. 102 — Spellcasting
> "Most settlements contain individuals who are willing to cast spells in exchange for payment… The higher the level of a desired spell, the harder it is to find someone to cast it."

## Prices every settlement should be able to quote

All from [[Economy and Downtime]] with cites: coins (SRD p. 89), food/lodging/lifestyle (SRD pp. 101–102), hirelings (SRD p. 102), mounts and vehicles (SRD pp. 100–101).

| Service / good | Price | Cite |
| --- | --- | --- |
| Modest inn stay per day / meal | 5 SP / 1 SP | SRD p. 101 |
| Aristocratic inn stay / meal | 4 GP / (top of table) | SRD p. 101 |
| Comfortable (lodging) / Wealthy / Aristocratic single-day figures | 8 SP / 2 GP / 4 GP | SRD p. 101 |
| Ale (mug) / Bread (loaf) / Cheese (wedge) | 4 CP / 2 CP / 1 SP | SRD p. 101 |
| Wine: common / fine | 2 SP / 10 GP | SRD pp. 101–102 |
| Skilled hireling / untrained hireling | 2 GP per day / 2 SP per day | SRD p. 102 |
| Messenger | 2 CP per mile | SRD p. 102 |
| Potion of Healing | 50 GP | SRD p. 99 |
| Thieves' Tools / Disguise Kit / Forgery Kit | 25 GP / 25 GP / 15 GP | SRD p. 94 |
| Holy Symbol (Amulet, Emblem, or Reliquary) | 5 GP each (price list says "Varies") | SRD pp. 97, 95 |
| Room for a ship's passenger (hammock) / private cabin | 5 SP per day / 2 GP per day | SRD p. 101 |
| Spyglass / Fine Clothes | 1,000 GP / 15 GP | SRD pp. 100, 97 |

## Travel through the settlement

Urban is one of the ten SRD travel terrains (SRD p. 192):

| Terrain | Max Pace | Encounter distance | Foraging DC | Navigation DC | Search DC |
| --- | --- | --- | --- | --- | --- |
| Urban | Normal | 2d6 × 10 feet | 20 | 15 | 15 |
| Coastal | Normal | 2d10 × 10 feet | 10 | 5 | 15 |
| Grassland | Fast | 6d6 × 10 feet | 15 | 5 | 15 |
| Forest | Normal | 2d8 × 10 feet | 10 | 15 | 15 |

Full table and pace rules: [[Encounter and Adventure Design#Travel, terrain, and the journey]]. Good roads raise a party's pace by one step (SRD p. 192).

## Settlement sheet (fill in)

```markdown
## Settlement: <name>
- **Tier:** village / town / city — which gates it opens (table above)
- **Terrain:** <one row from the Travel Terrain table, SRD p. 192>
- **Lifestyle available:** Squalid 1 SP … Aristocratic 10 GP per day (SRD p. 101)
- **Spellcasting for hire:** <levels available — SRD p. 102; name the caster NPC, see [[NPC Framework]]>
- **Magic items for sale:** <rarity permitted by SRD p. 205>
- **Crafting materials:** 75% / 25% (SRD p. 207) — and who controls supply
- **Hirelings:** <guard, guide, messenger — SRD p. 102>
- **Landmark:** <temple, guildhall, or other place with a teleportation circle — SRD p. 169>
- **Local law:** <pattern after SRD p. 197>
- **Local problem:** <see d6 below — one sentence>
- **Trinket someone in town owns:** <roll 1d100 on the SRD Trinkets table, SRD pp. 26–27>
```

## Location sheet (ruins, sites, sites with a past)

```markdown
## Location: <name>
- **Type:** ruin / tomb / vault / portal site / demiplane (SRD p. 122) / underdark-adjacent
- **Who built it:** <see [[History and Timelines]]>
- **Access:** <Search DC to find it — per terrain, SRD p. 192; and to open it>
- **Hazards on entry:** <obscured areas and light — SRD p. 11; environmental effects — SRD pp. 195–196>
- **Traps:** <nuisance or deadly for levels X–Y, with the SRD scaling table — SRD pp. 199–201>
- **Curse risk:** <Narrative Curse hooks — SRD p. 193 (broken vow, defiled tomb, murdered innocent)>
- **Faction claim:** <see [[Factions and Organizations Template]]>
- **Reward:** <price from [[Economy and Downtime]]; magic item rarity values SRD p. 206>
```

## Generator tables

### d6 — Settlement problem by tier (*homebrew*; tier framing per SRD pp. 23–24)

| d6 | Village (tier 1) | Town (tier 2) | City (tier 2–3) |
| --- | --- | --- | --- |
| 1 | Crop blight; foraging DC 15–20 nearby (SRD p. 192) | A guild owns the only teleportation circle (p. 169) | The only 9th-level caster in the city has vanished (p. 102) |
| 2 | Bandits on the road (Bandit, CR 1/8, p. 261) | Raw-material supply dries up (25% chance, p. 207) | Magic-item market manipulation (rarity values, p. 206) |
| 3 | A poisoned well — law question (p. 197) | Hirelings strike (2 GP/day floor, p. 102) | A shipyard fire (repair 20 GP/HP, p. 101) |
| 4 | Someone's deed is disputed (trinket 10, p. 26) | A temple's Reliquary is stolen (5 GP, p. 97) | A neighbourhood lives at Aristocratic lifestyle while others go Wretched (p. 101) |
| 5 | The local healer can only brew Potions of Healing (1 day, 25 GP, p. 103) | An assassin contract arrives (Assassin, CR 8, p. 260) | A district's search DC is 15 and its navigation DC 15 — travellers get lost on purpose (p. 192) |
| 6 | An old key fits nothing (trinket 56, p. 27) | The town can't afford 3rd-level spellcasting (300 GP base, p. 102) | Two factions, one guildhall (see [[Factions and Organizations Template]]) |

### d8 — Settlement name parts (*homebrew*; roll 1d8 twice)

| d8 | Prefix / core | Suffix / core |
| --- | --- | --- |
| 1 | Ash- | -ford |
| 2 | Bramble- | -mere |
| 3 | Cold- | -hollow |
| 4 | Dun- | -market |
| 5 | Grey- | -wall |
| 6 | Iron- | -crossing |
| 7 | Thorn- | -stead |
| 8 | White- | -gate |

*(Gates matter: a "…gate" settlement is a border or portal town — see [[Cosmology and Planes]].)*

### d6 — What the place is known for (*homebrew*)

| d6 | Prompt |
| --- | --- |
| 1 | Its market: equipment sells for half, trade goods keep full value (SRD p. 89) |
| 2 | Its circle: temples and guildhalls hold permanent teleportation circles (SRD p. 169) |
| 3 | Its shrine: a holy symbol of a god nobody else worships (SRD pp. 97, 26–27) |
| 4 | Its terrain: the foraging DC here is famous (SRD p. 192) |
| 5 | Its library: History and Religion checks are easier to justify (SRD p. 9) |
| 6 | Its ruin: half a floor plan exists as someone's trinket (SRD p. 27) |

## Building the sub-locations

1. **Inns and markets** — quote real prices from SRD pp. 101–102. A town that charges 10 GP for bread is telling a story; do it deliberately.
2. **Temples and guildhalls** — if it has a *Teleportation Circle*, it has traffic, and traffic has a foraging/navigation/search profile (SRD p. 192).
3. **Sewers, ruins, and vaults** — build them with the SRD's trap format: severity band (nuisance/deadly for levels X–Y), trigger, duration, detect-and-disarm DC, and an *At Higher Levels* scaling table (SRD pp. 199–201).
4. **Light and concealment** — Lightly Obscured (Disadvantage on sight-based Perception) and Heavily Obscured (Blinded) are your dungeon-lighting tools (SRD p. 11).
5. **Weather on the street** — Heavy Precipitation, Slippery Ice, Extreme Heat/Cold, High Altitude all have SRD mechanics (SRD pp. 195–196); use them to make a place feel like somewhere.

## Confirmed [GAP]s in this area

1. **No population, district, or building-count tables.**
2. **No settlement-generation procedures** (the tier gates are a service table, not a generator).
3. **No purchase/sale price variance by region** — only the resale rule (equipment at half, trade goods at full, SRD p. 89) and rarity values (SRD p. 206).
4. **No "safe haven" or rest-tier rules** — a town's safety is a GM call.
5. **No urban encounter tables** (combat encounter math exists at SRD p. 202, but not per-terrain encounter tables).

## Related notes

- [[Economy and Downtime]] — the full price lists and crafting rules
- [[Encounter and Adventure Design]] — travel, environment, and encounter math
- [[NPC Framework]] — who runs the place
- [[Factions and Organizations Template]] — who owns what
- [[Cosmology and Planes]] — if the location touches the planes
- [[Worldbuilding MOC]] — the hub
