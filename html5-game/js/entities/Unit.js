// ===================================
// RTS: ยุทธการไทย - Unit Entity v2
// With A* Pathfinding support
// ===================================

import { UNIT_TYPES } from '../data/units.js';

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
        this.angle = 0;

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
            'enemy_elephant': 'ENEMY_ELEPHANT'
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
        if (!path || path.length === 0) return;

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
            this.moveToTarget(deltaTime);
            return;
        }

        const waypoint = this.path[this.pathIndex];
        if (!waypoint) {
            this.state = 'idle';
            this.path = [];
            return;
        }

        const dx = waypoint.x - this.x;
        const dy = waypoint.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Reached waypoint?
        if (dist < 15) {
            this.pathIndex++;

            // More waypoints?
            if (this.pathIndex < this.path.length) {
                const next = this.path[this.pathIndex];
                this.targetX = next.x;
                this.targetY = next.y;
            } else {
                // Path complete
                this.state = 'idle';
                this.path = [];
            }
            return;
        }

        // Move towards waypoint
        this.angle = Math.atan2(dy, dx);
        const moveSpeed = this.speed * 50 * deltaTime;
        const ratio = Math.min(1, moveSpeed / dist);

        this.x += dx * ratio;
        this.y += dy * ratio;
    }

    moveToTarget(deltaTime) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            this.state = 'idle';
            return;
        }

        // Update angle for visual rotation
        this.angle = Math.atan2(dy, dx);

        // Move towards target
        const moveSpeed = this.speed * 50 * deltaTime;
        const ratio = Math.min(1, moveSpeed / dist);

        this.x += dx * ratio;
        this.y += dy * ratio;
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
                const path = this.game.pathfinder.findPath(
                    this.x, this.y,
                    this.target.x, this.target.y
                );
                this.setPath(path);
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
            this.dealDamage(this.target);
            this.attackCooldown = this.attackSpeed;
        }
    }

    dealDamage(target) {
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

        // Deal damage
        target.takeDamage(damage, this);

        // Visual feedback
        this.game.createDamageNumber(target.x, target.y, Math.round(damage));
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

        // Unit body (circle with team color)
        const gradient = ctx.createRadialGradient(
            screenX - halfSize * 0.3, screenY - halfSize * 0.3, 0,
            screenX, screenY, halfSize
        );

        if (this.isEnemy) {
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#7f1d1d');
        } else {
            gradient.addColorStop(0, this.color);
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
