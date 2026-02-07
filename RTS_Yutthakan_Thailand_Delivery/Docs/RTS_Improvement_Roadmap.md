# RTS: Yutthakan Thailand - Development Roadmap & Improvements

## Status Update (Phase 1-9 Completed)
*   [x] **Core Systems:** FSM Units, Buildings, Resources, Combat.
*   [x] **Visuals:** Team Colors, Health Bars, Fog of War (Texture-based).
*   [x] **Tools:** Level Builder, Combat Simulator.
*   [x] **Audio/Data:** AudioManager, UnitData ScriptableObjects.

---

## Recommended Next Steps (The "Gold" Path)

### 1. Advanced AI (The "Commander")
*   *Current:* `AIController` is a placeholder. It doesn't build buildings or train armies systematically.
*   *Goal:* Implement a **Macro AI** that follows a "Build Order" (e.g., House -> Barracks -> Train 3 Soldiers -> Attack).
*   *Tech:* Create `AIBuildOrder` and `AICommander` scripts.

### 2. Mission & Objective System (Campaign Logic)
*   *Current:* `GameLoopManager` only detects "HQ Destroyed".
*   *Goal:* Create a flexible **Objective System** to handle scenario specific tasks like "Escort Prince", "Survive 10 Minutes", or "Capture Area".
*   *Tech:* `ObjectiveManager`, `IObjective` interface, `AreaTrigger`.

### 3. RTS Camera & Minimap Interaction
*   *Current:* Default Static Camera. Minimap is visual only.
*   *Goal:* Implement a professional **RTS Camera** (WASD Pan, Scroll Zoom, Border Pan) and **Minimap Interaction** (Click minimap to jump camera).
*   *Tech:* `RTSCameraController`, `MinimapController` (OnPointerClick).

### 4. Save/Load System
*   *Goal:* Serialize Unit positions and Resources to JSON.
*   *Tech:* `JsonUtility`, `SaveManager`.

### 5. Post-Processing & Lighting
*   *Goal:* Make it look good. Add Bloom, Color Grading (Sepia for historical feel), and baked shadows.
