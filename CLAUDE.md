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

1. **Primitive Layer** (`Body` class in `src/lib/3d/Body.ts`)
   - Wraps Three.js `Brush` objects from `three-bvh-csg` library
   - Factory methods: `fromCube()`, `fromCylinder()`
   - Provides fluent API for transformations (all methods return `this`)
   - Maintains `negative` flag for CSG subtraction operations
   - All transforms are **relative/incremental** (not absolute)

2. **Composition Layer** (`BodySet` class in `src/lib/3d/BodySet.ts`)
   - Manages collections of `Body` objects
   - Performs CSG operations via static `Body.evaluator` (from `three-bvh-csg`)
   - `append()` adds bodies without merging
   - `merge()` performs actual CSG operations (ADDITION for positive bodies, SUBTRACTION for negative)
   - Transforms apply to all contained bodies
   - Grid utility: `BodySet.array(body, cx, cy)` creates 2D arrays

3. **Component Registry** (`src/stores/componentStore.svelte.ts`)
   - Uses Svelte 5 runes (`$state`) for reactivity
   - Components auto-register via `addToComponentStore()`
   - Alphabetically sorted by name
   - UI (`AppNavigation.svelte`) generates dropdown from this registry

### Data Flow

```
projects/*.ts (component definitions)
  → export ComponentsMap { "Name": () => BodySet }
  → addToComponentStore() on module load
  → componentStore (Svelte 5 $state reactive)
  → AppNavigation.svelte (dropdown + selection)
  → App.svelte (calls merge(), extracts vertices)
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

- CSG merge happens **only** when `BodySet.merge()` is called
- The `Body.evaluator` (static, single instance) performs all boolean operations
- Negative bodies are subtracted via `SUBTRACTION` constant from `three-bvh-csg`
- Each CSG operation creates a **new** Brush - the old geometry is replaced
- `updateMatrixWorld()` must be called after transforms (handled automatically by methods)

### Coordinate System & Transforms

- Three.js right-handed: X-right, Y-up, Z-toward camera
- All transformations are **incremental**: `dX(5).dX(3)` moves 8 units total
- Rotations use **degrees** (converted to radians internally)
- Grid pattern (`BodySet.array`) uses hardcoded spacing: `x * 6, y * 2` (see `BodySet.ts:73`)

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
import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const myPart = (width: number, height: number): BodySet => {
	const base = Body.fromCube(width, height, 1, 'blue');
	const hole = Body.fromCylinder(2, 5, 'blue').setNegative().rotateX(90);

	return new BodySet(base, hole).merge();
};

export const components: ComponentsMap = {
	MyPart: () => myPart(10, 10)
};
```

### Subtraction Pattern

```typescript
// Hollow box example
const outer = Body.fromCube(20, 20, 20, 'red');
const inner = Body.fromCube(16, 16, 16, 'red').setNegative();
new BodySet(outer, inner).merge(); // Subtraction occurs here
```

### Reusable Components with Context

See `projects/sample/_context.ts`:

- Shared constants across project components
- Production/development mode toggles
- Component parameters (e.g., `width: 240`)

### Grid Arrays

```typescript
const brick = Body.fromCube(3, 1, 1, 'red');
const wall = BodySet.array(brick, 10, 5); // 10 columns, 5 rows
// Spacing is hardcoded: cx * 6 horizontal, cy * 2 vertical
```

## Adding New Primitives

To add a new shape (e.g., sphere):

1. Add to `Body.ts`:

```typescript
static fromSphere = (radius: number, color: string): Body =>
  new Body(this.geometryToBrush(new SphereGeometry(radius, 32, 32)), color);
```

2. Import geometry: `import { SphereGeometry } from 'three';`

3. Use in components: `Body.fromSphere(5, 'green')`

## Common Issues

### Component Not Appearing in UI

- Check `projects/[project]/index.ts` calls `addToComponentStore()`
- Verify `projects/index.ts` exports the project: `export * from './[project]';`
- Ensure component name in `ComponentsMap` is unique
- Restart dev server if hot reload fails

### Mesh Renders Black/Wrong

- Missing `merge()` call on BodySet before rendering
- Invalid color string (must be CSS color: 'red', '#ff0000', etc.)
- Degenerate geometry (zero-volume shapes)
- Normals not computed (should auto-compute in `App3DScene.svelte:21`)

### Slow CSG Operations

- Cylinder segment counts scale with radius: `MathMinMax(radius * 8, 16, 48)`
- Complex nested merges are expensive - consider simplifying
- Merge incrementally instead of all at once

### Type Errors with Imports

- Use path aliases (`$lib/`, not relative `../../lib/`)
- Run `npm run ts:check` to see full error context
- Check `tsconfig.json` paths match `vite.config.ts` aliases
