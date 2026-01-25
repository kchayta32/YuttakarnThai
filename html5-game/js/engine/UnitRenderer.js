// ===================================
// RTS: ยุทธการไทย - Unit Renderer
// Enhanced visual system with sprites,
// shadows, selection, animations
// ===================================

import { spriteManager } from './SpriteManager.js';

export class UnitRenderer {
    constructor(game) {
        this.game = game;

        // Visual settings
        this.settings = {
            shadowEnabled: true,
            shadowColor: 'rgba(0, 0, 0, 0.35)',
            shadowOffsetY: 0.4,
            shadowScaleX: 0.9,
            shadowScaleY: 0.4,

            selectionRingWidth: 3,
            selectionRingColor: '#f4d03f',
            selectionRingGlow: 'rgba(244, 208, 63, 0.4)',

            healthBarWidth: 1.4,
            healthBarHeight: 5,
            healthBarOffsetY: 15,

            idleBobEnabled: true,
            idleBobAmount: 2,
            idleBobSpeed: 2,

            hitFlashEnabled: true,
            hitFlashDuration: 0.1,

            // Sprite settings
            spriteSize: 64,  // Base size for sprite rendering
            useSpriteImages: true  // Toggle between sprites and fallback
        };
    }

    /**
     * Render all units with y-sorting
     */
    renderUnits(ctx, units, camera) {
        const sortedUnits = [...units].filter(u => u.state !== 'dead')
            .sort((a, b) => a.y - b.y);

        for (const unit of sortedUnits) {
            this.renderUnit(ctx, unit, camera);
        }
    }

    /**
     * Render a single unit with all visual layers
     */
    renderUnit(ctx, unit, camera) {
        const zoom = camera.zoom || 1;
        const screenX = (unit.x - camera.x) * zoom;
        const screenY = (unit.y - camera.y) * zoom;

        // Culling check
        if (screenX < -100 || screenX > camera.width + 100 ||
            screenY < -100 || screenY > camera.height + 100) {
            return;
        }

        const size = unit.size * zoom;
        const halfSize = size / 2;

        // Calculate bob offset for idle animation
        const bobOffset = this.calculateIdleBob(unit);
        const finalY = screenY - bobOffset * zoom;

        // 1. Shadow (drawn first, at bottom)
        if (this.settings.shadowEnabled) {
            this.renderShadow(ctx, screenX, screenY, size);
        }

        // 2. Selection ring (if selected)
        if (unit.selected) {
            this.renderSelectionRing(ctx, screenX, finalY, halfSize);
        }

        // 3. Unit sprite or fallback
        this.renderUnitSprite(ctx, unit, screenX, finalY, size);

        // 4. Health bar (if damaged)
        if (unit.hp < unit.maxHp) {
            this.renderHealthBar(ctx, unit, screenX, finalY - halfSize);
        }

        // 5. Attack indicator line
        if (unit.state === 'attacking' && unit.target && unit.target.state !== 'dead') {
            this.renderAttackLine(ctx, unit, camera);
        }
    }

    /**
     * Render unit sprite image
     */
    renderUnitSprite(ctx, unit, x, y, size) {
        const spriteKey = spriteManager.getUnitSpriteKey(unit);
        const sprite = spriteManager.get(spriteKey);

        // Hit flash effect
        let isFlashing = false;
        if (unit.hitFlashTime && Date.now() - unit.hitFlashTime < this.settings.hitFlashDuration * 1000) {
            isFlashing = true;
        }

        // Attack squash/stretch
        let scaleX = 1, scaleY = 1;
        if (unit.attackAnimTime) {
            const elapsed = (Date.now() - unit.attackAnimTime) / 1000;
            if (elapsed < 0.15) {
                const t = elapsed / 0.15;
                scaleX = 1 + Math.sin(t * Math.PI) * 0.08;
                scaleY = 1 - Math.sin(t * Math.PI) * 0.05;
            }
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scaleX, scaleY);

        if (sprite && this.settings.useSpriteImages) {
            // Draw sprite image
            const spriteWidth = size * 1.5;
            const spriteHeight = size * 1.5;

            // Apply hit flash with filter
            if (isFlashing) {
                ctx.filter = 'brightness(2)';
            } else if (unit.isEnemy) {
                // Apply a more subtle red tint for enemy units
                ctx.filter = 'sepia(0.4) saturate(2.5) hue-rotate(-50deg) brightness(0.9)';
            }

            // Flip based on facing direction
            if (unit.angle && Math.abs(unit.angle) > Math.PI / 2) {
                ctx.scale(-1, 1);
            }

            ctx.drawImage(
                sprite,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );

            ctx.filter = 'none';
        } else {
            // Fallback: draw colored circle with icon
            this.renderFallbackUnit(ctx, unit, size, isFlashing);
        }

        ctx.restore();
    }

    /**
     * Fallback rendering (colored circle with icon)
     */
    renderFallbackUnit(ctx, unit, size, isFlashing) {
        const halfSize = size / 2;

        // Create gradient
        const gradient = ctx.createRadialGradient(
            -halfSize * 0.3, -halfSize * 0.3, 0,
            0, 0, halfSize
        );

        if (isFlashing) {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#cccccc');
        } else if (unit.isEnemy) {
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(0.7, '#a93226');
            gradient.addColorStop(1, '#7f1d1d');
        } else {
            gradient.addColorStop(0, unit.color || '#27ae60');
            gradient.addColorStop(0.7, this.darkenColor(unit.color || '#27ae60', 0.3));
            gradient.addColorStop(1, '#1a4d2e');
        }

        // Draw unit body
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = unit.isEnemy ? '#991b1b' : '#166534';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon
        const iconSize = size * 0.55;
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(unit.icon, 0, 0);
    }

    /**
     * Render shadow ellipse under unit
     */
    renderShadow(ctx, x, y, size) {
        const shadowX = size * this.settings.shadowScaleX / 2;
        const shadowY = size * this.settings.shadowScaleY / 2;
        const offsetY = size * this.settings.shadowOffsetY;

        ctx.beginPath();
        ctx.ellipse(x, y + offsetY, shadowX, shadowY, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.settings.shadowColor;
        ctx.fill();
    }

    /**
     * Render selection ring with glow effect
     */
    renderSelectionRing(ctx, x, y, halfSize) {
        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, halfSize + 10, 0, Math.PI * 2);
        ctx.strokeStyle = this.settings.selectionRingGlow;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(x, y, halfSize + 6, 0, Math.PI * 2);
        ctx.strokeStyle = this.settings.selectionRingColor;
        ctx.lineWidth = this.settings.selectionRingWidth;
        ctx.stroke();

        // Animated pulse effect
        const pulsePhase = (Date.now() % 1000) / 1000;
        const pulseRadius = halfSize + 12 + Math.sin(pulsePhase * Math.PI * 2) * 4;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244, 208, 63, ${0.3 - pulsePhase * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Render health bar above unit
     */
    renderHealthBar(ctx, unit, x, y) {
        const barWidth = unit.size * this.settings.healthBarWidth;
        const barHeight = this.settings.healthBarHeight;
        const barY = y - this.settings.healthBarOffsetY;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.roundRect(ctx, x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2, 2);
        ctx.fill();

        // Health fill
        const healthPercent = unit.hp / unit.maxHp;
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = this.createHealthGradient(ctx, x - barWidth / 2, barY, barWidth * healthPercent, '#27ae60', '#2ecc71');
        } else if (healthPercent > 0.3) {
            healthColor = this.createHealthGradient(ctx, x - barWidth / 2, barY, barWidth * healthPercent, '#d35400', '#f39c12');
        } else {
            healthColor = this.createHealthGradient(ctx, x - barWidth / 2, barY, barWidth * healthPercent, '#a93226', '#e74c3c');
        }

        ctx.fillStyle = healthColor;
        this.roundRect(ctx, x - barWidth / 2, barY, barWidth * healthPercent, barHeight, 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x - barWidth / 2, barY, barWidth, barHeight, 2);
        ctx.stroke();
    }

    /**
     * Render attack indicator line
     */
    renderAttackLine(ctx, unit, camera) {
        const zoom = camera.zoom || 1;
        const startX = (unit.x - camera.x) * zoom;
        const startY = (unit.y - camera.y) * zoom;
        const endX = (unit.target.x - camera.x) * zoom;
        const endY = (unit.target.y - camera.y) * zoom;

        const dashOffset = (Date.now() / 50) % 20;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -dashOffset;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Calculate idle bob offset
     */
    calculateIdleBob(unit) {
        if (!this.settings.idleBobEnabled || unit.state === 'moving' || unit.state === 'attacking') {
            return 0;
        }

        const time = Date.now() / 1000;
        const phase = (unit.id ? unit.id.charCodeAt(0) : 0) * 0.1;
        return Math.sin((time + phase) * this.settings.idleBobSpeed * Math.PI) * this.settings.idleBobAmount;
    }

    triggerHitFlash(unit) {
        unit.hitFlashTime = Date.now();
    }

    triggerAttackAnim(unit) {
        unit.attackAnimTime = Date.now();
    }

    createHealthGradient(ctx, x, y, width, colorDark, colorLight) {
        const gradient = ctx.createLinearGradient(x, y, x, y + this.settings.healthBarHeight);
        gradient.addColorStop(0, colorLight);
        gradient.addColorStop(1, colorDark);
        return gradient;
    }

    darkenColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - (num >> 16) * amount);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - ((num >> 8) & 0x00FF) * amount);
        const b = Math.max(0, (num & 0x0000FF) - (num & 0x0000FF) * amount);
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
