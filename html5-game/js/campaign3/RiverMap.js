/**
 * RiverMap Class
 * Creates the vertical scrolling river environment for Campaign 3
 * ระบบแผนที่แม่น้ำเจ้าพระยา (แนวตั้ง)
 */

class RiverMap {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.width = 0;
        this.height = 0;

        this.grid = []; // For logical layout or pathfinding

        this.sprites = {
            water: null,
            bankLeft: null,
            bankRight: null,
            mangrove: null,
            sandbar: null
        };

        this.config = {
            tileSize: 64,
            riverWidth: 10, // In tiles
            scrollSpeed: 0 // Optional: if we want a scrolling effect
        };

        this.scrollOffset = 0;

        // Visual elements (islands, sandbars, mangroves)
        this.decorations = [];

        // Background canvas for static rendering
        this.bgCanvas = document.createElement('canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
    }

    /**
     * Generate the river map
     */
    async generate(config = {}) {
        console.log("🗺️ Generating River Map...");

        this.config = { ...this.config, ...config };

        // Canvas dimensions are our world bounds for this minigame
        // Campaign 3 is typically fixed screen or vertical scrolling
        this.width = this.game.canvas.width;
        this.height = this.game.canvas.height;

        // Size background canvas
        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height * 1.5; // Taller for scrolling or just bounds

        await this.loadSprites(config.terrain);

        this.generateDecorations();
        this.cacheStaticBackground();

        console.log("✅ River Map generated");
    }

    /**
     * Load map sprites
     */
    async loadSprites(terrainConfig) {
        const loadImg = (src) => {
            return new Promise((resolve) => {
                if (!src) { resolve(null); return; }
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn(`⚠️ Missing terrain sprite: ${src}`);
                    resolve(null);
                };
                img.src = src;
            });
        };

        if (terrainConfig) {
            this.sprites.water = await loadImg(terrainConfig.water);
            this.sprites.bankLeft = await loadImg(terrainConfig.bank); // Often same sprite flipped
            this.sprites.bankRight = await loadImg(terrainConfig.bank);
            this.sprites.mangrove = await loadImg(terrainConfig.mangrove);
        }
    }

    /**
     * Generate decorative elements along banks and in water
     */
    generateDecorations() {
        const riverCenter = this.width / 2;
        const riverWidth = this.width * 0.6; // 60% of screen is playable river
        const halfRiver = riverWidth / 2;

        const numDecorations = 20;

        for (let i = 0; i < numDecorations; i++) {
            const isLeft = Math.random() > 0.5;
            const y = Math.random() * this.height * 1.5; // Spread vertically

            // Base X on river bank edge
            let x;
            if (isLeft) {
                // Left bank mangroves
                x = (riverCenter - halfRiver) - (Math.random() * 50);
            } else {
                // Right bank mangroves
                x = (riverCenter + halfRiver) + (Math.random() * 50);
            }

            // Occasional sandbar in middle
            const isSandbar = Math.random() > 0.8;
            if (isSandbar) {
                x = riverCenter + (Math.random() * riverWidth * 0.5 - riverWidth * 0.25);
            }

            this.decorations.push({
                x: x,
                y: y,
                type: isSandbar ? "sandbar" : "mangrove",
                scale: 0.5 + Math.random() * 1.5,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Pre-render static background to improve performance
     */
    cacheStaticBackground() {
        const ctx = this.bgCtx;

        // 1. Fill base water color
        // Deep muddy river green/brown
        const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, "#2c3e2e"); // Darker banks
        gradient.addColorStop(0.5, "#425e45"); // Lighter middle
        gradient.addColorStop(1, "#2c3e2e");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

        // 2. Draw water texture if available
        if (this.sprites.water) {
            // Tile pattern
            const pattern = ctx.createPattern(this.sprites.water, "repeat");
            ctx.fillStyle = pattern;
            ctx.globalAlpha = 0.5; // Blend with gradient
            ctx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
            ctx.globalAlpha = 1.0;
        } else {
            // Procedural water noise/currents
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            for (let i = 0; i < 200; i++) {
                ctx.beginPath();
                const startX = Math.random() * this.width;
                const startY = Math.random() * this.bgCanvas.height;
                const length = 20 + Math.random() * 40;

                ctx.moveTo(startX, startY);
                // Draw wavy line
                ctx.bezierCurveTo(
                    startX + 10, startY + length * 0.33,
                    startX - 10, startY + length * 0.66,
                    startX, startY + length
                );
                ctx.stroke();
            }
        }

        // 3. Draw river banks
        const bankWidth = (this.width - this.width * 0.6) / 2; // 20% on each side

        // Left bank color
        ctx.fillStyle = "#3e4a2e"; // Mud/Grass mix
        ctx.fillRect(0, 0, bankWidth, this.bgCanvas.height);
        // Right bank
        ctx.fillRect(this.width - bankWidth, 0, bankWidth, this.bgCanvas.height);

        // Jagged bank lines
        ctx.strokeStyle = "#5a4322"; // Mud edge
        ctx.lineWidth = 4;

        // Left edge
        ctx.beginPath();
        ctx.moveTo(bankWidth, 0);
        for (let y = 0; y <= this.bgCanvas.height; y += 20) {
            ctx.lineTo(bankWidth + (Math.random() * 10 - 5), y);
        }
        ctx.stroke();

        // Right edge
        ctx.beginPath();
        ctx.moveTo(this.width - bankWidth, 0);
        for (let y = 0; y <= this.bgCanvas.height; y += 20) {
            ctx.lineTo((this.width - bankWidth) + (Math.random() * 10 - 5), y);
        }
        ctx.stroke();

        // 4. Draw static decorations
        this.decorations.forEach(dec => {
            ctx.save();
            ctx.translate(dec.x, dec.y);

            if (dec.type === "mangrove") {
                if (this.sprites.mangrove) {
                    const w = 40 * dec.scale;
                    const h = 40 * dec.scale;
                    ctx.rotate(dec.angle);
                    ctx.drawImage(this.sprites.mangrove, -w / 2, -h / 2, w, h);
                } else {
                    // Fallback procedural mangrove
                    ctx.fillStyle = "#1e3a1e";
                    ctx.beginPath();
                    ctx.arc(0, 0, 15 * dec.scale, 0, Math.PI * 2);
                    ctx.fill();
                    // Roots
                    ctx.strokeStyle = "#4a3c2a";
                    ctx.lineWidth = 2 * dec.scale;
                    for (let r = 0; r < 5; r++) {
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        const a = r * (Math.PI * 2 / 5);
                        ctx.lineTo(Math.cos(a) * 20 * dec.scale, Math.sin(a) * 20 * dec.scale);
                        ctx.stroke();
                    }
                }
            } else if (dec.type === "sandbar") {
                ctx.fillStyle = "rgba(194, 178, 128, 0.4)";
                ctx.beginPath();
                ctx.ellipse(0, 0, 30 * dec.scale, 15 * dec.scale, dec.angle, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        // 5. Draw shallow water tint near banks
        const leftGrad = ctx.createLinearGradient(bankWidth, 0, bankWidth + 30, 0);
        leftGrad.addColorStop(0, "rgba(90, 67, 34, 0.6)"); // Mud color
        leftGrad.addColorStop(1, "rgba(90, 67, 34, 0)");
        ctx.fillStyle = leftGrad;
        ctx.fillRect(bankWidth, 0, 30, this.bgCanvas.height);

        const rightGrad = ctx.createLinearGradient(this.width - bankWidth - 30, 0, this.width - bankWidth, 0);
        rightGrad.addColorStop(0, "rgba(90, 67, 34, 0)");
        rightGrad.addColorStop(1, "rgba(90, 67, 34, 0.6)"); // Mud color
        ctx.fillStyle = rightGrad;
        ctx.fillRect(this.width - bankWidth - 30, 0, 30, this.bgCanvas.height);
    }

    /**
     * Update map logic (scrolling effect if needed)
     */
    update(deltaTime) {
        if (this.config.scrollSpeed > 0) {
            this.scrollOffset += this.config.scrollSpeed * deltaTime;

            // Loop scroll offset
            if (this.scrollOffset >= this.height) {
                this.scrollOffset = 0;
            }
        }

        // Update camera shake
        if (this.cameraShakeData) {
            this.cameraShakeData.time -= deltaTime * 1000;
            if (this.cameraShakeData.time <= 0) {
                this.cameraShakeData = null;
            }
        }
    }

    /**
     * Add camera shake effect (called by explosions/cannons)
     */
    addCameraShake(intensity, duration) {
        this.cameraShakeData = {
            intensity: intensity,
            time: duration
        };
    }

    /**
     * Get current camera offset based on shake
     */
    getCameraOffset() {
        if (!this.cameraShakeData) return { x: 0, y: 0 };

        return {
            x: (Math.random() - 0.5) * 2 * this.cameraShakeData.intensity,
            y: (Math.random() - 0.5) * 2 * this.cameraShakeData.intensity
        };
    }

    /**
     * Main Render function called every frame
     */
    render() {
        const ctx = this.game.ctx;

        // Apply camera shake if any
        const offset = this.getCameraOffset();

        if (offset.x !== 0 || offset.y !== 0) {
            ctx.save();
            ctx.translate(offset.x, offset.y);
        }

        if (this.config.scrollSpeed > 0) {
            // Draw scrolling background (draw twice to loop seamlessly)
            const drawY = Math.floor(this.scrollOffset);

            // Draw bottom part first
            ctx.drawImage(
                this.bgCanvas,
                0, this.bgCanvas.height - drawY - this.height,
                this.width, this.height,
                0, 0,
                this.width, this.height
            );
        } else {
            // Draw static background
            ctx.drawImage(this.bgCanvas, 0, 0, this.width, this.height);
        }

        // Add animated water effect (moving lines on top)
        this.renderWaterAnimation(ctx);

        if (offset.x !== 0 || offset.y !== 0) {
            ctx.restore();
        }
    }

    /**
     * Render dynamic water surface effects (simulated current)
     */
    renderWaterAnimation(ctx) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;

        const time = Date.now() / 1000;
        const currentSpeed = 50; // pixels per second downward

        const bankW = this.width * 0.2;
        const riverW = this.width * 0.6;

        ctx.beginPath();

        // Draw 10 moving wave lines
        for (let i = 0; i < 10; i++) {
            // Use time to sink positions downward
            const rawY = (time * currentSpeed + (i * this.height / 10)) % this.height;
            const x = bankW + 20 + ((i * 37) % (riverW - 40));

            ctx.moveTo(x, rawY);
            // Sine wave horizontal wiggle
            ctx.bezierCurveTo(
                x + 5 * Math.sin(time + i), rawY + 10,
                x - 5 * Math.sin(time + i), rawY + 20,
                x, rawY + 30
            );
        }

        ctx.stroke();
    }
}

// Export for use
export { RiverMap };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiverMap;
}
