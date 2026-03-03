/**
 * Campaign 3: The Paknam Incident (วิกฤตการณ์ปากน้ำ พ.ศ. 2436)
 * Main Controller Class
 */

import { RiverMap } from './RiverMap.js';
import { NavalCombat } from './NavalCombat.js';
import { FortDefense } from './FortDefense.js';
import { ChainBarrier } from './ChainBarrier.js';
import { FrenchAI } from './FrenchAI.js';
import { PaknamCutscene } from './PaknamCutscene.js';

class Campaign3 {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.missionData = null;
        this.isRunning = false;
        this.isPaused = false;

        // Game State
        this.currentTime = 0;
        this.timeLimit = 900; // 15 นาที (900 วินาที)
        this.gameSpeed = 1;

        // Resources
        this.resources = {
            gold: 800,
            supplies: 500
        };

        // Objectives
        this.objectives = {
            survive: { completed: false, description: "อยู่รอดเป็นเวลา 15 นาที" },
            destroyInconstant: { completed: false, description: "ทำลายเรือ Inconstant" },
            destroyComete: { completed: false, description: "ทำลายเรือ Comète" },
            protectBangkok: { completed: true, description: "ป้องกันกรุงเทพฯ" }
        };

        // Game Objects
        this.fort = null;
        this.playerShips = [];
        this.frenchShips = [];
        this.chainBarriers = [];
        this.coastalSoldiers = [];
        this.projectiles = [];

        // Systems
        this.riverMap = null;
        this.navalCombat = null;
        this.fortDefense = null;
        this.chainBarrierSystem = null;
        this.frenchAI = null;
        this.cutscene = null;

        // UI
        this.uiElements = {};
        this.timerDisplay = null;
        this.resourceDisplay = null;

        // Flags
        this.introPlayed = false;
        this.missionComplete = false;
        this.missionFailed = false;
    }

    /**
     * Initialize Campaign 3
     */
    async init() {
        console.log("🚢 Initializing Campaign 3: The Paknam Incident");

        try {
            // Load mission data
            await this.loadMissionData();

            // Initialize systems
            this.initializeSystems();

            // Setup map
            await this.setupRiverMap();

            // Setup fort
            await this.setupFortPakknam();

            // Setup initial units
            this.setupInitialUnits();

            // Setup UI
            this.setupUI();

            // Play intro cutscene
            await this.playIntro();

            // Start game loop
            this.startGame();

            console.log("✅ Campaign 3 initialized successfully");
        } catch (error) {
            console.error("❌ Error initializing Campaign 3:", error);
            throw error;
        }
    }

    /**
     * Load mission configuration data
     */
    async loadMissionData() {
        // Default mission data (สามารถโหลดจาก JSON file ได้)
        this.missionData = {
            id: 3,
            title: "วิกฤตการณ์ปากน้ำ",
            titleEN: "The Paknam Incident",
            year: "พ.ศ. 2436 (1893)",
            difficulty: "Hard",
            timeLimit: 900,
            startingResources: {
                gold: 800,
                supplies: 500
            },
            enemyWaves: [
                { time: 0, ship: "Inconstant", position: "south" },
                { time: 120, ship: "Comète", position: "south" },
                { time: 300, ship: "TorpedoBoat", position: "south", count: 2 }
            ]
        };

        this.timeLimit = this.missionData.timeLimit;
        this.resources = { ...this.missionData.startingResources };
    }

    /**
     * Initialize game systems
     */
    initializeSystems() {
        // Initialize River Map
        this.riverMap = new RiverMap(this.game);

        // Initialize Naval Combat
        this.navalCombat = new NavalCombat(this.game);

        // Initialize Fort Defense
        this.fortDefense = new FortDefense(this.game);

        // Initialize Chain Barrier System
        this.chainBarrierSystem = new ChainBarrier(this.game);

        // Initialize French AI
        this.frenchAI = new FrenchAI(this.game, this);

        // Initialize Cutscene
        this.cutscene = new PaknamCutscene(this.game);
    }

    /**
     * Setup river map
     */
    async setupRiverMap() {
        console.log("️ Setting up river map...");

        const mapConfig = {
            width: 30,
            height: 40,
            riverWidth: 12,
            riverPath: "vertical",
            terrain: {
                water: "images/campain 3/terrain/river_water.png",
                bank: "images/campain 3/terrain/river_bank.png",
                mangrove: "images/campain 3/terrain/mangrove.png"
            }
        };

        await this.riverMap.generate(mapConfig);
        this.riverMap.render();
    }

    /**
     * Setup Fort Phra Chulachomklao
     */
    async setupFortPakknam() {
        console.log("🏰 Setting up Fort Phra Chulachomklao...");

        const fortConfig = {
            x: this.game.canvas.width / 2,
            y: this.game.canvas.height * 0.6,
            width: 200,
            height: 150,
            hp: 5000,
            maxHp: 5000,
            attack: 100,
            range: 300,
            fireRate: 2000, // ms
            sprite: "images/campain 3/buildings/fort_pakknam.png",
            batteries: [
                { x: -60, y: -40, angle: -30 },
                { x: 60, y: -40, angle: 30 },
                { x: 0, y: -60, angle: 0 }
            ]
        };

        this.fort = await this.fortDefense.createFort(fortConfig);
    }

    /**
     * Setup initial player units
     */
    setupInitialUnits() {
        console.log("⚔️ Setting up initial units...");

        // Create Siamese gunboats
        for (let i = 0; i < 3; i++) {
            const ship = this.navalCombat.createSiameseShip({
                x: this.game.canvas.width * 0.3 + (i * 80),
                y: this.game.canvas.height * 0.7,
                hp: 800,
                attack: 40,
                speed: 1.5
            });
            this.playerShips.push(ship);
        }

        // Create coastal soldiers
        for (let i = 0; i < 5; i++) {
            const soldier = this.navalCombat.createCoastalSoldier({
                x: this.game.canvas.width * 0.2 + (i * 100),
                y: this.game.canvas.height * 0.55,
                hp: 100,
                attack: 15
            });
            this.coastalSoldiers.push(soldier);
        }
    }

    /**
     * Setup UI elements
     */
    setupUI() {
        console.log("🎨 Setting up UI...");

        // Create timer display
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.id = 'campaign3-timer';
        this.timerDisplay.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #FFD700;
            padding: 10px 20px;
            border: 2px solid #FFD700;
            border-radius: 5px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
        `;
        this.game.canvas.parentElement.appendChild(this.timerDisplay);

        // Create resource display
        this.resourceDisplay = document.createElement('div');
        this.resourceDisplay.id = 'campaign3-resources';
        this.resourceDisplay.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 16px;
            z-index: 1000;
        `;
        this.updateResourceDisplay();
        this.game.canvas.parentElement.appendChild(this.resourceDisplay);

        // Create objectives panel
        const objectivesPanel = document.createElement('div');
        objectivesPanel.id = 'campaign3-objectives';
        objectivesPanel.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-size: 14px;
            max-width: 300px;
            z-index: 1000;
        `;
        objectivesPanel.innerHTML = '<h3>🎯 วัตถุประสงค์</h3><div id="objectives-list"></div>';
        this.game.canvas.parentElement.appendChild(objectivesPanel);

        this.updateObjectivesDisplay();

        // Create command bar for purchasing defenses
        const commandBar = document.createElement('div');
        commandBar.id = 'campaign3-commands';
        commandBar.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 5px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        `;

        commandBar.innerHTML = `
            <button id="btn-buy-mine" style="
                background: #444; border: 2px solid #555; color: white; padding: 10px;
                border-radius: 5px; cursor: pointer; font-family: 'Kanit';
            " title="ทอง: 50">
                💣 วางทุ่นระเบิด (50 G)
            </button>
        `;
        this.game.canvas.parentElement.appendChild(commandBar);

        // Event listener for buying mine
        document.getElementById('btn-buy-mine').addEventListener('click', () => {
            // Activate placement mode
            if (this.resources.gold >= 50) {
                this.placementMode = "mine";
                if (this.game.messageLog) this.game.addSystemMessage("เลือกพื้นที่วางทุ่นระเบิดในแม่น้ำ");

                // Intercept next click on canvas
                const placingHandler = (e) => {
                    if (this.placementMode === "mine") {
                        const rect = this.game.canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        // Convert to world coords
                        const worldX = (x / this.game.camera.zoom) + this.game.camera.x;
                        const worldY = (y / this.game.camera.zoom) + this.game.camera.y;

                        if (this.addNavalMine(worldX, worldY)) {
                            this.placementMode = null;
                            this.game.canvas.removeEventListener('mousedown', placingHandler);
                        }
                    }
                };
                // Remove any existing first to avoid duplicate calls
                this.game.canvas.removeEventListener('mousedown', this.currentPlacingHandler);
                this.currentPlacingHandler = placingHandler;
                this.game.canvas.addEventListener('mousedown', placingHandler);
            } else {
                if (this.game.messageLog) this.game.addSystemMessage("ทองไม่เพียงพอ!");
            }
        });
    }

    /**
     * Update resource display
     */
    updateResourceDisplay() {
        if (this.resourceDisplay) {
            this.resourceDisplay.innerHTML = `
                <div>💰 ทอง: ${this.resources.gold}</div>
                <div>📦 สเบียง: ${this.resources.supplies}</div>
            `;
        }
    }

    /**
     * Update objectives display
     */
    updateObjectivesDisplay() {
        const objectivesList = document.getElementById('objectives-list');
        if (objectivesList) {
            let html = '';
            for (const [key, obj] of Object.entries(this.objectives)) {
                const icon = obj.completed ? '✅' : '';
                html += `<div>${icon} ${obj.description}</div>`;
            }
            objectivesList.innerHTML = html;
        }
    }

    /**
     * Play intro cutscene
     */
    async playIntro() {
        console.log("🎬 Playing intro cutscene...");

        const introData = {
            title: "วิกฤตการณ์ปากน้ำ",
            subtitle: "The Paknam Incident - พ.ศ. 2436",
            description: `ฝรั่งเศสส่งเรือรบ Inconstant และ Comète\nบุกขึ้นแม่น้ำเจ้าพระยา\n\nภารกิจของคุณ: ป้องกันกรุงเทพฯ\nอยู่รอดให้ได้ 15 นาที`,
            duration: 8000
        };

        await this.cutscene.playIntro(introData);
        this.introPlayed = true;
    }

    /**
     * Start game loop
     */
    startGame() {
        console.log("🎮 Starting game loop...");
        this.isRunning = true;
        this.startTime = Date.now();
        this.lastUpdate = Date.now();
        this.lastSpawnCheck = Date.now();

        this.gameLoop();
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning || this.isPaused) {
            if (this.isRunning) {
                requestAnimationFrame(() => this.gameLoop());
            }
            return;
        }

        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;

        // Update game time
        this.currentTime += deltaTime * this.gameSpeed;

        // Update timer display
        this.updateTimerDisplay();

        // Check win/lose conditions
        this.checkGameConditions();

        // Update systems
        this.update(deltaTime, now);

        // Render
        this.render();

        this.lastUpdate = now;

        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        if (this.timerDisplay) {
            const remaining = Math.max(0, this.timeLimit - this.currentTime);
            const minutes = Math.floor(remaining / 60);
            const seconds = Math.floor(remaining % 60);
            this.timerDisplay.textContent =
                `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Update all game systems
     */
    update(deltaTime, now) {
        // Update weather and tide
        this.updateWeather(deltaTime);

        // Update river map
        this.riverMap.update(deltaTime);

        // Update fort
        if (this.fort) {
            this.fortDefense.update(this.fort, deltaTime);
        }

        // Pass weather data to Naval Combat for accuracy/speed affecting
        this.navalCombat.update(this.playerShips, this.frenchShips, deltaTime, this.weather);

        // Update chain barriers
        this.chainBarrierSystem.update(this.chainBarriers, deltaTime);

        // Update French AI
        this.frenchAI.update(deltaTime, this.weather);

        // Spawn enemy waves
        this.checkEnemySpawns(now);

        // Check objectives
        this.checkObjectives();
    }

    /**
     * Update dynamic weather and river tide
     */
    updateWeather(deltaTime) {
        if (!this.weather) {
            this.weather = {
                state: "clear", // clear, rain, fog
                tideCurrent: 1.0, // 1.0 normally, < 1 slows ships, > 1 speeds up
                timer: 0,
                nextChange: 15000 + Math.random() * 10000 // initial change in 15-25s
            };
        }

        this.weather.timer += deltaTime;

        if (this.weather.timer >= this.weather.nextChange) {
            // Change weather
            const roll = Math.random();
            if (roll < 0.4) {
                this.weather.state = "clear";
                this.weather.tideCurrent = 1.0;
                if (this.game.messageLog) this.game.addSystemMessage("⛅ สภาพอากาศแจ่มใส ทัศนวิสัยปกติ กระแสน้ำสงบ");
            } else if (roll < 0.7) {
                this.weather.state = "rain";
                this.weather.tideCurrent = 1.5; // River flows faster out to sea (pushes French back, speeds Siamese)
                if (this.game.messageLog) this.game.addSystemMessage("🌧️ พายุฝนกระหน่ำ! กระแสน้ำเชี่ยวแรงขึ้น ทัศนวิสัยลดลง");
            } else {
                this.weather.state = "fog";
                this.weather.tideCurrent = 0.8; // Slack tide
                if (this.game.messageLog) this.game.addSystemMessage("🌫️ หมอกลงจัด! ความแม่นยำของปืนและระยะการมองเห็นลดลง");
            }

            this.weather.timer = 0;
            this.weather.nextChange = 20000 + Math.random() * 20000; // Next change in 20-40s
            this.updateObjectivesDisplay(); // Force UI update if needed
        }
    }

    /**
     * Check enemy spawn times
     */
    checkEnemySpawns(now) {
        if (now - this.lastSpawnCheck < 1000) return; // Check every second

        this.missionData.enemyWaves.forEach(wave => {
            if (wave.time <= this.currentTime && !wave.spawned) {
                this.spawnEnemyWave(wave);
                wave.spawned = true;
            }
        });

        this.lastSpawnCheck = now;
    }

    /**
     * Spawn enemy wave
     */
    spawnEnemyWave(wave) {
        console.log(` Spawning enemy wave: ${wave.ship}`);

        if (wave.ship === "Inconstant") {
            const ship = this.navalCombat.createFrenchShip({
                type: "Inconstant",
                x: this.game.canvas.width / 2,
                y: -100,
                hp: 2000,
                attack: 80,
                speed: 0.8,
                sprite: "images/campain 3/units/french_inconstant.png"
            });
            this.frenchShips.push(ship);
        } else if (wave.ship === "Comète") {
            const ship = this.navalCombat.createFrenchShip({
                type: "Comète",
                x: this.game.canvas.width / 2 + 100,
                y: -100,
                hp: 1200,
                attack: 60,
                speed: 1.2,
                sprite: "images/campain 3/units/french_comete.png"
            });
            this.frenchShips.push(ship);
        } else if (wave.ship === "TorpedoBoat") {
            const count = wave.count || 1;
            for (let i = 0; i < count; i++) {
                const ship = this.navalCombat.createFrenchShip({
                    type: "TorpedoBoat",
                    x: this.game.canvas.width / 2 + (i * 60 - 30),
                    y: -100,
                    hp: 400,
                    attack: 100,
                    speed: 2.0,
                    sprite: "images/campain 3/units/torpedo_boat.png"
                });
                this.frenchShips.push(ship);
            }
        }
    }

    /**
     * Check game objectives
     */
    checkObjectives() {
        // Check if Inconstant is destroyed
        const inconstantDestroyed = !this.frenchShips.some(s => s.type === "Inconstant");
        if (inconstantDestroyed && this.currentTime > 120) {
            this.objectives.destroyInconstant.completed = true;
        }

        // Check if Comète is destroyed
        const cometeDestroyed = !this.frenchShips.some(s => s.type === "Comète");
        if (cometeDestroyed && this.currentTime > 120) {
            this.objectives.destroyComete.completed = true;
        }

        this.updateObjectivesDisplay();
    }

    /**
     * Check win/lose conditions
     */
    checkGameConditions() {
        // Check time limit
        if (this.currentTime >= this.timeLimit) {
            this.missionComplete = true;
            this.objectives.survive.completed = true;
            this.endMission(true);
            return;
        }

        // Check if fort is destroyed
        if (this.fort && this.fort.hp <= 0) {
            this.missionFailed = true;
            this.objectives.protectBangkok.completed = false;
            this.endMission(false);
            return;
        }

        // Check if Bangkok is reached (ships pass the fort)
        const bangkokReached = this.frenchShips.some(ship =>
            ship.y > this.game.canvas.height - 50
        );
        if (bangkokReached) {
            this.missionFailed = true;
            this.objectives.protectBangkok.completed = false;
            this.endMission(false);
            return;
        }
    }

    /**
     * Render game
     */
    render() {
        const ctx = this.game.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // Render river map
        this.riverMap.render();

        // Render chain barriers
        this.chainBarrierSystem.render(this.chainBarriers);

        // Render fort
        if (this.fort) {
            this.fortDefense.render(this.fort);
        }

        // Render units
        this.navalCombat.renderUnits(this.playerShips);
        this.navalCombat.renderUnits(this.frenchShips);
        this.navalCombat.renderUnits(this.coastalSoldiers);

        // Render projectiles
        this.navalCombat.renderProjectiles();

        // Render effects
        this.navalCombat.renderEffects();

        // Render Weather Overlays
        if (this.weather) {
            if (this.weather.state === "rain") {
                // Rain overlay
                ctx.fillStyle = "rgba(0, 50, 100, 0.2)";
                ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

                // Simple rain particles overlay (fake effect moving top right to bottom left)
                ctx.strokeStyle = "rgba(200, 200, 255, 0.4)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                const timeStr = Date.now() / 20;
                for (let i = 0; i < 50; i++) {
                    const x = ((i * 123 + timeStr * 15) % (this.game.canvas.width + 200)) - 100;
                    const y = ((i * 321 + timeStr * 30) % this.game.canvas.height);
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - 5, y + 15);
                }
                ctx.stroke();
            } else if (this.weather.state === "fog") {
                // Fog overlay
                ctx.fillStyle = "rgba(200, 210, 220, 0.4)";
                ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            }
        }
    }

    /**
     * End mission
     */
    async endMission(victory) {
        console.log(victory ? "🎉 Mission Complete!" : "💀 Mission Failed!");
        this.isRunning = false;

        const endData = {
            victory: victory,
            objectives: this.objectives,
            time: this.currentTime,
            shipsDestroyed: this.frenchShips.filter(s => s.hp <= 0).length
        };

        await this.cutscene.playOutro(endData);

        // Cleanup
        this.cleanup();
    }

    /**
     * Pause game
     */
    pause() {
        this.isPaused = true;
        console.log("⏸️ Game paused");
    }

    /**
     * Resume game
     */
    resume() {
        this.isPaused = false;
        console.log("▶️ Game resumed");
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        console.log("🧹 Cleaning up...");

        // Remove UI elements
        if (this.timerDisplay && this.timerDisplay.parentElement) {
            this.timerDisplay.parentElement.removeChild(this.timerDisplay);
        }
        if (this.resourceDisplay && this.resourceDisplay.parentElement) {
            this.resourceDisplay.parentElement.removeChild(this.resourceDisplay);
        }

        // Clear game objects
        this.playerShips = [];
        this.frenchShips = [];
        this.chainBarriers = [];
        this.projectiles = [];
    }

    /**
     * Add chain barrier
     */
    addChainBarrier(x, y) {
        if (this.resources.gold >= 100) {
            const barrier = this.chainBarrierSystem.createBarrier(x, y);
            this.chainBarriers.push(barrier);
            this.resources.gold -= 100;
            this.updateResourceDisplay();
            return true;
        }
        return false;
    }

    /**
     * Add naval mine
     */
    addNavalMine(x, y) {
        // Double check cost here just in case
        if (this.resources.gold >= 50) {
            const mine = this.navalCombat.createNavalMine({ x: x, y: y });
            this.playerShips.push(mine);
            this.resources.gold -= 50;
            this.updateResourceDisplay();

            if (this.game.messageLog) {
                this.game.addSystemMessage("วางทุ่นระเบิดสำเร็จ");
            }
            return true;
        }
        return false;
    }

    /**
     * Build gun battery
     */
    buildGunBattery(x, y) {
        if (this.resources.gold >= 300) {
            const battery = this.fortDefense.createGunBattery(x, y);
            this.resources.gold -= 300;
            this.updateResourceDisplay();
            return battery;
        }
        return null;
    }
}

// Export for use
export { Campaign3 };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Campaign3;
}
