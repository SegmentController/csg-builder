# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSG Builder is a TypeScript-based 3D mesh creation tool using a component-based architecture. Users write TypeScript code to define 3D components (similar to React components) that are composed of primitive shapes (cubes, cylinders, spheres, cones, and polygon prisms). The system uses Constructive Solid Geometry (CSG) operations to perform boolean operations (union, subtraction) and exports the final mesh as binary STL files.

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

**Note:** Build output goes to `./docs` directory (configured for GitHub Pages deployment).

**IMPORTANT GitHub Pages Configuration:**

- Development server runs at root (`/`) by default

## High-Level Architecture

### Three-Layer Component System

1. **Primitive Layer** (`Solid` class in `src/lib/3d/Solid.ts`)
   - Wraps Three.js `Brush` objects from `three-bvh-csg` library
   - Factory methods: `cube()`, `cylinder()`, `sphere()`, `cone()`, `prism()`, `trianglePrism()`
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
   - **Type safety**: `ComponentsMap` type enforces functions returning `Solid | Mesh`
   - Components can return either `Solid` or `Mesh` - renderer extracts vertices automatically

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

All imports use aliases defined in `vite.config.ts` and `tsconfig.json`. **ALWAYS use these aliases, never relative paths**:

- `$lib/*` → `src/lib/*` (e.g., `import { Solid } from '$lib/3d/Solid'`)
- `$stores/*` → `src/stores/*` (e.g., `import { addToComponentStore } from '$stores/componentStore.svelte'`)
- `$types/*` → `src/types/*`
- `$components/*` → `src/components/*`
- `$projects` → `projects/index.ts`

These aliases work both in TypeScript files and Svelte components.

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
  - **IMPORTANT**: Mesh processes solids in **declaration order** (not by grouping positive/negative)
  - First solid cannot be negative (throws error)
  - Each subsequent solid is either added (positive) or subtracted (negative) from the accumulated result
  - Example: `new Mesh(base, positive1, negative1, positive2)` → `((base + positive1) - negative1) + positive2`
- `updateMatrixWorld()` must be called after transforms (handled automatically by methods)
- **Partial Geometries**: Cylinder, cone, sphere, and prism primitives with `angle` < 360° use CSG subtraction
  - Creates full 360° geometry first
  - Generates wedge-shaped cutter using `generateWedgePoints()` helper (calculates section to REMOVE: 360° - angle)
  - Wedge sized at 2x radius to ensure complete cutting through geometry
  - Arc segments calculated dynamically (1 segment per 15°, minimum 8) for smooth cuts
  - Wedge cutter positioned and rotated to align with primitive's Y-axis
  - Subtracts wedge from full geometry to create closed, manifold partial shapes
  - Optimized: skips CSG operations entirely when angle >= 360° (returns full geometry)
  - Result: reliable CSG operations without open edges or hollow sections

### Coordinate System & Transforms

- Three.js right-handed: X-right, Y-up, Z-toward camera
- **Absolute positioning**: `at(x, y, z)` sets position directly (all params required)
  - `Solid.at()` sets the solid's position
  - `Mesh.at()` applies the same position to **all solids** in the mesh (they move together)
- **Relative transforms**: `move({ x?, y?, z? })` and `rotate({ x?, y?, z? })` with optional properties
- All transformations are **incremental**: `.move({ x: 5 }).move({ x: 3 })` moves 8 units total
- Rotations use **degrees** (converted to radians internally)
- **Scaling**: `scale({ x?, y?, z? })` with optional properties - all values are **multiplicative**
  - `.scale({ x: 2 })` doubles the size on X-axis
  - Scaling is **cumulative**: `.scale({ x: 2 }).scale({ x: 1.5 })` results in 3x scale on X-axis
- Grid pattern (`Mesh.grid`) accepts configurable spacing parameter
- **Transform order matters**: Apply transforms before CSG operations for predictable results

### Geometry Normalization

Some primitives automatically call `normalize()` after creation to ensure clean CSG operations and prevent rendering artifacts:

**Auto-normalized primitives:**

- `cylinder()` - fixes seam issues
- `sphere()` - ensures smooth CSG intersections
- `cone()` - prevents tip artifacts
- `prism()` / `trianglePrism()` - ensures clean edge handling

**What normalize() does:**

- Performs a union operation with an empty cube (`Solid.emptyCube`)
- Forces the CSG evaluator to completely rebuild geometry buffers
- Ensures consistent geometry state for CSG operations
- Prevents rendering artifacts (holes, missing faces, internal triangles)
- Called automatically by affected primitives - you don't need to call it manually

**When to use manually:**

- After complex transform chains that cause geometry issues
- When experiencing CSG operation failures with custom geometries
- After importing or modifying brush geometry directly

```typescript
// Automatic normalization (built into certain primitives)
const sphere = Solid.sphere(5, { color: 'blue' }); // normalize() called internally

// Manual normalization (rarely needed)
const custom = Solid.cube(10, 10, 10, 'red').scale({ x: 2, y: 0.5 }).normalize(); // Fix potential issues from extreme scaling
```

### Centering & Alignment

Both `Solid` and `Mesh` support automatic centering and alignment operations:

**Bounding Box Utility:**

```typescript
const bounds = solid.getBounds();
// Returns: { width, height, depth, min: Vector3, max: Vector3, center: Vector3 }

// Example: Get dimensions for calculations
const box = Solid.cube(10, 20, 5, 'blue');
const { width, height, depth } = box.getBounds();
console.log(`Box dimensions: ${width} × ${height} × ${depth}`);
```

**Centering Method:**

```typescript
// Center on all axes at origin (0, 0, 0)
solid.center();

// Center on specific axes only using optional parameter
solid.center({ x: true, y: true }); // Center on X and Y axes only
solid.center({ z: true }); // Center on Z-axis only
solid.center({ x: true }); // Center on X-axis only

// Example: Center a complex shape
const myShape = Solid.cube(10, 20, 5, 'red')
	.subtract(Solid.cylinder(3, 25, { color: 'red' }).rotate({ x: 90 }))
	.center(); // Centers the result at origin
```

**Edge Alignment Method:**

Align specific edges to coordinate planes (origin = 0):

```typescript
solid.align('bottom'); // Bottom face at Y=0
solid.align('top'); // Top face at Y=0
solid.align('left'); // Left face at X=0
solid.align('right'); // Right face at X=0
solid.align('front'); // Front face at Z=0
solid.align('back'); // Back face at Z=0

// Example: Build from the ground up
const tower = Solid.cube(10, 50, 10, 'gray')
	.align('bottom') // Place on Y=0 plane
	.center({ x: true, z: true }); // Center horizontally and depth
```

**Chaining with Other Transforms:**

All methods follow fluent API pattern and can be chained:

```typescript
const piece = Solid.cube(20, 10, 5, 'blue')
	.center() // Center at origin first
	.move({ x: 50 }) // Then move to final position
	.rotate({ z: 45 }); // And rotate
```

**Mesh Centering:**

`Mesh` methods work on the combined bounding box of all contained solids:

```typescript
const mesh = new Mesh(
	Solid.cube(10, 10, 10, 'red').move({ x: 20 }),
	Solid.cylinder(5, 15, 'blue').move({ x: -20 })
);

// Centers the entire composition, not individual pieces
mesh.center();

// For grid arrays
const array = Mesh.grid(brick, { cols: 5, rows: 3 }).center(); // Centers the entire array at origin
```

**Use Cases:**

- **Centered exports:** Ensure STL files are centered for 3D printing
- **Alignment:** Stack objects or align to edges without manual calculations
- **Composition:** Position complex assemblies relative to their centers
- **Symmetry:** Create symmetric patterns easily

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
	const hole = Solid.cylinder(2, 5, { color: 'blue' }).rotate({ x: 90 });

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

## Available Primitives

The `Solid` class provides the following primitive shapes:

### Angle Constants

The `Solid` class provides predefined angle constants in degrees for convenient use with circular geometries:

```typescript
Solid.DEG_45 = 45; // Quarter of a right angle
Solid.DEG_90 = 90; // Right angle (quarter circle)
Solid.DEG_180 = 180; // Half circle
Solid.DEG_270 = 270; // Three-quarter circle
Solid.DEG_360 = 360; // Full circle (default)
```

These constants can be used with the `angle` parameter of circular geometries (cylinder, cone, sphere, prism).

### Basic Shapes

**Cube:**

```typescript
Solid.cube(width: number, height: number, depth: number, color?: string)
// Example: Solid.cube(10, 20, 5, 'red')
```

**Cylinder:**

```typescript
Solid.cylinder(
  radius: number,
  height: number,
  options?: {
    color?: string;
    angle?: number;  // Angular extent in degrees (default: 360)
  }
)

// Full cylinder (default)
Solid.cylinder(5, 10, { color: 'blue' })

// Partial cylinders using angle parameter
Solid.cylinder(8, 10, { color: 'red', angle: Solid.DEG_90 })   // Quarter cylinder (pie slice)
Solid.cylinder(8, 10, { color: 'blue', angle: Solid.DEG_180 }) // Half cylinder
Solid.cylinder(8, 10, { color: 'green', angle: Solid.DEG_270 }) // Three-quarter cylinder

// Radial segments scale with radius (16-48 segments)
// Partial geometries are created using CSG subtraction for closed, manifold shapes
```

**Sphere:**

```typescript
Solid.sphere(
  radius: number,
  options?: {
    color?: string;
    angle?: number;  // Angular extent in degrees (default: 360)
  }
)

// Full sphere (default)
Solid.sphere(8, { color: 'green' })

// Partial spheres using angle parameter
Solid.sphere(8, { color: 'cyan', angle: Solid.DEG_180 })  // Hemisphere (half sphere)
Solid.sphere(8, { color: 'magenta', angle: Solid.DEG_90 }) // Quarter sphere
Solid.sphere(8, { color: 'yellow', angle: Solid.DEG_270 }) // Three-quarter sphere

// Segments scale with radius (16-48 segments for both width and height)
// Partial geometries are created using CSG subtraction for closed, manifold shapes
```

**Cone:**

```typescript
Solid.cone(
  radius: number,
  height: number,
  options?: {
    color?: string;
    angle?: number;  // Angular extent in degrees (default: 360)
  }
)

// Full cone (default)
Solid.cone(6, 12, { color: 'yellow' })

// Partial cones using angle parameter
Solid.cone(8, 12, { color: 'orange', angle: Solid.DEG_180 }) // Half cone (wedge)
Solid.cone(8, 12, { color: 'purple', angle: Solid.DEG_90 })  // Quarter cone
Solid.cone(6, 10, { color: 'red', angle: Solid.DEG_270 }) // Three-quarter cone

// Radial segments scale with radius (16-48 segments)
// Height segments set to 1 for clean CSG operations
// Partial geometries are created using CSG subtraction for closed, manifold shapes
```

### Polygon Prisms

**N-gon Prism (custom sided):**

```typescript
Solid.prism(
  sides: number,
  radius: number,
  height: number,
  options?: {
    color?: string;
    angle?: number;  // Angular extent in degrees (default: 360)
  }
)

// Full prisms (default)
Solid.prism(6, 5, 10, { color: 'purple' }) // Hexagonal prism
Solid.prism(8, 4, 8, { color: 'orange' })  // Octagonal prism

// Partial prisms using angle parameter
Solid.prism(6, 8, 10, { color: 'teal', angle: Solid.DEG_180 }) // Half hexagonal prism
Solid.prism(8, 10, 4, { color: 'silver', angle: Solid.DEG_270 }) // Partial gear shape

// Partial geometries are created using CSG subtraction for closed, manifold shapes
```

**Triangle Prism (3-sided):**

```typescript
Solid.trianglePrism(
  radius: number,
  height: number,
  options?: {
    color?: string;
  }
)
// Example: Solid.trianglePrism(5, 10, { color: 'cyan' })
// Shorthand for Solid.prism(3, radius, height, options)
```

### Custom Profile Prisms

For complex 2D profiles that need to be extruded into 3D shapes, use the profile prism methods:

**Profile Prism with Shape Builder:**

```typescript
Solid.profilePrism(
  height: number,
  profileBuilder: (shape: Shape) => void,
  color?: string
)

// Example: L-bracket
const bracket = Solid.profilePrism(10, (shape) => {
  shape.moveTo(0, 0);
  shape.lineTo(20, 0);
  shape.lineTo(20, 5);
  shape.lineTo(5, 5);
  shape.lineTo(5, 20);
  shape.lineTo(0, 20);
  shape.lineTo(0, 0);
}, 'blue');

// Full Shape API available: lineTo, bezierCurveTo, quadraticCurveTo, arc, etc.
```

**Profile Prism from Points (Simplified):**

```typescript
Solid.profilePrismFromPoints(
  height: number,
  points: [number, number][],
  color?: string
)

// Example: Trapezoid
const trapezoid = Solid.profilePrismFromPoints(
  8,
  [[0, 0], [10, 0], [8, 5], [2, 5]],
  'red'
); // Automatically closes back to [0, 0]

// Example: Custom housing profile
const housing = Solid.profilePrismFromPoints(
  15,
  [[0, 0], [30, 0], [30, 10], [25, 15], [5, 15], [0, 10]],
  'gray'
);
```

**Key Features:**

- `profilePrism()` provides full Three.js Shape API (curves, arcs, beziers)
- `profilePrismFromPoints()` is simpler, takes point array and auto-closes the path
- Both methods automatically normalize geometry for clean CSG operations
- Extrudes along Z-axis with configurable height
- Bevel is disabled for clean CSG operations

### Usage Examples

```typescript
// Rounded corners using sphere subtraction
const roundedCube = Solid.cube(20, 20, 20, 'red').subtract(
	Solid.sphere(3, { color: 'red' }).move({ x: 10, y: 10, z: 10 })
);

// Chamfered edge using cone
const chamferedBlock = Solid.cube(15, 15, 15, 'blue').subtract(
	Solid.cone(4, 8, { color: 'blue' }).rotate({ x: 90 })
);

// Hexagonal nut
const nut = Solid.prism(6, 10, 5, { color: 'gray' }).subtract(
	Solid.cylinder(4, 6, { color: 'gray' })
);

// Triangular roof
const roof = Solid.trianglePrism(8, 20, { color: 'brown' }).rotate({ z: 90 });

// Partial geometry examples (closed, manifold shapes via CSG cutting)
const pieSlice = Solid.cylinder(10, 2, {
	color: 'red',
	angle: Solid.DEG_90
});

const hemisphere = Solid.sphere(8, {
	color: 'cyan',
	angle: Solid.DEG_180
});

const wedge = Solid.cone(8, 12, {
	color: 'orange',
	angle: Solid.DEG_180
});

const threeQuarterCylinder = Solid.cylinder(10, 2, {
	color: 'green',
	angle: Solid.DEG_270
});
```

## Adding New Primitives

To add additional shapes beyond the built-in primitives:

1. Import the Three.js geometry in `Solid.ts`:

```typescript
import { TorusGeometry } from 'three';
```

2. Update the `geometryToBrush()` type signature to include the new geometry type

3. Add factory method to `Solid.ts`:

```typescript
static torus = (radius: number, tubeRadius: number, color: string = 'gray'): Solid =>
  new Solid(
    this.geometryToBrush(
      new TorusGeometry(
        radius,
        tubeRadius,
        MathMinMax(tubeRadius * 8, 16, 32), // radialSegments
        MathMinMax(radius * 4, 16, 48)      // tubularSegments
      )
    ),
    color
  );
```

4. Use in components: `Solid.torus(10, 2, 'green')`

## Performance Optimization

### Caching Functions

For expensive component computations that are called repeatedly with the same parameters, use the caching utilities (`src/lib/cacheFunction.ts`):

**Named Function Caching:**

```typescript
import { cacheFunction } from '$lib/cacheFunction';

// Original function
const expensiveComponent = (width: number, height: number): Solid => {
	// Complex CSG operations...
	return result;
};

// Wrap with cache
const cachedComponent = cacheFunction(expensiveComponent);

// Usage: First call computes, subsequent calls with same params return cached result
const part1 = cachedComponent(10, 20); // Computes
const part2 = cachedComponent(10, 20); // Returns cached result (instant)
const part3 = cachedComponent(15, 25); // Different params - computes new result
```

**Inline Function Caching:**

```typescript
import { cacheInlineFunction } from '$lib/cacheFunction';

// For arrow functions or when function.name isn't available
const cachedPart = cacheInlineFunction('myPart', (size: number) => {
	return Solid.cube(size, size, size, 'red').subtract(
		Solid.cylinder(size / 2, size * 2, { color: 'red' })
	);
});
```

**How it works:**

- Cache key generated from function name and serialized arguments: `${functionName}:${JSON.stringify(args)}`
- Returns cached `Solid` instance if key exists in cache
- Otherwise computes result, caches it, and returns it
- Cache persists for the session (not cleared automatically)
- **Important**: Only caches functions returning `Solid` (not `Mesh`)

**When to use:**

- Component functions called multiple times with same parameters
- Expensive CSG operations in reusable parts
- Grid/array patterns where same base shape is used repeatedly
- **Don't use** for functions with side effects or non-serializable parameters

**Example: Cached grid components:**

```typescript
import { cacheFunction } from '$lib/cacheFunction';
import { Solid } from '$lib/3d/Solid';
import { Mesh } from '$lib/3d/Mesh';

// Cache the expensive base brick
const brick = cacheFunction((width: number, height: number, depth: number) => {
	return Solid.cube(width, height, depth, 'red')
		.subtract(Solid.cylinder(0.5, height * 2, { color: 'red' }))
		.subtract(Solid.cylinder(0.5, height * 2, { color: 'red' }).move({ x: width - 1 }));
});

// Use cached brick in grid
export const brickWall = (): Solid => {
	const b = brick(3, 1, 1.5); // Computed once
	return Mesh.grid(b, { cols: 10, rows: 8 }).toSolid();
};
```

## Common Issues & Critical Patterns

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

- Cylinder segment counts scale with radius: `MathMinMax(radius * 8, 16, 48)` (see `Solid.ts:42`)
- Multiple CSG operations are expensive - chain operations efficiently
- Each `subtract()`, `union()`, `intersect()` creates new geometry

### Type Errors with Imports

- Use path aliases (`$lib/`, not relative `../../lib/`)
- Run `npm run ts:check` to see full error context
- Check `tsconfig.json` paths match `vite.config.ts` aliases
- Ensure components return `Solid` or `Mesh` (not other types)

### Critical Errors to Avoid

**"First solid in Mesh cannot be negative"** error:

- Thrown when first solid in `new Mesh(...)` has `.setNegative()` applied
- Fix: Ensure first solid is always positive (base geometry)
- Example wrong: `new Mesh(hole.setNegative(), box)` ❌
- Example correct: `new Mesh(box, hole.setNegative())` ✅

**Position vs. Move confusion**:

- `at(x, y, z)` is **absolute** - requires all 3 parameters
- `move({ x?, y?, z? })` is **relative** - parameters are optional
- Don't chain `.at()` calls - only the last one takes effect
- Chain `.move()` calls - they accumulate
