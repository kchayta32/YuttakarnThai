/**
 * FrenchAI Class
 * Controls behavior of French gunboats and torpedo boats for Campaign 3
 * ระบบ AI ควบคุมเรือรบฝรั่งเศส
 */

class FrenchAI {
    constructor(gameEngine, campaignData) {
        this.game = gameEngine;
        this.campaign = campaignData; // Reference to Campaign3 instance

        // Difficulty multipliers
        this.difficulty = "normal"; // easy, normal, hard
        this.aggressiveness = 1.0;
        this.evasionSkill = 1.0;

        // Tactical states
        this.tactics = {
            formation: "line", // line, wedge, scattered
            currentObjective: "advance", // advance, attack_fort, attack_ships, retreat
            formationCenter: { x: 0, y: 0 }
        };

        // Decision cooldowns
        this.lastDecisionTime = 0;
        this.decisionInterval = 2000; // MS between major tactical decisions

        // Waypoints for advancing up the river
        this.waypoints = [];
    }

    /**
     * Initialize AI
     */
    init(config = {}) {
        console.log("🧠 Initializing French Naval AI...");

        if (config.difficulty) this.setDifficulty(config.difficulty);

        this.generateWaypoints();

        console.log(`✅ French AI initialized (Difficulty: ${this.difficulty})`);
    }

    /**
     * Set AI difficulty parameters
     */
    setDifficulty(level) {
        this.difficulty = level;
        switch (level) {
            case "easy":
                this.aggressiveness = 0.5;
                this.evasionSkill = 0.2;
                this.decisionInterval = 4000;
                break;
            case "normal":
                this.aggressiveness = 1.0;
                this.evasionSkill = 0.6;
                this.decisionInterval = 2000;
                break;
            case "hard":
                this.aggressiveness = 1.5;
                this.evasionSkill = 0.9;
                this.decisionInterval = 1000;
                break;
        }
    }

    /**
     * Generate waypoints for ships to follow up the river
     */
    generateWaypoints() {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const centerX = width / 2;

        // Create a path up the river with some slight curves
        this.waypoints = [
            { x: centerX, y: height * 0.9 }, // Near bottom
            { x: centerX + 50, y: height * 0.75 }, // Slight right
            { x: centerX - 30, y: height * 0.6 }, // Curve left towards fort
            { x: centerX + 20, y: height * 0.4 }, // Pass fort
            { x: centerX, y: height * 0.2 }, // Upper river
            { x: centerX, y: -100 } // Exit point (Bangkok)
        ];
    }

    /**
     * Main update loop for AI
     * @param {Number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (!this.campaign || !this.campaign.frenchShips) return;

        const now = Date.now();

        // High-level Tactical Decisions (runs periodically)
        if (now - this.lastDecisionTime > this.decisionInterval) {
            this.makeTacticalDecisions();
            this.lastDecisionTime = now;
        }

        // Low-level Ship Actions (runs every frame)
        this.updateIndividualShips(deltaTime, now);
    }

    /**
     * Determine overall strategy for the fleet
     */
    makeTacticalDecisions() {
        const ships = this.campaign.frenchShips.filter(s => s.hp > 0 && s.state !== "sinking");
        const playerShips = this.campaign.playerShips.filter(s => s.hp > 0 && s.state !== "sinking");
        const fort = this.campaign.fort;

        if (ships.length === 0) return;

        // Analyze situation
        const shipsNearFort = ships.filter(s => fort && Math.abs(s.y - fort.y) < 400);
        const shipsInCombat = ships.filter(s => s.target !== null);
        const totalHpPercent = ships.reduce((sum, s) => sum + (s.hp / s.maxHp), 0) / ships.length;

        // Basic decision tree
        if (totalHpPercent < 0.2 && this.difficulty !== "hard") {
            // Fleet heavily damaged, maybe retreat? (Inconstant historically forced its way through though)
            // We'll keep them advancing but more defensively
            this.tactics.currentObjective = "advance";
            this.tactics.formation = "scattered";
        } else if (shipsNearFort.length > 0 && fort && fort.hp > 0) {
            // In range of fort, focus on suppressing it or rushing past
            if (this.aggressiveness > 1.0) {
                this.tactics.currentObjective = "attack_fort";
            } else {
                this.tactics.currentObjective = "advance"; // Rush past
            }
        } else if (playerShips.length > 0 && shipsInCombat.length > 0) {
            // Engaging player fleet
            this.tactics.currentObjective = "attack_ships";
        } else {
            // Default: advance up river
            this.tactics.currentObjective = "advance";
            this.tactics.formation = "line";
        }

        // Calculate formation center
        if (ships.length > 0) {
            const sumX = ships.reduce((sum, s) => sum + s.x, 0);
            const sumY = ships.reduce((sum, s) => sum + s.y, 0);
            this.tactics.formationCenter = {
                x: sumX / ships.length,
                y: sumY / ships.length
            };
        }

        console.log(`🧠 AI Tactics: ${this.tactics.currentObjective} | Form: ${this.tactics.formation}`);
    }

    /**
     * Update physics and actions for each individual ship
     */
    updateIndividualShips(deltaTime, now) {
        const ships = this.campaign.frenchShips;

        ships.forEach(ship => {
            if (ship.hp <= 0 || ship.state === "sinking") return;

            // 1. Process steering & navigation
            this.navigateShip(ship, deltaTime);

            // 2. Process targeting & combat
            this.manageCombat(ship, now);

            // 3. Evasion mechanisms
            if (this.evasionSkill > 0) {
                this.performEvasion(ship, deltaTime);
            }

            // 4. Barrier Interaction (stop/slow down)
            this.handleBarriers(ship);
        });
    }

    /**
     * Handle navigation and movement
     */
    navigateShip(ship, deltaTime) {
        // Find next waypoint
        let targetWaypoint = null;

        if (ship.currentWaypointIndex === undefined) {
            ship.currentWaypointIndex = 0;
        }

        // If we have waypoints to follow
        if (ship.currentWaypointIndex < this.waypoints.length) {
            targetWaypoint = this.waypoints[ship.currentWaypointIndex];

            // Check if reached waypoint
            const distToWp = Math.hypot(targetWaypoint.x - ship.x, targetWaypoint.y - ship.y);
            if (distToWp < 50) {
                ship.currentWaypointIndex++;
                if (ship.currentWaypointIndex < this.waypoints.length) {
                    targetWaypoint = this.waypoints[ship.currentWaypointIndex];
                } else {
                    targetWaypoint = null; // Reached end
                }
            }
        }

        // Determine target position based on tactical objective
        let targetX = ship.x;
        let targetY = ship.y - 100; // Default: go up

        if (this.tactics.currentObjective === "advance" && targetWaypoint) {
            targetX = targetWaypoint.x;
            targetY = targetWaypoint.y;

            // Add formation offsets
            if (this.tactics.formation === "line") {
                // Keep spread out horizontally
                const shipIndex = this.campaign.frenchShips.indexOf(ship);
                const offset = (shipIndex % 2 === 0 ? 1 : -1) * (Math.ceil(shipIndex / 2) * 80);
                targetX += offset;
            }
        } else if (this.tactics.currentObjective === "attack_fort" && this.campaign.fort) {
            // Circle or hold position near fort
            const distToFort = Math.abs(ship.y - this.campaign.fort.y);
            if (distToFort > 300) {
                targetY = ship.y - 100; // Move closer
            } else {
                targetY = ship.y; // Hold Y position
                // Move side to side
                targetX = this.campaign.fort.x + Math.sin(Date.now() / 2000) * 150;
            }
        } else if (ship.target) {
            // Pursue target
            targetX = ship.target.x;
            // Don't get too close
            if (Math.hypot(targetX - ship.x, ship.target.y - ship.y) > 200) {
                targetY = ship.target.y;
            } else {
                targetY = ship.y;
            }
        }

        // Constrain to river boundaries
        const riverCenter = this.game.canvas.width / 2;
        const riverWidth = this.game.canvas.width * 0.5; // 50% width
        targetX = Math.max(riverCenter - riverWidth / 2 + 50, Math.min(riverCenter + riverWidth / 2 - 50, targetX));

        // Steer towards target
        this.steerShip(ship, targetX, targetY, deltaTime);
    }

    /**
     * Calculate steering forces
     */
    steerShip(ship, targetX, targetY, deltaTime) {
        // Calculate desired angle
        const desiredAngle = Math.atan2(targetY - ship.y, targetX - ship.x);

        // Calculate angle difference
        let angleDiff = desiredAngle - ship.angle;

        // Normalize angle to -PI to PI
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

        // Apply rotation (turn speed based on ship type)
        let turnSpeed = 0.5; // rad/sec
        if (ship.type === "TorpedoBoat") turnSpeed = 1.5;
        if (ship.type === "Inconstant") turnSpeed = 0.3;

        // Limit turning
        if (Math.abs(angleDiff) > 0.05) {
            ship.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed * deltaTime);
        }

        // Apply forward movement
        // Ships move slower if they are turning sharply
        const speedMultiplier = Math.max(0.2, 1 - (Math.abs(angleDiff) / Math.PI));
        
        // Base speed from ship properties
        let moveSpeed = ship.speed || 1.0;
        
        // Scale to game coordinates (e.g., 50 pixels per second at speed 1.0)
        const baseSpeedPx = 50; 
        
        const velocity = moveSpeed * baseSpeedPx * speedMultiplier * deltaTime;

        // Apply movement vector
        const dx = Math.cos(ship.angle) * velocity;
        const dy = Math.sin(ship.angle) * velocity;

        // Ensure ship is always generally moving "up" the screen (negative Y) unless retreating
        if (dy > 0 && this.tactics.currentObjective !== "retreat") {
            // Restrict downward movement
            ship.y += dy * 0.2; 
        } else {
            ship.y += dy;
        }
        
        ship.x += dx;
        
        // Mark as moving for animations
        ship.isMoving = (velocity > 0.1);
    }

    /**
     * Handle combat targeting and firing
     */
    manageCombat(ship, now) {
        // Initialize combat stats if needed
        if (!ship.lastFireTime) {
            ship.lastFireTime = 0;
            ship.fireRate = ship.type === "TorpedoBoat" ? 1500 : 3000;
            ship.range = ship.type === "TorpedoBoat" ? 250 : 350;
            if (ship.type === "Inconstant") {
                ship.fireRate = 4000; // Slow, heavy cannon
                ship.range = 500;
            }
        }

        // 1. Find or validate target
        if (!ship.target || !this.isValidTarget(ship.target, ship)) {
            ship.target = this.findBestTarget(ship);
        }

        // 2. Fire at target
        if (ship.target && this.isValidTarget(ship.target, ship)) {
            if (now - ship.lastFireTime > ship.fireRate) {
                // Check if aligned (broadside firing)
                const targetAngle = Math.atan2(ship.target.y - ship.y, ship.target.x - ship.x);
                let angleDiff = targetAngle - ship.angle;
                
                // Normalize
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                
                // Torpedo boats fire forward, big ships fire broadsides (approx 90 degrees)
                let canFire = false;
                let fireAngle = ship.angle;
                
                if (ship.type === "TorpedoBoat") {
                    // Forward arc
                    canFire = Math.abs(angleDiff) < Math.PI / 4;
                    fireAngle = targetAngle; // Aim directly
                } else {
                    // Broadside arc
                    const isPort = Math.abs(angleDiff - Math.PI/2) < Math.PI/4;
                    const isStarboard = Math.abs(angleDiff + Math.PI/2) < Math.PI/4;
                    
                    if (isPort || isStarboard) {
                        canFire = true;
                        // Determine which broadside
                        fireAngle = isPort ? ship.angle + Math.PI/2 : ship.angle - Math.PI/2;
                    }
                }

                if (canFire) {
                    this.fireWeapon(ship, fireAngle);
                    ship.lastFireTime = now;
                }
            }
        }
    }

    /**
     * Check if a target is valid
     */
    isValidTarget(target, attacker) {
        if (!target) return false;
        
        // Target is dead
        if (target.hp !== undefined && target.hp <= 0) return false;
        if (target.state === "destroyed" || target.state === "sinking") return false;
        
        // Out of range
        const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
        if (dist > attacker.range) return false;
        
        return true;
    }

    /**
     * Find best target for a ship
     */
    findBestTarget(attacker) {
        let bestTarget = null;
        let highestScore = -Infinity;

        const evaluateTarget = (target, type) => {
            if (!this.isValidTarget(target, attacker)) return;

            const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
            let score = 1000 - dist; // Base score on distance

            // Modifiers based on attacker type and target type
            if (attacker.type === "TorpedoBoat") {
                // Torpedo boats prefer larger ships
                if (type === "ship") score += 500;
                if (type === "fort") score -= 200; // Avoid fort guns
            } else if (attacker.type === "Inconstant") {
                // Inconstant targets fort primarily
                if (type === "fort") {
                    score += 800 * this.aggressiveness;
                }
            } else {
                // Comète deals with smaller threats
                if (type === "battery" || type === "soldier") score += 300;
            }

            if (score > highestScore) {
                highestScore = score;
                bestTarget = target;
            }
        };

        // Evaluate Fort
        if (this.campaign.fort) {
            evaluateTarget(this.campaign.fort, "fort");
        }

        // Evaluate Player Ships
        if (this.campaign.playerShips) {
            this.campaign.playerShips.forEach(ship => evaluateTarget(ship, "ship"));
        }

        // Evaluate Fort Batteries
        if (this.campaign.fortDefense && this.campaign.fortDefense.gunBatteries) {
            this.campaign.fortDefense.gunBatteries.forEach(battery => evaluateTarget(battery, "battery"));
        }

        // Evaluate Coastal Soldiers
        if (this.campaign.coastalSoldiers) {
            this.campaign.coastalSoldiers.forEach(soldier => evaluateTarget(soldier, "soldier"));
        }

        return bestTarget;
    }

    /**
     * Fire weapon at specific angle
     */
    fireWeapon(ship, angle) {
        if (!this.campaign.navalCombat) return;

        // Apply some inaccuracy based on difficulty
        const spread = (1.5 - this.aggressiveness) * 0.1; // radians
        const finalAngle = angle + (Math.random() * spread * 2 - spread);

        // Determine projectile type
        let projType = "cannonball";
        let damage = ship.attack;
        let speed = 300;
        let scale = 1.0;

        if (ship.type === "TorpedoBoat") {
            projType = "torpedo";
            speed = 200; // Torpedoes are slower but deadly
            damage *= 1.5;
        } else if (ship.type === "Inconstant") {
            scale = 1.5; // Bigger cannons
        }

        this.campaign.navalCombat.fireProjectile(ship, {
            x: ship.x,
            y: ship.y,
            angle: finalAngle,
            type: projType,
            damage: damage,
            speed: speed,
            range: ship.range,
            scale: scale,
            team: 1 // Enemy team
        });
    }

    /**
     * Evasion logic (avoiding incoming projectiles)
     */
    performEvasion(ship, deltaTime) {
        if (!this.campaign.fortDefense || ship.type === "Inconstant") return; // Big ships don't evade much

        // Only check occasionally to save performance
        if (Math.random() > 0.1) return;

        const incomingProj = this.campaign.fortDefense.projectiles || [];
        
        for (const proj of incomingProj) {
            if (!proj.active) continue;

            const dist = Math.hypot(proj.x - ship.x, proj.y - ship.y);
            
            // If projectile is close
            if (dist < 150) {
                // Calculate time to impact
                // Very simplified: assuming it's heading towards us
                
                // Vector to ship
                const dx = ship.x - proj.x;
                const dy = ship.y - proj.y;
                
                // Projectile velocity vector
                const pvx = Math.cos(proj.angle);
                const pvy = Math.sin(proj.angle);
                
                // Dot product to see if moving towards us
                const dot = (dx * pvx + dy * pvy);
                
                if (dot > 0 && Math.random() < this.evasionSkill) {
                    // Evade! Turn perpendicular to incoming fire
                    const evadeAngle = proj.angle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
                    
                    // Force turn
                    ship.angle = evadeAngle;
                    
                    // Small burst of speed
                    ship.x += Math.cos(evadeAngle) * 50 * deltaTime;
                    ship.y += Math.sin(evadeAngle) * 50 * deltaTime;
                    
                    // Create wake effect showing sudden turn
                    if (this.campaign.navalCombat) {
                        this.campaign.navalCombat.createWakeEffect(ship);
                    }
                    
                    break; // Only evade one thing at a time
                }
            }
        }
    }

    /**
     * Handle interaction with chain barriers
     */
    handleBarriers(ship) {
        if (!this.campaign.chainBarrierSystem) return;

        // Check for collision
        const collisionData = this.campaign.chainBarrierSystem.checkShipCollision(ship);

        if (collisionData.collision) {
            // Found a barrier
            const barrier = collisionData.barrier;
            
            // Focus fire on barrier segments if blocked
            if (this.aggressiveness > 0.5 && !ship.target) {
                // Determine which segment is closest and attack it
                // (implemented via NavalCombat system or direct damage)
            }
        }
    }
}

// Export for use
export { FrenchAI };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrenchAI;
}
