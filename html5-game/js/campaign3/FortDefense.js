/**
 * FortDefense Class
 * Handles Fort Phra Chulachomklao defense system for Campaign 3
 * ระบบป้อมพระจุลจอมเกล้า และปืนเสือหมอบ
 */

class FortDefense {
    constructor(gameEngine) {
        this.game = gameEngine;

        // Fort components
        this.fort = null;
        this.gunBatteries = [];
        this.watchTowers = [];
        this.defenders = [];

        // Projectiles
        this.projectiles = [];

        // Sprites
        this.sprites = {
            fortFull: null,
            fortDamaged: null,
            fortDestroyed: null,
            gunBattery: null,
            watchTower: null,
            cannonball: null,
            muzzleFlash: null,
            explosion: null
        };

        // Stats tracking
        this.stats = {
            shotsFired: 0,
            hits: 0,
            damageDealt: 0,
            shipsSunk: 0,
            repairsMade: 0
        };

        // Configuration
        this.config = {
            baseRepairCost: 10, // Gold per 100 HP
            repairAmount: 100, // HP per tick
            repairCooldown: 1000, // ms between repair ticks
            batteryCost: 300,
            towerCost: 150
        };

        // Effects
        this.effects = [];
    }

    /**
     * Initialize Fort Defense system
     * @param {Object} config - Configuration object
     */
    async init(config = {}) {
        console.log("🏰 Initializing Fort Defense System...");

        // Load sprites
        await this.loadSprites(config.sprites);

        console.log("✅ Fort Defense System initialized");
    }

    /**
     * Load fort sprites
     */
    async loadSprites(spriteConfig = {}) {
        const loadSprite = (src) => {
            return new Promise((resolve, reject) => {
                if (!src) {
                    resolve(null);
                    return;
                }
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn(`⚠️ Failed to load sprite: ${src}`);
                    resolve(null);
                };
                img.src = src;
            });
        };

        // Load sprites (using fallbacks if config not provided)
        this.sprites.fortFull = await loadSprite(spriteConfig.fortFull || "images/campain 3/buildings/fort_pakknam.png");
        this.sprites.fortDamaged = await loadSprite(spriteConfig.fortDamaged || "images/campain 3/buildings/fort_damaged.png");
        this.sprites.fortDestroyed = await loadSprite(spriteConfig.fortDestroyed || "images/campain 3/buildings/fort_destroyed.png");
        this.sprites.gunBattery = await loadSprite(spriteConfig.gunBattery || "images/campain 3/buildings/gun_battery.png");
        this.sprites.cannonball = await loadSprite(spriteConfig.cannonball || "images/campain 3/effects/cannonball.png");
        this.sprites.explosion = await loadSprite(spriteConfig.explosion || "images/campain 3/effects/explosion.png");
    }

    /**
     * Create the main fort
     * @param {Object} config - Fort constructor config
     */
    createFort(config) {
        this.fort = {
            id: "fort_paknam",
            x: config.x || this.game.canvas.width / 2,
            y: config.y || this.game.canvas.height * 0.7,
            width: config.width || 200,
            height: config.height || 150,
            hp: config.hp || 5000,
            maxHp: config.maxHp || 5000,
            armor: config.armor || 20,
            state: "active", // active, damaged, destroyed
            lastRepairTime: 0,
            isRepairing: false,

            // Hitbox for collision
            hitbox: {
                x: (config.x || this.game.canvas.width / 2) - (config.width || 200) / 2,
                y: (config.y || this.game.canvas.height * 0.7) - (config.height || 150) / 2,
                width: config.width || 200,
                height: config.height || 150
            }
        };

        // Create initial gun batteries (ปืนเสือหมอบ)
        if (config.batteries) {
            config.batteries.forEach(battery => {
                this.createGunBattery(
                    this.fort.x + battery.x,
                    this.fort.y + battery.y,
                    battery.angle
                );
            });
        } else {
            // Default batteries (Left, Right, Front)
            this.createGunBattery(this.fort.x - 70, this.fort.y - 40, -30);
            this.createGunBattery(this.fort.x + 70, this.fort.y - 40, 30);
            this.createGunBattery(this.fort.x, this.fort.y - 60, 0);
        }

        console.log(`🏰 Created Fort Phra Chulachomklao at (${this.fort.x}, ${this.fort.y})`);
        return this.fort;
    }

    /**
     * Create a gun battery (Armstrong Disappearing Gun)
     * @param {Number} x - X position
     * @param {Number} y - Y position
     * @param {Number} baseAngle - Default facing angle
     */
    createGunBattery(x, y, baseAngle = 0) {
        const battery = {
            id: `battery_${Date.now()}_${this.gunBatteries.length}`,
            type: "armstrong_gun",
            x: x,
            y: y,
            width: 40,
            height: 40,
            hp: 500,
            maxHp: 500,
            attack: 120, // High damage
            range: 400, // Long range
            fireRate: 3000, // 3 seconds per shot
            accuracy: 0.8, // 80% accuracy
            lastFireTime: 0,
            angle: baseAngle * Math.PI / 180,
            baseAngle: baseAngle * Math.PI / 180,
            target: null,
            state: "ready", // ready, reloading, firing, destroyed
            reloadProgress: 100
        };

        this.gunBatteries.push(battery);
        console.log(`🔫 Created Gun Battery at (${x}, ${y})`);
        return battery;
    }

    /**
     * Create a watch tower
     * @param {Number} x - X position
     * @param {Number} y - Y position
     */
    createWatchTower(x, y) {
        const tower = {
            id: `tower_${Date.now()}_${this.watchTowers.length}`,
            type: "watch_tower",
            x: x,
            y: y,
            width: 30,
            height: 50,
            hp: 300,
            maxHp: 300,
            vision: 600, // Reveals fog of war
            attack: 20, // Light defense
            range: 250,
            fireRate: 1000,
            lastFireTime: 0,
            target: null,
            state: "active"
        };

        this.watchTowers.push(tower);
        return tower;
    }

    /**
     * Update Fort Defense system
     * @param {Object} fort - Optional fort object (uses internal if not provided)
     * @param {Number} deltaTime - Time since last update
     */
    update(fortObj, deltaTime) {
        const fort = fortObj || this.fort;
        if (!fort) return;

        const now = Date.now();

        // Update fort state based on HP
        this.updateFortState(fort);

        // Handle fort repairs
        if (fort.isRepairing) {
            this.processRepair(fort, now);
        }

        // Update gun batteries
        this.updateGunBatteries(now, deltaTime);

        // Update watch towers
        this.updateWatchTowers(now, deltaTime);

        // Update projectiles
        this.updateProjectiles(deltaTime);

        // Update effects
        this.updateEffects(deltaTime);
    }

    /**
     * Update fort state based on HP percentage
     */
    updateFortState(fort) {
        if (fort.hp <= 0) {
            if (fort.state !== "destroyed") {
                fort.state = "destroyed";
                this.triggerFortDestroyed();
            }
        } else if (fort.hp < fort.maxHp * 0.4) {
            if (fort.state !== "damaged") {
                fort.state = "damaged";
                this.createSmokeEffects(fort, 3);
            }
        } else {
            fort.state = "active";
        }
    }

    /**
     * Process fort repair
     */
    processRepair(fort, now) {
        if (fort.hp >= fort.maxHp) {
            fort.isRepairing = false;
            return;
        }

        if (now - fort.lastRepairTime >= this.config.repairCooldown) {
            // Check if player has enough gold
            const campaignInfo = this.game.campaign3;
            if (campaignInfo && campaignInfo.resources.gold >= this.config.baseRepairCost) {
                // Determine how much to repair
                const repairAmount = Math.min(this.config.repairAmount, fort.maxHp - fort.hp);

                // Apply repair and deduct cost
                fort.hp += repairAmount;
                campaignInfo.resources.gold -= this.config.baseRepairCost;
                campaignInfo.updateResourceDisplay();

                fort.lastRepairTime = now;
                this.stats.repairsMade++;

                // Create repair effect
                this.createEffect({
                    type: "repair",
                    x: fort.x + (Math.random() * fort.width - fort.width / 2),
                    y: fort.y + (Math.random() * fort.height - fort.height / 2),
                    duration: 500,
                    text: "+" + repairAmount
                });

                console.log(`🔧 Fort repaired: +${repairAmount} HP. Cost: ${this.config.baseRepairCost} Gold.`);
            } else {
                // Not enough gold, cancel repair
                fort.isRepairing = false;
                console.log("⚠️ Not enough gold to continue repairing fort.");
            }
        }
    }

    /**
     * Update all gun batteries
     */
    updateGunBatteries(now, deltaTime) {
        this.gunBatteries.forEach(battery => {
            if (battery.hp <= 0) {
                battery.state = "destroyed";
                return;
            }

            // Update reload progress
            if (battery.state === "reloading") {
                const timeSinceFire = now - battery.lastFireTime;
                battery.reloadProgress = Math.min(100, (timeSinceFire / battery.fireRate) * 100);

                if (battery.reloadProgress >= 100) {
                    battery.state = "ready";
                }
            }

            // Find and attack targets
            if (battery.state === "ready") {
                // Check current target
                if (battery.target && this.isValidTarget(battery.target, battery)) {
                    this.aimAndFireBattery(battery, battery.target, now);
                } else {
                    // Find new target
                    const newTarget = this.findBestTarget(battery);
                    if (newTarget) {
                        battery.target = newTarget;
                        this.aimAndFireBattery(battery, newTarget, now);
                    } else {
                        // Slowly return to base angle if no targets
                        this.rotateTowards(battery, battery.baseAngle, deltaTime * 2);
                    }
                }
            }
        });
    }

    /**
     * Update watch towers
     */
    updateWatchTowers(now, deltaTime) {
        this.watchTowers.forEach(tower => {
            if (tower.hp <= 0) {
                tower.state = "destroyed";
                return;
            }

            this.watchTowers.forEach(tower => {
                const newTarget = this.findBestTarget(tower);
                if (newTarget) tower.target = newTarget;
                if (tower.target && this.isValidTarget(tower.target, tower)) {
                    if (now - tower.lastFireTime > tower.fireRate) {
                        const targetX = tower.target.x + tower.target.width / 2;
                        const targetY = tower.target.y + tower.target.height / 2;
                        tower.target.hp -= tower.attack;
                        this.stats.shotsFired++;
                        tower.lastFireTime = now;
                    }
                }
            });
        });
    }

    /**
     * Check if target is valid (alive and in range)
     */
    isValidTarget(target, source) {
        if (!target || target.hp <= 0) return false;

        const dist = Math.hypot(target.x - source.x, target.y - source.y);
        return dist <= source.range;
    }

    /**
     * Find best target for a defensive structure
     * Prioritize based on distance and ship type
     */
    findBestTarget(source) {
        const enemyShips = this.game.campaign3 ? this.game.campaign3.frenchShips : [];
        if (!enemyShips || enemyShips.length === 0) return null;

        let bestTarget = null;
        let bestScore = -Infinity;

        enemyShips.forEach(ship => {
            if (ship.hp <= 0 || ship.state === "sinking") return;

            const dist = Math.hypot(ship.x - source.x, ship.y - source.y);

            // Only consider targets in range
            if (dist <= source.range) {
                // Score based on distance (closer = better)
                let score = 1000 - dist;

                // Priority weights
                if (ship.type === "TorpedoBoat") score += 500; // High threat to fort
                if (ship.type === "Inconstant") score += 200; // Main target

                // Focus fire on low HP targets
                if (ship.hp < ship.maxHp * 0.3) score += 300;

                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = ship;
                }
            }
        });

        return bestTarget;
    }

    /**
     * Aim battery at target and fire if aligned
     */
    aimAndFireBattery(battery, target, now) {
        // Calculate angle to target center
        const targetX = target.x + target.width / 2;
        const targetY = target.y + target.height / 2;

        // Add lead based on target speed
        // This makes the Armstrong guns more accurate against moving targets
        let predictedX = targetX;
        let predictedY = targetY;

        if (target.isMoving && target.speed > 0) {
            const dist = Math.hypot(targetX - battery.x, targetY - battery.y);
            // Projectile speed approximation
            const projSpeed = 400; // pixels per second
            const travelTime = dist / projSpeed;

            // Predict position
            const targetSpeedPx = target.speed * 20; // adjust based on game scale
            const velocityX = Math.cos(target.angle) * targetSpeedPx;
            const velocityY = Math.sin(target.angle) * targetSpeedPx;

            predictedX += velocityX * travelTime;
            predictedY += velocityY * travelTime;
        }

        const targetAngle = Math.atan2(predictedY - battery.y, predictedX - battery.x);

        // Rotate towards target (1 rad/sec rotation speed)
        // Assume rotation is instant for simplicity, or implement smooth rotation
        battery.angle = targetAngle;

        // Fire!
        this.fireBattery(battery, targetAngle, now);
    }

    /**
     * Rotate battery angle smoothly
     */
    rotateTowards(battery, targetAngle, rotationSpeed) {
        // Simple angle interpolation
        let diff = targetAngle - battery.angle;

        // Normalize diff to -PI to PI
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        if (Math.abs(diff) < rotationSpeed) {
            battery.angle = targetAngle;
        } else {
            battery.angle += Math.sign(diff) * rotationSpeed;
        }
    }

    /**
     * Fire gun battery
     */
    fireBattery(battery, angle, now) {
        battery.state = "reloading";
        battery.reloadProgress = 0;
        battery.lastFireTime = now;

        this.stats.shotsFired++;

        // Add spread/inaccuracy based on battery accuracy
        const spread = (1 - battery.accuracy) * 0.5; // +/- radians
        const finalAngle = angle + (Math.random() * spread * 2 - spread);

        // Calculate spawn position (at the barrel of the gun)
        const barrelLength = 30;
        const spawnX = battery.x + Math.cos(finalAngle) * barrelLength;
        const spawnY = battery.y + Math.sin(finalAngle) * barrelLength;

        // Create projectile
        this.projectiles.push({
            id: `proj_${Date.now()}_${Math.random()}`,
            type: "cannonball",
            x: spawnX,
            y: spawnY,
            startX: spawnX,
            startY: spawnY,
            angle: finalAngle,
            speed: 400, // Pixels per second
            damage: battery.attack,
            range: battery.range,
            distanceTraveled: 0,
            active: true,
            sourceId: battery.id
        });

        // Add muzzle flash effect
        this.createEffect({
            type: "muzzleFlash",
            x: spawnX,
            y: spawnY,
            angle: angle,
            duration: 100,
            scale: 1.5
        });

        // Add recoil animation effect or shake
        this.game.campaign3 && this.game.campaign3.riverMap && this.game.campaign3.riverMap.addCameraShake(2, 100);

        // Play sound
        this.playSound("cannon_fire_heavy");
    }

    /**
     * Update projectiles
     */
    updateProjectiles(deltaTime) {
        this.projectiles = this.projectiles.filter(proj => {
            if (!proj.active) return false;

            // Move projectile
            const moveDist = proj.speed * deltaTime;
            proj.x += Math.cos(proj.angle) * moveDist;
            proj.y += Math.sin(proj.angle) * moveDist;
            proj.distanceTraveled += moveDist;

            // Check max range
            if (proj.distanceTraveled >= proj.range) {
                this.createSplash(proj.x, proj.y);
                return false;
            }

            // Check collision with enemy ships
            return !this.checkProjectileCollision(proj);
        });
    }

    /**
     * Check if projectile hits a ship
     */
    checkProjectileCollision(proj) {
        const enemyShips = this.game.campaign3 ? this.game.campaign3.frenchShips : [];

        for (const ship of enemyShips) {
            if (ship.hp <= 0 || ship.state === "sinking") continue;

            // Simple rectangle collision
            if (proj.x > ship.x && proj.x < ship.x + ship.width &&
                proj.y > ship.y && proj.y < ship.y + ship.height) {

                // Hit!
                this.handleHit(ship, proj);
                return true;
            }
        }

        return false;
    }

    /**
     * Handle projectile hitting a ship
     */
    handleHit(ship, proj) {
        this.stats.hits++;
        this.stats.damageDealt += proj.damage;

        // Apply armor reduction (simple formula)
        const armorReduction = Math.max(0, ship.armor || 0) * 0.5;
        const actualDamage = Math.max(1, proj.damage - armorReduction);

        ship.hp -= actualDamage;

        // Create hit effect
        this.createEffect({
            type: "explosion",
            x: proj.x,
            y: proj.y,
            duration: 300,
            scale: proj.damage > 80 ? 1.5 : 1.0 // Bigger explosion for heavy hits
        });

        // Create floating damage text
        this.createEffect({
            type: "damageText",
            x: proj.x,
            y: proj.y - 20,
            duration: 1000,
            text: Math.round(actualDamage).toString()
        });

        // Play hit sound
        this.playSound("hit_metal");

        // Check if ship is destroyed
        if (ship.hp <= 0 && ship.state !== "sinking") {
            ship.state = "sinking";
            this.stats.shipsSunk++;
            console.log(`💥 ${ship.type} sunk by Fort Paknam!`);

            if (this.game.campaign3 && this.game.campaign3.checkObjectives) {
                this.game.campaign3.checkObjectives();
            }
        }
    }

    /**
     * Handle fort receiving damage
     */
    takeDamage(damage) {
        if (!this.fort || this.fort.state === "destroyed") return;

        // Apply armor mitigation (Forts have high armor)
        const damageMitigated = Math.min(damage * 0.8, this.fort.armor * 2);
        const actualDamage = Math.max(1, damage - damageMitigated);

        this.fort.hp -= actualDamage;

        console.log(`🔥 Fort took ${actualDamage} damage. HP: ${this.fort.hp}/${this.fort.maxHp}`);

        // Visual feedback
        this.emitParticles(
            this.fort.x,
            this.fort.y - this.fort.height / 2,
            5,
            "#A0522D" // Brown brick color
        );
    }

    /**
     * Handle battery receiving damage
     */
    damageBattery(batteryId, damage) {
        const battery = this.gunBatteries.find(b => b.id === batteryId);
        if (!battery || battery.hp <= 0) return;

        // Disappearing Gun Mechanic:
        // If the gun is reloading, it's hidden in the pit and takes heavily reduced damage (or no damage)
        if (battery.state === "reloading") {
            // 90% damage reduction when hiding in the pit
            damage = damage * 0.1;

            // Optional: Create a "ping" effect to show it hit the armor plating
            this.createEffect({
                type: "damageText",
                x: battery.x,
                y: battery.y - 10,
                duration: 500,
                text: "ซ่อนตัว!"
            });
        }

        battery.hp -= damage;

        if (battery.hp <= 0) {
            battery.state = "destroyed";
            this.createEffect({
                type: "explosion",
                x: battery.x,
                y: battery.y,
                duration: 500,
                scale: 2.0
            });
            console.log("🧨 Gun battery destroyed!");
        }
    }

    /**
     * Triggered when main fort hp reaches 0
     */
    triggerFortDestroyed() {
        console.error("💥 ALARM: Fort Phra Chulachomklao has fallen!");

        // Create massive explosion sequence
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createEffect({
                    type: "explosion",
                    x: this.fort.x + (Math.random() * this.fort.width - this.fort.width / 2),
                    y: this.fort.y + (Math.random() * this.fort.height - this.fort.height / 2),
                    duration: 800 + Math.random() * 400,
                    scale: 1.5 + Math.random() * 2
                });
            }, i * 200);
        }

        // Inform campaign controller
        if (this.game.campaign3) {
            this.game.campaign3.checkGameConditions();
        }
    }

    // --- Visuals and Effects ---

    createSplash(x, y) {
        this.createEffect({
            type: "splash",
            x: x,
            y: y,
            duration: 400,
            scale: 1.0
        });
        this.playSound("water_splash_small");
    }

    createSmokeEffects(target, count) {
        for (let i = 0; i < count; i++) {
            this.createEffect({
                type: "smoke",
                x: target.x + (Math.random() * (target.width || 50) - (target.width || 50) / 2),
                y: target.y + (Math.random() * (target.height || 50) - (target.height || 50) / 2),
                duration: 2000 + Math.random() * 1000,
                persistent: true // Revives itself if target still damaged
            });
        }
    }

    createEffect(effect) {
        effect.createdAt = Date.now();
        this.effects.push(effect);
    }

    emitParticles(x, y, count, color) {
        // Delegate to game engine particle system if exists
        if (this.game.particleSystem) {
            this.game.particleSystem.emitDts(x, y, count, color);
        } else {
            // Simple visual effect
            for (let i = 0; i < count; i++) {
                this.createEffect({
                    type: "particle",
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 100,
                    vy: (Math.random() - 0.5) * 100 - 50,
                    color: color,
                    size: Math.random() * 4 + 2,
                    duration: 500 + Math.random() * 500
                });
            }
        }
    }

    updateEffects(deltaTime) {
        const now = Date.now();
        this.effects = this.effects.filter(effect => {
            const age = now - effect.createdAt;

            // Move particles
            if (effect.type === "particle" && effect.vx !== undefined) {
                effect.x += effect.vx * deltaTime;
                effect.y += effect.vy * deltaTime;
                // Add gravity
                effect.vy += 200 * deltaTime;
            }

            // Move floating text
            if (effect.type === "damageText" || effect.type === "repair") {
                effect.y -= 30 * deltaTime;
            }

            // Check expiration
            if (age >= effect.duration) {
                // Persistent effects (like smoke on damaged buildings) renew if condition met
                if (effect.persistent) {
                    // Quick check if fort is still damaged
                    if (this.fort && this.fort.state === "damaged") {
                        effect.createdAt = now;
                        // Jitter position slightly
                        effect.x += (Math.random() - 0.5) * 10;
                        effect.y += (Math.random() - 0.5) * 10;
                        return true;
                    }
                    return false;
                }
                return false;
            }

            return true;
        });
    }

    playSound(soundId) {
        if (this.game.soundManager) {
            this.game.soundManager.play(soundId);
        }
    }

    // --- Rendering ---

    render(fortObj) {
        const fort = fortObj || this.fort;
        if (!fort) return;

        const ctx = this.game.ctx;

        // 1. Render main fort base
        this.renderFortBase(ctx, fort);

        // 2. Render gun batteries (Armstrong guns)
        this.gunBatteries.forEach(battery => this.renderGunBattery(ctx, battery));

        // 3. Render watch towers
        this.watchTowers.forEach(tower => this.renderWatchTower(ctx, tower));

        // 4. Render projectiles
        this.projectiles.forEach(proj => this.renderProjectile(ctx, proj));

        // 5. Render effects
        this.renderEffects(ctx);

        // 6. UI overlays (HP bars, Repair indicators)
        this.renderOverlays(ctx, fort);
    }

    renderFortBase(ctx, fort) {
        ctx.save();

        // Draw shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(fort.x, fort.y + fort.height / 2 - 10, fort.width / 2 + 10, fort.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        let sprite = this.sprites.fortFull;
        if (fort.state === "damaged") sprite = this.sprites.fortDamaged || this.sprites.fortFull;
        if (fort.state === "destroyed") sprite = this.sprites.fortDestroyed || this.sprites.fortFull;

        if (sprite) {
            ctx.drawImage(
                sprite,
                fort.x - fort.width / 2,
                fort.y - fort.height / 2,
                fort.width,
                fort.height
            );

            // If using full sprite fallback for damaged/destroyed, add visual overlay
            if (fort.state === "damaged" && !this.sprites.fortDamaged) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
                ctx.fillRect(fort.x - fort.width / 2, fort.y - fort.height / 2, fort.width, fort.height);
                // Draw some cracks
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(fort.x, fort.y - 30);
                ctx.lineTo(fort.x - 20, fort.y + 10);
                ctx.lineTo(fort.x - 10, fort.y + 30);
                ctx.stroke();
            }
        } else {
            // Fallback shape if no sprite
            ctx.fillStyle = fort.state === "active" ? "#8B4513" : fort.state === "damaged" ? "#5A2E0B" : "#2F1805";
            ctx.fillRect(fort.x - fort.width / 2, fort.y - fort.height / 2, fort.width, fort.height);

            // Battlements
            ctx.fillStyle = "#A0522D";
            for (let i = -fort.width / 2; i < fort.width / 2; i += 30) {
                ctx.fillRect(fort.x + i + 5, fort.y - fort.height / 2 - 15, 20, 15);
            }
        }

        ctx.restore();
    }

    renderGunBattery(ctx, battery) {
        if (battery.state === "destroyed") {
            // Draw destroyed rubble
            ctx.fillStyle = "#333";
            ctx.beginPath();
            ctx.arc(battery.x, battery.y, battery.width / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        ctx.save();
        ctx.translate(battery.x, battery.y);

        // Draw battery base/pit
        ctx.fillStyle = "#555";
        ctx.beginPath();
        ctx.arc(0, 0, battery.width / 2 + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Rotate for gun barrel
        ctx.rotate(battery.angle);

        // Draw gun barrel (Armstrong gun)
        const recoilOffset = battery.state === "reloading" && battery.reloadProgress < 20 ? -5 : 0;

        ctx.fillStyle = "#111";
        // Main barrel
        ctx.fillRect(-10 + recoilOffset, -4, 30, 8);
        // Muzzle tip
        ctx.fillRect(20 + recoilOffset, -5, 5, 10);
        // Breech mechanism
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(-15 + recoilOffset, -8, 15, 16);

        ctx.restore();
    }

    renderWatchTower(ctx, tower) {
        if (tower.state === "destroyed") return;

        ctx.save();
        ctx.translate(tower.x, tower.y);

        // Tower Structure
        ctx.fillStyle = "#A0522D";
        // Base
        ctx.fillRect(-10, -10, 20, 20);
        // Pillar
        ctx.fillRect(-6, -40, 12, 30);
        // Top platform
        ctx.fillRect(-15, -45, 30, 10);

        // Roof
        ctx.fillStyle = "#8B0000";
        ctx.beginPath();
        ctx.moveTo(-18, -45);
        ctx.lineTo(0, -60);
        ctx.lineTo(18, -45);
        ctx.fill();

        ctx.restore();
    }

    renderProjectile(ctx, proj) {
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.rotate(proj.angle);

        if (this.sprites.cannonball) {
            ctx.drawImage(this.sprites.cannonball, -5, -5, 10, 10);
        } else {
            // Draw cannonball with trailing effect
            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();

            // Trail
            const gradient = ctx.createLinearGradient(0, 0, -15, 0);
            gradient.addColorStop(0, "rgba(200, 200, 200, 0.8)");
            gradient.addColorStop(1, "rgba(200, 200, 200, 0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.lineTo(-15, -1);
            ctx.lineTo(-15, 1);
            ctx.lineTo(0, 2);
            ctx.fill();
        }

        ctx.restore();
    }

    renderEffects(ctx) {
        const now = Date.now();

        this.effects.forEach(effect => {
            const age = now - effect.createdAt;
            const progress = age / effect.duration;

            ctx.save();

            if (effect.type === "smoke") {
                const alpha = Math.max(0, 1 - progress);
                const size = 10 + (progress * 20);

                ctx.globalAlpha = alpha * 0.7; // Max alpha 0.7
                ctx.fillStyle = "#555";
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (effect.type === "splash") {
                const size = effect.scale * 15 * progress;
                ctx.globalAlpha = 1 - progress;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
                ctx.stroke();
            }
            else if (effect.type === "particle") {
                ctx.globalAlpha = 1 - progress;
                ctx.fillStyle = effect.color;
                ctx.fillRect(effect.x, effect.y, effect.size, effect.size);
            }
            else if (effect.type === "damageText") {
                ctx.globalAlpha = 1 - progress * 0.5; // Fades out slowly
                ctx.fillStyle = effect.color || "#FF3333"; // Red for damage, or custom
                ctx.font = "bold 16px Arial";
                ctx.textAlign = "center";
                // Add stroke for readability
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.strokeText(effect.text, effect.x, effect.y);
                ctx.fillText(effect.text, effect.x, effect.y);
            }
            else if (effect.type === "repair") {
                ctx.globalAlpha = 1 - progress * 0.5;
                ctx.fillStyle = "#4CAF50"; // Green for repair
                ctx.font = "bold 16px Arial";
                ctx.textAlign = "center";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.strokeText(effect.text, effect.x, effect.y);
                ctx.fillText(effect.text, effect.x, effect.y);
            }
            else if (effect.type === "muzzleFlash") {
                ctx.translate(effect.x, effect.y);
                ctx.rotate(effect.angle);

                const size = 15 * effect.scale * (1 - progress);
                ctx.fillStyle = "rgba(255, 200, 50, " + (1 - progress) + ")";

                ctx.beginPath();
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(size * 1.5, 0);
                ctx.lineTo(0, size / 2);
                ctx.fill();
            }
            else if (effect.type === "explosion" && !this.sprites.explosion) {
                ctx.translate(effect.x, effect.y);
                const size = 20 * effect.scale * (progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8);

                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
                gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
                gradient.addColorStop(0.2, "rgba(255, 200, 0, 0.8)");
                gradient.addColorStop(0.6, "rgba(255, 50, 0, 0.5)");
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    renderOverlays(ctx, fort) {
        if (!fort || fort.state === "destroyed") return;

        // Health Bar
        const barWidth = 100;
        const barHeight = 8;
        const x = fort.x - barWidth / 2;
        const y = fort.y - fort.height / 2 - 20;
        const hpPercent = Math.max(0, fort.hp / fort.maxHp);

        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, barWidth, barHeight);

        // Color based on HP
        let hpColor = "#4CAF50"; // Green
        if (hpPercent < 0.5) hpColor = "#FFC107"; // Yellow
        if (hpPercent < 0.2) hpColor = "#F44336"; // Red

        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, barWidth * hpPercent, barHeight);

        // Border
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Name Tag
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        // Add shadow for readability
        ctx.shadowColor = "black";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText("ป้อมพระจุลจอมเกล้า", fort.x, y - 5);

        ctx.shadowBlur = 0; // reset
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Repairing indicator
        if (fort.isRepairing) {
            ctx.fillStyle = "#4CAF50";
            ctx.font = "10px Arial";
            ctx.fillText("🔧 กำลังซ่อมแซม...", fort.x, y - 20);

            // Draw progress circle
            const now = Date.now();
            const timeSinceTick = now - fort.lastRepairTime;
            const progress = Math.min(1, timeSinceTick / this.config.repairCooldown);

            ctx.beginPath();
            ctx.arc(fort.x + barWidth / 2 + 15, y + 4, 6, 0, Math.PI * 2);
            ctx.strokeStyle = "#4CAF50";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(fort.x + barWidth / 2 + 15, y + 4);
            ctx.arc(fort.x + barWidth / 2 + 15, y + 4, 6, -Math.PI / 2, -Math.PI / 2 + (progress * Math.PI * 2));
            ctx.fillStyle = "#4CAF50";
            ctx.fill();
        }

        // Draw reload bars for batteries
        this.gunBatteries.forEach(battery => {
            if (battery.state === "reloading") {
                const reloadW = 20;
                const reloadH = 4;
                const bx = battery.x - reloadW / 2;
                const by = battery.y + 20;

                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect(bx, by, reloadW, reloadH);

                ctx.fillStyle = "#00BCD4";
                ctx.fillRect(bx, by, reloadW * (battery.reloadProgress / 100), reloadH);
            }
        });
    }

    /**
     * Start repairing the fort
     */
    toggleRepair() {
        if (this.fort && this.fort.state !== "destroyed" && this.fort.hp < this.fort.maxHp) {
            this.fort.isRepairing = !this.fort.isRepairing;
            console.log(`Fort repair ${this.fort.isRepairing ? 'started' : 'stopped'}.`);
            return this.fort.isRepairing;
        }
        return false;
    }

    /**
     * Clear all defense data
     */
    clear() {
        this.fort = null;
        this.gunBatteries = [];
        this.watchTowers = [];
        this.projectiles = [];
        this.effects = [];
    }
}

// Export for use
export { FortDefense };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FortDefense;
}
