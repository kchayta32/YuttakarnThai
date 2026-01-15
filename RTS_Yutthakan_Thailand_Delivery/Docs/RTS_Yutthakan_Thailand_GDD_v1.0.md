# Game Design Document (GDD)
# RTS: ยุทธการไทย (RTS: Yutthakan Thailand)

**Version:** 1.0  
**Date:** December 30, 2025  
**Platform:** PC (Windows, macOS)  
**Genre:** Historical Real-Time Strategy (RTS)  
**Target Audience:** Strategy gamers, History enthusiasts (TH/Intl), Education sector (Secondary/University)  

---

## 1. Executive Summary
**RTS: Yutthakan Thailand** is a single-player Real-Time Strategy game that takes players through 9 pivotal military and political conflicts in Thai history, from the 16th century to a fictional near-future scenario. The game emphasizes tactical realism, historical authenticity (with educational context), and strategic resource management. Players will command armies, manage supply lines, and make tactical decisions that echo historical realities.

**USP (Unique Selling Points):**
*   **Deep Historical Immersion:** Rare settings like the Boworadet Rebellion or the Korean War from a Thai expeditionary perspective.
*   **Educational Value:** Accurate uniforms, expansive historical briefings, and "Museum Mode" context.
*   **Tactical Variety:** Mechanics evolve with eras—from elephants and swords in 1547 to drone warfare in 2025.

---

## 2. Gameplay Overview
**Core Loop:**
1.  **Briefing:** Player receives historical context and objectives.
2.  **Base/Army Management:** Gather resources (Rice, Supplies, Fuel/Gold), build structures, train units.
3.  **Exploration:** Scout the map, reveal Fog of War, secure strategic points.
4.  **Combat:** Engage enemies using rock-paper-scissors counters, terrain advantages, and unit abilities.
5.  **Victory/Loss:** Achieve objectives (Destroy enemy HQ, Capture area, Survive timer) or lose all key units/structures.

**Tutorial Flow:**
*   Integrated into the first mission (Burmese–Siamese 1547). Captain character guides player through camera controls -> selection -> movement -> combat -> building.

---

## 3. Mechanics (Detailed)

### Resource System
*   **Food/Rice:** Biological units cost Food. Gathered from Farms or Rice Paddies (regenerating).
*   **Supplies/Gold:** Equipment/Weapons cost Supplies. Gathered from Trade Posts or Supply Drops.
*   **Fuel (Modern Eras):** Vehicles require Fuel. Gathered from Oil Depots.
*   **Population Cap:** Limited by Housing/Tents.

### Combat Formula
*   **Damage Determination:** `FinalDamage = (BaseDamage * (100 / (100 + TargetArmor))) * RangeMultiplier`
*   **Accuracy:** Ranged units have percentage hit chance. `HitChance = BaseAccuracy - (Distance * FalloffFactor) - CoverBonus`
*   **Morale:** Units taking heavy fire lose Morale. < 50% Morale = -20% Fire Rate/Speed. 0% Morale = Rout (Uncontrollable retreat).
*   **Armor Types:** Unarmored (Infantry), Light Armor (Technical/Light Tank), Heavy Armor (MBT), Structure.

### Visibility
*   **Fog of War:** Shroud (unexplored) and Fog (explored but currently unseen).
*   **Line of Sight (LOS):** Calculated via raycast on a grid. Elevation expands LOS. Forests/Towns block LOS.
*   **Stealth:** Some units (Guerrillas, Snipers) are invisible in Forests until they attack or are detected by Detectors (Scouts, Dogs, Radar).

### Buildings
*   **HQ:** Main base. Produces builders. Loss = Defeat (usually).
*   **Barracks:** Trains infantry.
*   **Stable/Motor Pool:** Trains cavalry/vehicles.
*   **Tower/Bunker:** Static defense.

---

## 4. Campaigns & Missions Overview
(See separate detailed Campaign Sheets for full data)

1.  **Burmese–Siamese War (1547–1549):** Introduction to melee & elephants. Suriyothai narrative.
2.  **Tha Din Daeng Campaign (1786):** Jungle ambushes, light infantry tactics, supply lines.
3.  **Franco-Siamese War (1893):** Naval defense (Paknam) and diplomatic timers.
4.  **World War I Expeditionary Force (1918):** Western Front trench warfare, artillery usage.
5.  **Boworadet Rebellion (1933):** Civil conflict, rail-based movement, political morale mechanics.
6.  **Franco-Thai War (1940–1941):** Air superiority introduction, tank battles in Indochina.
7.  **Japanese Invasion (1941):** Amphibious defense, holding out against superior numbers (Ao Manao).
8.  **Korean War (1950–1953):** "Little Tigers" regiment. Snow weather effects, defensive hold.
9.  **Near Future Conflict (2025):** Modern combined arms, drones, rules of engagement politics.

---

## 5. Unit Roster (Template)
| Unit Name (EN/TH) | Role | Stats (HP/Dmg/Arm/Rg) | Cost | Abilities |
| :--- | :--- | :--- | :--- | :--- |
| **Pike Infantry** / พลหอก | Anti-Cav | 100 / 10 / 0 / 1 | 50 Food | **Phalanx:** +Def, -Speed |
| **War Elephant** / ช้างศึก | Tank/Siege | 1000 / 50 / 5 / 1 | 300 Food | **Trample:** AOE Knockback |
| **Gatling Gun** / ปืนกล | Suppression | 200 / 5 / 1 / 10 | 150 Gold | **Suppress:** Slows enemies |
| **MBT-30** / รถถังหลัก | Main Battle | 800 / 80 / 10 / 8 | 400 Fuel | **Smoke Screen:** Blocks LOS |

---

## 6. Map & Terrain
*   **Elevation:** Hilltops grant +20% damage and +25% range visibility.
*   **Forest:** -30% movement speed, +10 Defense cover. Hides Infantry.
*   **Water:** Impassable (except amphibious/naval).
*   **Roads:** +20% movement speed.
*   **Weather:**
    *   **Rain/Monsoon:** Slows vehicles, reduces visibility range.
    *   **Winter (Korea):** Infantry lose health if not near heat sources (campfires/buildings).

---

## 7. AI Design
**State Machine:**
*   **Idle/Patrol:** Move between waypoints, scan for enemies.
*   **Gather:** Economy focus.
*   **Attack:** Group up at rally point, move to target, engage closest threat.
*   **Retreat:** If Army Strength < Enemy Strength * 0.5 -> Fallback to nearest Defense.

**Difficulty Levels:**
*   **Easy:** Passive. Attacks rarely. Resource bonus: None.
*   **Medium:** Standard aggression. Counters player units. Resource bonus: None.
*   **Hard:** Aggressive expansion. Micro-manages units (hit & run). Resource bonus: +20%.

---

## 8. UI/UX
*   **HUD Layout:** Minimap (Bottom Left), Unit Info (Bottom Center), Commands (Bottom Right), Resources (Top Right).
*   **Selection:** Box select, Double click (select all of type), Control groups (Ctrl+1-9).
*   **Accessibility:** UI Scale slider (80%-150%), Colorblind modes (Protanopia/Deuteranopia/Tritanopia filters on unit outlines).
*   **Localization:** On-the-fly language switching (TH/EN/CN) in options.

---

## 9. Art Direction
*   **Style:** Low-poly but realistic proportions (not chibi). Desaturated historical tones.
*   **Citations:** Uniforms based on Royal Thai Army Museum references.
*   **Visual Logic:** Player Color clearly visible on shoulder pads/shields/flags.
*   **Effects:** Dust trails for vehicles, simple bloodless hit flashes (for rating), stylized explosions.

---

## 10. Audio Design
*   **Music:** Adaptive music system.
    *   *Ancient:* Thai traditional instruments (Ranat, Klong).
    *   *Modern:* Orchestral military march mixed with ambient synths.
*   **VO:** "Commander" voice for alerts ("Base under attack"). Unit responses in native language (Thai units speak Thai, Enemy speaks their language).

---

## 11. Technical Design
*   **Engine:** Unity 2022.3 LTS (or later).
*   **Architecture:**
    *   `GameManager`: Singleton. Handles state, pause, win/lose.
    *   `UnitController`: Component on every unit. Handles selection and commands.
    *   `NavMeshAgent`: For movement implementation.
*   **Data:** Units defined in `ScriptableObjects` (easier for game designers to tweak).
*   **Save/Load:** JSON serialization of Unit positions/health and Player resources.

---

## 12. Legal & Sensitivity
> **DISCLAIMER:** This game is a historical fiction work based on real events. Liberties have been taken for gameplay balance. It does not intend to promote violence or hatred against any nation.

*   **Content Warning:** Depictions of war. No gore.
*   **Assets:** All assets in this prototype package are CC0 placeholders or originals.
*   **Localization Strategy:** Neutral tone. Avoid nationalistic slurs. Focus on "duty" and "defense".

---

## Appendices
*   A: Unit Stats Table (See `Balance_Sheet.csv`)
*   B: Campaign Scripts
*   C: Asset Manifest

