// ===================================
// RTS: ยุทธการไทย - Unit Entity v2
// With A* Pathfinding support
// ===================================

import { UNIT_TYPES } from '../data/units.js';
import { spriteManager } from '../engine/SpriteManager.js';
import { Projectile } from './Projectile.js';

export class Unit {
    constructor(game, typeId, x, y, team = 0) {
        this.game = game;
        this.id = Math.random().toString(36).substr(2, 9);

        // Get type data
        const typeKey = this.getTypeKey(typeId);
        const typeData = UNIT_TYPES[typeKey];
        if (!typeData) {
            console.error(`Unknown unit type: ${typeId}`);
            return;
        }

        // Copy type properties
        Object.assign(this, typeData);
        this.typeId = typeId;

        // Position
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;

        // Team (0 = player, 1 = enemy)
        this.team = team;
        this.isEnemy = team !== 0;

        // State
        this.state = 'idle'; // idle, moving, attacking, dead
        this.selected = false;
        this.target = null;
        this.attackCooldown = 0;
        this.holdingPosition = false;

        // Pathfinding
        this.path = [];
        this.pathIndex = 0;

        // Visual & Collision Size (Adjusted to ~2.25x original)
        this.size = this.typeId.includes('elephant') ? 100 : 63;
        this.angle = this.team === 0 ? Math.PI : 0; // Player faces left, Enemy faces right

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
    }

    getTypeKey(typeId) {
        // Convert typeId to UNIT_TYPES key
        const mapping = {
            'swordsman': 'SWORDSMAN',
            'spearman': 'SPEARMAN',
            'archer': 'ARCHER',
            'elephant': 'WAR_ELEPHANT',
            'cavalry': 'CAVALRY',
            'enemy_swordsman': 'ENEMY_SWORDSMAN',
            'enemy_spearman': 'ENEMY_SPEARMAN',
            'enemy_archer': 'ENEMY_ARCHER',
            'enemy_elephant': 'ENEMY_ELEPHANT',
            'enemy_cavalry': 'ENEMY_CAVALRY'
        };
        return mapping[typeId] || typeId.toUpperCase();
    }

    update(deltaTime) {
        if (this.state === 'dead') return;

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }

        // Animation
        this.animTimer += deltaTime;
        if (this.animTimer >= 0.2) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Unit separation
        this.separateFromOthers(deltaTime);

        // State machine
        switch (this.state) {
            case 'idle':
                if (!this.holdingPosition) {
                    this.findNearbyEnemy();
                }
                break;
            case 'moving':
                this.followPath(deltaTime);
                break;
            case 'attacking':
                this.performAttack(deltaTime);
                break;
        }
    }

    findNearbyEnemy() {
        const enemies = this.game.units.filter(u =>
            u.team !== this.team && u.state !== 'dead'
        );

        let nearestEnemy = null;
        let nearestDist = this.range * 50 + 150; // Detection range

        for (const enemy of enemies) {
            const dist = this.distanceTo(enemy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy) {
            this.target = nearestEnemy;
            this.state = 'attacking';
        }
    }

    /**
     * Set path from A* pathfinding
     */
    setPath(path) {
        if (!path || path.length === 0) {
            this.stop();
            return;
        }

        this.path = path;
        this.pathIndex = 0;
        this.target = null;
        this.state = 'moving';

        // Set first waypoint as target
        const first = this.path[0];
        this.targetX = first.x;
        this.targetY = first.y;
    }

    /**
     * Follow the path waypoints
     */
    followPath(deltaTime) {
        if (this.path.length === 0) {
            if (this.game.pathfinder) {
                this.stop();
            } else {
                this.moveToTarget(deltaTime);
            }
            return;
        }

        const waypoint = this.path[this.pathIndex];
        if (!waypoint) {
            this.stop();
            return;
        }

        const dx = waypoint.x - this.x;
        const dy = waypoint.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Reached waypoint?
        if (dist < 15) {
            this.pathIndex++;

            // More waypoints?
            if (this.pathIndex >= this.path.length) {
                this.stop();
            } else {
                const next = this.path[this.pathIndex];
                this.targetX = next.x;
                this.targetY = next.y;
            }
            return;
        }

        // Move towards waypoint
        this.angle = Math.atan2(dy, dx);
        const moveSpeed = this.speed * 50 * deltaTime;
        const ratio = Math.min(1, moveSpeed / dist);

        const nextX = this.x + dx * ratio;
        const nextY = this.y + dy * ratio;

        if (this.game.pathfinder) {
            const gs = this.game.pathfinder.gridSize;
            const currentGX = Math.floor(this.x / gs);
            const currentGY = Math.floor(this.y / gs);
            const isCurrentlyBlocked = !this.game.pathfinder.isWalkable(currentGX, currentGY);

            const canMoveX = this.game.pathfinder.isWalkable(Math.floor(nextX / gs), Math.floor(this.y / gs));
            const canMoveY = this.game.pathfinder.isWalkable(Math.floor(this.x / gs), Math.floor(nextY / gs));

            if (canMoveX || isCurrentlyBlocked) this.x = nextX;
            if (canMoveY || isCurrentlyBlocked) this.y = nextY;
        } else {
            this.x = nextX;
            this.y = nextY;
        }
    }

    moveToTarget(deltaTime) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            this.stop();
            return;
        }

        // Update angle for visual rotation
        this.angle = Math.atan2(dy, dx);

        // Move towards target
        const moveSpeed = this.speed * 50 * deltaTime;
        const ratio = Math.min(1, moveSpeed / dist);

        const nextX = this.x + dx * ratio;
        const nextY = this.y + dy * ratio;

        if (this.game.pathfinder) {
            const gs = this.game.pathfinder.gridSize;
            const currentGX = Math.floor(this.x / gs);
            const currentGY = Math.floor(this.y / gs);
            const isCurrentlyBlocked = !this.game.pathfinder.isWalkable(currentGX, currentGY);

            const canMoveX = this.game.pathfinder.isWalkable(Math.floor(nextX / gs), Math.floor(this.y / gs));
            const canMoveY = this.game.pathfinder.isWalkable(Math.floor(this.x / gs), Math.floor(nextY / gs));

            if (canMoveX || isCurrentlyBlocked) this.x = nextX;
            if (canMoveY || isCurrentlyBlocked) this.y = nextY;
        } else {
            this.x = nextX;
            this.y = nextY;
        }
    }

    performAttack(deltaTime) {
        if (!this.target || this.target.state === 'dead') {
            this.target = null;
            this.state = 'idle';
            return;
        }

        const dist = this.distanceTo(this.target);
        const attackRange = this.range * 50;

        // Check if in range
        if (dist > attackRange) {
            // Move towards target
            if (this.game.pathfinder && !this.holdingPosition) {
                // Prevent pathfinding spam if target is unreachable
                if ((this.pathCooldown || 0) > 0) {
                    this.pathCooldown -= deltaTime;
                    return;
                }

                const path = this.game.pathfinder.findPath(
                    this.x, this.y,
                    this.target.x, this.target.y
                );

                if (!path || path.length === 0) {
                    this.stop();
                    this.pathCooldown = 1.0; // Cooldown for 1 second before retrying
                    return;
                }

                // For ranged units, only move if significantly out of range
                // and stop at personal range distance
                if (this.range > 1.5) {
                    if (dist > attackRange + 10) {
                        this.setPath(path);
                    } else {
                        this.state = 'idle'; // Wait at edge of range
                    }
                } else {
                    this.setPath(path);
                }
            } else if (!this.holdingPosition) {
                this.targetX = this.target.x;
                this.targetY = this.target.y;
                this.state = 'moving';
            }
            return;
        }

        // Face target
        this.angle = Math.atan2(
            this.target.y - this.y,
            this.target.x - this.x
        );

        // Attack if cooldown ready
        if (this.attackCooldown <= 0) {
            if (this.range > 1.5) {
                this.fireProjectile(this.target);
            } else {
                this.dealDamage(this.target);
            }
            this.attackCooldown = this.attackSpeed;
        }
    }

    fireProjectile(target) {
        // Calculate damage before firing
        let damage = this.calculateDamage(target);

        // Create projectile
        const projectile = new Projectile(
            this.game,
            'arrow',
            this.x, this.y,
            target,
            damage,
            this
        );

        this.game.projectiles.push(projectile);

        // Visual feedback (flash/bob)
        if (this.game.unitRenderer) {
            this.game.unitRenderer.triggerAttackAnim(this);
        }
    }

    calculateDamage(target) {
        // Calculate damage
        let damage = this.attack;

        // Apply bonus damage
        if (this.bonusVs && target.typeId) {
            for (const bonus of this.bonusVs) {
                if (target.typeId.includes(bonus)) {
                    damage *= 1.5;
                    break;
                }
            }
        }

        // Apply armor reduction
        const reduction = target.defense / (target.defense + 10);
        damage = damage * (1 - reduction);

        return damage;
    }

    dealDamage(target) {
        const damage = this.calculateDamage(target);

        // Deal damage
        target.takeDamage(damage, this);

        // Visual feedback
        this.game.createDamageNumber(target.x, target.y, Math.round(damage));

        if (this.game.unitRenderer) {
            this.game.unitRenderer.triggerAttackAnim(this);
        }
    }

    takeDamage(amount, attacker) {
        this.hp -= amount;

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        } else {
            // Aggro - attack back if idle
            if (this.state === 'idle' && !this.target && !this.holdingPosition) {
                this.target = attacker;
                this.state = 'attacking';
            }
        }
    }

    die() {
        this.state = 'dead';
        this.selected = false;

        // Remove after animation
        setTimeout(() => {
            this.game.removeUnit(this);
        }, 500);

        // Update kill count
        if (this.isEnemy) {
            this.game.stats.enemyKills++;
        }
    }

    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.target = null;
        this.path = [];
        this.state = 'moving';
        this.holdingPosition = false;
    }

    separateFromOthers(deltaTime) {
        let pushX = 0;
        let pushY = 0;
        let count = 0;

        for (const other of this.game.units) {
            if (other === this || other.state === 'dead') continue;

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distSq = dx * dx + dy * dy;
            const minDist = (this.size + other.size) * 0.4;

            if (distSq > 0 && distSq < minDist * minDist) {
                const dist = Math.sqrt(distSq);
                const pushStrength = (minDist - dist) / minDist;
                pushX += (dx / dist) * pushStrength;
                pushY += (dy / dist) * pushStrength;
                count++;
            }
        }

        if (count > 0) {
            const pushFactor = 80 * deltaTime;
            const nextX = this.x + (pushX / count) * pushFactor;
            const nextY = this.y + (pushY / count) * pushFactor;

            if (this.game.pathfinder) {
                const gs = this.game.pathfinder.gridSize;
                const currentGX = Math.floor(this.x / gs);
                const currentGY = Math.floor(this.y / gs);
                const isCurrentlyBlocked = !this.game.pathfinder.isWalkable(currentGX, currentGY);

                let canMoveX = this.game.pathfinder.isWalkable(Math.floor(nextX / gs), Math.floor(this.y / gs));
                let canMoveY = this.game.pathfinder.isWalkable(Math.floor(this.x / gs), Math.floor(nextY / gs));

                if (canMoveX || isCurrentlyBlocked) this.x = nextX;
                if (canMoveY || isCurrentlyBlocked) this.y = nextY;
            } else {
                this.x = nextX;
                this.y = nextY;
            }
        }
    }

    attackTarget(target) {
        if (target && target.team !== this.team) {
            this.target = target;
            this.state = 'attacking';
            this.holdingPosition = false;
        }
    }

    stop() {
        this.state = 'idle';
        this.target = null;
        this.path = [];
        this.targetX = this.x;
        this.targetY = this.y;
    }

    holdPosition() {
        this.stop();
        this.holdingPosition = true;
    }

    distanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    containsPoint(px, py) {
        const halfSize = this.size / 2;
        return px >= this.x - halfSize &&
            px <= this.x + halfSize &&
            py >= this.y - halfSize &&
            py <= this.y + halfSize;
    }

    render(ctx, camera) {
        if (this.state === 'dead') return;

        const zoom = camera.zoom || 1;
        const screenX = (this.x - camera.x) * zoom;
        const screenY = (this.y - camera.y) * zoom;

        // Check if on screen
        if (screenX < -50 || screenX > camera.width + 50 ||
            screenY < -50 || screenY > camera.height + 50) {
            return;
        }

        const halfSize = (this.size / 2) * zoom;

        // Ground circle / shadow
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + halfSize * 0.5, halfSize * 0.9, halfSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Selection ring
        if (this.selected) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, halfSize + 6 * zoom, 0, Math.PI * 2);
            ctx.strokeStyle = '#f4d03f';
            ctx.lineWidth = 3 * zoom;
            ctx.stroke();

            // Selection glow
            ctx.beginPath();
            ctx.arc(screenX, screenY, halfSize + 10 * zoom, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(244, 208, 63, 0.3)';
            ctx.lineWidth = 4 * zoom;
            ctx.stroke();
        }

        // Draw Sprite using SpriteManager
        const spriteKey = spriteManager.getUnitSpriteKey(this);
        const sprite = spriteManager.get(spriteKey);

        if (sprite) {
            // Draw sprite image
            // Sprites are usually a bit larger than collision box to look good
            const drawWidth = this.size * 1.5 * zoom;
            const drawHeight = this.size * 1.5 * zoom;

            ctx.save();
            ctx.translate(screenX, screenY);

            // Flip if facing left (angle is PI)
            if (this.angle > Math.PI / 2 || this.angle < -Math.PI / 2) {
                ctx.scale(-1, 1);
            }

            ctx.drawImage(
                sprite,
                -drawWidth / 2,
                -drawHeight * 0.8, // Shift up slightly
                drawWidth,
                drawHeight
            );
            ctx.restore();

        } else {
            // Fallback: Unit body (circle with team color)
            const gradient = ctx.createRadialGradient(
                screenX - halfSize * 0.3, screenY - halfSize * 0.3, 0,
                screenX, screenY, halfSize
            );

            if (this.isEnemy) {
                gradient.addColorStop(0, '#e74c3c');
                gradient.addColorStop(1, '#7f1d1d');
            } else {
                gradient.addColorStop(0, this.color || '#333');
                gradient.addColorStop(1, '#1a4d2e');
            }

            ctx.beginPath();
            ctx.arc(screenX, screenY, halfSize, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = this.isEnemy ? '#991b1b' : '#166534';
            ctx.lineWidth = 2 * zoom;
            ctx.stroke();

            // Direction indicator
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(
                screenX + Math.cos(this.angle) * halfSize * 0.8,
                screenY + Math.sin(this.angle) * halfSize * 0.8
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 3 * zoom;
            ctx.stroke();

            // Icon
            ctx.font = `${this.size * 0.65 * zoom}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.icon, screenX, screenY);
        }

        // Health bar
        if (this.hp < this.maxHp) {
            const barWidth = (this.size + 12) * zoom;
            const barHeight = 5 * zoom;
            const barY = screenY - halfSize - 12 * zoom;

            // Background
            ctx.fillStyle = '#222';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

            // Health
            const healthPercent = this.hp / this.maxHp;
            let healthColor;
            if (healthPercent > 0.6) healthColor = '#27ae60';
            else if (healthPercent > 0.3) healthColor = '#f39c12';
            else healthColor = '#c0392b';

            ctx.fillStyle = healthColor;
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight);

            // Border
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX - barWidth / 2, barY, barWidth, barHeight);
        }

        // State indicator (attack line)
        if (this.state === 'attacking' && this.target && this.target.state !== 'dead') {
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(
                (this.target.x - camera.x) * zoom,
                (this.target.y - camera.y) * zoom
            );
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
            ctx.lineWidth = 2 * zoom;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Debug: show path
        if (this.game.settings?.debugMode && this.path.length > 0) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);

            for (let i = this.pathIndex; i < this.path.length; i++) {
                const wp = this.path[i];
                ctx.lineTo((wp.x - camera.x) * zoom, (wp.y - camera.y) * zoom);
            }
            ctx.stroke();
        }
    }
}
