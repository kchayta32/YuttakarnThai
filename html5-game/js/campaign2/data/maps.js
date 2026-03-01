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
            { type: 'mountain', x: 500, y: 1300, width: 200, height: 200, blockLos: false },
            { type: 'mountain', x: 700, y: 700, width: 200, height: 200 },
            { type: 'mountain', x: 1000, y: 200, width: 200, height: 500 }
        ],
        objectives: {
            victory: {
                type: 'multi',
                description: 'สำรวจพิกัดค่ายพม่าและกำจัดศัตรูทั้งหมด',
                conditions: [
                    { type: 'explore_zone', zone: { x: 2600, y: 300, w: 400, h: 1400 }, description: 'ส่งยูนิตไปถึงพิกัดค่ายพม่า' },
                    { type: 'eliminate_all', description: 'กำจัดศัตรูให้สิ้นซาก' }
                ]
            },
            defeat: {
                type: 'multi',
                conditions: [
                    { type: 'lose_all_units', description: 'ยูนิตทั้งหมดถูกกำจัด' },
                    { type: 'destroy_building', target: 'c2_town_hall', description: 'ค่ายหลักถูกทำลาย' }
                ]
            }
        }
    },
    campaign2_mission2: {
        id: 'campaign2_mission2',
        name: 'ตัดเส้นทางเสบียง',
        description: 'ซุ่มโจมตีขบวนขนส่งเสบียงของพม่าริมแม่น้ำ ทำลายเกวียนเสบียงทั้งหมด',
        width: 3200,
        height: 2400,
        cameraStart: { x: 200, y: 1000 },
        terrain: { grass: '#4a7c59', forest: '#1e3f20', water: '#2980b9', road: '#a68b5b', mountain: '#6b7280' },
        playerUnits: [
            { type: 'c2_hero_rama1', x: 300, y: 1200, team: 0 },
            { type: 'cavalry', x: 400, y: 1150, team: 0 },
            { type: 'cavalry', x: 400, y: 1250, team: 0 },
            { type: 'c2_archer', x: 200, y: 1100, team: 0 },
            { type: 'c2_archer', x: 200, y: 1300, team: 0 }
        ],
        enemyUnits: [
            // เกวียนเสบียง 5 คัน (กระจายตามถนน)
            { type: 'c2_supply_cart', x: 2500, y: 400, team: 1 },
            { type: 'c2_supply_cart', x: 2500, y: 800, team: 1 },
            { type: 'c2_supply_cart', x: 2500, y: 1200, team: 1 },
            { type: 'c2_supply_cart', x: 2500, y: 1600, team: 1 },
            { type: 'c2_supply_cart', x: 2500, y: 2000, team: 1 },
            // ทหารคุ้มกัน
            { type: 'c2_enemy_infantry', x: 2400, y: 600, team: 1 },
            { type: 'c2_enemy_infantry', x: 2400, y: 1000, team: 1 },
            { type: 'c2_enemy_infantry', x: 2400, y: 1400, team: 1 },
            { type: 'c2_enemy_musketeer', x: 2600, y: 1000, team: 1 },
            { type: 'c2_enemy_musketeer', x: 2600, y: 1800, team: 1 }
        ],
        buildings: [
            // ค่ายทหาร (Forward base) ใกล้ฐาน (Size: 400)
            { type: 'c2_barracks', x: 400, y: 1525, team: 0 },
            // หอคอยเรียงตามแม่น้ำ (Size: 240)
            { type: 'c2_watchtower', x: 750, y: 400, team: 0 },
            { type: 'c2_watchtower', x: 750, y: 1200, team: 0 },
            { type: 'c2_watchtower', x: 750, y: 2000, team: 0 },
            // โรงเสบียงพม่า (Size: 300)
            { type: 'c2_granary', x: 2800, y: 1000, team: 1 },
            { type: 'c2_granary', x: 2800, y: 1800, team: 1 }
        ],
        features: [
            { type: 'forest', x: 400, y: 550, width: 300, height: 250, blockMovement: true },
            { type: 'water', x: 1000, y: 0, width: 150, height: 1100 },
            { type: 'road', x: 1000, y: 1100, width: 150, height: 200 }, // สะพาน
            { type: 'water', x: 1000, y: 1300, width: 150, height: 1100 },
            { type: 'road', x: 2500, y: 0, width: 100, height: 2400 } // ถนนเสบียง
        ],
        objectives: {
            victory: {
                type: 'multi',
                description: 'ทำลายเกวียน 3 คันขึ้นไป และกวาดล้างศัตรูทั้งหมด',
                conditions: [
                    { type: 'destroy_minimum_type', target: 'c2_supply_cart', min: 3, description: 'ทำลายเกวียนเสบียงพม่า 3 คันขึ้นไป' },
                    { type: 'eliminate_all', description: 'กำจัดพรรคพวกทั้งหมด' }
                ]
            },
            defeat: {
                type: 'multi',
                conditions: [
                    { type: 'lose_hero', target: 'c2_hero_rama1', description: 'พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช สวรรคต' },
                    { type: 'escape_limit', target: 'c2_supply_cart', max: 2, description: 'เกวียนเสบียงหลุดรอดไปได้เกิน 2 คัน' },
                    { type: 'lose_all_of_type', target: 'cavalry', description: 'หน่วยม้าเร็วถูกกำจัดทั้งหมด' }
                ]
            }
        }
    },
    campaign2_mission3: {
        id: 'campaign2_mission3',
        name: 'ยุทธการท่าดินแดง',
        description: 'บุกทำลาย 3 ค่ายใหญ่ของพม่า และสังหารแม่ทัพพม่า',
        width: 4000,
        height: 3000,
        cameraStart: { x: 300, y: 1500 },
        terrain: { grass: '#4a7c59', forest: '#1e3f20', water: '#2980b9', road: '#a68b5b', mountain: '#6b7280' },
        playerUnits: [
            { type: 'c2_hero_rama1', x: 300, y: 1800, team: 0 },
            { type: 'c2_hero_prince', x: 400, y: 1800, team: 0 },
            { type: 'c2_elephant', x: 350, y: 1850, team: 0 },
            { type: 'c2_swordsman', x: 600, y: 1450, team: 0 },
            { type: 'c2_swordsman', x: 600, y: 1650, team: 0 },
            { type: 'c2_archer', x: 500, y: 1350, team: 0 },
            { type: 'c2_archer', x: 500, y: 1750, team: 0 }
        ],
        enemyUnits: [
            // แม่ทัพพม่า (Boss)
            { type: 'c2_burmese_general', x: 3500, y: 1500, team: 1 },
            // ทหารคุ้มกันค่ายท่าดินแดง
            { type: 'c2_enemy_musketeer', x: 2500, y: 800, team: 1 },
            { type: 'c2_enemy_musketeer', x: 2700, y: 700, team: 1 },
            { type: 'c2_enemy_infantry', x: 2400, y: 600, team: 1 },
            // ทหารคุ้มกันค่ายสามสบ
            { type: 'c2_enemy_musketeer', x: 2500, y: 2200, team: 1 },
            { type: 'c2_enemy_infantry', x: 2400, y: 2400, team: 1 },
            { type: 'c2_enemy_infantry', x: 2700, y: 2300, team: 1 },
            // ทหารคุ้มกันศูนย์บัญชาการ
            { type: 'c2_enemy_musketeer', x: 3300, y: 1400, team: 1 },
            { type: 'c2_enemy_musketeer', x: 3300, y: 1600, team: 1 },
            { type: 'c2_enemy_infantry', x: 3200, y: 1500, team: 1 },
            { type: 'c2_enemy_infantry', x: 3400, y: 1300, team: 1 },
            { type: 'c2_enemy_infantry', x: 3400, y: 1700, team: 1 }
        ],
        buildings: [
            // ฝั่งไทย
            { type: 'c2_town_hall', x: 300, y: 1500, team: 0 },
            { type: 'c2_elephant_stable', x: 900, y: 1500, team: 0 },
            { type: 'c2_watchtower', x: 300, y: 1000, team: 0 },
            { type: 'c2_watchtower', x: 300, y: 2000, team: 0 },
            { type: 'c2_barracks', x: 1200, y: 1000, team: 0 },
            { type: 'c2_barracks', x: 1200, y: 2000, team: 0 },
            { type: 'c2_watchtower', x: 1350, y: 1300, team: 0 },
            { type: 'c2_watchtower', x: 1350, y: 1700, team: 0 },

            // 3 ค่ายพม่า (ใช้ Building เฉพาะ)
            { type: 'c2_camp_thadindaeng', x: 2800, y: 600, team: 1 },  // ค่ายท่าดินแดง
            { type: 'c2_camp_samsob', x: 2800, y: 2400, team: 1 },       // ค่ายสามสบ
            { type: 'c2_general_hq', x: 3600, y: 1500, team: 1 },        // ศูนย์บัญชาการ

            // ป้อมปืนพม่า
            { type: 'c2_watchtower', x: 2500, y: 1200, team: 1 },
            { type: 'c2_watchtower', x: 2500, y: 1800, team: 1 }
        ],
        features: [
            // แม่น้ำกั้นกลาง
            { type: 'water', x: 1500, y: 0, width: 300, height: 1350 },
            { type: 'road', x: 1500, y: 1350, width: 300, height: 300 }, // สะพานแคบตรงกลาง
            { type: 'water', x: 1500, y: 1650, width: 300, height: 1350 }
        ],
        objectives: {
            victory: {
                type: 'multi',
                description: 'กำจัดศัตรูทั้งหมด',
                conditions: [
                    { type: 'eliminate_all', description: 'กำจัดศัตรูทั้งหมด' }
                ]
            },
            defeat: {
                type: 'multi',
                conditions: [
                    { type: 'lose_hero', target: 'c2_hero_rama1', description: 'พระบาทสมเด็จพระพุทธยอดฟ้าฯ สวรรคต' },
                    { type: 'lose_hero', target: 'c2_hero_prince', description: 'กรมพระราชวังบวรฯ สิ้นพระชนม์' },
                    { type: 'destroy_building', target: 'c2_town_hall', description: 'ฐานทัพไทยถูกตีแตก' }
                ]
            }
        }
    },
    campaign2_mission4: {
        id: 'campaign2_mission4',
        name: 'การรุกไล่ข้ามพรมแดน',
        description: 'ไล่กวดศัตรูที่แตกพ่ายและนำทัพสู่ด่านเจดีย์สามองค์ ภายในเวลา 10 นาที',
        width: 4000,
        height: 2000,
        cameraStart: { x: 400, y: 1000 },
        terrain: { grass: '#4a7c59', forest: '#1e3f20', water: '#2980b9', road: '#a68b5b', mountain: '#6b7280' },
        playerUnits: [
            { type: 'c2_hero_prince', x: 500, y: 1000, team: 0 },
            { type: 'cavalry', x: 400, y: 900, team: 0 },
            { type: 'cavalry', x: 400, y: 1100, team: 0 },
            { type: 'c2_swordsman', x: 600, y: 950, team: 0 },
            { type: 'c2_swordsman', x: 600, y: 1050, team: 0 }
        ],
        enemyUnits: [
            { type: 'c2_enemy_infantry', x: 1000, y: 1000, team: 1 },
            { type: 'c2_enemy_infantry', x: 1500, y: 800, team: 1 },
            { type: 'c2_enemy_infantry', x: 2000, y: 1200, team: 1 },
            { type: 'c2_enemy_infantry', x: 2500, y: 900, team: 1 },
            { type: 'c2_enemy_infantry', x: 3000, y: 1100, team: 1 },
            { type: 'c2_enemy_musketeer', x: 3200, y: 1000, team: 1 }
        ],
        buildings: [
            // ฐานชั่วคราว
            { type: 'c2_town_hall', x: 180, y: 1000, team: 0 },
            { type: 'c2_barracks', x: 900, y: 630, team: 0 },

            // ด่านเจดีย์สามองค์ (ปลายแมพ)
            { type: 'c2_three_pagodas_gate', x: 3800, y: 1000, team: 0 },

            // หอคอยสกัดจับที่ประตูพรมแดน
            { type: 'c2_watchtower', x: 3600, y: 700, team: 0 },
            { type: 'c2_watchtower', x: 3600, y: 1300, team: 0 }
        ],
        features: [
            { type: 'forest', x: 800, y: 0, width: 200, height: 600 },
            { type: 'forest', x: 1800, y: 1400, width: 300, height: 600 },
            { type: 'road', x: 400, y: 900, width: 3600, height: 200 }, // ทางหนี
            { type: 'mountain', x: 3900, y: 0, width: 100, height: 2000 } // เทือกเขาตระนาวศรี
        ],
        objectives: {
            victory: {
                type: 'eliminate_all',
                description: 'กำจัดศัตรูทั้งหมดและนำทัพสู่ชัยชนะ'
            },
            defeat: {
                type: 'multi',
                conditions: [
                    { type: 'lose_hero', target: 'c2_hero_prince', description: 'กรมพระราชวังบวรฯ สิ้นพระชนม์' },
                    { type: 'lose_all_units', description: 'ยูนิตทั้งหมดถูกกำจัด' }
                ]
            }
        }
    }
};
