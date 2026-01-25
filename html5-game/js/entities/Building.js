// ===================================
// RTS: ยุทธการไทย - Building Entity
// Structures and resource buildings
// ===================================

import { BUILDING_TYPES } from '../data/units.js';

export class Building {
    constructor(game, typeId, x, y, team = 0) {
        this.game = game;
        this.id = Math.random().toString(36).substr(2, 9);

        // Get type data
        const typeKey = typeId.toUpperCase();
        const typeData = BUILDING_TYPES[typeKey];
        if (!typeData) {
            console.error(`Unknown building type: ${typeId}`);
            return;
        }

        // Copy type properties
        Object.assign(this, typeData);
        this.typeId = typeId;

        // Position
        this.x = x;
        this.y = y;

        // Team
        this.team = team;
        this.isEnemy = team !== 0;

        // State
        this.hp = this.hp || 1000;
        this.maxHp = this.hp;
        this.selected = false;
        this.size = 80;

        // Production
        this.productionQueue = [];
        this.productionProgress = 0;

        // Resource generation
        this.resourceTimer = 0;
    }

    update(deltaTime) {
        // Resource buildings generate resources
        if (this.produces && this.team === 0) {
            this.resourceTimer += deltaTime;
            if (this.resourceTimer >= 1) {
                this.resourceTimer = 0;
                this.game.resources[this.produces] += this.rate || 5;
            }
        }

        // Process production queue
        if (this.productionQueue.length > 0) {
            this.productionProgress += deltaTime;
            const currentItem = this.productionQueue[0];

            if (this.productionProgress >= currentItem.buildTime) {
                this.completeProduction();
            }
        }
    }

    queueUnit(unitType) {
        // Check if building can produce this unit
        if (!this.builds || !this.builds.includes(unitType)) {
            return false;
        }

        this.productionQueue.push({
            type: unitType,
            buildTime: 5 // Default build time
        });

        return true;
    }

    completeProduction() {
        const item = this.productionQueue.shift();
        this.productionProgress = 0;

        // Spawn unit near building
        const angle = Math.random() * Math.PI * 2;
        const spawnX = this.x + Math.cos(angle) * (this.size + 30);
        const spawnY = this.y + Math.sin(angle) * (this.size + 30);

        this.game.spawnUnit(item.type, spawnX, spawnY, this.team);
    }

    takeDamage(amount, attacker) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.destroy();
        }
    }

    destroy() {
        this.game.removeBuilding(this);
    }

    containsPoint(px, py) {
        const halfSize = this.size / 2;
        return px >= this.x - halfSize &&
            px <= this.x + halfSize &&
            py >= this.y - halfSize &&
            py <= this.y + halfSize;
    }

    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Check if on screen
        if (screenX < -this.size || screenX > camera.width + this.size ||
            screenY < -this.size || screenY > camera.height + this.size) {
            return;
        }

        const halfSize = this.size / 2;

        // Selection ring
        if (this.selected) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, halfSize + 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#f4d03f';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Building base (square with team color)
        ctx.fillStyle = this.isEnemy ? '#7f1d1d' : '#1a4d2e';
        ctx.fillRect(screenX - halfSize, screenY - halfSize, this.size, this.size);

        // Border
        ctx.strokeStyle = this.isEnemy ? '#c0392b' : '#27ae60';
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX - halfSize, screenY - halfSize, this.size, this.size);

        // Icon
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, screenX, screenY);

        // Name below
        ctx.font = '12px Kanit';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.name, screenX, screenY + halfSize + 15);

        // Health bar
        if (this.hp < this.maxHp) {
            const barWidth = this.size;
            const barHeight = 6;
            const barY = screenY - halfSize - 12;

            ctx.fillStyle = '#333';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

            const healthPercent = this.hp / this.maxHp;
            ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : '#c0392b';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }

        // Production progress
        if (this.productionQueue.length > 0) {
            const barWidth = this.size - 10;
            const barHeight = 4;
            const barY = screenY + halfSize + 25;

            ctx.fillStyle = '#333';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

            const progress = this.productionProgress / this.productionQueue[0].buildTime;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth * progress, barHeight);
        }
    }
}
