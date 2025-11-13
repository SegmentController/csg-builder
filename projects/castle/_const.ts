/**
 * Castle Project - Shared Configuration Constants
 *
 * This file demonstrates the shared constants pattern for multi-component projects.
 * Centralizing configuration values provides several benefits:
 *
 * ✅ **Consistency**: All walls use the same HEIGHT, WIDTH, ZIGZAG_LENGTH
 * ✅ **Maintainability**: Change WALL.HEIGHT once, affects all components
 * ✅ **Type Safety**: TypeScript ensures correct property access
 * ✅ **Documentation**: Constants serve as project specification
 * ✅ **Coordination**: Towers and walls use matching dimensions automatically
 *
 * Pattern: Export const objects with SCREAMING_SNAKE_CASE names
 * Usage: import { WALL, TOWER } from './_const'
 *
 * 💡 Best Practice: Use underscore prefix (_const.ts) to indicate internal/shared file
 * 💡 Alternative naming: context.ts, config.ts, constants.ts
 */

/**
 * Wall component dimensions
 * Used by: wall.ts (Wall, WallWithGate), tower.ts (for CSG subtraction)
 */
export const WALL = {
	HEIGHT: 20, // Wall and tower height (vertical dimension)
	WIDTH: 2, // Wall thickness (depth)
	ZIGZAG_LENGTH: 5, // Battlement/merlon spacing on wall header
	GATE_WIDTH: 14 // Width of gate opening in WallWithGate
};

/**
 * Tower component dimensions
 * Used by: tower.ts (CornerTower, ConnectorTower)
 *
 * 💡 Different tower types use different radii:
 * - CORNER_RADIUS (8): Larger towers at castle corners (more defensive)
 * - CONNECTOR_RADIUS (6): Smaller towers connecting wall segments
 */
export const TOWER = {
	CORNER_RADIUS: 8, // Radius for corner towers (larger, more prominent)
	CONNECTOR_RADIUS: 6 // Radius for connector towers (smaller, less obtrusive)
};
