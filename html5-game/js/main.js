// ===================================
// RTS: ยุทธการไทย - Main Entry Point
// ===================================

import { Game } from './engine/Game.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 RTS: ยุทธการไทย - Starting...');

    // Create game instance
    window.game = new Game();

    console.log('✅ Game initialized!');
});
