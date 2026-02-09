// ===================================
// RTS: ยุทธการไทย - Main Game Class v2
// Complete game engine with all features
// ===================================

import { Unit } from '../entities/Unit.js';
import { Building } from '../entities/Building.js';
import { InputHandler } from './Input.js';
import { Pathfinder } from './Pathfinder.js';
import { UnitRenderer } from './UnitRenderer.js';
import { TerrainRenderer } from './TerrainRenderer.js';
import { StoryCutscene } from './StoryCutscene.js';
import { BuildingSystem } from '../systems/BuildingSystem.js';
import { WorkerSystem } from '../systems/WorkerSystem.js';
import { MAPS, CURRENT_MAP, CAMPAIGN_MISSIONS } from '../data/maps.js';
import { UNIT_TYPES } from '../data/units.js';
import { spriteManager } from './SpriteManager.js';
import { FogOfWar } from './FogOfWar.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Screen elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainMenu = document.getElementById('main-menu');
        this.gameContainer = document.getElementById('game-container');
        this.pauseMenu = document.getElementById('pause-menu');
        this.resultScreen = document.getElementById('result-screen');

        // Game state
        this.state = 'loading'; // loading, menu, playing, paused, victory, defeat
        this.isPaused = false;
        this.gameSpeed = 1;
        this.gameTime = 0;

        // Settings
        this.settings = {
            volume: 70,
            cameraSpeed: 5,
            edgeScrollEnabled: true,
            debugMode: false,
            fogOfWarEnabled: true
        };

        // Fog of War
        this.fogOfWar = null;

        // Map data
        this.currentMap = MAPS[CURRENT_MAP];
        this.currentMissionId = CURRENT_MAP;
        this.mapWidth = this.currentMap.width;
        this.mapHeight = this.currentMap.height;

        // Camera
        this.camera = {
            x: this.currentMap.cameraStart?.x || 0,
            y: this.currentMap.cameraStart?.y || 0,
            width: 0,
            height: 0,
            zoom: 1
        };

        // Entities
        this.units = [];
        this.buildings = [];

        // Resources
        this.resources = {
            food: this.currentMap.startingResources?.food || 500,
            gold: this.currentMap.startingResources?.gold || 200,
            population: 0,
            maxPopulation: 20
        };

        // Stats
        this.stats = {
            enemyKills: 0,
            startTime: 0
        };

        // Control groups
        this.controlGroups = {};

        // Visual effects
        this.effects = [];
        this.damageNumbers = [];

        // Input handler
        this.input = null;

        // Pathfinding
        this.pathfinder = null;

        // Minimap
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas?.getContext('2d');

        // Renderers
        this.unitRenderer = new UnitRenderer(this);
        this.terrainRenderer = new TerrainRenderer(this);

        // Systems
        this.storyCutscene = new StoryCutscene(this);
        this.buildingSystem = new BuildingSystem(this);
        this.workerSystem = new WorkerSystem(this);

        // Mission Progress (localStorage)
        this.missionProgress = this.loadMissionProgress();

        // Timing
        this.lastTime = 0;

        this.init();
    }

    // Mission Progress System
    loadMissionProgress() {
        try {
            const saved = localStorage.getItem('yuttakarn_thai_progress');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load mission progress:', e);
        }
        // Default: only mission 1 unlocked
        return {
            white_elephant: {
                unlockedMission: 1,
                completedMissions: []
            }
        };
    }

    saveMissionProgress() {
        try {
            localStorage.setItem('yuttakarn_thai_progress', JSON.stringify(this.missionProgress));
            console.log('Mission progress saved:', this.missionProgress);
        } catch (e) {
            console.error('Failed to save mission progress:', e);
        }
    }

    getMissionNumber(missionId) {
        const match = missionId.match(/mission(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    isMissionUnlocked(missionId) {
        const missionNum = this.getMissionNumber(missionId);
        const campaignProgress = this.missionProgress[this.selectedCampaign || 'white_elephant'];
        return missionNum <= (campaignProgress?.unlockedMission || 1);
    }

    unlockNextMission() {
        const currentNum = this.getMissionNumber(this.currentMissionId);
        const campaignId = this.selectedCampaign || 'white_elephant';

        if (!this.missionProgress[campaignId]) {
            this.missionProgress[campaignId] = { unlockedMission: 1, completedMissions: [] };
        }

        // Mark current mission as completed
        if (!this.missionProgress[campaignId].completedMissions.includes(this.currentMissionId)) {
            this.missionProgress[campaignId].completedMissions.push(this.currentMissionId);
        }

        // Unlock next mission
        if (currentNum >= this.missionProgress[campaignId].unlockedMission) {
            this.missionProgress[campaignId].unlockedMission = currentNum + 1;
        }

        this.saveMissionProgress();
    }

    getNextMissionId() {
        const currentNum = this.getMissionNumber(this.currentMissionId);
        const nextNum = currentNum + 1;
        const nextMissionId = `campaign1_mission${nextNum}`;

        // Check if next mission exists
        if (MAPS[nextMissionId]) {
            return nextMissionId;
        }
        return null; // No more missions
    }

    updateMissionUI() {
        const missionCards = document.querySelectorAll('.mission-card');
        missionCards.forEach(card => {
            const missionId = card.dataset.mission;
            const isUnlocked = this.isMissionUnlocked(missionId);
            const campaignProgress = this.missionProgress[this.selectedCampaign || 'white_elephant'];
            const isCompleted = campaignProgress?.completedMissions?.includes(missionId);

            card.classList.toggle('locked', !isUnlocked);
            card.classList.toggle('completed', isCompleted);

            // Update status icon
            const statusEl = card.querySelector('.mission-status');
            if (statusEl) {
                if (!isUnlocked) {
                    statusEl.textContent = '🔒';
                } else if (isCompleted) {
                    statusEl.textContent = '✅';
                } else {
                    statusEl.textContent = '▶️';
                }
            }
        });
    }

    async init() {
        // Setup canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Show loading
        await this.showLoading();

        // Setup menu buttons
        this.setupMenuButtons();

        // Show main menu
        this.showMainMenu();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    async showLoading() {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');

        // Preload sprites
        if (loadingText) loadingText.textContent = 'กำลังโหลดหน่วยรบ...';
        await spriteManager.preloadAll();
        if (progressBar) progressBar.style.width = '15%';

        const steps = [
            { progress: 35, text: 'กำลังโหลดแผนที่...' },
            { progress: 55, text: 'กำลังสร้าง Pathfinding Grid...' },
            { progress: 75, text: 'กำลังเตรียม AI...' },
            { progress: 90, text: 'กำลังเตรียมเสียง...' },
            { progress: 100, text: 'พร้อมเล่น!' }
        ];

        for (const step of steps) {
            await this.delay(250);
            if (progressBar) progressBar.style.width = step.progress + '%';
            if (loadingText) loadingText.textContent = step.text;
        }

        await this.delay(400);
    }

    showMainMenu() {
        this.state = 'menu';
        this.loadingScreen?.classList.add('hidden');
        this.mainMenu?.classList.remove('hidden');
        this.gameContainer?.classList.add('hidden');
    }

    setupMenuButtons() {
        // Main menu buttons
        const btnStart = document.getElementById('btn-start');
        const btnNewGame = document.getElementById('btn-newgame');
        const btnSettings = document.getElementById('btn-settings');
        const btnAbout = document.getElementById('btn-about');

        btnStart?.addEventListener('click', () => this.showCampaignSelection());
        btnNewGame?.addEventListener('click', () => this.showCampaignSelection());

        btnSettings?.addEventListener('click', () => {
            document.getElementById('settings-modal')?.classList.remove('hidden');
        });

        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.saveSettings();
            document.getElementById('settings-modal')?.classList.add('hidden');
        });

        btnAbout?.addEventListener('click', () => {
            document.getElementById('about-modal')?.classList.remove('hidden');
        });

        document.getElementById('close-about')?.addEventListener('click', () => {
            document.getElementById('about-modal')?.classList.add('hidden');
        });

        // Campaign selection
        document.getElementById('close-campaign')?.addEventListener('click', () => {
            document.getElementById('campaign-modal')?.classList.add('hidden');
        });

        // Campaign play buttons (only unlocked)
        document.querySelectorAll('.campaign-card.unlocked .campaign-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.campaign-card');
                const campaignId = card?.dataset.campaign;
                this.selectCampaign(campaignId);
            });
        });

        // Tutorial modal
        document.getElementById('close-tutorial')?.addEventListener('click', () => {
            document.getElementById('tutorial-modal')?.classList.add('hidden');
            this.startGame();
        });

        // Mission modal
        const missionCards = document.querySelectorAll('.mission-card');
        missionCards.forEach(card => {
            card.addEventListener('click', () => {
                const missionId = card?.dataset.mission;
                this.selectMission(missionId);
            });
        });

        document.getElementById('close-mission')?.addEventListener('click', () => {
            document.getElementById('mission-modal')?.classList.add('hidden');
            document.getElementById('campaign-modal')?.classList.remove('hidden');
        });

        // Pause menu buttons
        document.getElementById('btn-pause')?.addEventListener('click', () => this.togglePause());
        document.getElementById('btn-menu')?.addEventListener('click', () => this.togglePause());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePause());
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveGame());
        document.getElementById('btn-restart')?.addEventListener('click', () => this.restartGame());
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMenu());

        // Result screen
        document.getElementById('btn-play-again')?.addEventListener('click', () => this.restartGame());
        document.getElementById('btn-to-menu')?.addEventListener('click', () => this.quitToMenu());

        // Speed button
        document.getElementById('btn-speed')?.addEventListener('click', () => this.toggleSpeed());

        // Next mission button
        document.getElementById('btn-next-mission')?.addEventListener('click', () => this.playNextMission());

        // Command buttons
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                this.executeCommand(cmd);
            });
        });

        // Settings sliders
        document.getElementById('volume-slider')?.addEventListener('input', (e) => {
            document.getElementById('volume-value').textContent = e.target.value + '%';
        });

        document.getElementById('camera-speed')?.addEventListener('input', (e) => {
            document.getElementById('camera-value').textContent = e.target.value;
        });
    }

    showCampaignSelection() {
        document.getElementById('campaign-modal')?.classList.remove('hidden');
    }

    selectCampaign(campaignId) {
        console.log('Selected campaign:', campaignId);
        this.selectedCampaign = campaignId;

        // Hide campaign modal, show mission modal for white elephant
        document.getElementById('campaign-modal')?.classList.add('hidden');

        if (campaignId === 'white_elephant') {
            // Update UI to show locked/unlocked missions
            this.updateMissionUI();
            // Show mission selection
            document.getElementById('mission-modal')?.classList.remove('hidden');
        } else {
            // For other campaigns, play story then tutorial
            this.storyCutscene.play(campaignId, () => {
                document.getElementById('tutorial-modal')?.classList.remove('hidden');
            });
        }
    }

    selectMission(missionId) {
        console.log('Selected mission:', missionId);

        // Check if mission is unlocked
        if (!this.isMissionUnlocked(missionId)) {
            console.log('Mission locked:', missionId);
            return; // Don't allow selecting locked missions
        }

        // Load the selected map
        if (MAPS[missionId]) {
            this.currentMissionId = missionId;
            this.currentMap = MAPS[missionId];
            this.mapWidth = this.currentMap.width;
            this.mapHeight = this.currentMap.height;
        }

        // Hide mission modal
        document.getElementById('mission-modal')?.classList.add('hidden');

        // Play story cutscene, then show tutorial
        this.storyCutscene.play(this.selectedCampaign, () => {
            document.getElementById('tutorial-modal')?.classList.remove('hidden');
        });
    }

    saveSettings() {
        this.settings.volume = parseInt(document.getElementById('volume-slider')?.value || 70);
        this.settings.cameraSpeed = parseInt(document.getElementById('camera-speed')?.value || 5);
        this.settings.edgeScrollEnabled = document.getElementById('edge-scroll')?.checked ?? true;
        this.settings.debugMode = document.getElementById('debug-mode')?.checked ?? false;

        if (this.input) {
            this.input.settings.edgeScrollEnabled = this.settings.edgeScrollEnabled;
            this.input.settings.cameraSpeed = this.settings.cameraSpeed;
        }
    }

    startGame() {
        this.state = 'playing';
        this.mainMenu?.classList.add('hidden');
        this.gameContainer?.classList.remove('hidden');
        this.pauseMenu?.classList.add('hidden');
        this.resultScreen?.classList.add('hidden');

        // Reset game
        this.units = [];
        this.buildings = [];
        this.effects = [];
        this.damageNumbers = [];
        this.gameTime = 0;
        this.stats.enemyKills = 0;
        this.stats.startTime = Date.now();

        // Reset resources
        this.resources.food = this.currentMap.startingResources?.food || 500;
        this.resources.gold = this.currentMap.startingResources?.gold || 200;

        // Initialize pathfinding
        this.pathfinder = new Pathfinder(this);
        this.pathfinder.initGrid(this.mapWidth, this.mapHeight, this.currentMap.features || []);

        // Initialize Fog of War if enabled for this map
        if (this.currentMap.fogOfWar !== false && this.settings.fogOfWarEnabled) {
            this.fogOfWar = new FogOfWar(this.mapWidth, this.mapHeight, 32);
        } else {
            this.fogOfWar = null;
        }

        // Spawn units and buildings
        this.spawnUnits();
        this.spawnBuildings();

        // Setup input
        if (!this.input) {
            this.input = new InputHandler(this);
        }
        this.input.settings.edgeScrollEnabled = this.settings.edgeScrollEnabled;
        this.input.settings.cameraSpeed = this.settings.cameraSpeed;

        // --- Final Camera Initialization ---
        // 1. Force resize to get correct dimensions
        this.resizeCanvas();

        // 2. Determine target center position (prioritize player group)
        let targetCenterX = this.mapWidth / 2;
        let targetCenterY = this.mapHeight / 2;

        const playerUnits = this.units.filter(u => u.team === 0);
        if (playerUnits.length > 0) {
            // Calculate center of player group
            targetCenterX = playerUnits.reduce((sum, u) => sum + u.x, 0) / playerUnits.length;
            targetCenterY = playerUnits.reduce((sum, u) => sum + u.y, 0) / playerUnits.length;
        } else if (this.currentMap.cameraStart) {
            // Fallback to map defined position (shifted from top-left to center focus)
            targetCenterX = this.currentMap.cameraStart.x + (this.camera.width / 2);
            targetCenterY = this.currentMap.cameraStart.y + (this.camera.height / 2);
        }

        // 3. Set camera based on center position and current viewport size
        const zoom = 1;
        this.camera.zoom = zoom;

        // Use window properties if camera.width is still 0
        const viewW = this.camera.width || window.innerWidth;
        const viewH = this.camera.height || window.innerHeight;

        this.camera.x = targetCenterX - (viewW / (2 * zoom));
        this.camera.y = targetCenterY - (viewH / (2 * zoom));

        // 4. Clamp to bounds immediately
        const maxX = this.mapWidth - (viewW / zoom);
        const maxY = this.mapHeight - (viewH / zoom);
        this.camera.x = Math.max(0, Math.min(maxX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxY, this.camera.y));

        // 5. Reset mouse safety and start game loop
        if (this.input) {
            this.input.mouseMoved = false;
        }

        this.lastTime = performance.now();
        requestAnimationFrame((time) => {
            // Re-apply camera center in the first frame to handle potential late canvas resizing
            if (playerUnits.length > 0) {
                const viewW = this.camera.width || window.innerWidth;
                const viewH = this.camera.height || window.innerHeight;
                this.camera.x = targetCenterX - (viewW / (2 * zoom));
                this.camera.y = targetCenterY - (viewH / (2 * zoom));
                this.camera.x = Math.max(0, Math.min(maxX, this.camera.x));
                this.camera.y = Math.max(0, Math.min(maxY, this.camera.y));
            }
            this.gameLoop(time);
        });
    }

    spawnUnits() {
        const map = this.currentMap;

        // Spawn player units
        if (map.playerUnits) {
            for (const data of map.playerUnits) {
                const unit = new Unit(this, data.type, data.x, data.y, data.team);
                this.units.push(unit);
            }
        }

        // Spawn enemy units
        if (map.enemyUnits) {
            for (const data of map.enemyUnits) {
                const unit = new Unit(this, data.type, data.x, data.y, data.team);
                this.units.push(unit);
            }
        }

        // Count population
        this.resources.population = this.units.filter(u => u.team === 0).length;
    }

    spawnBuildings() {
        const map = this.currentMap;

        if (map.buildings) {
            for (const data of map.buildings) {
                const building = new Building(this, data.type, data.x, data.y, data.team);
                this.buildings.push(building);

                // Add building to pathfinding grid
                if (this.pathfinder) {
                    this.pathfinder.addBuildingObstacle(building);
                }
            }
        }
    }

    spawnUnit(typeId, x, y, team) {
        const unit = new Unit(this, typeId, x, y, team);
        this.units.push(unit);
        return unit;
    }

    gameLoop(currentTime) {
        if (this.state !== 'playing' && this.state !== 'paused') return;

        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1) * this.gameSpeed;
        this.lastTime = currentTime;

        if (!this.isPaused) {
            this.update(deltaTime);
        }

        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;

        // Update input/camera
        this.input.update(deltaTime);

        // Update units
        for (const unit of this.units) {
            unit.update(deltaTime);
        }

        // Update buildings
        for (const building of this.buildings) {
            building.update(deltaTime);
        }

        // Update training queue UI if a building is selected
        if (this.selectedBuilding && this.selectedBuilding.builds) {
            this.updateTrainingQueue(this.selectedBuilding);
        }

        // Update Fog of War
        if (this.fogOfWar) {
            const playerUnits = this.units.filter(u => u.team === 0 && u.state !== 'dead');
            const playerBuildings = this.buildings.filter(b => b.team === 0);
            this.fogOfWar.update(playerUnits, playerBuildings, this.currentMap.features || []);
        }

        // Update effects
        this.updateEffects(deltaTime);

        // Update HUD
        this.updateHUD();

        // Check victory/defeat
        this.checkGameEnd();

        // Generate resources
        this.generateResources(deltaTime);
    }

    generateResources(deltaTime) {
        // Passive resource generation
        this.resources.food += 2 * deltaTime;
        this.resources.gold += 1 * deltaTime;
    }

    render() {
        const ctx = this.ctx;
        const zoom = this.camera.zoom;

        // Clear canvas
        ctx.fillStyle = this.currentMap.terrain.grass;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transform
        ctx.save();

        // Render terrain with new TerrainRenderer (Ground + Features + Decals)
        this.terrainRenderer.renderTerrain(ctx, this.camera, this.currentMap);

        // Render buildings (filter by fog visibility for enemy buildings)
        for (const building of this.buildings) {
            if (building.team !== 0 && this.fogOfWar && !this.fogOfWar.isVisible(building.x, building.y)) {
                continue; // Skip enemy buildings in fog
            }
            building.render(ctx, this.camera);
        }

        // Filter units for fog of war visibility
        let visibleUnits = this.units;
        if (this.fogOfWar) {
            visibleUnits = this.units.filter(u => {
                if (u.team === 0) return true; // Always show player units
                return this.fogOfWar.isVisible(u.x, u.y);
            });
        }

        // Render units with new UnitRenderer (Shadows + Y-sorted + Animations)
        this.unitRenderer.renderUnits(ctx, visibleUnits, this.camera);

        // Render Fog of War overlay
        if (this.fogOfWar) {
            this.fogOfWar.render(ctx, this.camera);
        }

        // Render effects
        this.renderEffects(ctx);

        // Render damage numbers
        this.renderDamageNumbers(ctx);

        // Debug: render pathfinding grid
        if (this.settings.debugMode && this.pathfinder) {
            this.pathfinder.renderDebug(ctx, this.camera);
        }

        ctx.restore();

        // Render selection box (screen space)
        if (this.input) {
            this.input.renderSelectionBox(ctx);
        }

        // Render minimap
        this.renderMinimap();
    }

    renderTerrain(ctx) {
        const features = this.currentMap.features || [];
        const zoom = this.camera.zoom;

        for (const feature of features) {
            const screenX = (feature.x - this.camera.x) * zoom;
            const screenY = (feature.y - this.camera.y) * zoom;
            const width = feature.width * zoom;
            const height = feature.height * zoom;

            // Skip if off screen
            if (screenX + width < 0 || screenX > this.camera.width ||
                screenY + height < 0 || screenY > this.camera.height) {
                continue;
            }

            ctx.fillStyle = this.currentMap.terrain[feature.type] || '#888';
            ctx.fillRect(screenX, screenY, width, height);

            // Add patterns for visual interest
            if (feature.type === 'forest') {
                // Draw tree pattern
                const treeCount = Math.floor((feature.width * feature.height) / 4000);
                ctx.fillStyle = '#1a4d2e';
                for (let i = 0; i < treeCount; i++) {
                    const tx = screenX + (Math.sin(i * 7.3) * 0.5 + 0.5) * width;
                    const ty = screenY + (Math.cos(i * 5.7) * 0.5 + 0.5) * height;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 10 * zoom, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (feature.type === 'water') {
                // Add wave effect
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                const waveOffset = (this.gameTime * 30) % 50;
                for (let i = 0; i < height; i += 50) {
                    const wy = screenY + i + waveOffset;
                    if (wy < screenY + height) {
                        ctx.fillRect(screenX, wy, width, 3 * zoom);
                    }
                }
            } else if (feature.type === 'mountain') {
                // Mountain texture
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(screenX, screenY, width * 0.3, height);
            }
        }
    }

    renderMinimap() {
        if (!this.minimapCtx) return;

        const ctx = this.minimapCtx;
        const scaleX = this.minimapCanvas.width / this.mapWidth;
        const scaleY = this.minimapCanvas.height / this.mapHeight;

        // Background
        ctx.fillStyle = this.currentMap.terrain.grass;
        ctx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);

        // Features
        for (const feature of (this.currentMap.features || [])) {
            ctx.fillStyle = this.currentMap.terrain[feature.type] || '#888';
            ctx.fillRect(
                feature.x * scaleX,
                feature.y * scaleY,
                feature.width * scaleX,
                feature.height * scaleY
            );
        }

        // Buildings
        for (const building of this.buildings) {
            ctx.fillStyle = building.team === 0 ? '#d4af37' : '#7f1d1d';
            ctx.fillRect(building.x * scaleX - 3, building.y * scaleY - 3, 6, 6);
        }

        // Units
        for (const unit of this.units) {
            if (unit.state === 'dead') continue;
            ctx.fillStyle = unit.team === 0 ? '#27ae60' : '#c0392b';
            ctx.fillRect(unit.x * scaleX - 2, unit.y * scaleY - 2, 4, 4);
        }

        // Camera viewport
        ctx.strokeStyle = '#f4d03f';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            this.camera.x * scaleX,
            this.camera.y * scaleY,
            (this.camera.width / this.camera.zoom) * scaleX,
            (this.camera.height / this.camera.zoom) * scaleY
        );
    }

    updateHUD() {
        // Resources
        const foodEl = document.getElementById('res-food');
        const goldEl = document.getElementById('res-gold');
        const popEl = document.getElementById('res-pop');

        if (foodEl) foodEl.textContent = Math.floor(this.resources.food);
        if (goldEl) goldEl.textContent = Math.floor(this.resources.gold);

        const playerUnits = this.units.filter(u => u.team === 0 && u.state !== 'dead').length;
        if (popEl) popEl.textContent = `${playerUnits}/${this.resources.maxPopulation}`;

        // Timer
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const timeEl = document.getElementById('game-time');
        if (timeEl) {
            timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Enemy count
        const enemyCount = this.units.filter(u => u.team !== 0 && u.state !== 'dead').length;
        const enemyEl = document.getElementById('enemy-count');
        if (enemyEl) enemyEl.textContent = enemyCount;
    }

    updateUnitPanel() {
        const selected = this.getSelectedUnits();

        if (selected.length === 0) {
            document.getElementById('unit-portrait').innerHTML = '<span>?</span>';
            document.getElementById('unit-name').textContent = 'ไม่ได้เลือกหน่วย';
            document.getElementById('unit-hp-text').textContent = '-';
            document.getElementById('unit-hp-bar').style.width = '0%';
            document.getElementById('unit-atk').textContent = '-';
            document.getElementById('unit-def').textContent = '-';
            document.getElementById('selected-count').textContent = '';
        } else if (selected.length === 1) {
            const unit = selected[0];
            document.getElementById('unit-portrait').innerHTML = `<span>${unit.icon}</span>`;
            document.getElementById('unit-name').textContent = unit.name;
            document.getElementById('unit-hp-text').textContent = `${Math.round(unit.hp)}/${unit.maxHp}`;
            document.getElementById('unit-hp-bar').style.width = `${(unit.hp / unit.maxHp) * 100}%`;
            document.getElementById('unit-atk').textContent = unit.attack;
            document.getElementById('unit-def').textContent = unit.defense;
            document.getElementById('selected-count').textContent = '';
        } else {
            document.getElementById('unit-portrait').innerHTML = `<span>👥</span>`;
            document.getElementById('unit-name').textContent = 'หลายหน่วย';

            const totalHp = selected.reduce((sum, u) => sum + u.hp, 0);
            const totalMaxHp = selected.reduce((sum, u) => sum + u.maxHp, 0);
            document.getElementById('unit-hp-text').textContent = `${Math.round(totalHp)}/${totalMaxHp}`;
            document.getElementById('unit-hp-bar').style.width = `${(totalHp / totalMaxHp) * 100}%`;
            document.getElementById('unit-atk').textContent = '-';
            document.getElementById('unit-def').textContent = '-';
            document.getElementById('selected-count').textContent = `เลือก ${selected.length} หน่วย`;
        }
    }

    updateBuildingPanel(building) {
        this.selectedBuilding = building;

        document.getElementById('unit-portrait').innerHTML = `<span>${building.icon}</span>`;
        document.getElementById('unit-name').textContent = building.name;
        document.getElementById('unit-hp-text').textContent = `${Math.round(building.hp)}/${building.maxHp}`;
        document.getElementById('unit-hp-bar').style.width = `${(building.hp / building.maxHp) * 100}%`;
        document.getElementById('unit-atk').textContent = building.attack ? building.attack : '-';
        document.getElementById('unit-def').textContent = '-';
        document.getElementById('selected-count').textContent = '';

        // Show training panel if building can produce units
        const trainingPanel = document.getElementById('training-panel');
        const trainingGrid = document.getElementById('training-grid');

        if (building.builds && building.builds.length > 0 && building.team === 0) {
            trainingPanel?.classList.remove('hidden');

            // Clear and populate training grid
            if (trainingGrid) {
                trainingGrid.innerHTML = '';

                building.builds.forEach(unitTypeId => {
                    const unitKey = unitTypeId.toUpperCase();
                    const unitData = UNIT_TYPES[unitKey];

                    if (!unitData) return;

                    const cost = unitData.cost || { food: 50, gold: 0 };
                    const buildTime = unitData.buildTime || 5;
                    const canAfford = this.resources.food >= cost.food && this.resources.gold >= cost.gold;

                    const btn = document.createElement('button');
                    btn.className = `train-btn ${canAfford ? '' : 'disabled'}`;
                    btn.innerHTML = `
                        <span class="unit-icon">${unitData.icon}</span>
                        <span class="unit-name">${unitData.name}</span>
                        <span class="unit-cost ${canAfford ? '' : 'insufficient'}">🍖${cost.food} 🪙${cost.gold}</span>
                        <span class="build-time">⏱️ ${buildTime}s</span>
                    `;
                    btn.onclick = () => this.trainUnit(building, unitTypeId);
                    trainingGrid.appendChild(btn);
                });
            }

            // Update queue display
            this.updateTrainingQueue(building);
        } else {
            trainingPanel?.classList.add('hidden');
        }
    }

    trainUnit(building, unitTypeId) {
        console.log('trainUnit called:', unitTypeId, 'on building:', building.name);
        const unitKey = unitTypeId.toUpperCase();
        const unitData = UNIT_TYPES[unitKey];

        if (!unitData) {
            console.log('Unit data not found for:', unitKey);
            return;
        }

        const cost = unitData.cost || { food: 50, gold: 0 };

        // Check resources
        if (this.resources.food < cost.food || this.resources.gold < cost.gold) {
            console.log('Not enough resources');
            return;
        }

        // Deduct resources
        this.resources.food -= cost.food;
        this.resources.gold -= cost.gold;
        this.updateHUD();

        // Add to production queue
        building.productionQueue.push({
            type: unitTypeId,
            buildTime: unitData.buildTime || 5,
            icon: unitData.icon
        });

        // Update UI
        this.updateTrainingQueue(building);
        this.updateBuildingPanel(building);

        console.log(`Training ${unitData.name}`);
    }

    onUnitTrainingComplete(unit, building) {
        // Auto-select newly trained unit
        this.clearSelection();
        unit.selected = true;
        this.updateUnitPanel();

        // Create visual effect at spawn location
        this.createCommandEffect(unit.x, unit.y, 'spawn');

        // Log completion
        console.log(`Unit ${unit.name} training complete at ${building.name}`);
    }

    updateTrainingQueue(building) {
        const queueItems = document.getElementById('queue-items');
        const progressContainer = document.getElementById('training-progress-container');
        const progressBar = document.getElementById('training-progress-bar');
        const progressText = document.getElementById('training-progress-text');

        if (!queueItems) return;

        queueItems.innerHTML = '';

        building.productionQueue.forEach((item, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = `queue-item ${index === 0 ? 'active' : ''}`;
            queueItem.textContent = item.icon || '⚔️';
            queueItems.appendChild(queueItem);
        });

        // Show/update progress bar
        if (building.productionQueue.length > 0 && progressContainer && progressBar && progressText) {
            progressContainer.classList.remove('hidden');
            const currentItem = building.productionQueue[0];
            const progress = (building.productionProgress / currentItem.buildTime) * 100;
            progressBar.style.width = `${progress}%`;
            const remaining = Math.ceil(currentItem.buildTime - building.productionProgress);
            progressText.textContent = `กำลังฝึก... ${remaining}s`;
        } else if (progressContainer) {
            progressContainer.classList.add('hidden');
        }
    }

    getSelectedUnits() {
        return this.units.filter(u => u.selected && u.state !== 'dead');
    }

    clearSelection() {
        for (const unit of this.units) {
            unit.selected = false;
        }
        for (const building of this.buildings) {
            building.selected = false;
        }

        // Hide training panel
        this.selectedBuilding = null;
        document.getElementById('training-panel')?.classList.add('hidden');
    }

    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }

    removeBuilding(building) {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }
    }

    // Control groups
    assignControlGroup(num) {
        this.controlGroups[num] = this.getSelectedUnits().map(u => u.id);
    }

    selectControlGroup(num) {
        const ids = this.controlGroups[num];
        if (!ids || ids.length === 0) return;

        this.clearSelection();
        for (const unit of this.units) {
            if (ids.includes(unit.id)) {
                unit.selected = true;
            }
        }
        this.updateUnitPanel();
    }

    createCommandEffect(x, y, type) {
        this.effects.push({
            x, y, type,
            radius: 0,
            maxRadius: 35,
            alpha: 1,
            time: 0
        });
    }

    createDamageNumber(x, y, damage) {
        this.damageNumbers.push({
            x, y,
            damage,
            time: 0,
            duration: 1.2
        });
    }

    updateEffects(deltaTime) {
        // Command effects
        this.effects = this.effects.filter(e => {
            e.time += deltaTime;
            e.radius = e.maxRadius * Math.min(1, e.time * 3);
            e.alpha = 1 - e.time;
            return e.alpha > 0;
        });

        // Damage numbers
        this.damageNumbers = this.damageNumbers.filter(d => {
            d.time += deltaTime;
            d.y -= 40 * deltaTime;
            return d.time < d.duration;
        });
    }

    renderEffects(ctx) {
        const zoom = this.camera.zoom;

        for (const effect of this.effects) {
            const screenX = (effect.x - this.camera.x) * zoom;
            const screenY = (effect.y - this.camera.y) * zoom;

            ctx.beginPath();
            ctx.arc(screenX, screenY, effect.radius * zoom, 0, Math.PI * 2);
            ctx.strokeStyle = effect.type === 'attack'
                ? `rgba(192, 57, 43, ${effect.alpha})`
                : `rgba(212, 175, 55, ${effect.alpha})`;
            ctx.lineWidth = 3 * zoom;
            ctx.stroke();

            // Inner circle
            ctx.beginPath();
            ctx.arc(screenX, screenY, 5 * zoom, 0, Math.PI * 2);
            ctx.fillStyle = effect.type === 'attack'
                ? `rgba(192, 57, 43, ${effect.alpha})`
                : `rgba(212, 175, 55, ${effect.alpha})`;
            ctx.fill();
        }
    }

    renderDamageNumbers(ctx) {
        const zoom = this.camera.zoom;
        ctx.font = `bold ${18 * zoom}px Kanit`;
        ctx.textAlign = 'center';

        for (const d of this.damageNumbers) {
            const screenX = (d.x - this.camera.x) * zoom;
            const screenY = (d.y - this.camera.y) * zoom;
            const alpha = 1 - d.time / d.duration;

            ctx.fillStyle = `rgba(255, 80, 80, ${alpha})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.lineWidth = 3 * zoom;
            ctx.strokeText(`-${d.damage}`, screenX, screenY);
            ctx.fillText(`-${d.damage}`, screenX, screenY);
        }
    }

    checkGameEnd() {
        const playerUnits = this.units.filter(u => u.team === 0 && u.state !== 'dead');
        const enemyUnits = this.units.filter(u => u.team !== 0 && u.state !== 'dead');

        if (enemyUnits.length === 0 && playerUnits.length > 0) {
            this.showResult('victory');
        } else if (playerUnits.length === 0) {
            this.showResult('defeat');
        }
    }

    showResult(result) {
        this.state = result;
        this.resultScreen?.classList.remove('hidden');

        const title = document.getElementById('result-title');
        const desc = document.getElementById('result-desc');
        const icon = document.getElementById('result-icon');
        const nextMissionBtn = document.getElementById('btn-next-mission');

        if (result === 'victory') {
            // Unlock and save progress
            this.unlockNextMission();

            if (title) {
                title.textContent = 'ชัยชนะ!';
                title.className = '';
            }
            if (desc) desc.textContent = 'คุณปกป้องพระนครได้สำเร็จ!';
            if (icon) icon.textContent = '🏆';

            // Show next mission button if there's a next mission
            const nextMissionId = this.getNextMissionId();
            if (nextMissionBtn) {
                if (nextMissionId) {
                    nextMissionBtn.classList.remove('hidden');
                    nextMissionBtn.textContent = '➡️ ภารกิจถัดไป';
                } else {
                    nextMissionBtn.classList.add('hidden');
                }
            }
        } else {
            if (title) {
                title.textContent = 'พ่ายแพ้';
                title.className = 'defeat';
            }
            if (desc) desc.textContent = 'กองทัพถูกทำลาย...';
            if (icon) icon.textContent = '💀';

            // Hide next mission button on defeat
            if (nextMissionBtn) nextMissionBtn.classList.add('hidden');
        }

        // Stats
        const killsEl = document.getElementById('stat-kills');
        const timeEl = document.getElementById('stat-time');
        const survivorsEl = document.getElementById('stat-survivors');

        if (killsEl) killsEl.textContent = this.stats.enemyKills;

        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        if (timeEl) {
            timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        const survivors = this.units.filter(u => u.team === 0 && u.state !== 'dead').length;
        if (survivorsEl) survivorsEl.textContent = survivors;
    }

    playNextMission() {
        const nextMissionId = this.getNextMissionId();
        if (nextMissionId) {
            this.resultScreen?.classList.add('hidden');
            this.selectMission(nextMissionId);
        }
    }

    togglePause() {
        if (this.state === 'victory' || this.state === 'defeat') return;

        this.isPaused = !this.isPaused;
        this.pauseMenu?.classList.toggle('hidden', !this.isPaused);
    }

    toggleSpeed() {
        const speeds = [1, 2, 3];
        const currentIndex = speeds.indexOf(this.gameSpeed);
        this.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
        const btn = document.getElementById('btn-speed');
        if (btn) btn.textContent = `${this.gameSpeed}x`;
    }

    executeCommand(cmd) {
        const selected = this.getSelectedUnits();

        switch (cmd) {
            case 'stop':
                for (const unit of selected) {
                    unit.stop();
                }
                break;
            case 'hold':
                for (const unit of selected) {
                    unit.holdPosition();
                }
                break;
        }
    }

    saveGame() {
        const saveData = {
            gameTime: this.gameTime,
            resources: this.resources,
            stats: this.stats,
            units: this.units.map(u => ({
                typeId: u.typeId,
                x: u.x,
                y: u.y,
                hp: u.hp,
                team: u.team
            }))
        };

        localStorage.setItem('rts_yutthakan_save', JSON.stringify(saveData));
        alert('บันทึกเกมสำเร็จ!');
    }

    restartGame() {
        this.isPaused = false;
        this.pauseMenu?.classList.add('hidden');
        this.resultScreen?.classList.add('hidden');
        this.startGame();
    }

    quitToMenu() {
        this.state = 'menu';
        this.isPaused = false;
        this.pauseMenu?.classList.add('hidden');
        this.resultScreen?.classList.add('hidden');
        this.showMainMenu();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
