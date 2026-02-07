# RTS: Yutthakan Thailand - Test Plan & QA Checklist

## 1. Test Strategy
*   **Unit Testing:** C# logic (Combat formulas, Pathfinding algorithms) tested via NUnit in Unity Test Runner.
*   **Integration Testing:** Scene-based tests for Prefab spawning and Game Loop state transitions.
*   **Manual Testing:** Playtests for "Feel", Balance, and Fun factor.

## 2. QA Checklist (Regression Suite)

### Core Mechanics
- [ ] **Unit Selection:** Click select, Box select, Shift-add, Ctrl-group recall.
- [ ] **Movement:** Units move to clicked point. Units navigate around obstacles.
- [ ] **Combat:** Units attack hostile targets automatically. Damage is applied correctly. Units die at 0 HP.
- [ ] **Resources:** Gathering increases counter. Spending decreases counter. Cannot build with insufficient funds.
- [ ] **Fog of War:** Unexplored areas are black. Explored unseen areas are gray. Units reveal area.

### UI & UX
- [ ] **Minimap:** Clicks move camera. Unit dots update in real-time.
- [ ] **Tooltips:** Hovering over unit showing correct stats.
- [ ] **Menus:** Pause menu works. Save/Load works. Settings (Volume/Graphics) persist.

### Localization
- [ ] Switch Language to TH -> Check Font rendering (Sarabun/Noto Sans Thai). Check line breaks.
- [ ] Switch Language to EN -> Check logic.
- [ ] Switch Language to CN -> Check CJK character rendering.

### Performance
- [ ] Frame rate > 60 FPS on GTX 1060 (1080p).
- [ ] Frame rate > 30 FPS on Integrated Graphics (720p).
- [ ] Load time < 15 seconds for Main Menu -> Game.
- [ ] Memory usage < 4GB RAM.

## 3. Automated Test Cases (Examples)
1.  `Test_DamageCalculation`: Assert that `ApplyDamage(100 armor, 50 dmg)` returns expected reduced value.
2.  `Test_ResourceCap`: Assert that gathering stops when `CurrentResource == MaxResource`.
3.  `Test_Pathfinding`: Assert that unit path length > straight line distance when obstacle is present.
