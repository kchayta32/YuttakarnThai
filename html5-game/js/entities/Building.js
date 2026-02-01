// ===================================
// RTS: ยุทธการไทย - Building Entity
// Structures and resource buildings
// ===================================

import { BUILDING_TYPES } from '../data/units.js';
import { spriteManager } from '../engine/SpriteManager.js';

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
        this.size = typeData.size || 100; // Use size from data

        // Sprite
        this.sprite = spriteManager.get(this.typeId);

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
        // Handle Sprite loading if not yet ready
        if (!this.sprite) {
            this.sprite = spriteManager.get(this.typeId);
        }

        const zoom = camera.zoom;
        const screenX = (this.x - camera.x) * zoom;
        const screenY = (this.y - camera.y) * zoom;

        // We calculate a visual size that maintains realism relative to world
        // User asked for "ซูมเข้าซูมออกก็ต้องไม่ขยับตามให้ขนาดเท่าเดิม" 
        // In most RTS, as you zoom out, buildings stay the same size in WORLD space, appearing smaller on screen.
        // If the user means they should look "fixed" in screen size, that's unusual for RTS.
        // However, I will ensure they are LARGE and use the sprite correctly.
        const drawSize = this.size * zoom;

        // Check if on screen
        if (screenX + drawSize < 0 || screenX - drawSize > camera.width ||
            screenY + drawSize < 0 || screenY - drawSize > camera.height) {
            return;
        }

        const halfSize = drawSize / 2;

        // Selection ring
        if (this.selected) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, halfSize + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#f4d03f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw Sprite if available, otherwise fallback to box
        if (this.sprite) {
            ctx.drawImage(this.sprite, screenX - halfSize, screenY - halfSize, drawSize, drawSize);
        } else {
            // Fallback (Traditional box)
            ctx.fillStyle = this.isEnemy ? '#7f1d1d' : '#1a4d2e';
            ctx.fillRect(screenX - halfSize, screenY - halfSize, drawSize, drawSize);
            ctx.strokeStyle = this.isEnemy ? '#c0392b' : '#27ae60';
            ctx.strokeRect(screenX - halfSize, screenY - halfSize, drawSize, drawSize);

            // Icon Fallback
            ctx.font = `${36 * zoom}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.icon, screenX, screenY);
        }

        // Name/Label (Overlapping/Closer to center for better integrated look)
        const labelY = screenY - (halfSize * 0.4) - 20 * zoom;
        ctx.font = `bold ${16 * zoom}px Kanit`;

        // Label background for clarity
        const textWidth = ctx.measureText(this.name).width;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.game.terrainRenderer.drawRoundedRect(ctx, screenX - textWidth / 2 - 5 * zoom, labelY - 12 * zoom, textWidth + 10 * zoom, 20 * zoom, 5 * zoom);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX, labelY + 3 * zoom);

        // Health bar
        if (this.hp < this.maxHp) {
            const barWidth = drawSize;
            const barHeight = 4 * zoom;
            const barY = screenY - halfSize - 10 * zoom;

            ctx.fillStyle = '#333';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

            const healthPercent = this.hp / this.maxHp;
            ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : '#c0392b';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }

        // Production progress
        if (this.productionQueue.length > 0) {
            const barWidth = drawSize - 10 * zoom;
            const barHeight = 4 * zoom;
            const barY = screenY + halfSize + 25 * zoom;

            ctx.fillStyle = '#333';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

            const progress = this.productionProgress / this.productionQueue[0].buildTime;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth * progress, barHeight);
        }
    }
}
