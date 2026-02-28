// ===================================
// RTS: ยุทธการไทย - Sprite Manager
// Loads and caches sprite images
// ===================================

export class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.loading = new Map();
        this.loaded = false;

        // Sprite definitions with paths
        this.spriteDefs = {
            // Units
            'swordsman': 'images/units/swordsman.png',
            'spearman': 'images/units/spearman.png',
            'archer': 'images/units/archer.png',
            'elephant': 'images/units/elephant.png',
            'cavalry': 'images/units/cavalry.png',
            'worker': 'images/units/swordsman.png',
            'enemy_swordsman': 'images/units/enemy_swordsman.png',
            'enemy_spearman': 'images/units/enemy_spearman.png',
            'enemy_archer': 'images/units/enemy_archer.png',
            'enemy_elephant': 'images/units/enemy_war_elephant.png',
            'enemy_cavalry': 'images/units/enemy_cavalry.png',

            // Terrain
            'grass': 'images/terrain/grass.png',
            'tree': 'images/terrain/thee.png',
            'tree_small': 'images/terrain/tree-sm.png',
            'rock': 'images/terrain/rock.png',
            'ocean_wave': 'images/terrain/ocean-wave.png',

            // Buildings
            'barracks': 'images/buildings/barracks.png',
            'enemy_barracks': 'images/buildings/woodred.png',
            'wood_factory': 'images/buildings/wood_factory.png',
            'elephant_pen': 'images/buildings/elephant_pen.png',
            'farm': 'images/buildings/farm_new.png',
            'wall': 'images/buildings/wall.png',
            'watch_tower': 'images/buildings/watch_tower.png',
            'palace': 'images/buildings/palace.png',
            'market': 'images/buildings/market.png',
            'stable': 'images/buildings/stable.png',

            // Mission 2 Buildings
            'burmese_fortress': 'images/buildings/mission2/burmese_fortress.png',
            'coastal_barracks': 'images/buildings/mission2/coastal_barracks.png',
            'dock': 'images/buildings/mission2/dock.png',

            // Mission 3 Buildings
            'three_pagodas': 'images/buildings/mission3/three_pagodas.png',
            'border_outpost': 'images/buildings/mission3/border_outpost.png',
            'supply_camp': 'images/buildings/mission3/supply_camp.png',

            // Mission 4 Buildings
            'royal_pavilion': 'images/buildings/mission4/royal_pavilion.png',
            'field_armory': 'images/buildings/mission4/field_armory.png',
            'barricades': 'images/buildings/mission4/barricades.png',

            // Mission 7/8 Buildings
            'burmese_camp': 'images/buildings/mission8/burmese_camp.png',
            'kamphaeng_phet_wall': 'images/buildings/mission8/kamphaeng_phet_wall.png',
            'portuguese_camp': 'images/buildings/mission8/portuguese_camp.png',

            // Mission 2 Units
            'burmese_defender': 'images/units/mission2/burmese_defender.png',
            'siamese_assault': 'images/units/mission2/siamese_assault_infantry.png',
            'war_boat': 'images/units/mission2/war_boat.png',

            // Mission 2 Terrain
            'tropical_forest': 'images/terrain/mission2/tropical_forest.png',
            'river_crossing': 'images/terrain/mission2/river_crossing.png',
            'coastal_sand': 'images/terrain/mission2/coastal_sand.png',
            'wooden_bridge': 'images/terrain/mission2/wooden_bridge.png',

            // Mission 6 Hero Units
            'thai_king': 'images/units/mission6/thai_king.png',
            'burmese_king': 'images/units/mission6/burmese_king.png',
            'queen_suriyothai': 'images/units/mission6/queen_suriyothai.png',

            // Mission 8 Units
            /*
             * TEXT PROMPT FOR IMAGE GENERATION (ทหารรับจ้างโปรตุเกส สำหรับใส่ใน images/units/portuguese_merc.png):
             * "A 16th-century Portuguese mercenary soldier in Ayutthaya, holding a matchlock musket. Top-down isometric perspective game sprite asset, clean pixel art style, transparent background."
             */
            'portuguese_merc': 'images/units/portuguese_merc.png',

            // Mission 2 Story
            'story_m2_opening': 'images/story/mission2/Opening Scene - กองทัพสยามเตรียมบุก.png',
            'story_m2_map': 'images/story/mission2/Map_Strategy Scene - แผนที่เมืองท่าวาย.png',
            'story_m2_battle': 'images/story/mission2/Battle Scene - ข้ามแม่น้ำบุกเมือง.png',
            'story_m2_victory': 'images/story/mission2/Victory Scene - ยึดเมืองสำเร็จ.png',

            // Campaign 2 Buildings
            'c2_town_hall': 'images/campain 2/Buildings/พลับพลาที่ประทับ(Town Hall).png',
            'c2_barracks': 'images/campain 2/Buildings/ค่ายทหาร(Barracks).png', // Fallback to standard barracks as campaign 2 specific might be missing
            'c2_elephant_stable': 'images/campain 2/Buildings/โรงช้าง(Elephant Stable).png',
            'c2_granary': 'images/campain 2/Buildings/โรงเสบียง(Granary).png',
            'c2_watchtower': 'images/campain 2/Buildings/หอคอยเฝ้าระวัง(Watchtower).png',

            // Campaign 2 Thai Units
            'c2_hero_prince': 'images/campain 2/ThaiForces/ตัวละครฮีโร่-กรมพระราชวังบวรฯ(Hero2-FrontPalacePrince).png',
            'c2_elephant': 'images/campain 2/ThaiForces/ช้างศึก(ThaiForce-War Elephant).png',
            'c2_hero_rama1': 'images/campain 2/ThaiForces/ตัวละครฮีโร่-รัชกาลที่1(Hero1-RamaI).png',
            'c2_swordsman': 'images/campain 2/ThaiForces/พลดาบ-พลโล่(ThaiForce-Swordsman-Shieldman).png',
            'c2_archer': 'images/campain 2/ThaiForces/พลธนู(ThaiForce-Archer).png',

            // Campaign 2 Burmese Units
            'c2_enemy_musketeer': 'images/campain 2/BurmeseForces/พลปืนไฟ(BurmeseForce-Musketeer).png',
            'c2_enemy_infantry1': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry1.png',
            'c2_enemy_infantry2': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry2.png',
            'c2_enemy_infantry3': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry3.png',
            'c2_enemy_infantry4': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry4.png',
            'c2_enemy_infantry5': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry5.png',
            'c2_enemy_infantry6': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry6.png',
            'c2_enemy_infantry7': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry7.png',
            'c2_enemy_infantry8': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry8.png',
            'c2_enemy_infantry9': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry9.png',
            'c2_enemy_infantry10': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry10.png',
            'c2_enemy_infantry11': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry11.png',
            'c2_enemy_infantry12': 'images/campain 2/BurmeseForces/BurmeseForce-Infantry12.png'
        };
    }

    /**
     * Preload all sprites
     */
    async preloadAll() {
        const promises = [];

        for (const [key, path] of Object.entries(this.spriteDefs)) {
            promises.push(this.loadSprite(key, path));
        }

        await Promise.allSettled(promises);
        this.loaded = true;
        console.log('SpriteManager: All sprites loaded');
    }

    /**
     * Load a single sprite
     */
    loadSprite(key, path) {
        if (this.sprites.has(key)) {
            return Promise.resolve(this.sprites.get(key));
        }

        if (this.loading.has(key)) {
            return this.loading.get(key);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(key, img);
                this.loading.delete(key);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${path}`);
                this.loading.delete(key);
                resolve(null); // Don't reject, just return null
            };
            img.src = path;
        });

        this.loading.set(key, promise);
        return promise;
    }

    /**
     * Get sprite by key
     */
    get(key) {
        return this.sprites.get(key) || null;
    }

    /**
     * Check if sprite exists and is loaded
     */
    has(key) {
        return this.sprites.has(key) && this.sprites.get(key) !== null;
    }

    /**
     * Get unit sprite key based on unit type
     */
    getUnitSpriteKey(unit) {
        const id = (unit.typeId || unit.id || unit.type || "").toLowerCase();

        if (unit.isEnemy) {
            // Enemy variants
            if (id.includes('burmese_defender')) return 'burmese_defender';
            if (id.includes('burmese_king')) return 'burmese_king'; // New Hero
            if (id.includes('c2_enemy_musketeer')) return 'c2_enemy_musketeer';
            if (id.includes('c2_enemy_infantry')) return unit.spriteVariant || 'c2_enemy_infantry1';
            if (id.includes('swordsman')) return 'enemy_swordsman';
            if (id.includes('spearman')) return 'enemy_spearman';
            if (id.includes('archer')) return 'enemy_archer';
            if (id.includes('elephant')) return 'enemy_elephant';
            if (id.includes('cavalry')) return 'enemy_cavalry';
            return 'enemy_swordsman';
        } else {
            // Player units
            if (id.includes('siamese_assault')) return 'siamese_assault';
            if (id.includes('war_boat')) return 'war_boat';
            if (id.includes('c2_hero_rama1')) return 'c2_hero_rama1';
            if (id.includes('c2_hero_prince')) return 'c2_hero_prince';
            if (id.includes('c2_swordsman')) return 'c2_swordsman';
            if (id.includes('c2_archer')) return 'c2_archer';
            if (id.includes('c2_elephant')) return 'c2_elephant';
            if (id.includes('thai_king')) return 'thai_king'; // New Hero
            if (id.includes('queen_suriyothai')) return 'queen_suriyothai'; // New Hero
            if (id.includes('portuguese_merc')) return 'portuguese_merc';
            if (id.includes('swordsman')) return 'swordsman';
            if (id.includes('spearman')) return 'spearman';
            if (id.includes('archer')) return 'archer';
            if (id.includes('elephant')) return 'elephant';
            if (id.includes('cavalry')) return 'cavalry';
            if (id.includes('worker')) return 'worker';
            return 'swordsman';
        }
    }
}

// Singleton instance
export const spriteManager = new SpriteManager();
