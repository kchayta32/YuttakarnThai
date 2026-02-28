// ===================================
// RTS: ยุทธการไทย - Campaign 2 Maps
// สงครามท่าดินแดง (พ.ศ. 2329-2330)
// ===================================

export const CAMPAIGN2_MAPS = {
    campaign2_mission1: {
        id: 'campaign2_mission1',
        name: 'การสำรวจต้นน้ำ',
        description: 'ส่งหน่วยม้าเร็วไปหาที่ตั้งค่ายพม่าที่ท่าดินแดง และตั้งฐานที่มั่น',
        width: 3000,
        height: 2000,
        cameraStart: { x: 0, y: 1500 },
        terrain: { grass: '#4a7c59', forest: '#1e3f20', water: '#2980b9', road: '#a68b5b', mountain: '#6b7280' },
        playerUnits: [
            { type: 'c2_hero_prince', x: 250, y: 950, team: 0 },
            { type: 'cavalry', x: 350, y: 900, team: 0 },
            { type: 'cavalry', x: 350, y: 1000, team: 0 },
            { type: 'c2_archer', x: 200, y: 850, team: 0 },
            { type: 'c2_archer', x: 200, y: 1050, team: 0 }
        ],
        enemyUnits: [
            { type: 'c2_enemy_infantry', x: 2800, y: 500, team: 1 },
            { type: 'c2_enemy_infantry', x: 2800, y: 1500, team: 1 }
        ],
        buildings: [
            // พลับพลา (Town Hall) มุมแมพติดป่า (Size: 500)
            { type: 'c2_town_hall', x: 280, y: 1400, team: 0 },
            // โรงเสบียง (Granary) ใกล้แหล่งน้ำ (Size: 300)
            { type: 'c2_granary', x: 900, y: 1750, team: 0 },
            // หอคอย (Watchtower) บนที่สูง (Size: 240)
            { type: 'c2_watchtower', x: 600, y: 1200, team: 0 },
            { type: 'c2_watchtower', x: 1000, y: 600, team: 0 }
        ],
        features: [
            { type: 'forest', x: 0, y: 1700, width: 300, height: 300 }, // ป่าหลังฐาน
            { type: 'water', x: 1500, y: 0, width: 200, height: 900 },
            { type: 'road', x: 1500, y: 900, width: 200, height: 200 }, // Bridge
            { type: 'water', x: 1500, y: 1100, width: 200, height: 900 },
            { type: 'mountain', x: 500, y: 1300, width: 200, height: 200, blockLos: false }, // High ground for watchtower (ไม่บล็อก LOS ให้หอคอยเห็นพื้นที่รอบๆ)
            { type: 'mountain', x: 700, y: 700, width: 200, height: 200 }, // High ground
            { type: 'mountain', x: 1000, y: 200, width: 200, height: 500 }
        ],
        objectives: {
            victory: { type: 'explore', description: 'ค้นหาบริเวณที่ตั้งค่ายพม่า (เดินทัพข้ามแม่น้ำ)' },
            defeat: { type: 'lose_hero', target: 'c2_hero_prince', description: 'กรมพระราชวังบวรฯ สิ้นพระชนม์' }
        }
    },
    campaign2_mission2: {
        id: 'campaign2_mission2',
        name: 'ตัดเส้นทางเสบียง',
        description: 'ซุ่มโจมตีขบวนขนส่งเสบียงของพม่าริมแม่น้ำ',
        width: 3200,
        height: 2400,
        cameraStart: { x: 200, y: 1000 },
        terrain: { grass: '#4a7c59', forest: '#1e3f20', water: '#2980b9', road: '#a68b5b', mountain: '#6b7280' },
        playerUnits: [
            { type: 'c2_hero_rama1', x: 300, y: 1200, team: 0 },
            { type: 'c2_swordsman', x: 400, y: 1150, team: 0 },
            { type: 'c2_swordsman', x: 400, y: 1250, team: 0 },
            { type: 'c2_archer', x: 200, y: 1100, team: 0 },
            { type: 'c2_archer', x: 200, y: 1300, team: 0 }
        ],
        enemyUnits: [
            // ขบวนเสบียง
            { type: 'c2_enemy_infantry', x: 2500, y: 800, team: 1 },
            { type: 'c2_enemy_infantry', x: 2500, y: 1200, team: 1 },
            { type: 'c2_enemy_infantry', x: 2500, y: 1600, team: 1 },
            { type: 'c2_enemy_musketeer', x: 2600, y: 1000, team: 1 }
        ],
        buildings: [
            // ค่ายทหาร (Forward base) ซ่อนในป่าใกล้ถนน (Size: 400)
            { type: 'c2_barracks', x: 500, y: 600, team: 0 },
            // หอคอยเรียงตามแม่น้ำ (Size: 240)
            { type: 'c2_watchtower', x: 800, y: 400, team: 0 },
            { type: 'c2_watchtower', x: 800, y: 1200, team: 0 },
            { type: 'c2_watchtower', x: 800, y: 2000, team: 0 },
            // โรงเสบียงพม่า (Size: 300)
            { type: 'c2_granary', x: 2800, y: 1000, team: 1 },
            { type: 'c2_granary', x: 2800, y: 1800, team: 1 }
        ],
        features: [
            { type: 'forest', x: 400, y: 500, width: 300, height: 300 }, // ป่าซ่อนค่าย
            { type: 'water', x: 1000, y: 0, width: 150, height: 2400 }, // แม่น้ำแคว
            { type: 'road', x: 2500, y: 0, width: 100, height: 2400 } // ถนนเสบียง
        ],
        objectives: {
            victory: { type: 'destroy_building', target: 'c2_granary', description: 'ทำลายโรงเสบียงพม่าทั้งหมด' },
            defeat: { type: 'lose_hero', target: 'c2_hero_rama1', description: 'พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช สวรรคต' }
        }
    },
    campaign2_mission3: {
        id: 'campaign2_mission3',
        name: 'ยุทธการท่าดินแดง',
        description: 'ตั้งค่ายริมแม่น้ำและบุกทำลาย 3 ค่ายใหญ่ของพม่า',
        width: 4000,
        height: 3000,
        cameraStart: { x: 300, y: 1500 },
        terrain: { grass: '#4a7c59', forest: '#1e3f20', water: '#2980b9', road: '#a68b5b', mountain: '#6b7280' },
        playerUnits: [
            { type: 'c2_hero_rama1', x: 300, y: 1500, team: 0 },
            { type: 'c2_hero_prince', x: 400, y: 1600, team: 0 },
            { type: 'c2_elephant', x: 350, y: 1550, team: 0 },
            { type: 'c2_swordsman', x: 600, y: 1450, team: 0 },
            { type: 'c2_swordsman', x: 600, y: 1650, team: 0 }
        ],
        enemyUnits: [
            { type: 'c2_enemy_musketeer', x: 2500, y: 1000, team: 1 },
            { type: 'c2_enemy_musketeer', x: 2500, y: 1500, team: 1 },
            { type: 'c2_enemy_musketeer', x: 2500, y: 2000, team: 1 },
            { type: 'c2_enemy_infantry', x: 2200, y: 1500, team: 1 },
            { type: 'c2_enemy_infantry', x: 2200, y: 1400, team: 1 },
            { type: 'c2_enemy_infantry', x: 2200, y: 1600, team: 1 }
        ],
        buildings: [
            // พลับพลาอยู่หลังสุด (Size: 500)
            { type: 'c2_town_hall', x: 300, y: 1500, team: 0 },
            // โรงช้างใจกลางฐาน (Size: 500)
            { type: 'c2_elephant_stable', x: 900, y: 1500, team: 0 },
            // หอคอยล้อมรอบ (Size: 240)
            { type: 'c2_watchtower', x: 300, y: 1000, team: 0 },
            { type: 'c2_watchtower', x: 300, y: 2000, team: 0 },
            // ค่ายทหารและหอคอยประชิดสะพาน (คอขวด) (Size: 400, 240)
            { type: 'c2_barracks', x: 1200, y: 1000, team: 0 },
            { type: 'c2_barracks', x: 1200, y: 2000, team: 0 },
            { type: 'c2_watchtower', x: 1350, y: 1300, team: 0 },
            { type: 'c2_watchtower', x: 1350, y: 1700, team: 0 },

            // ค่ายพม่าด่านหน้า (Size: 500)
            { type: 'c2_burmese_camp', x: 3200, y: 600, team: 1 },
            { type: 'c2_burmese_camp', x: 3500, y: 1500, team: 1 },
            { type: 'c2_burmese_camp', x: 3200, y: 2400, team: 1 },

            // ป้อมปืนพม่า (Size: 240)
            { type: 'c2_watchtower', x: 2800, y: 1200, team: 1 },
            { type: 'c2_watchtower', x: 2800, y: 1800, team: 1 }
        ],
        features: [
            // แม่น้ำกั้นกลาง
            { type: 'water', x: 1500, y: 0, width: 300, height: 1350 },
            { type: 'road', x: 1500, y: 1350, width: 300, height: 300 }, // สะพานแคบตรงกลาง
            { type: 'water', x: 1500, y: 1650, width: 300, height: 1350 }
        ],
        objectives: {
            victory: { type: 'destroy_building', target: 'c2_burmese_camp', description: 'ทำลายค่ายพม่าทั้ง 3 ค่าย' },
            defeat: { type: 'destroy_building', target: 'c2_town_hall', description: 'พลับพลาประทับถูกทำลาย' }
        }
    },
    campaign2_mission4: {
        id: 'campaign2_mission4',
        name: 'การรุกไล่',
        description: 'ไล่กวดศัตรูที่แตกพ่าย และสร้างค่ายสกัดกั้น',
        width: 4000,
        height: 2000,
        cameraStart: { x: 400, y: 1000 },
        terrain: { grass: '#4a7c59', forest: '#1e3f20', water: '#2980b9', road: '#a68b5b', mountain: '#6b7280' },
        playerUnits: [
            { type: 'c2_hero_prince', x: 500, y: 1000, team: 0 },
            { type: 'cavalry', x: 400, y: 900, team: 0 },
            { type: 'cavalry', x: 400, y: 1100, team: 0 }
        ],
        enemyUnits: [
            { type: 'c2_enemy_infantry', x: 1000, y: 1000, team: 1 },
            { type: 'c2_enemy_infantry', x: 2000, y: 800, team: 1 },
            { type: 'c2_enemy_infantry', x: 2500, y: 1200, team: 1 },
            { type: 'c2_enemy_infantry', x: 3500, y: 1000, team: 1 }
        ],
        buildings: [
            // เรามีพลับพลาชั่วคราวเล็กๆ (Size: 500)
            { type: 'c2_town_hall', x: 300, y: 1000, team: 0 },
            // ค่ายทหารเล็กน้อยให้สร้างเพิ่มตามทางได้ (Size: 400)
            { type: 'c2_barracks', x: 900, y: 800, team: 0 },

            // หอคอยสกัดจับที่ประตูพรมแดนปลายแมพ (Size: 240)
            { type: 'c2_watchtower', x: 3700, y: 700, team: 0 },
            { type: 'c2_watchtower', x: 3700, y: 1300, team: 0 }
        ],
        features: [
            { type: 'forest', x: 800, y: 0, width: 200, height: 600 },
            { type: 'forest', x: 1800, y: 1400, width: 300, height: 600 },
            { type: 'road', x: 400, y: 900, width: 3600, height: 200 }, // ทางหนี
            { type: 'mountain', x: 3900, y: 0, width: 100, height: 2000 } // เทือกเขาตระนาวศรีปลายทาง
        ],
        objectives: {
            victory: { type: 'eliminate_all', description: 'กำจัดศัตรูที่เหลือรอดทั้งหมด' },
            defeat: { type: 'lose_hero', target: 'c2_hero_prince', description: 'กรมพระราชวังบวรฯ สิ้นพระชนม์' }
        }
    }
};
