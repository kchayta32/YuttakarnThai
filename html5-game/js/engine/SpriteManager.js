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
            'cavalry': 'images/units/swordsman.png', // missing horse asset
            'worker': 'images/units/swordsman.png',
            'enemy_swordsman': 'images/units/enemy_swordsman.png',
            'enemy_spearman': 'images/units/spearman.png',
            'enemy_archer': 'images/units/archer.png',
            'enemy_elephant': 'images/units/elephant.png',

            // Terrain
            'grass': 'images/terrain/grass.png',
            'tree': 'images/terrain/thee.png',
            'tree_small': 'images/terrain/tree-sm.png',

            // Buildings
            'barracks': 'images/buildings/barracks.png',
            'elephant_pen': 'images/buildings/elephant_stable.png'
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
        if (unit.isEnemy) {
            // Enemy variants
            switch (unit.id?.toLowerCase() || unit.type?.toLowerCase()) {
                case 'enemy_swordsman':
                case 'swordsman':
                    return 'enemy_swordsman';
                case 'enemy_spearman':
                case 'spearman':
                    return 'enemy_spearman';
                case 'enemy_archer':
                case 'archer':
                    return 'enemy_archer';
                case 'enemy_elephant':
                case 'elephant':
                    return 'enemy_elephant';
                default:
                    return 'enemy_swordsman';
            }
        } else {
            // Player units
            switch (unit.id?.toLowerCase() || unit.type?.toLowerCase()) {
                case 'swordsman':
                    return 'swordsman';
                case 'spearman':
                    return 'spearman';
                case 'archer':
                    return 'archer';
                case 'elephant':
                case 'war_elephant':
                    return 'elephant';
                case 'cavalry':
                    return 'cavalry';
                case 'worker':
                    return 'worker';
                default:
                    return 'swordsman';
            }
        }
    }
}

// Singleton instance
export const spriteManager = new SpriteManager();
