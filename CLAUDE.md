# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSG Builder is a TypeScript-based 3D mesh creation tool using a component-based architecture. Users write TypeScript code to define 3D components (similar to React components) that are composed of primitive shapes (cubes, cylinders). The system uses Constructive Solid Geometry (CSG) operations to perform boolean operations (union, subtraction) and exports the final mesh as binary STL files.

## Build and Development Commands

```bash
npm run dev              # Start Vite dev server with hot reload (http://localhost:5173)
npm run build            # Production build to ./docs directory
npm run preview          # Preview production build locally

npm run ts:check         # Run TypeScript type checking
npm run lint:check       # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format:check     # Check Prettier formatting
npm run format:fix       # Auto-format with Prettier
npm run all              # Run format:fix, lint:fix, ts:check, and build
```

**Note:** Build output goes to `./docs` directory (configured for GitHub Pages deployment at `/pcb-tht-holder` base path in production).

## High-Level Architecture

### Three-Layer Component System

1. **Primitive Layer** (`Solid` class in `src/lib/3d/Solid.ts`)
   - Wraps Three.js `Brush` objects from `three-bvh-csg` library
   - Factory methods: `cube()`, `cylinder()`
   - Provides fluent API for transformations (all methods return `this`)
   - Explicit CSG methods: `subtract()`, `union()`, `intersect()`
   - Supports both **absolute** (`at()`) and **relative** (`move()`) positioning

2. **Composition Layer** (`Mesh` class in `src/lib/3d/Mesh.ts`)
   - Manages collections of `Solid` objects
   - Performs CSG operations via static `Solid.evaluator` (from `three-bvh-csg`)
   - `append()` adds solids without merging
   - `merge()` performs actual CSG operations
   - `toSolid()` returns final merged solid
   - Transforms apply to all contained solids
   - Grid utility: `Mesh.grid(solid, { cols, rows, spacing })` creates 2D arrays

3. **Component Registry** (`src/stores/componentStore.svelte.ts`)
   - Uses Svelte 5 runes (`$state`) for reactivity
   - Components auto-register via `addToComponentStore()`
   - Alphabetically sorted by name
   - UI (`AppNavigation.svelte`) generates dropdown from this registry

### Data Flow

```
projects/*.ts (component definitions)
  → export ComponentsMap { "Name": () => Solid }
  → addToComponentStore() on module load
  → componentStore (Svelte 5 $state reactive)
  → AppNavigation.svelte (dropdown + selection)
  → App.svelte (extracts vertices from Solid)
  → App3DScene.svelte (Three.js rendering via Threlte)
  → STL export (generateBinaryStlFromVertices)
```

### Path Aliases (Vite + TypeScript)

All imports use aliases defined in `vite.config.ts` and `tsconfig.json`:

- `$lib/*` → `src/lib/*`
- `$stores/*` → `src/stores/*`
- `$types/*` → `src/types/*`
- `$components/*` → `src/components/*`
- `$projects` → `projects/index.ts`

### Component Registration Pattern

Every project follows this structure:

```
projects/
  [project-name]/
    index.ts          # Calls addToComponentStore() with all components
    _context.ts       # Optional: shared constants/config
    component1.ts     # Exports component functions + ComponentsMap
    component2.ts     # Exports component functions + ComponentsMap
```

**Critical:** Each `projects/[project-name]/index.ts` must be re-exported in `projects/index.ts` or components won't be discovered.

## Key Implementation Details

### CSG Operation Mechanics

- CSG operations use explicit methods: `subtract()`, `union()`, `intersect()`
- The `Solid.evaluator` (static, single instance) performs all boolean operations
- Each CSG operation creates a **new** Solid with new Brush - immutable pattern
- `Mesh.toSolid()` performs final merge when multiple solids need to be combined
- **Negative Solids**: `setNegative()` marks a solid for subtraction during Mesh merge
  - Mesh separates positive/negative solids
  - Unions all positives first
  - Then subtracts all negatives
- `updateMatrixWorld()` must be called after transforms (handled automatically by methods)

### Coordinate System & Transforms

- Three.js right-handed: X-right, Y-up, Z-toward camera
- **Absolute positioning**: `at(x, y, z)` sets position directly (all params required)
- **Relative transforms**: `move({ x?, y?, z? })` and `rotate({ x?, y?, z? })` with optional properties
- All transformations are **incremental**: `.move({ x: 5 }).move({ x: 3 })` moves 8 units total
- Rotations use **degrees** (converted to radians internally)
- Grid pattern (`Mesh.grid`) accepts configurable spacing parameter

### STL Export Format

Binary STL structure (see `src/lib/3d/stl.ts`):

- 80-byte header (unused)
- 4-byte triangle count (vertices.length / 9)
- Per-triangle: 12 floats (normal + 3 vertices) + 2-byte attribute
- **Coordinate swap on export:** `(X, Y, Z) → (X, -Z, Y)` to match STL conventions (line 16)

### 3D Rendering (Threlte/Three.js)

Scene setup in `App3DScene.svelte`:

- Camera distance calculated from mesh volume: `CAMERA_FAR * volume`
- Orbit controls for interaction
- Point light + ambient light
- Vertex normals computed on mount for proper lighting
- Wireframe mode toggleable via UI

### UI Selection & URL Hash

`AppNavigation.svelte` implements:

- Component selection via dropdown
- URL hash persistence: selecting "BrickWall" sets `#BrickWall`
- On mount, reads hash to restore last selection
- Performance metrics: generation time (ms) and triangle count displayed

## Component Development Patterns

### Basic Component Structure

```typescript
import { Solid } from '$lib/3d/Solid';
import { Mesh } from '$lib/3d/Mesh';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const myPart = (width: number, height: number): Solid => {
	const base = Solid.cube(width, height, 1, 'blue');
	const hole = Solid.cylinder(2, 5, 'blue').rotate({ x: 90 });

	return base.subtract(hole);
};

export const components: ComponentsMap = {
	MyPart: () => myPart(10, 10)
};
```

### Subtraction Patterns

**Direct Subtraction (for simple cases):**

```typescript
// Hollow box example - explicit subtract method
const outer = Solid.cube(20, 20, 20, 'red');
const inner = Solid.cube(16, 16, 16, 'red');
const result = outer.subtract(inner); // Explicit subtraction
```

**Negative Solids (for reusable components):**

```typescript
// Window component with negative opening that cuts through walls
export const window = (width: number, height: number): Mesh => {
	const frame = Solid.cube(width, height, 3, 'brown');
	const opening = Solid.cube(width - 4, height - 4, 10, 'gray').setNegative(); // Marks as negative
	const bar = Solid.cube(1, height, 2, 'brown');

	return new Mesh(frame, opening, bar); // Mesh tracks negative solids
};

// Usage: Window's negative opening cuts into wall automatically
const wall = Solid.cube(20, 20, 1, 'gray');
const win = window(5, 8).at(10, 5, 0);
return Mesh.compose(wall, win).toSolid(); // Opening subtracts from wall!
```

### Reusable Components with Context

See `projects/sample/_context.ts`:

- Shared constants across project components
- Production/development mode toggles
- Component parameters (e.g., `width: 240`)

### Grid Arrays

```typescript
const brick = Solid.cube(3, 1, 1, 'red');
// With configurable spacing
const wall = Mesh.grid(brick, { cols: 10, rows: 5, spacing: [6, 2] }).toSolid();

// Or with default spacing [6, 2]
const wall2 = Mesh.array(brick, 10, 5).toSolid();

// Grid internally uses: .move({ x: col * spacingX, y: row * spacingY, z: 0 })
```

## Adding New Primitives

To add a new shape (e.g., sphere):

1. Add to `Solid.ts`:

```typescript
static sphere = (radius: number, color: string = 'gray'): Solid =>
  new Solid(this.geometryToBrush(new SphereGeometry(radius, 32, 32)), color);
```

2. Import geometry: `import { SphereGeometry } from 'three';`

3. Use in components: `Solid.sphere(5, 'green')`

## Common Issues

### Component Not Appearing in UI

- Check `projects/[project]/index.ts` calls `addToComponentStore()`
- Verify `projects/index.ts` exports the project: `export * from './[project]';`
- Ensure component name in `ComponentsMap` is unique
- Restart dev server if hot reload fails

### Mesh Renders Black/Wrong

- Missing final merge - ensure component returns a `Solid`, call `toSolid()` on `Mesh` if needed
- Invalid color string (must be CSS color: 'red', '#ff0000', etc.)
- Degenerate geometry (zero-volume shapes)
- Normals not computed (should auto-compute in `App3DScene.svelte:21`)

### Slow CSG Operations

- Cylinder segment counts scale with radius: `MathMinMax(radius * 8, 16, 48)`
- Multiple CSG operations are expensive - chain operations efficiently
- Each `subtract()`, `union()`, `intersect()` creates new geometry

### Type Errors with Imports

- Use path aliases (`$lib/`, not relative `../../lib/`)
- Run `npm run ts:check` to see full error context
- Check `tsconfig.json` paths match `vite.config.ts` aliases
- Ensure components return `Solid` (not `Mesh` or `BodySet`)
