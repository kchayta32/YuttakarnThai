// ===================================
// RTS: ยุทธการไทย - Fog of War System
// Handles visibility and exploration
// ===================================

export class FogOfWar {
    constructor(mapWidth, mapHeight, tileSize = 32) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileSize = tileSize;

        // Grid dimensions
        this.gridWidth = Math.ceil(mapWidth / tileSize);
        this.gridHeight = Math.ceil(mapHeight / tileSize);

        // Visibility states: 0 = unexplored, 1 = explored (fog), 2 = visible
        this.visibility = new Uint8Array(this.gridWidth * this.gridHeight);

        // Previous frame visibility for optimization
        this.previousVisibility = new Uint8Array(this.gridWidth * this.gridHeight);

        // Fog colors
        this.unexploredColor = 'rgba(0, 0, 0, 0.95)';
        this.exploredColor = 'rgba(0, 0, 0, 0.6)';

        // Enable/disable fog
        this.enabled = true;

        // Cache for performance
        this.visibilityChanged = true;
        this.fogCanvas = null;
        this.fogCtx = null;

        this.initFogCanvas();
    }

    initFogCanvas() {
        // Create off-screen canvas for fog rendering
        this.fogCanvas = document.createElement('canvas');
        this.fogCanvas.width = this.gridWidth;
        this.fogCanvas.height = this.gridHeight;
        this.fogCtx = this.fogCanvas.getContext('2d');
    }

    /**
     * Update visibility based on player units and buildings
     * @param {Array} playerUnits - Array of player units
     * @param {Array} playerBuildings - Array of player buildings
     * @param {Array} terrainFeatures - Array of terrain features (forests, mountains)
     */
    update(playerUnits, playerBuildings = [], terrainFeatures = []) {
        if (!this.enabled) return;

        // Copy current visibility to previous
        this.previousVisibility.set(this.visibility);

        // Downgrade all visible cells to explored
        for (let i = 0; i < this.visibility.length; i++) {
            if (this.visibility[i] === 2) {
                this.visibility[i] = 1;
            }
        }

        // Update visibility from units
        for (const unit of playerUnits) {
            if (unit.team === 0) { // Player team only
                const visionRange = unit.visionRange || 5;
                this.revealArea(unit.x, unit.y, visionRange, terrainFeatures);
            }
        }

        // Update visibility from buildings
        for (const building of playerBuildings) {
            if (building.team === 0) {
                // Buildings have base vision + watchtower bonus
                const visionRange = building.visionRange || 4;
                this.revealArea(building.x, building.y, visionRange, terrainFeatures);
            }
        }

        // Check if visibility changed
        this.visibilityChanged = !this.arraysEqual(this.visibility, this.previousVisibility);

        if (this.visibilityChanged) {
            this.updateFogTexture();
        }
    }

    /**
     * Reveal an area around a point
     */
    revealArea(worldX, worldY, range, terrainFeatures = []) {
        const centerGridX = Math.floor(worldX / this.tileSize);
        const centerGridY = Math.floor(worldY / this.tileSize);
        const rangeTiles = range;

        for (let dy = -rangeTiles; dy <= rangeTiles; dy++) {
            for (let dx = -rangeTiles; dx <= rangeTiles; dx++) {
                const gx = centerGridX + dx;
                const gy = centerGridY + dy;

                // Bounds check
                if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) {
                    continue;
                }

                // Distance check (circular vision)
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > rangeTiles) {
                    continue;
                }

                // Check line of sight for blocking terrain
                if (!this.hasLineOfSight(centerGridX, centerGridY, gx, gy, terrainFeatures)) {
                    continue;
                }

                // Reveal the cell
                const index = gy * this.gridWidth + gx;
                this.visibility[index] = 2;
            }
        }
    }

    /**
     * Check if there's a clear line of sight between two points
     */
    hasLineOfSight(x0, y0, x1, y1, terrainFeatures) {
        // Bresenham's line algorithm to check for blocking terrain
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (x !== x1 || y !== y1) {
            // Check if current position is blocked by terrain
            const worldX = x * this.tileSize + this.tileSize / 2;
            const worldY = y * this.tileSize + this.tileSize / 2;

            for (const feature of terrainFeatures) {
                if (feature.type === 'mountain') {
                    if (this.pointInRect(worldX, worldY, feature)) {
                        return false; // Blocked by mountain
                    }
                }
            }

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        return true;
    }

    /**
     * Check if a point is inside a rectangle
     */
    pointInRect(x, y, rect) {
        return x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height;
    }

    /**
     * Update the fog texture canvas
     */
    updateFogTexture() {
        const imageData = this.fogCtx.createImageData(this.gridWidth, this.gridHeight);
        const data = imageData.data;

        for (let i = 0; i < this.visibility.length; i++) {
            const pixelIndex = i * 4;
            const state = this.visibility[i];

            if (state === 0) {
                // Unexplored - fully black
                data[pixelIndex] = 0;
                data[pixelIndex + 1] = 0;
                data[pixelIndex + 2] = 0;
                data[pixelIndex + 3] = 240;
            } else if (state === 1) {
                // Explored but not visible - dark fog
                data[pixelIndex] = 0;
                data[pixelIndex + 1] = 0;
                data[pixelIndex + 2] = 0;
                data[pixelIndex + 3] = 150;
            } else {
                // Visible - no fog
                data[pixelIndex] = 0;
                data[pixelIndex + 1] = 0;
                data[pixelIndex + 2] = 0;
                data[pixelIndex + 3] = 0;
            }
        }

        this.fogCtx.putImageData(imageData, 0, 0);
    }

    /**
     * Render fog of war to the main canvas
     */
    render(ctx, camera) {
        if (!this.enabled) return;

        ctx.save();

        // Calculate visible area in grid coordinates
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.ceil((camera.x + camera.width) / this.tileSize);
        const endY = Math.ceil((camera.y + camera.height) / this.tileSize);

        // Draw fog scaled up from the small fog canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low';

        // Source rectangle (from fog canvas)
        const sx = Math.max(0, startX);
        const sy = Math.max(0, startY);
        const sw = Math.min(this.gridWidth - sx, endX - startX);
        const sh = Math.min(this.gridHeight - sy, endY - startY);

        // Destination rectangle (on screen)
        const dx = sx * this.tileSize - camera.x;
        const dy = sy * this.tileSize - camera.y;
        const dw = sw * this.tileSize;
        const dh = sh * this.tileSize;

        if (sw > 0 && sh > 0) {
            ctx.drawImage(this.fogCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
        }

        ctx.restore();
    }

    /**
     * Check if a world position is currently visible
     */
    isVisible(worldX, worldY) {
        if (!this.enabled) return true;

        const gx = Math.floor(worldX / this.tileSize);
        const gy = Math.floor(worldY / this.tileSize);

        if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) {
            return false;
        }

        return this.visibility[gy * this.gridWidth + gx] === 2;
    }

    /**
     * Check if a world position has been explored
     */
    isExplored(worldX, worldY) {
        if (!this.enabled) return true;

        const gx = Math.floor(worldX / this.tileSize);
        const gy = Math.floor(worldY / this.tileSize);

        if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) {
            return false;
        }

        return this.visibility[gy * this.gridWidth + gx] >= 1;
    }

    /**
     * Reveal entire map (for debugging or special abilities)
     */
    revealAll() {
        this.visibility.fill(2);
        this.updateFogTexture();
    }

    /**
     * Reset fog to unexplored
     */
    reset() {
        this.visibility.fill(0);
        this.updateFogTexture();
    }

    /**
     * Toggle fog of war on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Compare two arrays for equality
     */
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}
