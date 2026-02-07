// ===================================
// RTS: ยุทธการไทย - Map Data v2
// Campaign: สงครามช้างเผือก 1547
// Complete map with obstacles
// ===================================

export const MAPS = {
    campaign1_mission1: {
        id: 'campaign1_mission1',
        name: 'ศึกที่ราบกาญจนบุรี',
        description: 'กองทัพพม่าบุกผ่านด่านเจดีย์สามองค์ ป้องกันพระนครให้ได้!',
        width: 3000,
        height: 1800,

        // Terrain colors
        terrain: {
            grass: '#4a7c59',      // พื้นหญ้า
            forest: '#2d5a3d',     // ป่า
            water: '#2980b9',      // น้ำ
            road: '#a68b5b',       // ถนน
            mountain: '#6b7280'    // ภูเขา
        },

        // Player starting units (Siam - Team 0)
        playerUnits: [
            // Main army group (Moved closer but NOT overlapping)
            { type: 'swordsman', x: 2350, y: 800, team: 0 },
            { type: 'swordsman', x: 2400, y: 800, team: 0 },
            { type: 'swordsman', x: 2450, y: 800, team: 0 },
            { type: 'swordsman', x: 2350, y: 850, team: 0 },
            { type: 'swordsman', x: 2400, y: 850, team: 0 },
            { type: 'swordsman', x: 2450, y: 850, team: 0 },
            { type: 'spearman', x: 2300, y: 800, team: 0 },
            { type: 'spearman', x: 2300, y: 850, team: 0 },
            { type: 'spearman', x: 2300, y: 900, team: 0 },
            { type: 'archer', x: 2450, y: 750, team: 0 },
            { type: 'archer', x: 2500, y: 750, team: 0 },
            { type: 'archer', x: 2450, y: 800, team: 0 },
            { type: 'archer', x: 2500, y: 800, team: 0 },
            { type: 'elephant', x: 2350, y: 950, team: 0 },
            { type: 'elephant', x: 2450, y: 950, team: 0 },
            { type: 'cavalry', x: 2250, y: 750, team: 0 },
            { type: 'cavalry', x: 2250, y: 800, team: 0 },
            { type: 'cavalry', x: 2250, y: 850, team: 0 }
        ],

        // Enemy units (Burma - Team 1)
        enemyUnits: [
            // Wave 1 - West main force (Shift right to avoid barracks at 400)
            { type: 'enemy_cavalry', x: 650, y: 800, team: 1 },
            { type: 'enemy_cavalry', x: 700, y: 800, team: 1 },
            { type: 'enemy_cavalry', x: 750, y: 800, team: 1 },
            { type: 'enemy_swordsman', x: 650, y: 850, team: 1 },
            { type: 'enemy_swordsman', x: 700, y: 850, team: 1 },
            { type: 'enemy_swordsman', x: 750, y: 850, team: 1 },
            { type: 'enemy_spearman', x: 600, y: 800, team: 1 },
            { type: 'enemy_spearman', x: 600, y: 850, team: 1 },
            { type: 'enemy_archer', x: 550, y: 825, team: 1 },
            { type: 'enemy_archer', x: 550, y: 875, team: 1 },

            // Wave 2 - ย้ายลงมาและเขยิบขวาให้พ้นต้นไม้
            { type: 'enemy_swordsman', x: 800, y: 550, team: 1 },
            { type: 'enemy_swordsman', x: 850, y: 550, team: 1 },
            { type: 'enemy_swordsman', x: 800, y: 600, team: 1 },
            { type: 'enemy_elephant', x: 750, y: 575, team: 1 },

            // Wave 3 - Southwest
            { type: 'enemy_swordsman', x: 400, y: 1100, team: 1 },
            { type: 'enemy_swordsman', x: 450, y: 1100, team: 1 },
            { type: 'enemy_swordsman', x: 400, y: 1150, team: 1 },
            { type: 'enemy_spearman', x: 350, y: 1125, team: 1 },
            { type: 'enemy_archer', x: 300, y: 1100, team: 1 },
            { type: 'enemy_archer', x: 300, y: 1150, team: 1 },

            // Wave 4 - Bridge defenders
            { type: 'enemy_swordsman', x: 950, y: 800, team: 1 },
            { type: 'enemy_swordsman', x: 950, y: 850, team: 1 },
            { type: 'enemy_spearman', x: 900, y: 825, team: 1 },
            { type: 'enemy_elephant', x: 850, y: 825, team: 1 }
        ],

        // Buildings
        buildings: [
            // Player base (Siam - Team 0) - ฝั่งขวาของแผนที่
            { type: 'barracks', x: 2600, y: 850, team: 0 },
            { type: 'farm', x: 2850, y: 700, team: 0 },
            { type: 'farm', x: 2850, y: 850, team: 0 },
            { type: 'farm', x: 2850, y: 1000, team: 0 },

            // Enemy base (Burma - Team 1) - ปรับพิกัดไม่ให้ทับกัน (Mirror player layout)
            { type: 'barracks', x: 400, y: 850, team: 1 },   // ค่ายทหารพม่า (เขยิบมาทางขวา)
            { type: 'farm', x: 150, y: 700, team: 1 },       // นาข้าวพม่า 1 (เขยิบไปขอบซ้าย)
            { type: 'farm', x: 150, y: 850, team: 1 },       // นาข้าวพม่า 2
            { type: 'farm', x: 150, y: 1000, team: 1 }       // นาข้าวพม่า 3
        ],

        // Terrain features (obstacles, forests, water)
        features: [
            // === FORESTS (slows movement, blocks LOS) ===
            // North forest belt
            { type: 'forest', x: 100, y: 100, width: 400, height: 250 },
            { type: 'forest', x: 2000, y: 50, width: 350, height: 200 },

            // Central forest patches
            { type: 'forest', x: 500, y: 500, width: 150, height: 180 },
            { type: 'forest', x: 1700, y: 450, width: 180, height: 150 },

            // South forest belt
            { type: 'forest', x: 100, y: 1400, width: 450, height: 300 },
            { type: 'forest', x: 2100, y: 1500, width: 300, height: 200 },

            // === MOUNTAINS (impassable) ===
            // Northwest mountains
            { type: 'mountain', x: 0, y: 0, width: 80, height: 500 },
            { type: 'mountain', x: 0, y: 1300, width: 80, height: 500 },

            // Central mountain range
            { type: 'mountain', x: 700, y: 300, width: 120, height: 150 },
            { type: 'mountain', x: 700, y: 1200, width: 120, height: 180 },

            // East (Blue Side) mountains - Moved further left as requested
            { type: 'mountain', x: 1850, y: 100, width: 100, height: 100 },    // Shunted left from 2050
            { type: 'mountain', x: 1450, y: 500, width: 80, height: 80 },     // Shunted left from 1750 (past the river)
            { type: 'mountain', x: 1900, y: 1550, width: 120, height: 120 },  // Shunted left from 2150

            // === RIVER (impassable except bridge) ===
            { type: 'water', x: 1600, y: -50, width: 100, height: 800 },    // ยาวถึงขอบบน (เลื่อนไป 600)
            { type: 'water', x: 1600, y: 950, width: 100, height: 1000 },   // ยาวถึงขอบล่าง (เลื่อนไป 600)

            // === BRIDGE (road over river - passable) ===
            { type: 'road', x: 1600, y: 700, width: 100, height: 250 }
        ],

        // Victory/Defeat conditions
        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'กำจัดกองทัพพม่าทั้งหมด'
            },
            defeat: {
                type: 'lose_all_units',
                description: 'หน่วยรบทั้งหมดถูกทำลาย'
            }
        },

        // Starting resources
        startingResources: {
            food: 500,
            gold: 300
        },

        // Camera starting position
        cameraStart: { x: 2100, y: 600 }
    }
};

export const CURRENT_MAP = 'campaign1_mission1';
