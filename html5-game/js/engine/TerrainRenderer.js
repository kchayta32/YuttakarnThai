// ===================================
// RTS: ยุทธการไทย - Terrain Renderer
// Enhanced terrain with 3 layers:
// Ground, Decals, Props
// ===================================

import { spriteManager } from './SpriteManager.js';

export class TerrainRenderer {
    constructor(game) {
        this.game = game;

        // Terrain tile cache
        this.tileCache = new Map();
        this.tileSize = 64;

        // Visual settings
        this.settings = {
            // Ground layer
            groundColors: {
                grass: ['#4a7c59', '#3d6b4d', '#537f62', '#486e54'],
                dirt: ['#8b7355', '#7a6548', '#9c8260', '#6d5840'],
                sand: ['#c2b280', '#b8a870', '#d4c590', '#a99a68']
            },

            // Decal settings
            decalsEnabled: true,
            decalDensity: 0.02, // per tile

            // Prop shadows
            propShadowEnabled: true,
            propShadowColor: 'rgba(0, 0, 0, 0.25)',

            // Water animation
            waterAnimSpeed: 2,
            waterWaveHeight: 3,

            // Use texture tiles
            useTextureTiles: true
        };

        // Generate noise seed
        this.noiseSeed = Math.random() * 1000;
    }

    /**
     * Render all terrain layers
     */
    renderTerrain(ctx, camera, mapData) {
        // 1. Ground layer with texture tiles
        this.renderGroundLayer(ctx, camera, mapData);

        // 2. Feature layers (forests, mountains, water)
        this.renderFeatures(ctx, camera, mapData);

        // 3. Decal layer (grass tufts, rocks, flowers)
        if (this.settings.decalsEnabled) {
            this.renderDecals(ctx, camera, mapData);
        }

        // 4. Grid lines (debug)
        if (this.game.settings?.debugMode) {
            this.renderGrid(ctx, camera);
        }
    }

    /**
     * Render ground with texture tiles or fallback colors
     */
    renderGroundLayer(ctx, camera, mapData) {
        const zoom = camera.zoom || 1;
        const tileSize = this.tileSize * zoom;

        // Get grass texture
        const grassTexture = spriteManager.get('grass');
        const useTexture = this.settings.useTextureTiles && grassTexture;

        // Calculate visible tile range
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.ceil((camera.x + camera.width / zoom) / this.tileSize);
        const endY = Math.ceil((camera.y + camera.height / zoom) / this.tileSize);

        // Draw base ground
        for (let ty = startY; ty <= endY; ty++) {
            for (let tx = startX; tx <= endX; tx++) {
                const screenX = (tx * this.tileSize - camera.x) * zoom;
                const screenY = (ty * this.tileSize - camera.y) * zoom;

                if (useTexture) {
                    // Draw textured grass tile
                    ctx.drawImage(grassTexture, screenX, screenY, tileSize + 1, tileSize + 1);
                } else {
                    // Fallback: Get tile color with variation
                    const colorIndex = this.pseudoRandom(tx * 7 + ty * 13) % 4;
                    const colors = this.settings.groundColors.grass;
                    ctx.fillStyle = colors[colorIndex];
                    ctx.fillRect(screenX, screenY, tileSize + 1, tileSize + 1);
                }
            }
        }
    }

    /**
     * Render terrain features (forest, water, mountain, road)
     */
    renderFeatures(ctx, camera, mapData) {
        const features = mapData.features || [];
        const zoom = camera.zoom || 1;
        const time = Date.now() / 1000;

        for (const feature of features) {
            const screenX = (feature.x - camera.x) * zoom;
            const screenY = (feature.y - camera.y) * zoom;
            const width = feature.width * zoom;
            const height = feature.height * zoom;

            // Culling
            if (screenX + width < 0 || screenX > camera.width ||
                screenY + height < 0 || screenY > camera.height) {
                continue;
            }

            switch (feature.type) {
                case 'forest':
                    this.renderForest(ctx, screenX, screenY, width, height, feature);
                    break;
                case 'water':
                    this.renderWater(ctx, screenX, screenY, width, height, time);
                    break;
                case 'mountain':
                    this.renderMountain(ctx, screenX, screenY, width, height);
                    break;
                case 'road':
                    this.renderRoad(ctx, screenX, screenY, width, height);
                    break;
            }
        }
    }

    /**
     * Render forest with individual trees
     */
    renderForest(ctx, x, y, width, height, feature) {
        // Base forest floor
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#2d5a3d');
        gradient.addColorStop(0.5, '#234a31');
        gradient.addColorStop(1, '#1a3a24');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Draw trees
        const treeCount = Math.floor((feature.width * feature.height) / 3000);
        const seed = feature.x * 7 + feature.y * 13;

        for (let i = 0; i < treeCount; i++) {
            const treeX = x + this.pseudoRandomFloat(seed + i * 3) * width;
            const treeY = y + this.pseudoRandomFloat(seed + i * 5) * height;
            const treeSize = 12 + this.pseudoRandomFloat(seed + i * 7) * 10;

            // Tree shadow
            ctx.beginPath();
            ctx.ellipse(treeX + 5, treeY + treeSize * 0.6, treeSize * 0.8, treeSize * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();

            // Tree top (dark green)
            ctx.beginPath();
            ctx.arc(treeX, treeY, treeSize, 0, Math.PI * 2);
            const treeGradient = ctx.createRadialGradient(
                treeX - treeSize * 0.3, treeY - treeSize * 0.3, 0,
                treeX, treeY, treeSize
            );
            treeGradient.addColorStop(0, '#3d8a5e');
            treeGradient.addColorStop(0.6, '#2d6b48');
            treeGradient.addColorStop(1, '#1a4d2e');
            ctx.fillStyle = treeGradient;
            ctx.fill();

            // Highlight
            ctx.beginPath();
            ctx.arc(treeX - treeSize * 0.3, treeY - treeSize * 0.3, treeSize * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
        }
    }

    /**
     * Render water with animated waves
     */
    renderWater(ctx, x, y, width, height, time) {
        // Base water
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#1a6b9c');
        gradient.addColorStop(0.5, '#2980b9');
        gradient.addColorStop(1, '#1a5276');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Animated waves
        const waveOffset = (time * 30) % 60;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';

        for (let wy = 0; wy < height; wy += 60) {
            const actualY = y + wy + waveOffset;
            if (actualY >= y && actualY <= y + height - 3) {
                ctx.fillRect(x, actualY, width, 3);
            }
        }

        // Sparkles
        const sparkleCount = Math.floor(width * height / 5000);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleTime = time + i * 0.3;
            const sparkleAlpha = (Math.sin(sparkleTime * 3) + 1) * 0.2;
            if (sparkleAlpha > 0.1) {
                const sx = x + this.pseudoRandomFloat(i * 7) * width;
                const sy = y + this.pseudoRandomFloat(i * 11) * height;
                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                ctx.fill();
            }
        }

        // Shore line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
    }

    /**
     * Render mountain with depth
     */
    renderMountain(ctx, x, y, width, height) {
        // Base mountain
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, '#8b9dc3');
        gradient.addColorStop(0.3, '#6b7280');
        gradient.addColorStop(0.7, '#4b5563');
        gradient.addColorStop(1, '#374151');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Snow cap effect (top 30%)
        const snowGradient = ctx.createLinearGradient(x, y, x, y + height * 0.3);
        snowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        snowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = snowGradient;
        ctx.fillRect(x, y, width, height * 0.35);

        // Rock texture
        const rockCount = Math.floor(width * height / 2000);
        for (let i = 0; i < rockCount; i++) {
            const rx = x + this.pseudoRandomFloat(i * 11) * width;
            const ry = y + this.pseudoRandomFloat(i * 17) * height;
            const rSize = 5 + this.pseudoRandomFloat(i * 23) * 8;

            ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + this.pseudoRandomFloat(i) * 0.15})`;
            ctx.fillRect(rx, ry, rSize, rSize * 0.6);
        }

        // Impassable indicator (subtle X pattern)
        ctx.strokeStyle = 'rgba(139, 0, 0, 0.15)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + width - 10, y + height - 10);
        ctx.moveTo(x + width - 10, y + 10);
        ctx.lineTo(x + 10, y + height - 10);
        ctx.stroke();
    }

    /**
     * Render road/bridge
     */
    renderRoad(ctx, x, y, width, height) {
        // Base road
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y, width, height);

        // Road texture lines
        ctx.fillStyle = '#7a6548';
        for (let i = 0; i < Math.max(width, height); i += 20) {
            if (width > height) {
                ctx.fillRect(x + i, y, 10, height);
            } else {
                ctx.fillRect(x, y + i, width, 10);
            }
        }

        // Border
        ctx.strokeStyle = '#5a4838';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Center line (if wide enough)
        if (Math.min(width, height) > 50) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            if (width > height) {
                ctx.moveTo(x, y + height / 2);
                ctx.lineTo(x + width, y + height / 2);
            } else {
                ctx.moveTo(x + width / 2, y);
                ctx.lineTo(x + width / 2, y + height);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    /**
     * Render small decals (grass tufts, small rocks, flowers)
     */
    renderDecals(ctx, camera, mapData) {
        const zoom = camera.zoom || 1;
        const decalSpacing = 100;

        const startX = Math.floor(camera.x / decalSpacing) * decalSpacing;
        const startY = Math.floor(camera.y / decalSpacing) * decalSpacing;
        const endX = camera.x + camera.width / zoom + decalSpacing;
        const endY = camera.y + camera.height / zoom + decalSpacing;

        for (let dy = startY; dy < endY; dy += decalSpacing) {
            for (let dx = startX; dx < endX; dx += decalSpacing) {
                // Check if inside any feature
                let insideFeature = false;
                for (const f of (mapData.features || [])) {
                    if (dx >= f.x && dx <= f.x + f.width &&
                        dy >= f.y && dy <= f.y + f.height) {
                        insideFeature = true;
                        break;
                    }
                }
                if (insideFeature) continue;

                const seed = dx * 7 + dy * 13;
                if (this.pseudoRandom(seed) % 10 < 3) {
                    const screenX = (dx - camera.x) * zoom;
                    const screenY = (dy - camera.y) * zoom;
                    const decalType = this.pseudoRandom(seed + 1) % 4;

                    this.renderDecal(ctx, screenX, screenY, decalType, zoom);
                }
            }
        }
    }

    /**
     * Render a single decal
     */
    renderDecal(ctx, x, y, type, zoom) {
        const size = 8 * zoom;

        switch (type) {
            case 0: // Grass tuft
                ctx.fillStyle = '#3d6b4d';
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x + i * 2 * zoom, y);
                    ctx.lineTo(x + i * 2 * zoom - 1, y - size);
                    ctx.lineTo(x + i * 2 * zoom + 1, y - size);
                    ctx.fill();
                }
                break;

            case 1: // Small rock
                ctx.fillStyle = '#6b7280';
                ctx.beginPath();
                ctx.ellipse(x, y, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.ellipse(x - 2, y - 2, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 2: // Flower
                const colors = ['#e74c3c', '#f1c40f', '#9b59b6', '#3498db'];
                ctx.fillStyle = colors[Math.floor(Math.random() * 4)];
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    const px = x + Math.cos(angle) * size * 0.3;
                    const py = y + Math.sin(angle) * size * 0.3;
                    ctx.beginPath();
                    ctx.arc(px, py, size * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 3: // Dirt patch
                ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
                ctx.beginPath();
                ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    /**
     * Render debug grid
     */
    renderGrid(ctx, camera) {
        const zoom = camera.zoom || 1;
        const gridSize = 100 * zoom;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        const startX = -(camera.x % 100) * zoom;
        const startY = -(camera.y % 100) * zoom;

        for (let x = startX; x < camera.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, camera.height);
            ctx.stroke();
        }

        for (let y = startY; y < camera.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(camera.width, y);
            ctx.stroke();
        }
    }

    // Pseudo-random number generator (deterministic based on seed)
    pseudoRandom(seed) {
        const x = Math.sin(seed + this.noiseSeed) * 10000;
        return Math.floor((x - Math.floor(x)) * 1000);
    }

    pseudoRandomFloat(seed) {
        return (this.pseudoRandom(seed) % 1000) / 1000;
    }
}
