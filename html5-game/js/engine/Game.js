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
import { MAPS, CURRENT_MAP } from '../data/maps.js';
import { spriteManager } from './SpriteManager.js';

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
            debugMode: false
        };

        // Map data
        this.currentMap = MAPS[CURRENT_MAP];
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

        // Timing
        this.lastTime = 0;

        this.init();
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

        // Hide campaign modal
        document.getElementById('campaign-modal')?.classList.add('hidden');

        // Play story cutscene, then show tutorial
        this.storyCutscene.play(campaignId, () => {
            // After story, show tutorial
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

        // Spawn units and buildings
        this.spawnUnits();
        this.spawnBuildings();

        // Setup input
        if (!this.input) {
            this.input = new InputHandler(this);
        }
        this.input.settings.edgeScrollEnabled = this.settings.edgeScrollEnabled;
        this.input.settings.cameraSpeed = this.settings.cameraSpeed;

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
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

        // Render buildings
        for (const building of this.buildings) {
            building.render(ctx, this.camera);
        }

        // Render units with new UnitRenderer (Shadows + Y-sorted + Animations)
        this.unitRenderer.renderUnits(ctx, this.units, this.camera);

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
        document.getElementById('unit-portrait').innerHTML = `<span>${building.icon}</span>`;
        document.getElementById('unit-name').textContent = building.name;
        document.getElementById('unit-hp-text').textContent = `${Math.round(building.hp)}/${building.maxHp}`;
        document.getElementById('unit-hp-bar').style.width = `${(building.hp / building.maxHp) * 100}%`;
        document.getElementById('unit-atk').textContent = '-';
        document.getElementById('unit-def').textContent = '-';
        document.getElementById('selected-count').textContent = '';
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

        if (result === 'victory') {
            if (title) {
                title.textContent = 'ชัยชนะ!';
                title.className = '';
            }
            if (desc) desc.textContent = 'คุณปกป้องพระนครได้สำเร็จ!';
            if (icon) icon.textContent = '🏆';
        } else {
            if (title) {
                title.textContent = 'พ่ายแพ้';
                title.className = 'defeat';
            }
            if (desc) desc.textContent = 'กองทัพถูกทำลาย...';
            if (icon) icon.textContent = '💀';
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
