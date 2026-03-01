/**
 * NavalCombat Class
 * Handles combat between ships, projectiles, and effects for Campaign 3
 * ระบบการรบทางเรือ ปืนใหญ่ และตอร์ปิโด
 */

class NavalCombat {
    constructor(gameEngine) {
        this.game = gameEngine;

        // Entities
        this.projectiles = [];
        this.effects = [];

        // Sprite cache
        this.sprites = {
            ships: {},
            projectiles: {},
            effects: {}
        };

        // Configuration
        this.config = {
            wakeInterval: 100, // ms between wake particles
            explosionDuration: 500,
            hitDuration: 200
        };

        // Stats
        this.stats = {
            projectilesFired: 0,
            projectilesHit: 0,
            totalDamage: 0
        };
    }

    /**
     * Initialize Naval Combat System
     */
    async init(config = {}) {
        console.log("⚔️ Initializing Naval Combat System...");

        // Preset sprite paths if not provided
        const defaultSprites = {
            // Siamese
            siameseGunboat: "images/campain 3/units/siamese_gunboat.png",
            coastalSoldier: "images/campain 3/units/coastal_soldier.png",

            // French
            frenchInconstant: "images/campain 3/units/french_inconstant.png",
            frenchComete: "images/campain 3/units/french_comete.png",
            torpedoBoat: "images/campain 3/units/torpedo_boat.png",

            // Projectiles
            cannonball: "images/campain 3/effects/cannonball.png",
            torpedo: "images/campain 3/effects/torpedo.png",

            // Effects
            explosion: "images/campain 3/effects/explosion.png",
            waterSplash: "images/campain 3/effects/water_splash.png",
            wake: "images/campain 3/effects/wake.png"
        };

        const mergedSprites = { ...defaultSprites, ...config.sprites };

        // Load all sprites
        await this.loadSprites(mergedSprites);

        console.log("✅ Naval Combat System initialized");
    }

    /**
     * Load all required sprites
     */
    async loadSprites(spriteMap) {
        const loadImg = (src) => {
            return new Promise((resolve) => {
                if (!src) { resolve(null); return; }
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn(`⚠️ Missing naval combat sprite: ${src}`);
                    resolve(null);
                };
                img.src = src;
            });
        };

        // Cache them categorically
        this.sprites.ships.siamese = await loadImg(spriteMap.siameseGunboat);
        this.sprites.ships.inconstant = await loadImg(spriteMap.frenchInconstant);
        this.sprites.ships.comete = await loadImg(spriteMap.frenchComete);
        this.sprites.ships.torpedoBoat = await loadImg(spriteMap.torpedoBoat);

        this.sprites.projectiles.cannonball = await loadImg(spriteMap.cannonball);
        this.sprites.projectiles.torpedo = await loadImg(spriteMap.torpedo);

        this.sprites.effects.explosion = await loadImg(spriteMap.explosion);
        this.sprites.effects.splash = await loadImg(spriteMap.waterSplash);
        this.sprites.effects.wake = await loadImg(spriteMap.wake);

        // Soldier (not a ship, but combat unit)
        this.sprites.soldier = await loadImg(spriteMap.coastalSoldier);
    }

    /**
     * Create a Siamese defensive ship
     */
    createSiameseShip(config) {
        return {
            id: `siam_ship_${Date.now()}_${Math.random()}`,
            team: 0, // Player
            type: "SiameseGunboat",
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 40,
            height: config.height || 80,
            hp: config.hp || 800,
            maxHp: config.maxHp || 800,
            armor: config.armor || 10,
            attack: config.attack || 40,
            range: config.range || 300,
            speed: config.speed || 1.5,
            angle: config.angle || -Math.PI / 2, // Facing up

            // State
            state: "idle", // idle, moving, attacking, sinking
            target: null,
            lastFireTime: 0,
            isMoving: false,

            // Visuals
            spriteKey: "siamese",
            lastWakeTime: 0
        };
    }

    /**
     * Create coastal defender
     */
    createCoastalSoldier(config) {
        return {
            id: `soldier_${Date.now()}_${Math.random()}`,
            team: 0,
            type: "CoastalDefender",
            x: config.x || 0,
            y: config.y || 0,
            width: 20,
            height: 20,
            hp: config.hp || 100,
            maxHp: config.maxHp || 100,
            armor: 0,
            attack: config.attack || 15,
            range: config.range || 200,
            speed: 0, // Stationary defenese usually
            angle: 0,

            state: "idle",
            target: null,
            lastFireTime: 0,

            spriteKey: "soldier"
        };
    }

    /**
     * Create a French attacking ship
     */
    createFrenchShip(config) {
        let defaultWidth = 40;
        let defaultHeight = 100;
        let spriteKey = "inconstant";

        if (config.type === "Comète") {
            defaultWidth = 30;
            defaultHeight = 80;
            spriteKey = "comete";
        } else if (config.type === "TorpedoBoat") {
            defaultWidth = 20;
            defaultHeight = 60;
            spriteKey = "torpedoBoat";
        }

        return {
            id: `french_ship_${Date.now()}_${Math.random()}`,
            team: 1, // Enemy
            type: config.type || "Inconstant",
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || defaultWidth,
            height: config.height || defaultHeight,
            hp: config.hp || 1000,
            maxHp: config.maxHp || 1000,
            armor: config.armor || (config.type === "TorpedoBoat" ? 5 : 20),
            attack: config.attack || 50,
            range: config.range || 300,
            speed: config.speed || 1.0,
            angle: config.angle || Math.PI / 2, // Facing down initially

            // Need for AI steering
            baseSpeed: config.speed || 1.0,

            state: "moving",
            target: null,
            lastFireTime: 0,
            isMoving: true,

            spriteKey: spriteKey,
            lastWakeTime: 0
        };
    }

    /**
     * Common fire projectile method
     */
    fireProjectile(source, config) {
        const team = config.team !== undefined ? config.team : source.team;

        const proj = {
            id: `proj_${Date.now()}_${Math.random()}`,
            type: config.type || "cannonball",
            team: team,
            sourceId: source.id,
            x: config.x,
            y: config.y,
            startX: config.x,
            startY: config.y,
            angle: config.angle,
            speed: config.speed || 400,
            damage: config.damage || source.attack,
            range: config.range || source.range,
            scale: config.scale || 1.0,
            distanceTraveled: 0,
            active: true
        };

        this.projectiles.push(proj);
        this.stats.projectilesFired++;

        // Add muzzle flash
        this.createEffect({
            type: "muzzleFlash",
            x: config.x,
            y: config.y,
            angle: config.angle,
            duration: 100,
            scale: config.scale || 1.0
        });

        // Sound handling
        if (this.game.soundManager) {
            const soundId = proj.type === "torpedo" ? "torpedo_launch" :
                (config.scale > 1.2 ? "cannon_fire_heavy" : "cannon_fire");
            this.game.soundManager.play(soundId);
        }
    }

    /**
     * Main update loop for combat
     */
    update(playerShips, enemyShips, deltaTime) {
        // 1. Update projecties
        this.updateProjectiles(playerShips, enemyShips, deltaTime);

        // 2. Process ship logic (rendering prep, wakes)
        this.updateShipsMovementVisuals(playerShips, deltaTime);
        this.updateShipsMovementVisuals(enemyShips, deltaTime);

        // 3. Simple auto-attack for player ships if not manually controlled
        this.updatePlayerShipAutoAttacks(playerShips, enemyShips);

        // 4. Update effects
        this.updateEffects(deltaTime);
    }

    /**
     * Update visualization properties of ships
     */
    updateShipsMovementVisuals(ships, deltaTime) {
        const now = Date.now();

        ships.forEach(ship => {
            if (ship.hp <= 0 && ship.state !== "sinking" && ship.state !== "destroyed") {
                ship.state = "sinking";
                ship.sinkingProgress = 0;
            }

            if (ship.state === "sinking") {
                ship.sinkingProgress = (ship.sinkingProgress || 0) + deltaTime * 0.2; // 5 seconds to sink
                if (ship.sinkingProgress >= 1) {
                    ship.state = "destroyed";
                }
            }

            // Create wakes if moving
            if (ship.isMoving && now - ship.lastWakeTime > this.config.wakeInterval) {
                this.createWakeEffect(ship);
                ship.lastWakeTime = now;
            }
        });
    }

    /**
     * Simple auto-attack logic for player ships
     */
    updatePlayerShipAutoAttacks(playerShips, enemyShips) {
        const now = Date.now();

        playerShips.forEach(ship => {
            if (ship.hp <= 0 || ship.state === "sinking") return;

            // Set default fire rate if missing
            if (!ship.fireRate) ship.fireRate = 2000;

            // Find target if none
            if (!ship.target || ship.target.hp <= 0) {
                let closest = null;
                let minDist = Infinity;

                enemyShips.forEach(enemy => {
                    if (enemy.hp <= 0 || enemy.state === "sinking") return;

                    const dist = Math.hypot(enemy.x - ship.x, enemy.y - ship.y);
                    if (dist < minDist && dist <= ship.range) {
                        minDist = dist;
                        closest = enemy;
                    }
                });

                ship.target = closest;
            }

            // Fire if ready
            if (ship.target && now - ship.lastFireTime > ship.fireRate) {
                // Check distance again
                const dist = Math.hypot(ship.target.x - ship.x, ship.target.y - ship.y);
                if (dist <= ship.range) {
                    const angle = Math.atan2(ship.target.y - ship.y, ship.target.x - ship.x);

                    this.fireProjectile(ship, {
                        x: ship.x,
                        y: ship.y,
                        angle: angle,
                        team: 0
                    });

                    ship.lastFireTime = now;
                } else {
                    ship.target = null; // Out of range, find new
                }
            }
        });
    }

    /**
     * Update all projectiles and handle collisions
     */
    updateProjectiles(playerShips, enemyShips, deltaTime) {
        this.projectiles = this.projectiles.filter(proj => {
            if (!proj.active) return false;

            // Move
            const moveDist = proj.speed * deltaTime;
            proj.x += Math.cos(proj.angle) * moveDist;
            proj.y += Math.sin(proj.angle) * moveDist;
            proj.distanceTraveled += moveDist;

            // Max range check
            if (proj.distanceTraveled >= proj.range) {
                this.createEffect({
                    type: "splash",
                    x: proj.x,
                    y: proj.y,
                    duration: 500,
                    scale: proj.scale
                });
                return false;
            }

            // Check collisions based on team
            const targets = proj.team === 0 ? enemyShips : playerShips;
            let hit = false;

            for (const target of targets) {
                if (target.hp <= 0 || target.state === "sinking") continue;

                // Simple box collision
                // Using half width/height for tighter hitboxes on ships
                const hitBoxW = target.width * 0.8;
                const hitBoxH = target.height * 0.8;

                if (Math.abs(proj.x - target.x) < hitBoxW / 2 &&
                    Math.abs(proj.y - target.y) < hitBoxH / 2) {

                    this.handleHit(target, proj);
                    hit = true;
                    break;
                }
            }

            // If enemy projectile, also check fort collision
            if (!hit && proj.team === 1 && this.game.campaign3 && this.game.campaign3.fort) {
                const fort = this.game.campaign3.fort;
                if (fort.hp > 0 &&
                    proj.x > fort.hitbox.x && proj.x < fort.hitbox.x + fort.hitbox.width &&
                    proj.y > fort.hitbox.y && proj.y < fort.hitbox.y + fort.hitbox.height) {

                    // Hit Fort
                    this.createEffect({
                        type: "explosion",
                        x: proj.x,
                        y: proj.y,
                        duration: 300,
                        scale: proj.scale * 1.5
                    });

                    if (this.game.campaign3.fortDefense) {
                        this.game.campaign3.fortDefense.takeDamage(proj.damage);
                    }
                    hit = true;
                }
            }

            return !hit;
        });
    }

    /**
     * Handle projectile hitting a ship
     */
    handleHit(ship, proj) {
        this.stats.projectilesHit++;

        // Armor calculation: Armor reduces flat damage
        const armorReduction = ship.armor || 0;
        let actualDamage = proj.damage - armorReduction;

        // Minimum damage of 1 so nothing is invincible
        if (actualDamage < 1) actualDamage = 1;

        ship.hp -= actualDamage;
        this.stats.totalDamage += actualDamage;

        // Effects
        const isTorpedo = proj.type === "torpedo";

        this.createEffect({
            type: "explosion",
            x: proj.x,
            y: proj.y,
            duration: isTorpedo ? 600 : 300,
            scale: isTorpedo ? 2.0 : proj.scale
        });

        this.createEffect({
            type: "damageText",
            x: proj.x,
            y: proj.y - 20,
            duration: 800,
            text: Math.round(actualDamage)
        });

        // Add a visual "damaged" flare temporarily
        ship.damagedTimer = 10; // frames

        // Play Sound
        if (this.game.soundManager) {
            this.game.soundManager.play(isTorpedo ? "explosion_huge" : "hit_metal");
        }
    }

    /**
     * Add visual effect
     */
    createEffect(config) {
        this.effects.push({
            type: config.type,
            x: config.x,
            y: config.y,
            angle: config.angle || 0,
            scale: config.scale || 1.0,
            duration: config.duration || 300,
            createdAt: Date.now(),
            text: config.text || "",

            // Physic properties for particles
            vx: config.vx || 0,
            vy: config.vy || 0
        });
    }

    /**
     * Helper to create wake behind ship
     */
    createWakeEffect(ship) {
        // Calculate position at back of ship
        const backOffset = ship.height / 2;
        const wakeX = ship.x - Math.cos(ship.angle) * backOffset;
        const wakeY = ship.y - Math.sin(ship.angle) * backOffset;

        this.createEffect({
            type: "wake",
            x: wakeX,
            y: wakeY,
            angle: ship.angle,
            scale: ship.width / 40, // Scale based on ship width
            duration: 1500 // Fade out over 1.5s
        });
    }

    /**
     * Update effects list
     */
    updateEffects(deltaTime) {
        const now = Date.now();

        this.effects = this.effects.filter(effect => {
            const age = now - effect.createdAt;

            if (age >= effect.duration) return false;

            // Movement logic
            if (effect.vx || effect.vy) {
                effect.x += effect.vx * deltaTime;
                effect.y += effect.vy * deltaTime;
            }
            if (effect.type === "damageText") {
                effect.y -= 20 * deltaTime; // Float up
            }

            return true;
        });
    }

    // ============================================
    // RENDERING
    // ============================================

    renderUnits(ships) {
        if (!ships) return;
        const ctx = this.game.ctx;

        ships.forEach(ship => {
            if (ship.state === "destroyed") return;

            ctx.save();
            ctx.translate(ship.x, ship.y);

            // Handle sinking animation
            if (ship.state === "sinking") {
                // Rotate and scale down to simulate sinking
                ctx.rotate(ship.angle + (ship.sinkingProgress * Math.PI / 4));
                ctx.scale(1 - (ship.sinkingProgress * 0.8), 1 - (ship.sinkingProgress * 0.8));
                ctx.globalAlpha = 1 - ship.sinkingProgress;
            } else {
                ctx.rotate(ship.angle);
            }

            // Draw Sprite
            let sprite = null;
            if (ship.spriteKey && this.sprites.ships[ship.spriteKey]) {
                sprite = this.sprites.ships[ship.spriteKey];
            } else if (ship.spriteKey === "soldier" && this.sprites.soldier) {
                sprite = this.sprites.soldier;
            }

            if (sprite) {
                // Draw image centered
                ctx.drawImage(sprite, -ship.width / 2, -ship.height / 2, ship.width, ship.height);
            } else {
                // Fallback basic shape
                this.renderFallbackShip(ctx, ship);
            }

            // Damage blink effect
            if (ship.damagedTimer && ship.damagedTimer > 0) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
                ctx.fillRect(-ship.width / 2, -ship.height / 2, ship.width, ship.height);
                ship.damagedTimer--;
            }

            ctx.restore();

            // Render Health Bar (above ship, not rotated)
            if (ship.state !== "sinking" && ship.hp < ship.maxHp) {
                this.renderHealthBar(ctx, ship);
            }
        });
    }

    renderFallbackShip(ctx, ship) {
        // Base color based on team
        ctx.fillStyle = ship.team === 0 ? "#4a7a8c" : "#8c4a4a"; // Blue-ish vs Red-ish

        // Hull
        ctx.beginPath();
        // Pointy front
        ctx.moveTo(0, ship.height / 2);
        ctx.lineTo(-ship.width / 2, Math.floor(ship.height * 0.2));
        ctx.lineTo(-ship.width / 2, -ship.height / 2);
        ctx.lineTo(ship.width / 2, -ship.height / 2);
        ctx.lineTo(ship.width / 2, Math.floor(ship.height * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Details based on type
        ctx.fillStyle = "#333";
        if (ship.type === "Inconstant") {
            // Big smoke stacks
            ctx.fillRect(-8, -10, 16, 16);
            ctx.fillRect(-8, 10, 16, 16);
        } else if (ship.type === "Comète") {
            ctx.fillRect(-6, 0, 12, 16);
        } else if (ship.type === "TorpedoBoat") {
            // Sleek looking
            ctx.fillRect(-4, -5, 8, 10);
            ctx.fillStyle = "#111"; // Torpedo tube
            ctx.fillRect(-2, Math.floor(ship.height * 0.3), 4, 15);
        } else if (ship.type === "CoastalDefender") {
            ctx.fillStyle = "#556B2F"; // Soldier green
            ctx.beginPath();
            ctx.arc(0, 0, ship.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderHealthBar(ctx, unit) {
        const barW = unit.width * 1.2;
        const barH = 5;
        const x = unit.x - barW / 2;
        const y = unit.y - unit.height / 2 - 15;

        ctx.fillStyle = "black";
        ctx.fillRect(x, y, barW, barH);

        const hpPercent = Math.max(0, unit.hp / unit.maxHp);
        ctx.fillStyle = hpPercent > 0.5 ? "#2ecc71" : hpPercent > 0.2 ? "#f1c40f" : "#e74c3c";
        ctx.fillRect(x + 1, y + 1, (barW - 2) * hpPercent, barH - 2);
    }

    renderProjectiles() {
        const ctx = this.game.ctx;

        this.projectiles.forEach(proj => {
            if (!proj.active) return;

            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(proj.angle);

            if (proj.type === "torpedo") {
                // Draw torpedo
                if (this.sprites.projectiles.torpedo) {
                    ctx.drawImage(this.sprites.projectiles.torpedo, -8, -3, 16, 6);
                } else {
                    ctx.fillStyle = "#444";
                    ctx.fillRect(-6, -2, 12, 4);
                    // Bubble trail
                    ctx.fillStyle = "rgba(255,255,255,0.6)";
                    ctx.beginPath();
                    ctx.arc(-8, 0, 2, 0, Math.PI * 2);
                    ctx.arc(-12, (Math.random() - 0.5) * 4, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Draw Cannonball
                const size = 3 * proj.scale;
                if (this.sprites.projectiles.cannonball) {
                    ctx.drawImage(this.sprites.projectiles.cannonball, -size, -size, size * 2, size * 2);
                } else {
                    ctx.fillStyle = "#222";
                    ctx.beginPath();
                    ctx.arc(0, 0, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
        });
    }

    renderEffects() {
        const ctx = this.game.ctx;
        const now = Date.now();

        this.effects.forEach(effect => {
            const progress = (now - effect.createdAt) / effect.duration;

            ctx.save();
            ctx.translate(effect.x, effect.y);

            switch (effect.type) {
                case "explosion":
                    // Draw sprite or fallback radial gradient
                    const sizeE = 30 * effect.scale * (progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7);

                    if (this.sprites.effects.explosion) {
                        ctx.globalAlpha = 1 - progress;
                        ctx.drawImage(this.sprites.effects.explosion, -sizeE, -sizeE, sizeE * 2, sizeE * 2);
                    } else {
                        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, sizeE);
                        grad.addColorStop(0, "white");
                        grad.addColorStop(0.2, "yellow");
                        grad.addColorStop(0.5, "red");
                        grad.addColorStop(1, "rgba(50,0,0,0)");
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(0, 0, sizeE, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;

                case "splash":
                    const sizeS = 20 * effect.scale * progress;
                    ctx.globalAlpha = 1 - progress;
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, sizeS, sizeS * 0.6, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    break;

                case "wake":
                    ctx.rotate(effect.angle);
                    ctx.globalAlpha = (1 - progress) * 0.5;
                    const sizeW = 10 * effect.scale * (1 + progress);

                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-sizeW * 2, -sizeW);
                    ctx.lineTo(-sizeW * 2, sizeW);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case "damageText":
                    ctx.globalAlpha = 1 - progress;
                    ctx.fillStyle = "red";
                    ctx.font = "bold 16px Arial";
                    ctx.textAlign = "center";
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 2;
                    ctx.strokeText(effect.text, 0, 0);
                    ctx.fillText(effect.text, 0, 0);
                    break;

                case "muzzleFlash":
                    ctx.rotate(effect.angle);
                    const sizeM = 20 * effect.scale * (1 - progress);
                    ctx.fillStyle = `rgba(255, 200, 50, ${1 - progress})`;
                    ctx.beginPath();
                    ctx.moveTo(0, -sizeM / 2);
                    ctx.lineTo(sizeM * 2, 0);
                    ctx.lineTo(0, sizeM / 2);
                    ctx.fill();
                    break;
            }

            ctx.restore();
        });
    }
}

// Export for use
export { NavalCombat };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavalCombat;
}
