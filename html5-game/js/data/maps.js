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
            { type: 'archer', x: 2350, y: 700, team: 0 },
            { type: 'archer', x: 2400, y: 700, team: 0 },
            { type: 'archer', x: 2450, y: 700, team: 0 },
            { type: 'archer', x: 2500, y: 700, team: 0 },
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

            // Wave 3 - Southwest (Moved up and right to clear pathing and avoid farms/forests)
            { type: 'enemy_swordsman', x: 600, y: 1000, team: 1 },
            { type: 'enemy_swordsman', x: 650, y: 1000, team: 1 },
            { type: 'enemy_swordsman', x: 600, y: 1050, team: 1 },
            { type: 'enemy_spearman', x: 550, y: 1025, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1000, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1050, team: 1 },

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

            // Player side rocks (Siam side)
            { type: 'mountain', x: 2350, y: 400, width: 120, height: 100 },
            { type: 'mountain', x: 2400, y: 1200, width: 150, height: 120 },
            { type: 'mountain', x: 2700, y: 300, width: 100, height: 100 },
            { type: 'mountain', x: 2750, y: 1600, width: 150, height: 150 },

            // === RIVER (impassable except bridge) ===
            { type: 'water', x: 1450, y: -50, width: 100, height: 800 },    // ยาวถึงขอบบน
            { type: 'water', x: 1450, y: 950, width: 100, height: 1000 },   // ยาวถึงขอบล่าง

            // === BRIDGE (road over river - passable) ===
            { type: 'road', x: 1450, y: 750, width: 100, height: 200 }
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
        cameraStart: { x: 2100, y: 600 },

        // Fog of War disabled for tutorial mission
        fogOfWar: false
    },

    // =====================================================
    // MISSION 2: ศึกท่าวาย (Battle of Tavoy) - January 1547
    // Siamese forces capture the frontier town of Tavoy
    // =====================================================
    campaign1_mission2: {
        id: 'campaign1_mission2',
        name: 'ศึกท่าวาย',
        nameEn: 'Battle of Tavoy',
        description: 'นำกองทัพสยามยึดเมืองท่าวายจากพม่า!',
        date: 'มกราคม พ.ศ. 2090',
        width: 3200,
        height: 2400,
        fogOfWar: true,

        terrain: {
            grass: '#4a7c59',
            forest: '#2d5a3d',
            water: '#2980b9',
            road: '#a68b5b',
            mountain: '#6b7280',
            sand: '#c2b280'
        },

        // Story cutscene images
        storyCutscene: {
            opening: 'story_m2_opening',
            map: 'story_m2_map',
            battle: 'story_m2_battle',
            victory: 'story_m2_victory'
        },

        // Player attacks from west - Enhanced with assault infantry
        playerUnits: [
            // Assault infantry (new unit type)
            { type: 'siamese_assault', x: 200, y: 1050, team: 0 },
            { type: 'siamese_assault', x: 250, y: 1050, team: 0 },
            { type: 'siamese_assault', x: 300, y: 1050, team: 0 },
            // Regular swordsmen
            { type: 'swordsman', x: 200, y: 1100, team: 0 },
            { type: 'swordsman', x: 250, y: 1100, team: 0 },
            { type: 'swordsman', x: 300, y: 1100, team: 0 },
            { type: 'swordsman', x: 200, y: 1150, team: 0 },
            { type: 'swordsman', x: 250, y: 1150, team: 0 },
            // Spearmen
            { type: 'spearman', x: 200, y: 1200, team: 0 },
            { type: 'spearman', x: 250, y: 1200, team: 0 },
            { type: 'spearman', x: 300, y: 1200, team: 0 },
            // Archers
            { type: 'archer', x: 150, y: 1100, team: 0 },
            { type: 'archer', x: 150, y: 1150, team: 0 },
            { type: 'archer', x: 150, y: 1200, team: 0 },
            { type: 'archer', x: 150, y: 1250, team: 0 },
            // War elephant
            { type: 'elephant', x: 350, y: 1150, team: 0 },
            { type: 'elephant', x: 400, y: 1150, team: 0 },
            // Cavalry for flanking
            { type: 'cavalry', x: 100, y: 1000, team: 0 },
            { type: 'cavalry', x: 100, y: 1050, team: 0 },
            { type: 'cavalry', x: 100, y: 1300, team: 0 }
        ],

        // Enemy defends Tavoy (east side) - Enhanced with defenders
        enemyUnits: [
            // Fortress defenders (moved to front/left of the fortress, well-spaced)
            { type: 'burmese_defender', x: 2350, y: 1300, team: 1 },
            { type: 'burmese_defender', x: 2350, y: 1400, team: 1 },
            { type: 'burmese_defender', x: 2450, y: 1350, team: 1 },
            { type: 'burmese_defender', x: 2450, y: 1450, team: 1 },
            // Regular troops (Shifted left to avoid farm overlap)
            { type: 'enemy_swordsman', x: 2400, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 2400, y: 1500, team: 1 },
            { type: 'enemy_spearman', x: 2400, y: 1600, team: 1 },
            // Archers on walls (moved to ground level on the left, well-spaced)
            { type: 'enemy_archer', x: 2500, y: 1250, team: 1 },
            { type: 'enemy_archer', x: 2500, y: 1350, team: 1 },
            { type: 'enemy_archer', x: 2500, y: 1450, team: 1 },
            { type: 'enemy_archer', x: 2500, y: 1550, team: 1 },
            { type: 'enemy_archer', x: 2500, y: 1650, team: 1 },
            // War elephant (moved to ground level with troops)
            { type: 'enemy_elephant', x: 2400, y: 1300, team: 1 },
            // Patrol cavalry (Shifted right and out of forest/river bounds)
            { type: 'enemy_cavalry', x: 1700, y: 800, team: 1 },
            { type: 'enemy_cavalry', x: 1700, y: 1500, team: 1 },
            { type: 'enemy_cavalry', x: 2300, y: 750, team: 1 }
        ],

        // Enhanced buildings with new Mission 2 structures
        buildings: [
            // Burmese fortress (main objective)
            { type: 'burmese_fortress', x: 2850, y: 1125, team: 1 },
            // Coastal barracks (moved apart for space)
            { type: 'coastal_barracks', x: 2950, y: 500, team: 1 },
            { type: 'coastal_barracks', x: 2950, y: 1700, team: 1 },
            // Dock
            { type: 'dock', x: 2850, y: 2000, team: 1 },
            // Farms
            { type: 'farm', x: 2600, y: 500, team: 1 },
            { type: 'farm', x: 2600, y: 1900, team: 1 }
        ],

        features: [
            // Rivers
            { type: 'water', x: 1500, y: 0, width: 80, height: 950 },
            { type: 'water', x: 1500, y: 1250, width: 80, height: 1150 },
            // Bridge crossing (Adjusted length)
            { type: 'road', x: 1500, y: 900, width: 80, height: 400 },
            // Tropical forests
            { type: 'forest', x: 500, y: 200, width: 500, height: 350 },
            { type: 'forest', x: 500, y: 1800, width: 500, height: 450 },
            { type: 'forest', x: 1900, y: 350, width: 350, height: 300 },
            { type: 'forest', x: 1900, y: 1650, width: 350, height: 350 },
            { type: 'forest', x: 1000, y: 1400, width: 200, height: 200 }, // Moved down
            // Mountains (north & south edges)
            { type: 'mountain', x: 0, y: 0, width: 120, height: 700 },
            { type: 'mountain', x: 0, y: 1700, width: 120, height: 700 }
        ],

        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'กำจัดกองทัพพม่าประจำเมืองท่าวายทั้งหมด'
            },
            defeat: {
                type: 'lose_all_units',
                description: 'หน่วยรบทั้งหมดถูกทำลาย'
            }
        },

        startingResources: { food: 500, gold: 300 },
        cameraStart: { x: 100, y: 1000 }
    },

    // =====================================================
    // MISSION 3: ด่านเจดีย์สามองค์ (Three Pagodas Pass)
    // October 1548 - Burmese invasion through the pass
    // =====================================================
    campaign1_mission3: {
        id: 'campaign1_mission3',
        name: 'ด่านเจดีย์สามองค์',
        nameEn: 'Three Pagodas Pass',
        description: 'สกัดกองทัพพม่าที่บุกผ่านช่องเขาด่านเจดีย์สามองค์!',
        date: 'ตุลาคม พ.ศ. 2091',
        width: 3600,
        height: 2000,
        fogOfWar: true,

        terrain: {
            grass: '#4a7c59',
            forest: '#2d5a3d',
            water: '#2980b9',
            road: '#a68b5b',
            mountain: '#6b7280'
        },

        // Player defends from east (ambush positions)
        playerUnits: [
            { type: 'swordsman', x: 2800, y: 900, team: 0 },
            { type: 'swordsman', x: 2850, y: 900, team: 0 },
            { type: 'swordsman', x: 2900, y: 900, team: 0 },
            { type: 'swordsman', x: 2800, y: 950, team: 0 },
            { type: 'swordsman', x: 2850, y: 950, team: 0 },
            { type: 'spearman', x: 2750, y: 950, team: 0 },
            { type: 'spearman', x: 2750, y: 1000, team: 0 },
            { type: 'spearman', x: 2750, y: 1050, team: 0 },
            // Archers in forest ambush (moved further right to avoid forest completely)
            { type: 'archer', x: 2550, y: 700, team: 0 },
            { type: 'archer', x: 2600, y: 700, team: 0 },
            { type: 'archer', x: 2200, y: 1250, team: 0 },
            { type: 'archer', x: 2250, y: 1250, team: 0 },
            { type: 'elephant', x: 2900, y: 1000, team: 0 },
            { type: 'elephant', x: 2950, y: 1000, team: 0 },
            { type: 'cavalry', x: 3000, y: 850, team: 0 },
            { type: 'cavalry', x: 3000, y: 1100, team: 0 }
        ],

        // Burmese army enters from west (Three Pagodas Pass)
        enemyUnits: [
            // Main force (Shifted forward to completely avoid buildings at x: 200 - 600)
            { type: 'enemy_swordsman', x: 900, y: 900, team: 1 },
            { type: 'enemy_swordsman', x: 950, y: 900, team: 1 },
            { type: 'enemy_swordsman', x: 1000, y: 900, team: 1 },
            { type: 'enemy_swordsman', x: 900, y: 950, team: 1 },
            { type: 'enemy_swordsman', x: 950, y: 950, team: 1 },
            { type: 'enemy_swordsman', x: 1000, y: 950, team: 1 },
            { type: 'enemy_swordsman', x: 900, y: 1000, team: 1 },
            { type: 'enemy_swordsman', x: 950, y: 1000, team: 1 },
            { type: 'enemy_spearman', x: 850, y: 925, team: 1 },
            { type: 'enemy_spearman', x: 850, y: 975, team: 1 },
            { type: 'enemy_archer', x: 800, y: 900, team: 1 },
            { type: 'enemy_archer', x: 800, y: 950, team: 1 },
            { type: 'enemy_archer', x: 800, y: 1000, team: 1 },
            { type: 'enemy_elephant', x: 1050, y: 900, team: 1 },
            { type: 'enemy_elephant', x: 1050, y: 1000, team: 1 },
            { type: 'enemy_cavalry', x: 850, y: 850, team: 1 },
            { type: 'enemy_cavalry', x: 850, y: 1050, team: 1 },
            // Second wave
            { type: 'enemy_swordsman', x: 950, y: 925, team: 1 },
            { type: 'enemy_swordsman', x: 1000, y: 925, team: 1 },
            { type: 'enemy_swordsman', x: 950, y: 975, team: 1 },
            { type: 'enemy_elephant', x: 1050, y: 950, team: 1 }
        ],

        buildings: [
            // Unique Mission 3 Buildings
            { type: 'three_pagodas', x: 200, y: 1000, team: 1 }, // Landmark at the pass
            { type: 'border_outpost', x: 600, y: 1000, team: 1 }, // Guarding the entry
            { type: 'supply_camp', x: 400, y: 1200, team: 1 }, // Rear camp
            { type: 'supply_camp', x: 400, y: 800, team: 1 },

            // Player Base
            { type: 'barracks', x: 3200, y: 950, team: 0 },
            { type: 'farm', x: 3300, y: 800, team: 0 },
            { type: 'farm', x: 3300, y: 1100, team: 0 }
        ],

        features: [
            // Mountain pass (narrow corridor)
            { type: 'mountain', x: 0, y: 0, width: 200, height: 750 },
            { type: 'mountain', x: 0, y: 1150, width: 200, height: 850 },
            // Expanding mountains
            { type: 'mountain', x: 200, y: 0, width: 600, height: 500 },
            { type: 'mountain', x: 200, y: 1400, width: 600, height: 600 },
            // Central forests for ambush
            { type: 'forest', x: 1000, y: 600, width: 400, height: 200 },
            { type: 'forest', x: 1000, y: 1100, width: 400, height: 200 },
            { type: 'forest', x: 2000, y: 500, width: 350, height: 250 },
            { type: 'forest', x: 2000, y: 1150, width: 350, height: 250 },
            // Road through pass
            { type: 'road', x: 0, y: 850, width: 3600, height: 200 }
        ],

        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'หยุดยั้งกองทัพพม่าที่ด่านเจดีย์สามองค์'
            },
            defeat: {
                type: 'lose_all_units',
                description: 'หน่วยรบทั้งหมดถูกทำลาย'
            }
        },

        startingResources: { food: 350, gold: 250 },
        cameraStart: { x: 2500, y: 800 }
    },

    // =====================================================
    // MISSION 4: ที่ราบกาญจนบุรี (Kanchanaburi Plains)
    // Late 1548 - Open field battle
    // =====================================================
    campaign1_mission4: {
        id: 'campaign1_mission4',
        name: 'ที่ราบกาญจนบุรี',
        nameEn: 'Battle of Kanchanaburi Plains',
        description: 'ปะทะกองทัพพม่าบนที่ราบกว้างใหญ่!',
        date: 'พฤศจิกายน พ.ศ. 2091',
        width: 4000,
        height: 3000,
        fogOfWar: true,

        terrain: {
            grass: '#5a8c5a',
            forest: '#2d5a3d',
            water: '#2980b9',
            road: '#a68b5b',
            mountain: '#6b7280'
        },

        playerUnits: [
            // Main infantry line (Shifted UP and LEFT to clear Royal Pavilion footprint)
            { type: 'swordsman', x: 2800, y: 1750, team: 0 },
            { type: 'swordsman', x: 2850, y: 1750, team: 0 },
            { type: 'swordsman', x: 2900, y: 1750, team: 0 },
            { type: 'swordsman', x: 2950, y: 1750, team: 0 },
            { type: 'swordsman', x: 2800, y: 1800, team: 0 },
            { type: 'swordsman', x: 2850, y: 1800, team: 0 },
            { type: 'swordsman', x: 2900, y: 1800, team: 0 },
            { type: 'swordsman', x: 2950, y: 1800, team: 0 },
            { type: 'spearman', x: 2800, y: 1850, team: 0 },
            { type: 'spearman', x: 2850, y: 1850, team: 0 },
            { type: 'spearman', x: 2900, y: 1850, team: 0 },
            { type: 'spearman', x: 2950, y: 1850, team: 0 },
            // Archers behind (shifted further forward to clear Pavilion)
            { type: 'archer', x: 2850, y: 1750, team: 0 },
            { type: 'archer', x: 2900, y: 1750, team: 0 },
            { type: 'archer', x: 2850, y: 1800, team: 0 },
            { type: 'archer', x: 2900, y: 1800, team: 0 },
            { type: 'archer', x: 2850, y: 1850, team: 0 },
            // Elephants (Middle defense - Shifted LEFT)
            { type: 'elephant', x: 2750, y: 1600, team: 0 },
            { type: 'elephant', x: 2750, y: 1650, team: 0 },
            { type: 'elephant', x: 2750, y: 1700, team: 0 },
            // Cavalry flanks (Middle defense - Shifted LEFT)
            { type: 'cavalry', x: 2700, y: 1550, team: 0 },
            { type: 'cavalry', x: 2700, y: 1580, team: 0 },
            { type: 'cavalry', x: 2700, y: 1720, team: 0 },
            { type: 'cavalry', x: 2700, y: 1750, team: 0 }
        ],

        enemyUnits: [
            // Large Burmese army
            { type: 'enemy_swordsman', x: 600, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 650, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 700, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 750, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 800, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 600, y: 1450, team: 1 },
            { type: 'enemy_swordsman', x: 650, y: 1450, team: 1 },
            { type: 'enemy_swordsman', x: 700, y: 1450, team: 1 },
            { type: 'enemy_swordsman', x: 750, y: 1450, team: 1 },
            { type: 'enemy_swordsman', x: 800, y: 1450, team: 1 },
            { type: 'enemy_spearman', x: 550, y: 1400, team: 1 },
            { type: 'enemy_spearman', x: 550, y: 1450, team: 1 },
            { type: 'enemy_spearman', x: 550, y: 1500, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1350, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1400, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1450, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1500, team: 1 },
            { type: 'enemy_elephant', x: 850, y: 1425, team: 1 },
            { type: 'enemy_elephant', x: 900, y: 1425, team: 1 },
            { type: 'enemy_elephant', x: 850, y: 1475, team: 1 },
            { type: 'enemy_cavalry', x: 450, y: 1300, team: 1 },
            { type: 'enemy_cavalry', x: 450, y: 1350, team: 1 },
            { type: 'enemy_cavalry', x: 450, y: 1550, team: 1 },
            { type: 'enemy_cavalry', x: 450, y: 1600, team: 1 }
        ],

        buildings: [

            // Unique Mission 4 Buildings (Shifted LEFT)
            { type: 'royal_pavilion', x: 3300, y: 1450, team: 0 }, // Player Command (Center)
            { type: 'field_armory', x: 3300, y: 1050, team: 0 },   // Moved Down
            { type: 'field_armory', x: 3300, y: 2050, team: 0 },  // Moved Down

            // Barricades front line (Shifted forward/LEFT)
            { type: 'barricades', x: 2600, y: 1300, team: 0 },
            { type: 'barricades', x: 2600, y: 1600, team: 0 },
            { type: 'barricades', x: 2600, y: 1450, team: 0 },

            { type: 'barracks', x: 3700, y: 1450, team: 0 },      // Moved Back
            { type: 'farm', x: 3700, y: 1000, team: 0 },          // Moved Back & Up
            { type: 'farm', x: 3700, y: 1900, team: 0 },          // Moved Back & Down
            { type: 'barracks', x: 200, y: 1450, team: 1 },
            { type: 'farm', x: 100, y: 1300, team: 1 },
            { type: 'farm', x: 100, y: 1600, team: 1 }
        ],

        features: [
            // Scattered forests
            { type: 'forest', x: 1400, y: 600, width: 400, height: 300 },
            { type: 'forest', x: 2200, y: 400, width: 350, height: 250 },
            { type: 'forest', x: 1400, y: 2200, width: 400, height: 300 },
            { type: 'forest', x: 2200, y: 2400, width: 350, height: 250 },
            // River through middle (Aligned with army at y=1500)
            { type: 'water', x: 1950, y: 0, width: 100, height: 1500 },
            { type: 'water', x: 1950, y: 1900, width: 100, height: 1100 },
            { type: 'road', x: 1950, y: 1500, width: 100, height: 400 },
            // Mountain edges
            { type: 'mountain', x: 0, y: 0, width: 150, height: 800 },
            { type: 'mountain', x: 0, y: 2200, width: 150, height: 800 },
            { type: 'mountain', x: 3850, y: 0, width: 150, height: 800 },
            { type: 'mountain', x: 3850, y: 2200, width: 150, height: 800 }
        ],

        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'เอาชนะกองทัพพม่าในสมรภูมิที่ราบ'
            },
            defeat: {
                type: 'lose_all_units',
                description: 'หน่วยรบทั้งหมดถูกทำลาย'
            }
        },

        startingResources: { food: 500, gold: 350 },
        cameraStart: { x: 2600, y: 1500 }
    },

    // =====================================================
    // MISSION 5: ล้อมกรุงศรีอยุธยา (Siege of Ayutthaya)
    // Late 1548 - Defense of the capital
    // =====================================================
    campaign1_mission5: {
        id: 'campaign1_mission5',
        name: 'ล้อมกรุงศรีอยุธยา',
        nameEn: 'Siege of Ayutthaya',
        description: 'ป้องกันพระนครจากกองทัพพม่าที่ล้อมเมือง! อย่าให้ศัตรูทำลายพระบรมมหาราชวัง!',
        date: 'ธันวาคม พ.ศ. 2091',
        width: 4800,
        height: 4000,
        fogOfWar: true,

        terrain: {
            grass: '#4a7c59',
            forest: '#2d5a3d',
            water: '#2980b9',
            road: '#a68b5b',
            mountain: '#6b7280'
        },

        // Defenders inside city
        playerUnits: [
            // Gate defenders
            { type: 'swordsman', x: 2300, y: 1900, team: 0 },
            { type: 'swordsman', x: 2350, y: 1900, team: 0 },
            { type: 'swordsman', x: 2400, y: 1900, team: 0 },
            { type: 'swordsman', x: 2450, y: 1900, team: 0 },
            { type: 'swordsman', x: 2500, y: 1900, team: 0 },
            { type: 'spearman', x: 2300, y: 1950, team: 0 },
            { type: 'spearman', x: 2350, y: 1950, team: 0 },
            { type: 'spearman', x: 2400, y: 1950, team: 0 },
            { type: 'spearman', x: 2450, y: 1950, team: 0 },
            { type: 'spearman', x: 2500, y: 1950, team: 0 },
            // Archers on walls
            { type: 'archer', x: 2200, y: 1850, team: 0 },
            { type: 'archer', x: 2300, y: 1850, team: 0 },
            { type: 'archer', x: 2400, y: 1850, team: 0 },
            { type: 'archer', x: 2500, y: 1850, team: 0 },
            { type: 'archer', x: 2600, y: 1850, team: 0 },
            // Royal elephants
            { type: 'elephant', x: 2350, y: 2000, team: 0 },
            { type: 'elephant', x: 2450, y: 2000, team: 0 },
            // Reserve cavalry
            { type: 'cavalry', x: 2300, y: 2100, team: 0 },
            { type: 'cavalry', x: 2350, y: 2100, team: 0 },
            { type: 'cavalry', x: 2450, y: 2100, team: 0 },
            { type: 'cavalry', x: 2500, y: 2100, team: 0 }
        ],

        // Large Burmese siege army
        enemyUnits: [
            // Main assault force (south)
            { type: 'enemy_swordsman', x: 2200, y: 600, team: 1 },
            { type: 'enemy_swordsman', x: 2250, y: 600, team: 1 },
            { type: 'enemy_swordsman', x: 2300, y: 600, team: 1 },
            { type: 'enemy_swordsman', x: 2350, y: 600, team: 1 },
            { type: 'enemy_swordsman', x: 2400, y: 600, team: 1 },
            { type: 'enemy_swordsman', x: 2450, y: 600, team: 1 },
            { type: 'enemy_swordsman', x: 2500, y: 600, team: 1 },
            { type: 'enemy_swordsman', x: 2200, y: 650, team: 1 },
            { type: 'enemy_swordsman', x: 2250, y: 650, team: 1 },
            { type: 'enemy_swordsman', x: 2300, y: 650, team: 1 },
            { type: 'enemy_spearman', x: 2150, y: 600, team: 1 },
            { type: 'enemy_spearman', x: 2150, y: 650, team: 1 },
            { type: 'enemy_spearman', x: 2550, y: 600, team: 1 },
            { type: 'enemy_spearman', x: 2550, y: 650, team: 1 },
            { type: 'enemy_archer', x: 2200, y: 500, team: 1 },
            { type: 'enemy_archer', x: 2300, y: 500, team: 1 },
            { type: 'enemy_archer', x: 2400, y: 500, team: 1 },
            { type: 'enemy_archer', x: 2500, y: 500, team: 1 },
            { type: 'enemy_elephant', x: 2300, y: 700, team: 1 },
            { type: 'enemy_elephant', x: 2400, y: 700, team: 1 },
            { type: 'enemy_elephant', x: 2350, y: 750, team: 1 },
            { type: 'enemy_cavalry', x: 2100, y: 550, team: 1 },
            { type: 'enemy_cavalry', x: 2100, y: 600, team: 1 },
            { type: 'enemy_cavalry', x: 2600, y: 550, team: 1 },
            { type: 'enemy_cavalry', x: 2600, y: 600, team: 1 },
            // Flanking forces
            { type: 'enemy_swordsman', x: 800, y: 2000, team: 1 },
            { type: 'enemy_swordsman', x: 850, y: 2000, team: 1 },
            { type: 'enemy_archer', x: 750, y: 2000, team: 1 },
            { type: 'enemy_elephant', x: 900, y: 2000, team: 1 },
            { type: 'enemy_swordsman', x: 4000, y: 2000, team: 1 },
            { type: 'enemy_swordsman', x: 4050, y: 2000, team: 1 },
            { type: 'enemy_archer', x: 4100, y: 2000, team: 1 },
            { type: 'enemy_elephant', x: 3950, y: 2000, team: 1 }
        ],

        buildings: [
            // Ayutthaya city (center)
            { type: 'barracks', x: 2400, y: 2250, team: 0 },
            { type: 'farm', x: 2250, y: 2450, team: 0 },
            { type: 'farm', x: 2550, y: 2450, team: 0 },
            { type: 'farm', x: 2400, y: 2650, team: 0 },
            // Burmese camps
            { type: 'barracks', x: 2400, y: 300, team: 1 },
            { type: 'farm', x: 2200, y: 200, team: 1 },
            { type: 'farm', x: 2600, y: 200, team: 1 }
        ],

        features: [
            // Chao Phraya River (surrounds city)
            { type: 'water', x: 1800, y: 0, width: 150, height: 1600 },
            { type: 'water', x: 1800, y: 1600, width: 100, height: 200 },
            { type: 'water', x: 1600, y: 1700, width: 300, height: 100 },
            { type: 'water', x: 1600, y: 1700, width: 100, height: 200 }, // Left split top
            { type: 'water', x: 1600, y: 2100, width: 100, height: 300 }, // Left split bottom
            { type: 'water', x: 1600, y: 2300, width: 220, height: 100 }, // Left bottom horizontal (shortened)
            { type: 'water', x: 2900, y: 1700, width: 100, height: 200 }, // Right split top
            { type: 'water', x: 2900, y: 2100, width: 100, height: 300 }, // Right split bottom
            { type: 'water', x: 2850, y: 2300, width: 150, height: 100 }, // Right bottom horizontal (shortened)
            { type: 'water', x: 2800, y: 0, width: 150, height: 1800 },
            // Bridges (aligned with vertical river sections in the split gaps)
            { type: 'road', x: 1600, y: 1900, width: 100, height: 200 },
            { type: 'road', x: 2900, y: 1900, width: 100, height: 200 },
            // Forests
            { type: 'forest', x: 400, y: 400, width: 500, height: 400 },
            { type: 'forest', x: 4000, y: 400, width: 500, height: 400 },
            { type: 'forest', x: 400, y: 3200, width: 500, height: 400 },
            { type: 'forest', x: 4000, y: 3200, width: 500, height: 400 }
        ],

        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'ขับไล่กองทัพพม่าออกจากพระนคร'
            },
            defeat: {
                type: 'lose_all_units',
                description: 'หน่วยรบทั้งหมดถูกทำลาย'
            }
        },

        startingResources: { food: 600, gold: 400 },
        cameraStart: { x: 2000, y: 1700 }
    },

    // =====================================================
    // MISSION 6: ยุทธหัตถี (Elephant Duel)
    // January 1549 - Queen Suriyothai's sacrifice
    // =====================================================
    campaign1_mission6: {
        id: 'campaign1_mission6',
        name: 'ยุทธหัตถี',
        nameEn: 'The Elephant Duel',
        description: 'ศึกยุทธหัตถี! ปกป้องสมเด็จพระมหาจักรพรรดิ!',
        date: 'มกราคม พ.ศ. 2092',
        width: 2400,
        height: 1800,
        fogOfWar: false, // Clear vision for dramatic battle

        terrain: {
            grass: '#4a7c59',
            forest: '#2d5a3d',
            water: '#2980b9',
            road: '#a68b5b',
            mountain: '#6b7280'
        },

        // Siamese royal guard and elephants
        playerUnits: [
            // === FRONT LINE: THE DUEL (Center-Right) ===
            { type: 'thai_king', x: 1510, y: 900, team: 0 }, // King Maha Chakkraphat (Facing Left)
            // Royal Guard for the King
            { type: 'swordsman', x: 2000, y: 850, team: 0 },
            { type: 'swordsman', x: 2000, y: 950, team: 0 },
            { type: 'spearman', x: 2000, y: 900, team: 0 },

            // === REINFORCEMENTS: QUEEN SURIYOTHAI (Rear/Far Right) ===
            { type: 'queen_suriyothai', x: 2100, y: 900, team: 0 }, // Queen arriving to help
            // Queen's Army
            { type: 'elephant', x: 2150, y: 850, team: 0 },
            { type: 'elephant', x: 2150, y: 950, team: 0 },
            { type: 'cavalry', x: 2050, y: 800, team: 0 },
            { type: 'cavalry', x: 2050, y: 1000, team: 0 },
            { type: 'archer', x: 2200, y: 850, team: 0 },
            { type: 'archer', x: 2200, y: 950, team: 0 },
            { type: 'swordsman', x: 2050, y: 900, team: 0 }
        ],

        // Burmese assault with boss elephant
        enemyUnits: [
            // === BURMESE KING (Center-Left) ===
            { type: 'burmese_king', x: 1250, y: 900, team: 1 },

            // Burmese Elite Guard
            { type: 'enemy_elephant', x: 650, y: 800, team: 1 },
            { type: 'enemy_elephant', x: 650, y: 1000, team: 1 },
            { type: 'enemy_swordsman', x: 600, y: 850, team: 1 },
            { type: 'enemy_swordsman', x: 600, y: 950, team: 1 },
            { type: 'enemy_spearman', x: 550, y: 900, team: 1 },
            { type: 'enemy_archer', x: 500, y: 800, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1000, team: 1 }
        ],

        buildings: [],

        features: [
            // Open battlefield with minimal obstacles
            { type: 'forest', x: 100, y: 100, width: 200, height: 200 },
            { type: 'forest', x: 2100, y: 100, width: 200, height: 200 },
            { type: 'forest', x: 100, y: 1500, width: 200, height: 200 },
            { type: 'forest', x: 2100, y: 1500, width: 200, height: 200 },
            // Road
            { type: 'road', x: 0, y: 800, width: 2400, height: 200 }
        ],

        objectives: {
            victory: {
                type: 'kill_hero',
                target: 'burmese_king',
                description: 'เอาชนะพระเจ้าตะเบ็งชเวตี้ในศึกยุทธหัตถี!'
            },
            defeat: {
                type: 'protect_hero',
                target: 'thai_king',
                description: 'สมเด็จพระมหาจักรพรรดิถูกปลงพระชนม์'
            }
        },

        startingResources: { food: 300, gold: 200 },
        cameraStart: { x: 1000, y: 600 }
    },

    // =====================================================
    // MISSION 7: ขับไล่ข้าศึก (Counterattack)
    // January 1549 - Siamese counterattack
    // =====================================================
    campaign1_mission7: {
        id: 'campaign1_mission7',
        name: 'ขับไล่ข้าศึก',
        nameEn: 'The Counterattack',
        description: 'ตีโต้กองทัพพม่าที่กำลังล่าถอย! ขับไล่ออกจากแผ่นดินสยาม!',
        date: 'มกราคม พ.ศ. 2092',
        width: 4000,
        height: 3000,
        fogOfWar: true,

        terrain: {
            grass: '#4a7c59',
            forest: '#2d5a3d',
            water: '#2980b9',
            road: '#a68b5b',
            mountain: '#6b7280'
        },

        // Siamese pursuit force
        playerUnits: [
            { type: 'swordsman', x: 3300, y: 1400, team: 0 },
            { type: 'swordsman', x: 3350, y: 1400, team: 0 },
            { type: 'swordsman', x: 3400, y: 1400, team: 0 },
            { type: 'swordsman', x: 3300, y: 1450, team: 0 },
            { type: 'swordsman', x: 3350, y: 1450, team: 0 },
            { type: 'swordsman', x: 3400, y: 1450, team: 0 },
            { type: 'spearman', x: 3300, y: 1500, team: 0 },
            { type: 'spearman', x: 3350, y: 1500, team: 0 },
            { type: 'spearman', x: 3400, y: 1500, team: 0 },
            { type: 'archer', x: 3450, y: 1400, team: 0 },
            { type: 'archer', x: 3450, y: 1450, team: 0 },
            { type: 'archer', x: 3450, y: 1500, team: 0 },
            { type: 'elephant', x: 3250, y: 1450, team: 0 },
            { type: 'elephant', x: 3250, y: 1500, team: 0 },
            // Fast cavalry for pursuit
            { type: 'cavalry', x: 3200, y: 1350, team: 0 },
            { type: 'cavalry', x: 3200, y: 1400, team: 0 },
            { type: 'cavalry', x: 3200, y: 1550, team: 0 },
            { type: 'cavalry', x: 3200, y: 1600, team: 0 }
        ],

        // Retreating Burmese (scattered)
        enemyUnits: [
            // Main retreating force
            { type: 'enemy_swordsman', x: 600, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 650, y: 1400, team: 1 },
            { type: 'enemy_swordsman', x: 600, y: 1450, team: 1 },
            { type: 'enemy_swordsman', x: 650, y: 1450, team: 1 },
            { type: 'enemy_spearman', x: 550, y: 1425, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1400, team: 1 },
            { type: 'enemy_archer', x: 500, y: 1450, team: 1 },
            { type: 'enemy_elephant', x: 700, y: 1425, team: 1 },
            // Scattered groups
            { type: 'enemy_swordsman', x: 1200, y: 800, team: 1 },
            { type: 'enemy_swordsman', x: 1250, y: 800, team: 1 },
            { type: 'enemy_archer', x: 1150, y: 800, team: 1 },
            { type: 'enemy_swordsman', x: 1200, y: 2100, team: 1 },
            { type: 'enemy_swordsman', x: 1250, y: 2100, team: 1 },
            { type: 'enemy_cavalry', x: 1300, y: 2100, team: 1 },
            { type: 'enemy_swordsman', x: 2000, y: 1200, team: 1 },
            { type: 'enemy_swordsman', x: 2050, y: 1200, team: 1 },
            { type: 'enemy_elephant', x: 2100, y: 1200, team: 1 },
            { type: 'enemy_swordsman', x: 2000, y: 1700, team: 1 },
            { type: 'enemy_archer', x: 1950, y: 1700, team: 1 },
            { type: 'enemy_cavalry', x: 2050, y: 1700, team: 1 }
        ],

        buildings: [
            { type: 'barracks', x: 3700, y: 1450, team: 0 },
            { type: 'farm', x: 3800, y: 1300, team: 0 },
            { type: 'farm', x: 3800, y: 1600, team: 0 },
            // Burmese camp (target)
            { type: 'burmese_camp', x: 200, y: 1450, team: 1 },
            { type: 'burmese_camp', x: 100, y: 1300, team: 1 },
            { type: 'burmese_camp', x: 100, y: 1600, team: 1 }
        ],

        features: [
            // Forests (hiding spots for enemy)
            { type: 'forest', x: 800, y: 500, width: 400, height: 300 },
            { type: 'forest', x: 800, y: 2100, width: 400, height: 300 },
            { type: 'forest', x: 1600, y: 900, width: 300, height: 250 },
            { type: 'forest', x: 1600, y: 1750, width: 300, height: 250 },
            { type: 'forest', x: 2400, y: 600, width: 350, height: 280 },
            { type: 'forest', x: 2400, y: 2100, width: 350, height: 280 },
            // Mountains
            { type: 'mountain', x: 0, y: 0, width: 100, height: 1000 },
            { type: 'mountain', x: 0, y: 2000, width: 100, height: 1000 },
            // River
            { type: 'water', x: 2800, y: 0, width: 80, height: 1300 },
            { type: 'water', x: 2800, y: 1600, width: 80, height: 1400 },
            { type: 'road', x: 2800, y: 1300, width: 80, height: 300 }
        ],

        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'กำจัดกองทัพพม่าที่เหลืออยู่ทั้งหมด'
            },
            defeat: {
                type: 'lose_all_units',
                description: 'หน่วยรบทั้งหมดถูกทำลาย'
            }
        },

        startingResources: { food: 450, gold: 300 },
        cameraStart: { x: 3200, y: 1200 }
    },

    // =====================================================
    // MISSION 8: กำแพงเพชร (Kamphaeng Phet Defense)
    // February 1549 - Final stand with Portuguese mercenaries
    // =====================================================
    campaign1_mission8: {
        id: 'campaign1_mission8',
        name: 'กำแพงเพชร',
        nameEn: 'Defense of Kamphaeng Phet',
        description: 'ป้องกันเมืองกำแพงเพชรจากการโจมตีครั้งสุดท้ายของพม่า! ใช้ทหารรับจ้างโปรตุเกสช่วยป้องกัน!',
        date: 'กุมภาพันธ์ พ.ศ. 2092',
        width: 3200,
        height: 2400,
        fogOfWar: true,

        terrain: {
            grass: '#4a7c59',
            forest: '#2d5a3d',
            water: '#2980b9',
            road: '#a68b5b',
            mountain: '#6b7280'
        },

        // Defenders with mixed force
        playerUnits: [
            // Wall defenders
            { type: 'swordsman', x: 2400, y: 1000, team: 0 },
            { type: 'swordsman', x: 2450, y: 1000, team: 0 },
            { type: 'swordsman', x: 2500, y: 1000, team: 0 },
            { type: 'swordsman', x: 2400, y: 1050, team: 0 },
            { type: 'swordsman', x: 2450, y: 1050, team: 0 },
            { type: 'swordsman', x: 2500, y: 1050, team: 0 },
            { type: 'spearman', x: 2350, y: 1000, team: 0 },
            { type: 'spearman', x: 2350, y: 1050, team: 0 },
            { type: 'spearman', x: 2550, y: 1000, team: 0 },
            { type: 'spearman', x: 2550, y: 1050, team: 0 },
            // Archers on walls
            { type: 'archer', x: 2400, y: 950, team: 0 },
            { type: 'archer', x: 2450, y: 950, team: 0 },
            { type: 'archer', x: 2500, y: 950, team: 0 },
            { type: 'archer', x: 2400, y: 1100, team: 0 },
            { type: 'archer', x: 2450, y: 1100, team: 0 },
            { type: 'archer', x: 2500, y: 1100, team: 0 },
            // Elephants
            { type: 'elephant', x: 2600, y: 1025, team: 0 },
            { type: 'elephant', x: 2650, y: 1025, team: 0 },
            // Cavalry reserve (shifted left and up)
            { type: 'cavalry', x: 2650, y: 950, team: 0 },
            { type: 'cavalry', x: 2650, y: 1000, team: 0 },
            { type: 'cavalry', x: 2650, y: 1050, team: 0 },
            { type: 'cavalry', x: 2650, y: 1100, team: 0 }
        ],

        // Attacking Burmese
        enemyUnits: [
            // Main assault
            { type: 'enemy_swordsman', x: 400, y: 1050, team: 1 },
            { type: 'enemy_swordsman', x: 450, y: 1050, team: 1 },
            { type: 'enemy_swordsman', x: 500, y: 1050, team: 1 },
            { type: 'enemy_swordsman', x: 550, y: 1050, team: 1 },
            { type: 'enemy_swordsman', x: 400, y: 1100, team: 1 },
            { type: 'enemy_swordsman', x: 450, y: 1100, team: 1 },
            { type: 'enemy_swordsman', x: 500, y: 1100, team: 1 },
            { type: 'enemy_swordsman', x: 550, y: 1100, team: 1 },
            { type: 'enemy_swordsman', x: 400, y: 1150, team: 1 },
            { type: 'enemy_swordsman', x: 450, y: 1150, team: 1 },
            { type: 'enemy_swordsman', x: 500, y: 1150, team: 1 },
            { type: 'enemy_swordsman', x: 550, y: 1150, team: 1 },
            { type: 'enemy_spearman', x: 350, y: 1075, team: 1 },
            { type: 'enemy_spearman', x: 350, y: 1125, team: 1 },
            { type: 'enemy_archer', x: 300, y: 1000, team: 1 },
            { type: 'enemy_archer', x: 300, y: 1050, team: 1 },
            { type: 'enemy_archer', x: 300, y: 1100, team: 1 },
            { type: 'enemy_archer', x: 300, y: 1150, team: 1 },
            { type: 'enemy_archer', x: 300, y: 1200, team: 1 },
            { type: 'enemy_elephant', x: 600, y: 1075, team: 1 },
            { type: 'enemy_elephant', x: 600, y: 1125, team: 1 },
            { type: 'enemy_elephant', x: 650, y: 1100, team: 1 },
            { type: 'enemy_cavalry', x: 300, y: 875, team: 1 },
            { type: 'enemy_cavalry', x: 300, y: 925, team: 1 },
            { type: 'enemy_cavalry', x: 300, y: 1225, team: 1 },
            { type: 'enemy_cavalry', x: 300, y: 1275, team: 1 }
        ],

        buildings: [
            // City defenses
            { type: 'kamphaeng_phet_wall', x: 2600, y: 1100, team: 0 },
            { type: 'portuguese_camp', x: 2950, y: 850, team: 0 },
            { type: 'farm', x: 3000, y: 1350, team: 0 },
            // Burmese camp
            { type: 'burmese_camp', x: 350, y: 1100, team: 1 },
            { type: 'burmese_camp', x: 150, y: 800, team: 1 },
            { type: 'burmese_camp', x: 150, y: 1400, team: 1 }
        ],

        features: [
            // City walls (represented as mountains for impassability)
            { type: 'mountain', x: 2200, y: 800, width: 50, height: 250 },
            { type: 'mountain', x: 2200, y: 1150, width: 50, height: 250 },
            // Forests
            { type: 'forest', x: 800, y: 400, width: 400, height: 300 },
            { type: 'forest', x: 800, y: 1700, width: 400, height: 300 },
            { type: 'forest', x: 1400, y: 600, width: 300, height: 250 },
            { type: 'forest', x: 1400, y: 1500, width: 300, height: 250 },
            // River
            { type: 'water', x: 1900, y: 0, width: 80, height: 700 },
            { type: 'water', x: 1900, y: 900, width: 80, height: 1500 },
            { type: 'road', x: 1900, y: 700, width: 80, height: 200 },
            // Mountains
            { type: 'mountain', x: 0, y: 0, width: 80, height: 600 },
            { type: 'mountain', x: 0, y: 1800, width: 80, height: 600 }
        ],

        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'ป้องกันเมืองกำแพงเพชรและเอาชนะกองทัพพม่า!'
            },
            defeat: {
                type: 'lose_all_units',
                description: 'หน่วยรบทั้งหมดถูกทำลาย'
            }
        },

        startingResources: { food: 400, gold: 350 },
        cameraStart: { x: 2100, y: 900 }
    }
};

// Campaign mission list for UI
export const CAMPAIGN_MISSIONS = {
    white_elephant: [
        'campaign1_mission1',
        'campaign1_mission2',
        'campaign1_mission3',
        'campaign1_mission4',
        'campaign1_mission5',
        'campaign1_mission6',
        'campaign1_mission7',
        'campaign1_mission8'
    ]
};

export const CURRENT_MAP = 'campaign1_mission1';

