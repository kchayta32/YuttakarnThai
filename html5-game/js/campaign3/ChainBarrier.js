/**
 * ChainBarrier Class
 * Handles river chain barrier system for Campaign 3
 * ระบบโซ่กั้นแม่น้ำเจ้าพระยา ชะลอเรือศัตรู
 */

class ChainBarrier {
    constructor(gameEngine) {
        this.game = gameEngine;

        // Barrier data
        this.barriers = [];
        this.chainSegments = [];

        // Barrier sprites
        this.sprites = {
            chain: null,
            chainLink: null,
            anchor: null,
            buoy: null
        };

        // Barrier configuration
        this.barrierConfig = {
            maxBarriers: 3,
            chainHealth: 1000,
            slowFactor: 0.3, // Reduce ship speed to 30%
            damageToShips: 5, // Damage per second when touching chain
            cost: 100, // Gold per barrier
            rebuildTime: 30000, // ms before can rebuild
            segmentWidth: 20,
            segmentHeight: 10
        };

        // Animation
        this.animationFrame = 0;
        this.chainSway = 0;
    }

    /**
     * Initialize chain barrier system
     * @param {Object} config - Configuration object
     */
    async init(config = {}) {
        console.log("⛓️ Initializing Chain Barrier System...");

        // Load sprites
        await this.loadSprites(config.sprites);

        console.log("✅ Chain Barrier System initialized");
    }

    /**
     * Load barrier sprites
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

        // Load barrier sprites
        this.sprites.chain = await loadSprite(spriteConfig.chain || "images/campain 3/buildings/chain_barrier.png");
        this.sprites.chainLink = await loadSprite(spriteConfig.chainLink || "images/campain 3/effects/chain_link.png");
        this.sprites.anchor = await loadSprite(spriteConfig.anchor);
        this.sprites.buoy = await loadSprite(spriteConfig.buoy);
    }

    /**
     * Create chain barrier across river
     * @param {Number} y - Y position across river
     * @param {Array} points - Array of points for chain segments
     */
    createBarrier(y, points = null) {
        // Check if max barriers reached
        const activeBarriers = this.barriers.filter(b => b.active).length;
        if (activeBarriers >= this.barrierConfig.maxBarriers) {
            console.warn("⚠️ Maximum chain barriers reached!");
            return null;
        }

        // Check if player has enough gold
        if (this.game.campaign3 && this.game.campaign3.resources.gold < this.barrierConfig.cost) {
            console.warn("⚠️ Not enough gold to build chain barrier!");
            return null;
        }

        // Deduct gold
        if (this.game.campaign3) {
            this.game.campaign3.resources.gold -= this.barrierConfig.cost;
            this.game.campaign3.updateResourceDisplay();
        }

        // Generate barrier points if not provided
        if (!points) {
            points = this.generateBarrierPoints(y);
        }

        const barrier = {
            id: `barrier_${Date.now()}_${Math.random()}`,
            y: y || this.game.canvas.height * 0.5,
            points: points,
            segments: [],
            hp: this.barrierConfig.chainHealth,
            maxHp: this.barrierConfig.chainHealth,
            active: true,
            damaged: false,
            broken: false,
            rebuildTime: 0,
            createdAt: Date.now(),
            shipsCaught: [],
            visualOffset: 0
        };

        // Create chain segments
        barrier.segments = this.createChainSegments(barrier.points);

        this.barriers.push(barrier);

        console.log(`⛓️ Created chain barrier at y=${barrier.y} with ${barrier.segments.length} segments`);
        return barrier;
    }

    /**
     * Generate barrier points across river
     */
    generateBarrierPoints(y) {
        const points = [];
        const riverCenter = this.game.canvas.width / 2;
        const riverWidth = this.game.canvas.width * 0.6; // 60% of canvas is river
        const halfRiver = riverWidth / 2;

        // Create points from left bank to right bank
        const numSegments = Math.floor(riverWidth / this.barrierConfig.segmentWidth);

        for (let i = 0; i <= numSegments; i++) {
            const x = riverCenter - halfRiver + (i * this.barrierConfig.segmentWidth);

            // Add some curve to the chain (sag in the middle)
            const sag = Math.sin((i / numSegments) * Math.PI) * 20;

            points.push({
                x: x,
                y: y + sag,
                originalY: y
            });
        }

        return points;
    }

    /**
     * Create chain segments between points
     */
    createChainSegments(points) {
        const segments = [];

        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];

            const segment = {
                id: `segment_${Date.now()}_${i}`,
                startX: start.x,
                startY: start.y,
                endX: end.x,
                endY: end.y,
                width: Math.hypot(end.x - start.x, end.y - start.y),
                angle: Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI,
                hp: this.barrierConfig.chainHealth / points.length,
                maxHp: this.barrierConfig.chainHealth / points.length,
                active: true,
                broken: false
            };

            segments.push(segment);
        }

        return segments;
    }

    /**
     * Update chain barrier system
     * @param {Array} barriers - Barriers array
     * @param {Number} deltaTime - Time since last update
     */
    update(barriers, deltaTime) {
        this.animationFrame += deltaTime * 60;
        this.chainSway = Math.sin(this.animationFrame * 0.05) * 3;

        // Update each barrier
        barriers.forEach(barrier => {
            if (!barrier.active) {
                // Check if can rebuild
                if (Date.now() - barrier.rebuildTime >= this.barrierConfig.rebuildTime) {
                    barrier.canRebuild = true;
                }
                return;
            }

            // Update segments
            this.updateBarrierSegments(barrier, deltaTime);

            // Check barrier health
            if (barrier.hp <= 0) {
                this.breakBarrier(barrier);
            }

            // Apply chain effects to ships
            this.applyChainEffects(barrier, deltaTime);

            // Update visual offset
            barrier.visualOffset = this.chainSway;
        });

        // Cleanup broken barriers
        this.cleanupBarriers();
    }

    /**
     * Update barrier segments
     */
    updateBarrierSegments(barrier, deltaTime) {
        let totalHp = 0;
        let activeSegments = 0;

        barrier.segments.forEach(segment => {
            if (!segment.broken) {
                totalHp += segment.hp;
                activeSegments++;
            }
        });

        barrier.hp = totalHp;

        // Check if barrier is damaged
        barrier.damaged = barrier.hp < barrier.maxHp * 0.5;
    }

    /**
     * Apply chain effects to ships (slow down, damage)
     */
    applyChainEffects(barrier, deltaTime) {
        if (!barrier.active || barrier.broken) return;

        const enemyShips = this.game.campaign3 ? this.game.campaign3.frenchShips : [];

        enemyShips.forEach(ship => {
            if (ship.hp <= 0) return;

            // Check if ship is touching barrier
            const shipCenterY = ship.y + ship.height / 2;
            const barrierY = barrier.y;
            const tolerance = 30; // Pixels tolerance

            if (Math.abs(shipCenterY - barrierY) < tolerance) {
                // Check if ship is within river width
                const shipCenterX = ship.x + ship.width / 2;
                const riverCenter = this.game.canvas.width / 2;
                const riverWidth = this.game.canvas.width * 0.6;

                if (Math.abs(shipCenterX - riverCenter) < riverWidth / 2) {
                    // Ship is touching chain - apply slow effect
                    if (!ship.caughtByBarrier || ship.caughtByBarrier !== barrier.id) {
                        ship.caughtByBarrier = barrier.id;
                        ship.originalSpeed = ship.speed;
                        ship.speed *= this.barrierConfig.slowFactor;
                        console.log(`⛓️ Ship ${ship.type} caught by chain barrier!`);
                    }

                    // Apply damage over time
                    ship.hp -= this.barrierConfig.damageToShips * deltaTime;

                    // Create chain contact effect
                    if (Math.random() < 0.1) {
                        this.createChainSpark(shipCenterX, barrierY);
                    }
                }
            } else {
                // Ship passed the barrier
                if (ship.caughtByBarrier === barrier.id) {
                    ship.caughtByBarrier = null;
                    if (ship.originalSpeed) {
                        ship.speed = ship.originalSpeed;
                        ship.originalSpeed = null;
                    }
                }
            }
        });
    }

    /**
     * Create chain spark effect
     */
    createChainSpark(x, y) {
        if (this.game.campaign3 && this.game.campaign3.navalCombat) {
            this.game.campaign3.navalCombat.createEffect({
                type: "spark",
                x: x,
                y: y,
                duration: 300,
                scale: 0.5
            });
        }
    }

    /**
     * Break barrier (when HP reaches 0)
     */
    breakBarrier(barrier) {
        console.log(`💔 Chain barrier broken at y=${barrier.y}!`);

        barrier.active = false;
        barrier.broken = true;
        barrier.rebuildTime = Date.now();
        barrier.canRebuild = false;

        // Break all segments
        barrier.segments.forEach(segment => {
            segment.broken = true;
            segment.active = false;
        });

        // Release caught ships
        const enemyShips = this.game.campaign3 ? this.game.campaign3.frenchShips : [];
        enemyShips.forEach(ship => {
            if (ship.caughtByBarrier === barrier.id) {
                ship.caughtByBarrier = null;
                if (ship.originalSpeed) {
                    ship.speed = ship.originalSpeed;
                    ship.originalSpeed = null;
                }
            }
        });

        // Create break effect
        if (this.game.campaign3 && this.game.campaign3.navalCombat) {
            this.game.campaign3.navalCombat.createEffect({
                type: "explosion",
                spriteKey: "explosion",
                x: this.game.canvas.width / 2,
                y: barrier.y,
                duration: 1000,
                scale: 1.5
            });
        }
    }

    /**
     * Damage barrier (from ship collision or attacks)
     */
    damageBarrier(barrier, damage, position = null) {
        if (!barrier.active || barrier.broken) return;

        barrier.hp -= damage;

        // Damage specific segment if position provided
        if (position) {
            barrier.segments.forEach(segment => {
                if (!segment.broken) {
                    const dist = this.pointToSegmentDistance(
                        position.x,
                        position.y,
                        segment.startX,
                        segment.startY,
                        segment.endX,
                        segment.endY
                    );

                    if (dist < 30) {
                        segment.hp -= damage;
                        if (segment.hp <= 0) {
                            segment.broken = true;
                            segment.active = false;
                        }
                    }
                }
            });
        }

        console.log(`⛓️ Barrier took ${damage} damage. HP: ${barrier.hp}/${barrier.maxHp}`);
    }

    /**
     * Calculate distance from point to line segment
     */
    pointToSegmentDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;

        return Math.hypot(dx, dy);
    }

    /**
     * Repair barrier
     */
    repairBarrier(barrier, amount) {
        if (!barrier || barrier.broken) return false;

        const cost = amount * 2; // 2 gold per HP

        if (this.game.campaign3 && this.game.campaign3.resources.gold >= cost) {
            this.game.campaign3.resources.gold -= cost;
            barrier.hp = Math.min(barrier.maxHp, barrier.hp + amount);

            // Repair segments proportionally
            barrier.segments.forEach(segment => {
                if (!segment.broken) {
                    segment.hp = Math.min(segment.maxHp, segment.hp + amount / barrier.segments.length);
                }
            });

            this.game.campaign3.updateResourceDisplay();
            console.log(`🔧 Barrier repaired ${amount} HP. Cost: ${cost} gold`);
            return true;
        }

        return false;
    }

    /**
     * Rebuild broken barrier
     */
    rebuildBarrier(barrier) {
        if (!barrier || !barrier.canRebuild) return false;

        if (this.game.campaign3 && this.game.campaign3.resources.gold >= this.barrierConfig.cost) {
            this.game.campaign3.resources.gold -= this.barrierConfig.cost;

            barrier.active = true;
            barrier.broken = false;
            barrier.hp = barrier.maxHp;
            barrier.createdAt = Date.now();
            barrier.rebuildTime = 0;
            barrier.canRebuild = false;

            // Rebuild segments
            barrier.segments.forEach(segment => {
                segment.active = true;
                segment.broken = false;
                segment.hp = segment.maxHp;
            });

            this.game.campaign3.updateResourceDisplay();
            console.log(`🔨 Chain barrier rebuilt at y=${barrier.y}!`);
            return true;
        }

        return false;
    }

    /**
     * Cleanup broken barriers
     */
    cleanupBarriers() {
        // Remove barriers that are broken and past rebuild time
        const now = Date.now();
        this.barriers = this.barriers.filter(barrier => {
            if (barrier.broken && now - barrier.rebuildTime > this.barrierConfig.rebuildTime * 2) {
                return false; // Remove old broken barriers
            }
            return true;
        });
    }

    /**
     * Check if ship collides with any barrier
     */
    checkShipCollision(ship) {
        for (const barrier of this.barriers) {
            if (!barrier.active || barrier.broken) continue;

            const shipCenterY = ship.y + ship.height / 2;
            const tolerance = 30;

            if (Math.abs(shipCenterY - barrier.y) < tolerance) {
                return {
                    collision: true,
                    barrier: barrier,
                    slowFactor: this.barrierConfig.slowFactor
                };
            }
        }

        return { collision: false };
    }

    /**
     * Get available positions
     */
    getAvailablePositions() {
        const positions = [];
        const riverHeight = this.game.canvas.height * 0.6;
        const riverStart = this.game.canvas.height * 0.2;

        // Create 3 possible barrier lines
        for (let i = 1; i <= 3; i++) {
            const y = riverStart + (riverHeight / 4) * i;
            const existing = this.barriers.find(b => Math.abs(b.y - y) < 50 && b.active);

            if (!existing) {
                positions.push({
                    y: y,
                    available: true,
                    cost: this.barrierConfig.cost
                });
            } else {
                positions.push({
                    y: y,
                    available: false,
                    barrier: existing
                });
            }
        }

        return positions;
    }

    /**
     * Render chain barrier system
     */
    render() {
        const ctx = this.game.ctx;

        // Render each barrier
        this.barriers.forEach(barrier => {
            if (barrier.active) {
                this.renderBarrier(barrier);
            } else if (barrier.broken) {
                this.renderBrokenBarrier(barrier);
            }
        });
    }

    /**
     * Render active barrier
     */
    renderBarrier(barrier) {
        const ctx = this.game.ctx;

        // Render chain segments
        barrier.segments.forEach(segment => {
            if (!segment.active || segment.broken) return;

            ctx.save();

            // Calculate segment center
            const centerX = (segment.startX + segment.endX) / 2;
            const centerY = (segment.startY + segment.endY) / 2 + barrier.visualOffset;

            ctx.translate(centerX, centerY);
            ctx.rotate(segment.angle * Math.PI / 180);

            // Draw chain sprite or placeholder
            if (this.sprites.chain) {
                ctx.drawImage(
                    this.sprites.chain,
                    -segment.width / 2,
                    -this.barrierConfig.segmentHeight / 2,
                    segment.width,
                    this.barrierConfig.segmentHeight
                );
            } else {
                // Placeholder chain
                const gradient = ctx.createLinearGradient(
                    -segment.width / 2, 0,
                    segment.width / 2, 0
                );
                gradient.addColorStop(0, "#4a4a4a");
                gradient.addColorStop(0.5, "#8a8a8a");
                gradient.addColorStop(1, "#4a4a4a");

                ctx.fillStyle = gradient;
                ctx.fillRect(-segment.width / 2, -5, segment.width, 10);

                // Draw chain links
                ctx.strokeStyle = "#2a2a2a";
                ctx.lineWidth = 2;
                for (let i = 0; i < segment.width; i += 15) {
                    ctx.beginPath();
                    ctx.arc(-segment.width / 2 + i, 0, 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // Draw damage indicator
            if (segment.hp < segment.maxHp * 0.5) {
                ctx.strokeStyle = "#F44336";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-segment.width / 2, -8);
                ctx.lineTo(segment.width / 2, -8);
                ctx.stroke();
            }

            ctx.restore();
        });

        // Render barrier anchors (ends)
        this.renderBarrierAnchors(barrier);

        // Render barrier health bar
        this.renderBarrierHealthBar(barrier);
    }

    /**
     * Render barrier anchors
     */
    renderBarrierAnchors(barrier) {
        const ctx = this.game.ctx;
        const riverCenter = this.game.canvas.width / 2;
        const riverWidth = this.game.canvas.width * 0.6;

        // Left anchor
        ctx.save();
        ctx.fillStyle = "#654321";
        ctx.fillRect(riverCenter - riverWidth / 2 - 10, barrier.y - 20, 20, 40);

        // Right anchor
        ctx.fillRect(riverCenter + riverWidth / 2 - 10, barrier.y - 20, 20, 40);
        ctx.restore();

        // Draw buoys
        if (this.sprites.buoy) {
            ctx.drawImage(this.sprites.buoy, riverCenter - riverWidth / 2, barrier.y - 10, 20, 20);
            ctx.drawImage(this.sprites.buoy, riverCenter + riverWidth / 2 - 20, barrier.y - 10, 20, 20);
        } else {
            ctx.fillStyle = "#FF6600";
            ctx.beginPath();
            ctx.arc(riverCenter - riverWidth / 2, barrier.y, 10, 0, Math.PI * 2);
            ctx.arc(riverCenter + riverWidth / 2, barrier.y, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Render barrier health bar
     */
    renderBarrierHealthBar(barrier) {
        const ctx = this.game.ctx;
        const barWidth = 150;
        const barHeight = 8;
        const x = this.game.canvas.width / 2 - barWidth / 2;
        const y = barrier.y - 25;

        // Background
        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthPercent = Math.max(0, barrier.hp / barrier.maxHp);
        ctx.fillStyle = healthPercent > 0.5 ? "#4CAF50" : healthPercent > 0.25 ? "#FFC107" : "#F44336";
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Text
        ctx.fillStyle = "#FFF";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.ceil(barrier.hp)}/${barrier.maxHp}`, x + barWidth / 2, y + barHeight / 2 + 3);
    }

    /**
     * Render broken barrier
     */
    renderBrokenBarrier(barrier) {
        const ctx = this.game.ctx;

        ctx.save();
        ctx.globalAlpha = 0.5;

        // Draw broken chain segments (sagging)
        barrier.segments.forEach(segment => {
            if (!segment.broken) return;

            const centerX = (segment.startX + segment.endX) / 2;
            const centerY = (segment.startY + segment.endY) / 2 + 30; // Sag down

            ctx.fillStyle = "#4a4a4a";
            ctx.fillRect(centerX - 10, centerY - 3, 20, 6);
        });

        // Draw "Broken" text
        ctx.fillStyle = "#F44336";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("โซ่ขาด!", this.game.canvas.width / 2, barrier.y);

        ctx.restore();

        // Draw rebuild timer
        if (barrier.canRebuild) {
            ctx.fillStyle = "#4CAF50";
            ctx.font = "bold 14px Arial";
            ctx.fillText("คลิกเพื่อสร้างใหม่", this.game.canvas.width / 2, barrier.y + 20);
        } else {
            const remaining = Math.max(0, this.barrierConfig.rebuildTime - (Date.now() - barrier.rebuildTime));
            const seconds = Math.ceil(remaining / 1000);

            ctx.fillStyle = "#FFC107";
            ctx.font = "bold 14px Arial";
            ctx.fillText(`รอสร้างใหม่: ${seconds}วินาที`, this.game.canvas.width / 2, barrier.y + 20);
        }
    }

    /**
     * Get barrier status
     */
    getBarrierStatus() {
        return {
            totalBarriers: this.barriers.length,
            activeBarriers: this.barriers.filter(b => b.active && !b.broken).length,
            brokenBarriers: this.barriers.filter(b => b.broken).length,
            canBuildMore: this.barriers.filter(b => b.active).length < this.barrierConfig.maxBarriers
        };
    }

    /**
     * Clear barrier data
     */
    clear() {
        this.barriers = [];
        this.chainSegments = [];
    }
}

// Export for use
export { ChainBarrier };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChainBarrier;
}
