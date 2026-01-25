// ===================================
// RTS: ยุทธการไทย - Game Data
// Unit Definitions
// ===================================

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
        speed: 1.2,
        attackSpeed: 2.0,
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
        range: 5,
        speed: 2.2,
        attackSpeed: 1.5,
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
        speed: 1.2,
        attackSpeed: 2.0,
        isEnemy: true,
        aoe: true
    }
};

export const BUILDING_TYPES = {
    BARRACKS: {
        id: 'barracks',
        name: 'ค่ายทหาร',
        icon: '🏛️',
        hp: 1000,
        builds: ['swordsman', 'spearman', 'archer'],
        cost: { food: 0, gold: 150 }
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
        cost: { food: 0, gold: 50 }
    },
    MARKET: {
        id: 'market',
        name: 'ตลาด',
        icon: '💰',
        hp: 500,
        produces: 'gold',
        rate: 5,
        cost: { food: 100, gold: 0 }
    }
};
