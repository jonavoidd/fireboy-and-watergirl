# Game Modules Structure

This directory contains the modularized game code, separated by functionality for better maintainability and reusability across different levels.

## File Structure

### `characters.js`
Contains all character-related classes:
- `Character` - Base character class with common functionality
- `Fireboy` - Fireboy character with specific controls and behavior
- `Watergirl` - Watergirl character with specific controls and behavior

### `projectiles.js`
Contains projectile and visual effect classes:
- `Projectile` - Basic projectile class
- `UltimateProjectile` - Enhanced projectile for ultimate attacks
- `DefenseBarrier` - Active defense barrier system
- `Effect` - Visual effects (explosions, healing, etc.)
- `TextEffect` - Floating text effects

### `gameObjects.js`
Contains game world objects:
- `Platform` - Game platforms with sprite support
- `PowerUp` - Collectible power-ups (health, speed)
- `Goal` - Level completion goals
- `Switch` - Interactive switches for puzzles
- `Enemy` - Basic enemy class
- `BossEnemy` - Enhanced boss enemy
- `Door` - Level transition doors

### `levelManager.js`
Contains level management and progression:
- `LevelManager` - Handles level creation, transitions, and door mechanics
- Level-specific setup methods for each game mode
- Door collision and win handling
- Level 1 to Level 2 transition logic

### `game.js`
Contains the main game engine:
- `Game` - Core game class with main game loop
- Asset loading and management
- Input handling and event listeners
- Collision detection and game state management
- UI rendering and game controls

## Usage

All modules are loaded in the correct order in the HTML files:
1. `characters.js` - Character classes
2. `projectiles.js` - Projectile and effect classes
3. `gameObjects.js` - Game world objects
4. `levelManager.js` - Level management system
5. `game.js` - Main game engine

## Benefits of Modular Structure

1. **Maintainability**: Each file has a specific purpose and is easier to maintain
2. **Reusability**: Classes can be easily reused across different levels
3. **Scalability**: New features can be added to specific modules without affecting others
4. **Debugging**: Issues can be isolated to specific modules
5. **Team Development**: Different developers can work on different modules simultaneously
6. **Code Organization**: Related functionality is grouped together logically

## Level System

The modular structure supports the level progression system:
- Level 1: Competitive mode with door mechanics
- Level 2: Cooperative mode (triggered after Level 1 door win)
- Level 3: Boss battle mode
- Level 4: Puzzle mode
- Level 5: Final level

Each level can have its own specific setup while reusing the core game mechanics and classes.
