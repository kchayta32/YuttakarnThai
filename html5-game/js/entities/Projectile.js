// ===================================
// RTS: ยุทธการไทย - Projectile Entity
// Handles arrows and other projectiles
// ===================================

export class Projectile {
    constructor(game, type, startX, startY, target, damage, attacker) {
        this.game = game;
        this.type = type; // 'arrow'
        this.x = startX;
        this.y = startY;
        this.target = target;
        this.damage = damage;
        this.attacker = attacker;

        this.speed = 600; // Pixels per second
        this.radius = 4;
        this.hitRadius = 20;
        this.isDead = false;

        // For ballistic trajectory
        this.startX = startX;
        this.startY = startY;
        const dx = target.x - startX;
        const dy = target.y - startY;
        this.totalDistance = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);
        this.archHeight = Math.min(this.totalDistance * 0.2, 100);
        this.progress = 0;
    }

    update(deltaTime) {
        if (this.isDead) return;

        // Move towards target position (even if target moves or dies, arrow goes to last known)
        const targetX = this.target.x;
        const targetY = this.target.y;

        const dx = targetX - this.startX;
        const dy = targetY - this.startY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);

        this.progress += (this.speed * deltaTime) / currentDist;

        if (this.progress >= 1) {
            this.progress = 1;
            this.onHit();
        }

        // Calculate current position with arc
        this.x = this.startX + dx * this.progress;
        this.y = this.startY + dy * this.progress;

        // Update angle for visual rotation
        this.angle = Math.atan2(dy, dx);
    }

    onHit() {
        this.isDead = true;

        // Check if target is still alive and nearby
        if (this.target && this.target.state !== 'dead') {
            const dist = Math.sqrt(
                Math.pow(this.target.x - this.x, 2) +
                Math.pow(this.target.y - this.y, 2)
            );

            if (dist < this.hitRadius + this.target.size / 2) {
                this.target.takeDamage(this.damage, this.attacker);
                this.game.createDamageNumber(this.target.x, this.target.y, Math.round(this.damage));
            }
        }
    }

    render(ctx, camera) {
        const zoom = camera.zoom || 1;
        const screenX = (this.x - camera.x) * zoom;
        const screenY = (this.y - camera.y) * zoom;

        // Calculate arc offset (visual only)
        const arcY = -Math.sin(this.progress * Math.PI) * this.archHeight * zoom;

        ctx.save();
        ctx.translate(screenX, screenY + arcY);
        ctx.rotate(this.angle);

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(-10 * zoom, 0);
        ctx.lineTo(10 * zoom, 0);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(10 * zoom, 0);
        ctx.lineTo(5 * zoom, -3 * zoom);
        ctx.lineTo(5 * zoom, 3 * zoom);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();

        // Fletching
        ctx.beginPath();
        ctx.moveTo(-10 * zoom, 0);
        ctx.lineTo(-13 * zoom, -4 * zoom);
        ctx.lineTo(-7 * zoom, 0);
        ctx.lineTo(-13 * zoom, 4 * zoom);
        ctx.closePath();
        ctx.fillStyle = '#eee';
        ctx.fill();

        ctx.restore();
    }
}
