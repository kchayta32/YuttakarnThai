// ===================================
// RTS: ยุทธการไทย - Game Data
// Unit Definitions
// ===================================

import { CAMPAIGN2_UNITS, CAMPAIGN2_BUILDINGS } from '../campaign2/data/units.js';

export const UNIT_TYPES = {
    // === SIAM (Player) Units ===
    SWORDSMAN: {
        id: 'swordsman',
        name: 'พลดาบ',
        nameEn: 'Swordsman',
        icon: '⚔️',
        color: '#27ae60',
        hp: 100,
        maxHp: 100,
        attack: 12,
        defense: 2,
        range: 1,
        speed: 2,
        attackSpeed: 1.0,
        visionRange: 12,
        cost: { food: 50, gold: 0 },
        buildTime: 5,
        description: 'ทหารราบพื้นฐานติดอาวุธดาบสั้น'
    },
    SPEARMAN: {
        id: 'spearman',
        name: 'พลหอก',
        nameEn: 'Spearman',
        icon: '🔱',
        color: '#2980b9',
        hp: 80,
        maxHp: 80,
        attack: 8,
        defense: 4,
        range: 1.5,
        speed: 1.8,
        attackSpeed: 1.2,
        visionRange: 12,
        cost: { food: 40, gold: 10 },
        buildTime: 6,
        description: 'ทหารหอกเหมาะต่อต้านม้าและช้าง',
        bonusVs: ['cavalry', 'elephant']
    },
    ARCHER: {
        id: 'archer',
        name: 'นักธนู',
        nameEn: 'Archer',
        icon: '🏹',
        color: '#8e44ad',
        hp: 60,
        maxHp: 60,
        attack: 10,
        defense: 0,
        range: 5,
        speed: 2.2,
        attackSpeed: 1.5,
        visionRange: 15,
        cost: { food: 30, gold: 30 },
        buildTime: 7,
        description: 'หน่วยยิงระยะไกล'
    },
    WAR_ELEPHANT: {
        id: 'elephant',
        name: 'ช้างศึก',
        nameEn: 'War Elephant',
        icon: '🐘',
        color: '#d35400',
        hp: 500,
        maxHp: 500,
        attack: 35,
        defense: 8,
        range: 1.5,
        speed: 1.7,
        attackSpeed: 2.0,
        visionRange: 16,
        cost: { food: 200, gold: 100 },
        buildTime: 20,
        description: 'หน่วยรถถังโบราณ สร้างความเสียหายกว้าง',
        aoe: true
    },
    CAVALRY: {
        id: 'cavalry',
        name: 'ม้าศึก',
        nameEn: 'Cavalry',
        icon: '🐴',
        color: '#c0392b',
        hp: 120,
        maxHp: 120,
        attack: 15,
        defense: 3,
        range: 1,
        speed: 4,
        attackSpeed: 1.0,
        visionRange: 14,
        cost: { food: 80, gold: 50 },
        buildTime: 10,
        description: 'หน่วยโจมตีเร็ว เหมาะโจมตีนักธนู'
    },
    WORKER: {
        id: 'worker',
        name: 'ชาวบ้าน',
        nameEn: 'Worker',
        icon: '👷',
        color: '#f39c12',
        hp: 40,
        maxHp: 40,
        attack: 3,
        defense: 0,
        range: 1,
        speed: 2,
        attackSpeed: 2.0,
        visionRange: 8,
        cost: { food: 50, gold: 0 },
        buildTime: 3,
        description: 'เก็บทรัพยากร สร้างอาคาร',
        type: 'worker',
        canBuild: true,
        canGather: true
    },

    // === BURMA (Enemy) Units ===
    ENEMY_SWORDSMAN: {
        id: 'enemy_swordsman',
        name: 'พลดาบพม่า',
        nameEn: 'Burmese Swordsman',
        icon: '⚔️',
        color: '#c0392b',
        hp: 90,
        maxHp: 90,
        attack: 10,
        defense: 2,
        range: 1,
        speed: 2,
        attackSpeed: 1.0,
        visionRange: 5,
        isEnemy: true
    },
    ENEMY_SPEARMAN: {
        id: 'enemy_spearman',
        name: 'พลหอกพม่า',
        nameEn: 'Burmese Spearman',
        icon: '🔱',
        color: '#c0392b',
        hp: 70,
        maxHp: 70,
        attack: 7,
        defense: 3,
        range: 1.5,
        speed: 1.8,
        attackSpeed: 1.2,
        visionRange: 5,
        isEnemy: true,
        bonusVs: ['cavalry', 'elephant']
    },
    ENEMY_ARCHER: {
        id: 'enemy_archer',
        name: 'นักธนูพม่า',
        nameEn: 'Burmese Archer',
        icon: '🏹',
        color: '#c0392b',
        hp: 50,
        maxHp: 50,
        attack: 8,
        defense: 0,
        range: 8,
        speed: 2.2,
        attackSpeed: 1.5,
        visionRange: 7,
        isEnemy: true
    },
    ENEMY_ELEPHANT: {
        id: 'enemy_elephant',
        name: 'ช้างศึกพม่า',
        nameEn: 'Burmese Elephant',
        icon: '🐘',
        color: '#c0392b',
        hp: 450,
        maxHp: 450,
        attack: 30,
        defense: 7,
        range: 1.5,
        speed: 1.6,
        attackSpeed: 2.0,
        visionRange: 8,
        isEnemy: true,
        aoe: true
    },
    ENEMY_CAVALRY: {
        id: 'enemy_cavalry',
        name: 'ม้าศึกพม่า',
        nameEn: 'Burmese Cavalry',
        icon: '🐴',
        color: '#c0392b',
        hp: 110,
        maxHp: 110,
        attack: 14,
        defense: 2,
        range: 1,
        speed: 4,
        attackSpeed: 1.0,
        visionRange: 6,
        isEnemy: true
    },

    // === MISSION 2 SPECIFIC UNITS ===
    BURMESE_DEFENDER: {
        id: 'burmese_defender',
        name: 'ทหารพม่าประจำการ',
        nameEn: 'Burmese Defender',
        icon: '🛡️',
        color: '#8b0000',
        hp: 120,
        maxHp: 120,
        attack: 8,
        defense: 6,
        range: 1,
        speed: 1.5,
        attackSpeed: 1.5,
        visionRange: 5,
        isEnemy: true,
        description: 'ทหารพม่าป้องกันเมือง มีเกราะหนา'
    },
    SIAMESE_ASSAULT: {
        id: 'siamese_assault',
        name: 'ทหารบุกสยาม',
        nameEn: 'Siamese Assault Infantry',
        icon: '⚔️',
        color: '#ffd700',
        hp: 90,
        maxHp: 90,
        attack: 15,
        defense: 2,
        range: 1,
        speed: 2.5,
        attackSpeed: 0.8,
        visionRange: 14,
        cost: { food: 60, gold: 20 },
        buildTime: 6,
        description: 'ทหารบุกจู่โจม โจมตีรุนแรง'
    },
    WAR_BOAT: {
        id: 'war_boat',
        name: 'เรือรบ',
        nameEn: 'War Boat',
        icon: '⛵',
        color: '#2e86ab',
        hp: 200,
        maxHp: 200,
        attack: 20,
        defense: 5,
        range: 4,
        speed: 3,
        attackSpeed: 2.0,
        visionRange: 8,
        cost: { food: 100, gold: 80 },
        buildTime: 15,
        description: 'เรือรบลำเลียงทหารและยิงธนู',
        isNaval: true
    },

    // === MISSION 6 SPECIFIC UNITS ===
    THAI_KING: {
        id: 'thai_king',
        name: 'สมเด็จพระมหาจักรพรรดิ',
        nameEn: 'King Maha Chakkraphat',
        icon: '👑',
        color: '#f1c40f',
        hp: 1500,
        maxHp: 1500,
        attack: 40,
        defense: 10,
        range: 1.5,
        speed: 1.5,
        attackSpeed: 2.0,
        visionRange: 16,
        description: 'กษัตริย์แห่งสยาม',
        aoe: true
    },
    QUEEN_SURIYOTHAI: {
        id: 'queen_suriyothai',
        name: 'สมเด็จพระสุริโยทัย',
        nameEn: 'Queen Suriyothai',
        icon: '👸',
        color: '#e67e22',
        hp: 1200,
        maxHp: 1200,
        attack: 35,
        defense: 8,
        range: 1.5,
        speed: 1.8,
        attackSpeed: 1.8,
        visionRange: 16,
        description: 'วีรสตรีผู้ปกป้องพระสวามี',
        aoe: true
    },
    BURMESE_KING: {
        id: 'burmese_king',
        name: 'พระเจ้าตะเบ็งชเวตี้',
        nameEn: 'King Tabinshwehti',
        icon: '👑',
        color: '#c0392b',
        hp: 2000,
        maxHp: 2000,
        attack: 45,
        defense: 12,
        range: 1.5,
        speed: 1.5,
        attackSpeed: 2.0,
        visionRange: 16,
        isEnemy: true,
        description: 'จอมทัพพม่าผู้เกรียงไกร',
        aoe: true
    },

    // === MISSION 8 SPECIFIC UNITS ===
    PORTUGUESE_MERC: {
        id: 'portuguese_merc',
        name: 'ทหารรับจ้างโปรตุเกส',
        nameEn: 'Portuguese Mercenary',
        icon: '🔫',
        color: '#3498db',
        hp: 80,
        maxHp: 80,
        attack: 25,
        defense: 2,
        range: 10,
        speed: 1.5,
        attackSpeed: 3.0,
        visionRange: 16,
        cost: { food: 50, gold: 50 },
        buildTime: 8,
        description: 'หน่วยปืนไฟ พลังโจมตีสูงแต่ยิงช้า'
    },
    ...CAMPAIGN2_UNITS
};

export const BUILDING_TYPES = {
    BARRACKS: {
        id: 'barracks',
        name: 'ค่ายทหาร',
        icon: '🏛️',
        builds: ['swordsman', 'spearman', 'archer'],
        cost: { food: 0, gold: 150 },
        size: 225 // Increased 1.5x from 150
    },
    STABLE: {
        id: 'stable',
        name: 'คอกม้า',
        icon: '🐴',
        hp: 800,
        builds: ['cavalry'],
        cost: { food: 100, gold: 100 }
    },
    ELEPHANT_PEN: {
        id: 'elephant_pen',
        name: 'โรงช้าง',
        icon: '🐘',
        hp: 1200,
        builds: ['elephant'],
        cost: { food: 150, gold: 200 }
    },
    FARM: {
        id: 'farm',
        name: 'นาข้าว',
        icon: '🌾',
        hp: 300,
        produces: 'food',
        rate: 10,
        cost: { food: 0, gold: 50 },
        size: 360 // Doubled from 180
    },
    MARKET: {
        id: 'market',
        name: 'ตลาด',
        icon: '💰',
        hp: 500,
        produces: 'gold',
        rate: 5,
        cost: { food: 100, gold: 0 },
        size: 180
    },
    WALL: {
        id: 'wall',
        name: 'กำแพง',
        icon: '🧱',
        hp: 2000,
        cost: { food: 0, gold: 30 },
        size: 80,
        description: 'กำแพงป้องกันศัตรู ทนทานมาก'
    },
    WATCH_TOWER: {
        id: 'watch_tower',
        name: 'หอคอย',
        icon: '🗼',
        hp: 800,
        attack: 15,
        range: 8,
        attackSpeed: 2.0,
        cost: { food: 0, gold: 100 },
        size: 100,
        visionRange: 12,
        description: 'หอยิงธนูอัตโนมัติ มองเห็นระยะไกล'
    },
    PALACE: {
        id: 'palace',
        name: 'พระราชวัง',
        icon: '🏯',
        hp: 5000,
        cost: { food: 500, gold: 500 },
        size: 250,
        description: 'ศูนย์บัญชาการหลัก ต้องปกป้องไว้ให้ได้'
    },
    WOOD_FACTORY: {
        id: 'wood_factory',
        name: 'โรงเลื่อย',
        icon: '🪵',
        hp: 600,
        produces: 'wood',
        rate: 8,
        cost: { food: 0, gold: 75 },
        size: 150,
        description: 'ผลิตไม้สำหรับก่อสร้าง'
    },

    // === MISSION 2 SPECIFIC BUILDINGS ===
    BURMESE_FORTRESS: {
        id: 'burmese_fortress',
        name: 'ป้อมปราการพม่า',
        icon: '🏰',
        hp: 3000,
        attack: 20,
        range: 6,
        attackSpeed: 3.0,
        size: 600, // Doubled from 300
        description: 'ป้อมปราการพม่า มีหอยิงธนู'
    },
    COASTAL_BARRACKS: {
        id: 'coastal_barracks',
        name: 'ค่ายทหารชายฝั่ง',
        icon: '🏕️',
        hp: 800,
        builds: ['burmese_defender'],
        size: 360, // Doubled from 180
        description: 'ค่ายทหารพม่าริมทะเล'
    },
    DOCK: {
        id: 'dock',
        name: 'ท่าเรือ',
        icon: '⚓',
        hp: 500,
        builds: ['war_boat'],
        cost: { food: 150, gold: 100 },
        size: 400, // Doubled from 200
        description: 'ท่าเรือสำหรับสร้างเรือรบ'
    },

    // === MISSION 3 SPECIFIC BUILDINGS ===
    THREE_PAGODAS: {
        id: 'three_pagodas',
        name: 'พระเจดีย์สามองค์',
        icon: 'pagoda',
        hp: 5000,
        size: 400,
        description: 'สัญลักษณ์แห่งด่านชายแดน'
    },
    BORDER_OUTPOST: {
        id: 'border_outpost',
        name: 'ด่านตรวจคนเข้าเมือง',
        icon: 'gate',
        hp: 1500,
        size: 300,
        description: 'จุดตรวจและป้องกันชายแดน'
    },
    SUPPLY_CAMP: {
        id: 'supply_camp',
        name: 'ค่ายเสบียง',
        icon: 'tent',
        hp: 800,
        size: 250,
        description: 'ค่ายพักแรมและเก็บเสบียง'
    },

    // === MISSION 4 SPECIFIC BUILDINGS ===
    ROYAL_PAVILION: {
        id: 'royal_pavilion',
        name: 'พลับพลาที่ประทับ',
        icon: 'pavilion',
        hp: 4000,
        size: 600, // Reduced from 700 to fix stuck units
        description: 'ศูนย์บัญชาการหลักในสนามรบ'
    },
    FIELD_ARMORY: {
        id: 'field_armory',
        name: 'คลังอาวุธสนาม',
        icon: 'armory',
        hp: 1000,
        size: 400, // Doubled from 200
        description: 'จุดเก็บอาวุธและเสบียงกรัง'
    },
    BARRIER: {
        id: 'barricades',
        name: 'แนวป้องกัน',
        icon: 'barricade',
        hp: 2000,
        size: 300, // Doubled from 150
        description: 'ขวากหนามป้องกันการบุกรุก'
    },

    // === MISSION 7 SPECIFIC BUILDINGS ===
    BURMESE_CAMP: {
        id: 'burmese_camp',
        name: 'ค่ายพักแรมพม่า',
        icon: '⛺',
        hp: 1500,
        size: 300,
        description: 'ค่ายพักชั่วคราวของกองทัพพม่าที่กำลังล่าถอย'
    },

    // === MISSION 8 SPECIFIC BUILDINGS ===
    KAMPHAENG_PHET_WALL: {
        id: 'kamphaeng_phet_wall',
        name: 'ป้อมกำแพงเพชร',
        icon: '🧱',
        hp: 4000,
        attack: 20,
        range: 6,
        attackSpeed: 2.5,
        size: 300,
        description: 'ป้อมปราการศิลาแลงอันแข็งแกร่ง'
    },
    PORTUGUESE_CAMP: {
        id: 'portuguese_camp',
        name: 'ค่ายทหารโปรตุเกส',
        icon: '🏰',
        hp: 2000,
        builds: ['portuguese_merc'],
        cost: { food: 200, gold: 200 },
        size: 250,
        description: 'ที่ตั้งของทหารรับจ้างแม่นปืน'
    },
    ...CAMPAIGN2_BUILDINGS
};
