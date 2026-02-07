// ===================================
// RTS: ยุทธการไทย - Building System
// Warcraft-style building construction
// ===================================

import { BUILDING_TYPES } from '../data/units.js';

export class BuildingSystem {
    constructor(game) {
        this.game = game;

        // Building placement state
        this.isPlacing = false;
        this.placingBuildingType = null;
        this.placementValid = false;
        this.placementX = 0;
        this.placementY = 0;

        // Construction queue
        this.constructionQueue = [];

        // Settings
        this.gridSize = 50;
        this.buildingSize = {
            small: 80,
            medium: 120,
            large: 160
        };
    }

    /**
     * Start placing a building
     */
    startPlacement(buildingTypeKey) {
        const buildingType = BUILDING_TYPES[buildingTypeKey];
        if (!buildingType) {
            console.warn('Unknown building type:', buildingTypeKey);
            return false;
        }

        // Check resources
        const cost = buildingType.cost || { food: 0, gold: 0 };
        if (this.game.resources.food < cost.food || this.game.resources.gold < cost.gold) {
            this.game.showMessage('ทรัพยากรไม่เพียงพอ!');
            return false;
        }

        this.isPlacing = true;
        this.placingBuildingType = buildingTypeKey;

        // Change cursor
        document.getElementById('game-canvas').style.cursor = 'crosshair';

        return true;
    }

    /**
     * Cancel building placement
     */
    cancelPlacement() {
        this.isPlacing = false;
        this.placingBuildingType = null;
        document.getElementById('game-canvas').style.cursor = 'default';
    }

    /**
     * Update placement position based on mouse
     */
    updatePlacement(worldX, worldY) {
        if (!this.isPlacing) return;

        // Snap to grid
        this.placementX = Math.round(worldX / this.gridSize) * this.gridSize;
        this.placementY = Math.round(worldY / this.gridSize) * this.gridSize;

        // Check if placement is valid
        this.placementValid = this.checkPlacementValid(this.placementX, this.placementY);
    }

    /**
     * Check if building can be placed at location
     */
    checkPlacementValid(x, y) {
        const buildingType = BUILDING_TYPES[this.placingBuildingType];
        if (!buildingType) return false;

        const size = this.buildingSize.medium;
        const halfSize = size / 2;

        // Check map bounds
        if (x - halfSize < 0 || x + halfSize > this.game.mapWidth ||
            y - halfSize < 0 || y + halfSize > this.game.mapHeight) {
            return false;
        }

        // Check collision with terrain features (water, mountain)
        for (const feature of (this.game.currentMap.features || [])) {
            if (feature.type === 'water' || feature.type === 'mountain') {
                if (this.rectsOverlap(
                    x - halfSize, y - halfSize, size, size,
                    feature.x, feature.y, feature.width, feature.height
                )) {
                    return false;
                }
            }
        }

        // Check collision with other buildings
        for (const building of this.game.buildings) {
            const bSize = building.width || 100;
            if (this.rectsOverlap(
                x - halfSize, y - halfSize, size, size,
                building.x - bSize / 2, building.y - bSize / 2, bSize, bSize
            )) {
                return false;
            }
        }

        // Check collision with units
        for (const unit of this.game.units) {
            if (!unit.isEnemy) {
                const dist = Math.hypot(unit.x - x, unit.y - y);
                if (dist < size / 2 + unit.size) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Place the building
     */
    placeBuilding() {
        if (!this.isPlacing || !this.placementValid) return false;

        const buildingType = BUILDING_TYPES[this.placingBuildingType];
        if (!buildingType) return false;

        // Deduct resources
        const cost = buildingType.cost || { food: 0, gold: 0 };
        this.game.resources.food -= cost.food;
        this.game.resources.gold -= cost.gold;

        // Create building (under construction)
        const building = {
            id: `building_${Date.now()}`,
            type: this.placingBuildingType,
            x: this.placementX,
            y: this.placementY,
            width: this.buildingSize.medium,
            height: this.buildingSize.medium,
            hp: buildingType.hp,
            maxHp: buildingType.hp,
            constructionProgress: 0,
            constructionTime: 10, // seconds
            isComplete: false,
            icon: buildingType.icon,
            name: buildingType.name,
            trainingQueue: [],
            selected: false,
            isEnemy: false
        };

        this.game.buildings.push(building);
        this.constructionQueue.push(building);

        // Reset placement state
        this.cancelPlacement();

        this.game.showMessage(`กำลังสร้าง ${buildingType.name}...`);

        return true;
    }

    /**
     * Update building construction progress
     */
    update(deltaTime) {
        for (const building of this.constructionQueue) {
            if (!building.isComplete) {
                building.constructionProgress += deltaTime / building.constructionTime;

                if (building.constructionProgress >= 1) {
                    building.constructionProgress = 1;
                    building.isComplete = true;
                    this.game.showMessage(`${building.name} สร้างเสร็จแล้ว!`);
                }
            }
        }

        // Remove completed buildings from queue
        this.constructionQueue = this.constructionQueue.filter(b => !b.isComplete);

        // Update training queues
        for (const building of this.game.buildings) {
            if (building.isComplete && building.trainingQueue.length > 0) {
                this.updateTrainingQueue(building, deltaTime);
            }
        }
    }

    /**
     * Update unit training queue
     */
    updateTrainingQueue(building, deltaTime) {
        const training = building.trainingQueue[0];
        if (!training) return;

        training.progress += deltaTime / training.buildTime;

        if (training.progress >= 1) {
            // Spawn unit
            this.spawnUnit(building, training.unitType);
            building.trainingQueue.shift();
        }
    }

    /**
     * Spawn unit from building
     */
    spawnUnit(building, unitTypeKey) {
        const { Unit } = require('../entities/Unit.js');
        const { UNIT_TYPES } = require('../data/units.js');

        const unitType = UNIT_TYPES[unitTypeKey.toUpperCase()];
        if (!unitType) return;

        // Find spawn position (near building)
        const angle = Math.random() * Math.PI * 2;
        const dist = building.width / 2 + 40;
        const spawnX = building.x + Math.cos(angle) * dist;
        const spawnY = building.y + Math.sin(angle) * dist;

        const unit = new Unit({
            ...unitType,
            x: spawnX,
            y: spawnY,
            isEnemy: false
        });

        this.game.units.push(unit);
        this.game.showMessage(`${unitType.name} พร้อมรบ!`);
    }

    /**
     * Add unit to training queue
     */
    trainUnit(building, unitTypeKey) {
        if (!building.isComplete) {
            this.game.showMessage('อาคารยังสร้างไม่เสร็จ!');
            return false;
        }

        const buildingType = BUILDING_TYPES[building.type];
        if (!buildingType.builds?.includes(unitTypeKey)) {
            this.game.showMessage('อาคารนี้ไม่สามารถฝึกหน่วยนี้ได้!');
            return false;
        }

        const { UNIT_TYPES } = require('../data/units.js');
        const unitType = UNIT_TYPES[unitTypeKey.toUpperCase()];
        if (!unitType) return false;

        // Check resources
        const cost = unitType.cost || { food: 0, gold: 0 };
        if (this.game.resources.food < cost.food || this.game.resources.gold < cost.gold) {
            this.game.showMessage('ทรัพยากรไม่เพียงพอ!');
            return false;
        }

        // Deduct resources
        this.game.resources.food -= cost.food;
        this.game.resources.gold -= cost.gold;

        // Add to queue
        building.trainingQueue.push({
            unitType: unitTypeKey,
            buildTime: unitType.buildTime || 5,
            progress: 0
        });

        this.game.showMessage(`เริ่มฝึก ${unitType.name}...`);
        return true;
    }

    /**
     * Render building placement preview
     */
    renderPlacement(ctx, camera) {
        if (!this.isPlacing) return;

        const buildingType = BUILDING_TYPES[this.placingBuildingType];
        if (!buildingType) return;

        const zoom = camera.zoom || 1;
        const screenX = (this.placementX - camera.x) * zoom;
        const screenY = (this.placementY - camera.y) * zoom;
        const size = this.buildingSize.medium * zoom;

        // Draw placement preview
        ctx.save();
        ctx.globalAlpha = 0.6;

        // Color based on validity
        if (this.placementValid) {
            ctx.fillStyle = 'rgba(39, 174, 96, 0.4)';
            ctx.strokeStyle = '#27ae60';
        } else {
            ctx.fillStyle = 'rgba(192, 57, 43, 0.4)';
            ctx.strokeStyle = '#c0392b';
        }

        // Draw building footprint
        ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);

        // Draw icon
        ctx.globalAlpha = 0.8;
        ctx.font = `${size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(buildingType.icon, screenX, screenY);

        ctx.restore();
    }

    // Helper: Check if two rectangles overlap
    rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
    }
}
