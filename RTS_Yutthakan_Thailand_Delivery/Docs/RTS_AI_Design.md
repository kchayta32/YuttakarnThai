# RTS: Yutthakan Thailand - AI Design Document

## 1. AI Architecture
The AI uses a **Hierarchical Task Network (HTN)** combined with **Behavior Trees (BT)** for unit-level micro-management.
*   **Macro Coordinator (Commander AI):** Decides overall strategy (Economy vs Army vs Technology).
*   **Squad Manager:** Groups units and assigns tactical goals (Attack A, Defend B).
*   **Unit Brain (Micro):** Handles pathfinding, targeting, and local avoidance.

## 2. Difficulty Scaling
| Feature | Easy | Normal | Hard |
| :--- | :--- | :--- | :--- |
| **Resource Cheats** | None | None | +20% Gather Rate |
| **Initial Aggression** | 10 mins (Peaceful) | 5 mins | 2 mins (Rush) |
| **Micro Ability** | No kiting | Basic focus fire | Kites, Focuses low HP |
| **Expansion** | 1 Base max | 2 Bases | Map Control focus |
| **APM Limit** | 30 actions/min | 100 actions/min | Unlimited |

## 3. Behavior Tree: Unit Combat (Pseudo-code)
```text
Root
|-> Selector
    |-> Sequence (Morale Check)
    |   |-> Condition: Morale < 20%
    |   |-> Action: Retreat to HQ
    |-> Sequence (Opportunity Target)
    |   |-> Condition: Enemy In Range AND Enemy HP < OneHitKill
    |   |-> Action: Attack Enemy
    |-> Sequence (Combat)
    |   |-> Condition: Has Attack Order
    |   |-> Selector
    |       |-> Sequence (In Range)
    |       |   |-> Condition: Distance <= Range
    |       |   |-> Action: Stop Moving
    |       |   |-> Action: Fire Weapon
    |       |-> Sequence (Out of Range)
    |           |-> Action: Move To Target(Range)
    |-> Action: Idle / Scan for Targets
```

## 4. Commander AI States
1.  **Opening (0-5 mins):**
    *   Goal: Maximize worker production.
    *   Build Order: House -> Barracks -> Supply Depot.
    *   Scout: Send 1 unit to find player.
2.  **Mid-Game (5-15 mins):**
    *   Evaluate: If Army > Player Army -> PUSH.
    *   Evaluate: If Resources Low -> EXPAND.
3.  **Late-Game:**
    *   Goal: Seek and Destroy.
    *   Tactics: Multi-pronged attacks (Main force front, harass dropship back).

## 5. Pathfinding Fallbacks
*   **Primary:** Unity NavMesh.
*   **Stuck Handling:** If rigid body velocity < 0.1 for 2 seconds while moving -> Repath.
*   **Crowd Control:** Use `RVO (Reciprocal Velocity Obstacles)` to prevent unit clumping.
