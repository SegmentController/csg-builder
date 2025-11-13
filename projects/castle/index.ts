/**
 * Castle Project - Component Registry
 *
 * This project demonstrates production-ready patterns for complex 3D model composition.
 *
 * Architecture Overview:
 * - Multi-file modular structure (wall.ts, tower.ts, castle.ts)
 * - Hierarchical component composition: Primitives → Building Blocks → Assembly
 * - Shared configuration via _const.ts (centralized dimensions)
 * - Performance optimization with cacheInlineFunction()
 * - Reusable building blocks composed into larger structures
 *
 * Component Hierarchy (3 tiers):
 * 1. Primitives: Solid.cube(), cylinder(), etc.
 * 2. Building Blocks: Wall(), Tower(), WallWithGate()
 * 3. Assembly: Castle() - combines walls and towers
 *
 * Key Patterns Demonstrated:
 * - Shared constants file for project-wide configuration
 * - Caching expensive CSG operations for performance
 * - Clone pattern for reusing components with different transforms
 * - Configuration objects for component variants
 * - Cross-file component dependencies
 * - Modular design with single responsibility per file
 */

import { addToComponentStore } from '$stores/componentStore';

import { components as castleComponents } from './castle';
import { components as towerComponents } from './tower';
import { components as wallComponents } from './wall';

// Register all castle components in the global store
// Order matches dependency hierarchy: walls → towers → castle
addToComponentStore({
	...wallComponents,
	...towerComponents,
	...castleComponents
});
