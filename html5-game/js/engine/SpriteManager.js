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
            'wood_factory': 'images/buildings/wood_factory.png',
            'elephant_pen': 'images/buildings/elephant_pen.png',
            'farm': 'images/buildings/vegetable_plot.png',
            'wall': 'images/buildings/wall.png',
            'watch_tower': 'images/buildings/watch_tower.png',
            'palace': 'images/buildings/palace.png',
            'market': 'images/buildings/market.png',
            'stable': 'images/buildings/stable.png',

            // Mission 2 Buildings
            'burmese_fortress': 'images/buildings/mission2/burmese_fortress.png',
            'coastal_barracks': 'images/buildings/mission2/coastal_barracks.png',
            'dock': 'images/buildings/mission2/dock.png',

            // Mission 2 Units
            'burmese_defender': 'images/units/mission2/burmese_defender.png',
            'siamese_assault': 'images/units/mission2/siamese_assault_infantry.png',
            'war_boat': 'images/units/mission2/war_boat.png',

            // Mission 2 Terrain
            'tropical_forest': 'images/terrain/mission2/tropical_forest.png',
            'river_crossing': 'images/terrain/mission2/river_crossing.png',
            'coastal_sand': 'images/terrain/mission2/coastal_sand.png',
            'wooden_bridge': 'images/terrain/mission2/wooden_bridge.png',

            // Mission 2 Story
            'story_m2_opening': 'images/story/mission2/Opening Scene - กองทัพสยามเตรียมบุก.png',
            'story_m2_map': 'images/story/mission2/Map_Strategy Scene - แผนที่เมืองท่าวาย.png',
            'story_m2_battle': 'images/story/mission2/Battle Scene - ข้ามแม่น้ำบุกเมือง.png',
            'story_m2_victory': 'images/story/mission2/Victory Scene - ยึดเมืองสำเร็จ.png'
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
