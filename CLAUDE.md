# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSG Builder is a web-based 3D STL file generator for THT (Through-Hole Technology) PCB component holders. The application uses Constructive Solid Geometry (CSG) operations via three-bvh-csg to create 3D models that can be exported as binary STL files for 3D printing.

**Live site:** https://segmentcontroller.github.io/pcb-tht-holder/

## Requirements

- Node.js >= 22.0.0
- npm >= 10.0.0

## Development Commands

```bash
# Development server with network access
npm run dev

# Type checking
npm run ts:check

# Linting
npm run lint:check
npm run lint:fix

# Formatting
npm run format:check
npm run format:fix

# Build for production (outputs to docs/ directory)
npm run build

# Preview production build
npm run preview

# Run all checks and build
npm run all
```

## Architecture

### Core Geometry System

The application uses a layered CSG system built on three.js and three-bvh-csg:

**Body (`src/lib/3d/Body.ts`)**: Represents a single 3D primitive (cube or cylinder) with:

- Wraps a three-bvh-csg `Brush` object
- **Static shared `Evaluator`** (Body.ts:7) - Single instance reused for all CSG operations for performance
- Transformations:
  - Individual axis: `dX(x)`, `dY(y)`, `dZ(z)` for translation
  - Combined: `d(x, y, z)` - sets all 3 axes with single matrix update (more efficient)
  - Individual rotation: `rotateX(angle)`, `rotateY(angle)`, `rotateZ(angle)`
  - Combined rotation: `rotate(x, y, z)` - sets all 3 rotations with single matrix update
- Can be marked as negative (for subtraction operations via `setNegative()`)
- Static factory methods: `Body.fromCube()` and `Body.fromCylinder()`

**BodySet (`src/lib/3d/BodySet.ts`)**: Container for multiple Body objects with:

- `append()`: Adds bodies to the set without merging
- `merge()`: Combines all bodies using CSG operations (ADDITION for normal bodies, SUBTRACTION for negative bodies)
  - **Uses shared static Evaluator from Body class** (BodySet.ts:24) via `Body.evaluator` for performance
- Supports array generation for repeated patterns via `BodySet.array()`
- Transformations apply to all bodies in the set (same API as Body: individual and combined methods)

### Coordinate System Transformations

**CRITICAL**: The application uses different coordinate systems internally vs for rendering/export:

- **Internal (Body/BodySet)**: Standard Three.js coordinates (X, Y, Z)
- **3D Display (App3DScene.svelte:26-34)**: Y and Z are swapped for camera positioning
- **STL Export (stl.ts:16-17)**: Y and Z coordinates are swapped, and Z is negated

When debugging position/rotation issues, always verify which coordinate system you're working in.

### Performance Optimizations

The codebase implements several performance optimizations:

- **Shared Evaluator instance** - Single static `Evaluator` (Body.ts:7) reused across all CSG operations instead of creating new instances
- **Vertex caching** - App3DScene.svelte:14-17 caches vertex arrays at component initialization to avoid recreating Float32Arrays on every render
- **Optimized vertex counting** - AppNavigation.svelte:34 calculates triangle count by summing individual body vertices instead of performing expensive merge operation
- **Memory leak prevention** - download.ts:15 properly revokes blob URLs after download with 100ms delay
- **Combined transformations** - Use `d(x,y,z)` and `rotate(x,y,z)` instead of chaining individual axis methods to reduce matrix updates from 3 to 1

### Component/Project System

Projects are defined in the `projects/` directory and registered via the component store:

1. Create a new folder under `projects/` (e.g., `projects/myproject/`)
2. Define geometry functions that return `BodySet` objects
3. **Export a `components` object** from each module file
4. Import and register all components in the project's `index.ts`
5. Use `_context.ts` for shared configuration (e.g., `production` flag, dimensions)

**Example:**

```typescript
// projects/myproject/mypart.ts - Define components
import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const myPart = (): BodySet => {
	const base = Body.fromCube(10, 10, 2, 'blue');
	const hole = Body.fromCylinder(2, 3, 'red').setNegative(true);
	return new BodySet(base, hole).d(5, 0, 0);
};

// Export components object with explicit type (no direct registration needed)
export const components: ComponentsMap = {
	'My Part': () => myPart()
};
```

```typescript
// projects/myproject/index.ts - Register all components
import { addToComponentStore } from '$stores/componentStore.svelte';

import { components as myComponents } from './mypart';
import { components as otherComponents } from './otherpart';

// Single registration point for the entire project
addToComponentStore({
	...myComponents,
	...otherComponents
});
```

**Component Store** (`src/stores/componentStore.svelte.ts`):

- Uses Svelte 5 module-level `$state()` rune (not legacy stores)
- Note the `.svelte.ts` extension - required for files using runes outside components
- Direct array mutation instead of store `.update()` calls
- Components are automatically sorted alphabetically and deduplicated by name

### STL Export

Binary STL generation (`src/lib/3d/stl.ts`):

- Takes Float32Array vertices from merged geometry
- Uses low-level binary writers from `src/lib/buffer.ts` (writeInt16LE, writeInt32LE, writeFloatLE)
- Coordinate system transformation: Y and Z axes are swapped, Z is negated
- Outputs standard binary STL format (80-byte header + triangle count + 50 bytes per triangle)
- Download handled by `src/lib/download.ts` using Blob URLs with dynamic filename based on model name

### UI Components (Svelte 5)

All components use modern Svelte 5 runes syntax:

**App.svelte**: Main component that:

- Uses `$state()` for reactive variables: `volume`, `name`, `bodyset`, `wireframe`
- Orchestrates the navigation, 3D scene, and download functionality
- Triggers STL generation and download with proper filename (`{modelName}.stl`)

**AppNavigation.svelte**: Navigation bar with:

- **Props pattern**: Uses `$props()` with `Properties` type and `$bindable()` for two-way wireframe binding
- **State**: Uses `$state()` for `selected`, `generateTimeMs`, `vertexCount`
- Model selector dropdown (populated from component store)
- Performance metrics (generation time, triangle count)
- URL hash-based model selection for deep linking (onMount handler)
- Callback props: `onselect`, `ondownload`

**App3DScene.svelte**: 3D rendering using @threlte/core:

- **Props pattern**: Uses `$props()` with `Properties` type (no bindable props)
- **Derived state**: Uses `$derived()` for `bodiesWithVertices` to cache vertices and ensure reactivity when bodyset changes
- Renders each Body as a separate mesh
- Coordinate transformation for display (Y/Z swap)
- Supports wireframe mode
- Handles negative bodies with transparency (opacity 0.25)

## Path Aliases

The project uses TypeScript path aliases configured in both `tsconfig.json` and `vite.config.ts`:

- `$components/*` → `./src/components/*`
- `$lib/*` → `./src/lib/*`
- `$stores/*` → `./src/stores/*`
- `$types/*` → `./src/types/*`
- `$projects` → `./projects`

## Build Configuration

- **Output directory**: `docs/` (configured for GitHub Pages deployment)
- **Base path**: `/pcb-tht-holder` (in production)
- **Build target**: `esnext` (in vite.config.ts)

## Svelte 5 Patterns

This codebase is **fully migrated to Svelte 5 runes** with zero legacy patterns:

**Component Props:**

- Use `$props()` with explicit `Properties` type
- Use `$bindable()` for two-way binding (e.g., `wireframe`)
- Pattern: `let { prop1 = $bindable(), prop2 }: Properties = $props();`

**Reactive State:**

- Use `$state()` for component-level reactive variables
- Use `$derived()` for computed values that depend on reactive state
- Module-level state in `.svelte.ts` files (e.g., componentStore.svelte.ts)

**No Legacy Patterns:**

- ❌ No `export let` - replaced with `$props()`
- ❌ No `$:` reactive statements - replaced with `$derived()`
- ❌ No `writable`/`readable`/`derived` stores - replaced with `$state()` in `.svelte.ts` files
- ✅ Direct mutation of `$state()` arrays/objects (no `.update()` calls needed)

## Important Implementation Notes

- **fakeAddition() method** (Body.ts:27-28) - Currently just returns the brush unchanged. Originally designed for fake SUBTRACTION operations but disabled for performance
- **Evaluator access in BodySet** (BodySet.ts:24) - Uses bracket notation `Body['evaluator']` to access the static evaluator since it's marked as private in Body class
- **Blob URL revocation timing** (download.ts:15) - Uses 100ms setTimeout to ensure download completes before revoking the blob URL
- **.svelte.ts extension** - Required for TypeScript files that use Svelte 5 runes outside of components (e.g., componentStore.svelte.ts)

## Technology Stack

- **Framework:** Svelte 5 (100% runes mode - no legacy patterns)
- **Build tool:** Vite 7
- **3D library:** Three.js with @threlte/core wrapper
- **CSG operations:** three-bvh-csg
- **UI components:** Flowbite Svelte
- **Styling:** Tailwind CSS 4
