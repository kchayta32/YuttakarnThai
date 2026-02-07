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

        // Constant noise seed for deterministic tree generation
        this.noiseSeed = 42.42;
    }

    /**
     * Simple seeded pseudo-random
     */
    pseudoRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * 1000);
    }

    /**
     * Render all terrain layers
     */
    renderTerrain(ctx, camera, mapData) {
        const props = [];

        // 1. Ground layer with texture tiles
        this.renderGroundLayer(ctx, camera, mapData);

        // 2. Base feature layers (water, roads) and collect props (forests, mountains)
        this.renderFeatures(ctx, camera, mapData, props);

        // 3. Decal layer (grass tufts, rocks, flowers) - Render before props
        if (this.settings.decalsEnabled) {
            this.renderDecals(ctx, camera, mapData);
        }

        // 4. Render sorted props (Trees, Rocks)
        if (props.length > 0) {
            // Sort props by Y coordinate for correct depth
            props.sort((a, b) => a.y - b.y);

            // Pass 1: Render all shadows
            ctx.save();
            for (const prop of props) {
                this.renderPropShadow(ctx, prop);
            }
            ctx.restore();

            // Pass 2: Render all sprites
            for (const prop of props) {
                this.renderPropSprite(ctx, prop);
            }
        }

        // 5. Grid lines (debug)
        if (this.game.settings?.debugMode) {
            this.renderGrid(ctx, camera);
        }
    }

    /**
     * Check if a world-space coordinate is on water
     */
    isWaterAt(worldX, worldY, features) {
        if (!features) return false;
        for (const feature of features) {
            if (feature.type === 'water') {
                if (worldX >= feature.x && worldX <= feature.x + feature.width &&
                    worldY >= feature.y && worldY <= feature.y + feature.height) {
                    return true;
                }
            }
        }
        return false;
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
    renderFeatures(ctx, camera, mapData, props) {
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
                    this.collectForestProps(props, screenX, screenY, width, height, feature);
                    break;
                case 'water':
                    this.renderWater(ctx, screenX, screenY, width, height, time);
                    break;
                case 'mountain':
                    this.collectMountainProps(props, screenX, screenY, width, height, feature);
                    break;
                case 'road':
                    this.renderRoad(ctx, screenX, screenY, width, height);
                    break;
            }
        }
    }

    /**
     * Render water with animated waves using ocean-wave.png
     */
    renderWater(ctx, x, y, width, height, time) {
        const zoom = this.game.camera.zoom || 1;

        // 1. Base water gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#1a6b9c');
        gradient.addColorStop(0.5, '#2980b9');
        gradient.addColorStop(1, '#1a5276');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        const sprite = spriteManager.get('ocean_wave');
        if (sprite) {
            ctx.save();
            // 2. Clip to water area so waves don't spill
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();

            // 3. Setup animation parameters
            const waveSize = 120 * zoom;
            const vStep = waveSize * 0.4;
            const hStep = waveSize * 0.6;

            const flowSpeed = 30 * zoom;  // Slow, steady flow
            const swayAmount = 25 * zoom; // Wider sway for more pronounced movement
            const swaySpeed = 0.4;        // Very slow oscillations

            // Calculate two layers of movement for extra smoothness and depth
            // Layer 1
            const offV1 = (time * flowSpeed) % vStep;
            const offH1 = Math.sin(time * swaySpeed) * swayAmount;

            // Layer 2 (slayer sway, different timing)
            const offV2 = (time * flowSpeed * 1.2) % vStep;
            const offH2 = Math.sin(time * swaySpeed * 0.7 + 2) * (swayAmount * 0.8);

            // 4. Tile the wave sprite - Dual layer for depth and overlapping

            // Layer 1: Base Waves
            ctx.globalAlpha = 0.3;
            for (let wy = -waveSize; wy < height + waveSize; wy += vStep) {
                for (let wx = -waveSize; wx < width + waveSize; wx += hStep) {
                    ctx.drawImage(
                        sprite,
                        Math.round(x + wx + offH1),
                        Math.round(y + wy + offV1),
                        waveSize,
                        waveSize
                    );
                }
            }

            // Layer 2: Detail Waves (slightly differently timed)
            ctx.globalAlpha = 0.25;
            for (let wy = -waveSize; wy < height + waveSize; wy += vStep) {
                for (let wx = -waveSize; wx < width + waveSize; wx += hStep) {
                    ctx.drawImage(
                        sprite,
                        Math.round(x + wx + offH2),
                        Math.round(y + wy + offV2),
                        waveSize,
                        waveSize
                    );
                }
            }

            ctx.restore();
        } else {
            // Fallback to simple line waves if sprite not loaded
            const waveOffset = (time * 30) % 60;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            for (let wy = 0; wy < height; wy += 60) {
                const actualY = y + wy + waveOffset;
                if (actualY >= y && actualY <= y + height - 3) {
                    ctx.fillRect(x, actualY, width, 3);
                }
            }
        }

        // 5. Sparkles (retained for extra polish)
        const sparkleCount = Math.floor(width * height / 8000);
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleTime = time + i * 0.3;
            const sparkleAlpha = (Math.sin(sparkleTime * 3) + 1) * 0.2;
            if (sparkleAlpha > 0.05) {
                const sx = x + this.pseudoRandomFloat(i * 7) * width;
                const sy = y + this.pseudoRandomFloat(i * 11) * height;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5 * zoom, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                ctx.fill();
            }
        }

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5 * zoom;
        ctx.strokeRect(x, y, width, height);
    }

    /**
     * Collect tree props from forest feature
     */
    collectForestProps(props, x, y, width, height, feature) {
        if (this.game.settings?.propsDetail === false) return;

        const zoom = this.game.camera.zoom || 1;

        // Get tree textures
        const treeLarge = spriteManager.get('tree');
        const treeSmall = spriteManager.get('tree_small');

        // Draw trees - Increased density (lower number)
        const treeDensity = 6000;
        const treeCount = Math.floor((feature.width * feature.height) / treeDensity);
        const seed = feature.x * 7 + feature.y * 13;

        for (let i = 0; i < treeCount; i++) {
            const padding = 80; // World space padding
            const worldTreeX = feature.x - padding + this.pseudoRandomFloat(seed + i * 3) * (feature.width + padding * 2);
            const worldTreeY = feature.y - padding + this.pseudoRandomFloat(seed + i * 5) * (feature.height + padding * 2);

            // Skip if tree is in water
            if (this.isWaterAt(worldTreeX, worldTreeY, this.game.currentMap.features)) {
                continue;
            }

            const treeX = (worldTreeX - this.game.camera.x) * zoom;
            const treeY = (worldTreeY - this.game.camera.y) * zoom;

            // Randomly choose which tree sprite to use
            const useLarge = this.pseudoRandom(seed + i * 9) % 10 > 3;
            const sprite = useLarge ? treeLarge : treeSmall;

            // Determine size based on sprite type, SCALED by zoom
            const baseSize = useLarge ? 260 : 180;
            const variation = this.pseudoRandomFloat(seed + i * 7) * 80;
            const treeWidth = (baseSize + variation) * zoom;
            const treeHeight = sprite ? treeWidth * (sprite.height / sprite.width) : treeWidth;

            props.push({
                type: 'tree',
                x: treeX,
                y: treeY,
                width: treeWidth,
                height: treeHeight,
                sprite: sprite,
                zoom: zoom
            });
        }
    }

    /**
     * Collect rock props from mountain feature
     */
    collectMountainProps(props, screenX, screenY, screenWidth, screenHeight, feature) {
        if (this.game.settings?.propsDetail === false) return;

        const sprite = spriteManager.get('rock');
        const zoom = this.game.camera.zoom || 1;

        // Use WORLD-SPACE coordinates for deterministic seed and count
        const seed = feature.x * 7 + feature.y * 13;
        // Increased rock count (lower divisor)
        const rockCount = Math.max(1, Math.floor((feature.width * feature.height) / 3000));

        for (let i = 0; i < rockCount; i++) {
            // Random variation in world-space
            const variation = this.pseudoRandomFloat(seed + i * 7);

            // Base size 90
            const worldSize = (90 + variation * 90);
            const screenRockSize = worldSize * zoom;

            // Position offset in world-space
            const worldOffsetX = this.pseudoRandomFloat(seed + i * 11) * (feature.width - worldSize * 0.5);
            const worldOffsetY = this.pseudoRandomFloat(seed + i * 17) * (feature.height - worldSize * 0.5);

            const worldX = feature.x + worldOffsetX;
            const worldY = feature.y + worldOffsetY;

            // Skip if rock is in water
            if (this.isWaterAt(worldX, worldY, this.game.currentMap.features)) {
                continue;
            }

            // Project to screen space
            const rx = (worldX - this.game.camera.x) * zoom;
            const ry = (worldY - this.game.camera.y) * zoom;

            props.push({
                type: 'rock',
                x: rx + screenRockSize / 2, // Center X for consistency
                y: ry + screenRockSize * 0.8, // "Foot" Y for sorting
                width: screenRockSize,
                height: screenRockSize,
                sprite: sprite,
                zoom: zoom,
                originX: rx,
                originY: ry
            });
        }
    }

    /**
     * Render shadow pass for a prop
     */
    renderPropShadow(ctx, prop) {
        if (!this.settings.propShadowEnabled) return;

        if (prop.type === 'tree') {
            ctx.beginPath();
            ctx.ellipse(prop.x + 15 * prop.zoom, prop.y + prop.height / 2.5, prop.width / 2.5, prop.width / 5, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fill();
        } else if (prop.type === 'rock') {
            ctx.beginPath();
            ctx.ellipse(prop.originX + prop.width / 2, prop.originY + prop.width * 0.8, prop.width / 2.5, prop.width / 6, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fill();
        }
    }

    /**
     * Render sprite pass for a prop
     */
    renderPropSprite(ctx, prop) {
        if (prop.sprite) {
            if (prop.type === 'tree') {
                ctx.drawImage(
                    prop.sprite,
                    prop.x - prop.width / 2,
                    prop.y - prop.height / 2,
                    prop.width,
                    prop.height
                );
            } else if (prop.type === 'rock') {
                ctx.drawImage(prop.sprite, prop.originX, prop.originY, prop.width, prop.height);
            }
        } else {
            // Fallback
            if (prop.type === 'tree') {
                ctx.beginPath();
                ctx.arc(prop.x, prop.y, prop.width / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#1a4d2e';
                ctx.fill();
            }
        }
    }

    /**
     * Render road/bridge
     */
    renderRoad(ctx, x, y, width, height) {
        const zoom = this.game.camera.zoom || 1;

        // --- 1. THE UNDER-STRUCTURE (Arches in the water) ---
        // This adds massive depth, making it feel like a real bridge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const archWidth = width / 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(x + (i + 0.5) * archWidth, y + height, archWidth * 0.4, 20 * zoom, 0, 0, Math.PI, true);
            ctx.fill();
        }

        // --- 2. DEEP SHADOW ---
        ctx.shadowBlur = 20 * zoom;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 10 * zoom, y + 10 * zoom, width, height);
        ctx.shadowBlur = 0;

        // --- 3. MAIN DECK (Horizontal Planks Focus) ---
        // Base Teak Gradient
        const deckGrad = ctx.createLinearGradient(x, y, x, y + height);
        deckGrad.addColorStop(0, '#2b1d16');
        deckGrad.addColorStop(0.5, '#4e342e');
        deckGrad.addColorStop(1, '#2b1d16');
        ctx.fillStyle = deckGrad;
        ctx.fillRect(x, y, width, height);

        // Individual Horizontal Planks
        const plankSize = 18 * zoom;
        for (let px = 0; px < width; px += plankSize) {
            const seed = x + px;
            const pWidth = plankSize - (1.5 * zoom);

            // Randomize plank color slightly for "hand-made" feel
            const shade = (this.pseudoRandom(seed) % 30) - 15;
            ctx.fillStyle = `rgb(${93 + shade}, ${64 + shade}, ${55 + shade})`;
            ctx.fillRect(x + px, y + 2 * zoom, pWidth, height - 4 * zoom);

            // Fine Grain Detail
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath();
            ctx.moveTo(x + px + 4 * zoom, y + 10 * zoom);
            ctx.lineTo(x + px + 4 * zoom, y + height - 10 * zoom);
            ctx.stroke();

            // Iron Nails/Bolts
            ctx.fillStyle = '#1a1a1a';
            const nailY1 = y + height * 0.15;
            const nailY2 = y + height * 0.85;
            ctx.beginPath();
            ctx.arc(x + px + pWidth / 2, nailY1, 1.2 * zoom, 0, Math.PI * 2);
            ctx.arc(x + px + pWidth / 2, nailY2, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- 4. ORNATE SIDE BALUSTRADES (Left-Right Rails) ---
        const railHeight = 14 * zoom;
        const balusterSpacing = 22 * zoom;

        // Rail Frames
        const railColor = '#3e2723';
        ctx.fillStyle = railColor;
        ctx.fillRect(x, y - railHeight / 2, width, railHeight); // Top Rail
        ctx.fillRect(x, y + height - railHeight / 2, width, railHeight); // Bottom Rail

        // Balusters (The decorative vertical posts on rails)
        for (let bx = 0; bx <= width; bx += balusterSpacing) {
            this.drawRoyalBaluster(ctx, x + bx, y, zoom);
            this.drawRoyalBaluster(ctx, x + bx, y + height, zoom);
        }

        // --- 5. THE "KRANOK" GOLDEN ORNAMENTS ---
        // Special Thai patterns at the center of the rails
        this.drawKranokOrnament(ctx, x + width / 2, y, zoom);
        this.drawKranokOrnament(ctx, x + width / 2, y + height, zoom);

        // --- 6. MASTER CORNER COLUMNS (Imperial Style) ---
        this.drawImperialPost(ctx, x, y, zoom);
        this.drawImperialPost(ctx, x + width, y, zoom);
        this.drawImperialPost(ctx, x, y + height, zoom);
        this.drawImperialPost(ctx, x + width, y + height, zoom);

        // Final Polish: Edge highlighting
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }

    /**
     * Royal Thai Baluster with curve
     */
    drawRoyalBaluster(ctx, x, y, zoom) {
        const w = 8 * zoom;
        const h = 20 * zoom;
        ctx.save();
        ctx.translate(x, y);

        // Body
        ctx.fillStyle = '#1b110c';
        ctx.fillRect(-w / 2, -h / 2, w, h);

        // Golden Band
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(-w / 2, -2 * zoom, w, 4 * zoom);

        ctx.restore();
    }

    /**
     * Traditional Kranok pattern (simplified for Canvas)
     */
    drawKranokOrnament(ctx, x, y, zoom) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#f1c40f';

        // Symmetrical Flame Pattern
        for (let i = -1; i <= 1; i += 2) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(10 * i * zoom, -15 * zoom, 25 * i * zoom, -5 * zoom, 5 * i * zoom, 5 * zoom);
            ctx.fill();
        }

        // Center Jewel
        ctx.beginPath();
        ctx.arc(0, 0, 4 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c'; // Ruby red center
        ctx.fill();
        ctx.restore();
    }

    /**
     * The most elaborate corner post
     */
    drawImperialPost(ctx, x, y, zoom) {
        const size = 22 * zoom;
        ctx.save();
        ctx.translate(x, y);

        // 1. Column Base
        ctx.fillStyle = '#1b110c';
        ctx.fillRect(-size / 2, -size / 2, size, size);

        // 2. Tapered Middle
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(-size / 2 + 3 * zoom, -size / 2 - 5 * zoom, size - 6 * zoom, 10 * zoom);

        // 3. Golden "Thepphanom" style cap
        for (let i = 0; i < 4; i++) {
            const layerW = size * (1.2 - i * 0.25);
            const layerH = 4 * zoom;
            const yPos = -8 * zoom - (i * 4 * zoom);

            const g = ctx.createLinearGradient(-layerW / 2, 0, layerW / 2, 0);
            g.addColorStop(0, '#b8860b');
            g.addColorStop(0.5, '#f4d03f');
            g.addColorStop(1, '#b8860b');

            ctx.fillStyle = g;
            this.drawRoundedRect(ctx, -layerW / 2, yPos, layerW, layerH, 2 * zoom);
        }

        // 4. Top Flame (Tip)
        ctx.beginPath();
        ctx.moveTo(0, -35 * zoom);
        ctx.quadraticCurveTo(5 * zoom, -25 * zoom, 0, -20 * zoom);
        ctx.quadraticCurveTo(-5 * zoom, -25 * zoom, 0, -35 * zoom);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();

        ctx.restore();
    }

    /**
     * Utility for rounded rectangles
     */
    drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
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
