# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSG Builder is a TypeScript-based 3D mesh creation tool using a component-based architecture. Users write TypeScript code to define 3D components (similar to React components) that are composed of primitive shapes (cubes, cylinders, spheres, cones, and polygon prisms). The system uses Constructive Solid Geometry (CSG) operations to perform boolean operations (union, subtraction) and exports the final mesh as binary STL files.

## Learning Resources

The codebase includes two fully-documented example projects that serve as both working code and comprehensive tutorials:

### **projects/examples/** - Progressive Learning Examples

A series of 8 tutorial files (A through G) demonstrating CSG Builder syntax progressively:

- **A.solids.ts** - Basic primitives (cube, cylinder, sphere, cone, prisms)
- **B.operations.ts** - CSG boolean operations (union, subtract, intersect)
- **C.alignment.ts** - Positioning and alignment methods
- **D.partials.ts** - Partial geometries with angle parameters
- **E.wallAndWindow.ts** - Complex multi-component composition
- **F.shapes.ts** - Custom profile prisms (2D to 3D extrusion)
- **G.revolution.ts** - Revolution solids (lathe geometry)

Each file contains comprehensive inline comments explaining:

- Syntax patterns and method signatures
- Key concepts (immutability, method chaining, static vs instance methods)
- Common pitfalls and best practices
- Use cases and practical examples

**Start here** to learn CSG Builder syntax from basics to advanced techniques.

### **projects/castle/** - Production-Ready Architecture Example

A complete castle project demonstrating advanced patterns for complex 3D model composition:

- **Multi-file modular structure** (wall.ts, tower.ts, castle.ts)
- **Hierarchical component composition** (Primitives → Building Blocks → Assembly)
- **Shared configuration** via \_const.ts
- **Performance optimization** with cacheInlineFunction()
- **Cross-file dependencies** and component integration
- **Advanced CSG techniques** (boolean carving, component subtraction, loops)

Fully commented to show production-ready patterns, architectural decisions, and performance considerations.

**Use this** as a reference for structuring complex, maintainable 3D projects.

## Build and Development Commands

```bash
npm run dev              # Start Vite dev server with hot reload (http://localhost:5173)
npm run build            # Production build to ./docs directory
npm run preview          # Preview production build locally
npm run export           # CLI tool for exporting components to STL without running UI

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

### Two-Layer Component System

1. **Primitive Layer** (`Solid` class in `src/lib/3d/Solid.ts`)
   - Wraps Three.js `Brush` objects from `three-bvh-csg` library
   - Factory methods: `cube()`, `cylinder()`, `sphere()`, `cone()`, `prism()`, `trianglePrism()`
   - Provides fluent API for transformations (all methods return `this`)
   - **Static CSG methods**: `SUBTRACT()`, `UNION()`, `INTERSECT()`, `MERGE()` - all immutable (return new Solid)
   - **Static Grid methods**: `GRID_X()`, `GRID_XY()`, `GRID_XYZ()` - create arrays of solids
   - Supports both **absolute** (`at()`) and **relative** (`move()`) positioning

2. **Component Registry** (dual-store architecture)
   - **Base Store** (`src/stores/componentStore.ts`) - Plain TypeScript array for CLI and Node.js
   - **Svelte Store** (`src/stores/componentStore.svelte.ts`) - Reactive wrapper for web UI
   - Both stores share the same underlying component data via callback mechanism
   - Components auto-register via `addToComponentStore()` (works in both contexts)
   - Alphabetically sorted by name
   - UI (`AppNavigation.svelte`) generates dropdown from this registry
   - **Type safety**: `ComponentsMap` type enforces functions returning `Solid`
   - Components return `Solid` - renderer extracts vertices automatically

### Data Flow

**Web UI Path:**

```
projects/*.ts (component definitions)
  → export ComponentsMap { "Name": () => Solid }
  → addToComponentStore() on module load
  → componentStore (base) → componentStore.svelte (reactive wrapper)
  → AppNavigation.svelte (dropdown + selection)
  → App.svelte (extracts vertices from Solid)
  → App3DScene.svelte (Three.js rendering via Threlte)
  → STL export (generateBinaryStlFromVertices)
```

**CLI Path:**

```
projects/*.ts (component definitions)
  → addToComponentStore() on module load
  → componentStore (base, plain array)
  → bin/csg-export.ts (CLI tool)
    → getComponentStoreValue() (retrieve component by name)
    → component.receiveData() (execute to get Solid)
    → getVertices()
    → generateBinaryStlFromVertices()
    → write to stdout or file
```

### Path Aliases (Vite + TypeScript)

All imports use aliases defined in `vite.config.ts` and `tsconfig.json`. **ALWAYS use these aliases, never relative paths**:

- `$lib/*` → `src/lib/*` (e.g., `import { Solid } from '$lib/3d/Solid'`)
- `$stores/*` → `src/stores/*` (e.g., `import { addToComponentStore } from '$stores/componentStore'`)
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

**Dual-Store Architecture:**

- Projects import from `$stores/componentStore` (non-Svelte base store)
- This works in both web UI and CLI contexts
- The Svelte wrapper (`componentStore.svelte.ts`) adds reactivity for UI
- Both stores share the same underlying data via callback mechanism
- When `addToComponentStore()` is called, it updates the base array and triggers the Svelte reactive wrapper

**Import Pattern (for all project files):**

```typescript
import { addToComponentStore } from '$stores/componentStore';
import type { ComponentsMap } from '$stores/componentStore';

// NOT: import from '$stores/componentStore.svelte'
```

## Key Implementation Details

### CSG Operation Mechanics

- **All CSG operations are static and immutable** - they return new Solid instances without modifying inputs
- CSG operations use static methods: `Solid.SUBTRACT()`, `Solid.UNION()`, `Solid.INTERSECT()`, `Solid.MERGE()`
- The `Solid.evaluator` (static, single instance) performs all boolean operations
- Each CSG operation creates a **new** Solid with new Brush - immutable pattern ensures original solids remain unchanged
- **MERGE()**: Combines multiple solids, respecting negative flags
  - `Solid.MERGE([base, positive1, negative1, positive2])` → `((base + positive1) - negative1) + positive2`
  - First solid cannot be negative (throws error)
  - Processes solids in **array order** (not by grouping positive/negative)
- **Negative Solids**: `setNegative()` marks a solid for subtraction when used with `MERGE()`
  - Only relevant when passing solid to `MERGE()`
  - Use `SUBTRACT()` for explicit subtraction without negative flags
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
  - `Solid.at()` sets the solid's position (mutates the solid, returns `this` for chaining)
- **Relative transforms**: `move({ x?, y?, z? })` and `rotate({ x?, y?, z? })` with optional properties
- All transformations are **incremental**: `.move({ x: 5 }).move({ x: 3 })` moves 8 units total
- Rotations use **degrees** (converted to radians internally)
- **Scaling**: `scale({ all?, x?, y?, z? })` with optional properties - all values are **multiplicative**
  - `all` parameter scales uniformly on all three axes
  - Individual axis scaling with `x`, `y`, `z` parameters
  - `.scale({ all: 2 })` doubles the size uniformly on all axes
  - `.scale({ x: 2 })` doubles the size on X-axis only
  - `.scale({ all: 2, z: 1.5 })` scales all axes by 2, then additionally scales Z by 1.5 (resulting in 3x on Z)
  - Scaling is **cumulative**: `.scale({ x: 2 }).scale({ x: 1.5 })` results in 3x scale on X-axis
  - Order matters: `all` is applied first, then individual axis scales are applied
- **Grid patterns**: Static methods `Solid.GRID_X()`, `Solid.GRID_XY()`, `Solid.GRID_XYZ()` accept configurable spacing parameters
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

`Solid` supports automatic centering and alignment operations:

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
const myShape = Solid.SUBTRACT(
	Solid.cube(10, 20, 5, 'red'),
	Solid.cylinder(3, 25, { color: 'red' }).rotate({ x: 90 })
).center(); // Centers the result at origin
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

**Grid Arrays:**

Grid methods return a single Solid, which can be centered:

```typescript
// Create grid and center the entire array
const array = Solid.GRID_XY(brick, { cols: 5, rows: 3 }).center();
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

### CLI Export Tool

The CLI export tool (`bin/csg-export.ts`) allows exporting components to STL files without running the Svelte web UI:

**Usage:**

```bash
# List all available components
npm run export -- --list

# Export to file with -o flag
npm run export -- Box -o box.stl
npm run export -- "Chess Pawn" -o pawn.stl

# Export to stdout (use --silent to suppress npm output)
npm run export --silent -- Box > box.stl
npm run export --silent -- BrickWall > wall.stl
```

**Implementation Details:**

- Uses `tsx` to run TypeScript with path alias support (`tsconfig.cli.json`)
- Uses `commander` for CLI argument parsing
- Imports all projects to trigger component registration
- Retrieves components from the base (non-Svelte) store
- Outputs binary STL data to stdout or file
- Shows helpful error messages with available components on failure
- Displays export statistics (triangle count, file size)

**Key Files:**

- `bin/csg-export.ts` - CLI entry point with command handlers
- `tsconfig.cli.json` - TypeScript config with Node.js module resolution
- `src/stores/componentStore.ts` - Base store (used by CLI)
- `package.json` - Defines `export` script and dependencies (`tsx`, `commander`)

**Use Cases:**

- Automated STL generation in build scripts
- Batch export of multiple components
- CI/CD pipeline integration
- Headless server environments without display

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
import type { ComponentsMap } from '$stores/componentStore';

export const myPart = (width: number, height: number): Solid => {
	const base = Solid.cube(width, height, 1, 'blue');
	const hole = Solid.cylinder(2, 5, { color: 'blue' }).rotate({ x: 90 });

	return Solid.SUBTRACT(base, hole);
};

export const components: ComponentsMap = {
	MyPart: () => myPart(10, 10)
};
```

### Subtraction Patterns

**Direct Subtraction (immutable static method):**

```typescript
// Hollow box example - static SUBTRACT method
const outer = Solid.cube(20, 20, 20, 'red');
const inner = Solid.cube(16, 16, 16, 'red');
const result = Solid.SUBTRACT(outer, inner); // Returns new Solid
```

**Negative Solids (for merge operations):**

```typescript
// Window component with negative opening
export const window = (width: number, height: number): Solid => {
	const frame = Solid.cube(width, height, 3, 'brown');
	const opening = Solid.cube(width - 4, height - 4, 10, 'gray').setNegative(); // Marks as negative
	const bar = Solid.cube(1, height, 2, 'brown');

	return Solid.MERGE([frame, opening, bar]); // MERGE respects negative flags
};

// Usage: Window's negative opening cuts into wall
const wall = Solid.cube(20, 20, 1, 'gray');
const win = window(5, 8).move({ x: 10, y: 5 });
return Solid.UNION(wall, win); // Combines wall and window (with its hole)
```

### Reusable Components with Context

See `projects/sample/_context.ts`:

- Shared constants across project components
- Production/development mode toggles
- Component parameters (e.g., `width: 240`)

### Grid Arrays

The `Solid` class provides three static grid methods for creating 1D, 2D, and 3D arrays:

```typescript
const brick = Solid.cube(3, 1, 1, 'red');

// 1D grid along X-axis
const row = Solid.GRID_X(brick, { cols: 10, spacing: 1 });
// Without spacing (solids touching)
const rowTight = Solid.GRID_X(brick, { cols: 10 });

// 2D grid on XY plane (most common for walls, patterns)
const wall = Solid.GRID_XY(brick, { cols: 10, rows: 5, spacing: [1, 0.5] });
// Without spacing
const wallTight = Solid.GRID_XY(brick, { cols: 10, rows: 5 });

// 3D grid in XYZ space (for volume fills, lattices)
const lattice = Solid.GRID_XYZ(brick, {
	cols: 5,
	rows: 5,
	levels: 3,
	spacing: [1, 1, 2]
});
// Without spacing
const latticeTight = Solid.GRID_XYZ(brick, { cols: 5, rows: 5, levels: 3 });

// All grid methods return a single merged Solid (immutable)
// Spacing adds gaps between elements:
// - GRID_X: spacing = gap between columns
// - GRID_XY: spacing = [gapX, gapY]
// - GRID_XYZ: spacing = [gapX, gapY, gapZ]
// Internal calculation: position = index * (dimension + spacing)
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

**Profile Prism from Path (Path-Based):**

```typescript
Solid.profilePrismFromPath(
  height: number,
  segments: PathSegment[],
  color?: string
)

// Import factory functions
import { Solid, straight, curve } from '$lib/3d/Solid';

// Example: Rounded rectangle
const roundedRect = Solid.profilePrismFromPath(10, [
  straight(20),      // Bottom edge
  curve(5, 90),      // Right turn with radius 5
  straight(10),      // Right edge
  curve(5, 90),      // Another right turn
  straight(20),      // Top edge
  curve(5, 90),      // Left turn
  straight(10),      // Left edge
  curve(5, 90)       // Final turn back to start
], 'blue'); // Automatically closes back to origin

// Example: S-curve
const sCurve = Solid.profilePrismFromPath(8, [
  straight(10),
  curve(5, 90),      // Right turn (positive angle)
  straight(5),
  curve(5, -90),     // Left turn (negative angle)
  straight(10)
], 'red');

// Example: Sharp corners using zero-radius curves
const triangle = Solid.profilePrismFromPath(4, [
  straight(15),
  curve(0, 120),     // Sharp 120° corner (no rounding)
  straight(15),
  curve(0, 120),     // Another sharp corner
  straight(15),
  curve(0, 120)      // Close with sharp corner
], 'orange');

// Example: Race track (oval)
const raceTrack = Solid.profilePrismFromPath(3, [
  straight(30),      // Straightaway
  curve(8, 180),     // Semicircle turn
  straight(30),      // Back straightaway
  curve(8, 180)      // Return semicircle
], 'green');
```

**Path Segment Types:**

- `straight(length)` - Straight line segment with specified length
- `curve(radius, angle)` - Curved segment with:
  - `radius`: Arc radius (0 = sharp corner, >0 = smooth curve)
  - `angle`: Turn angle in degrees (positive = right turn, negative = left turn)

**Path Behavior:**

- Always starts at origin (0, 0) facing right (+X direction)
- Each segment starts from the endpoint of the previous segment
- Current heading updates after each segment
- Path automatically closes back to origin
- Zero-radius curves create sharp corners (heading changes without arc)
- Positive angle = clockwise/right turn, negative = counter-clockwise/left turn

**Key Features:**

- `profilePrism()` provides full Three.js Shape API (curves, arcs, beziers)
- `profilePrismFromPoints()` is simpler, takes point array and auto-closes the path
- `profilePrismFromPath()` uses path segments for smooth curves and controlled turns
- All methods automatically normalize geometry for clean CSG operations
- Extrudes along Z-axis with configurable height
- Bevel is disabled for clean CSG operations

### Body of Revolution (Lathe Geometry)

For creating rotationally symmetric objects like chess pieces, vases, bottles, and goblets by rotating a 2D profile around the Y-axis.

**Revolution Solid with Shape Builder:**

```typescript
Solid.revolutionSolid(
  profileBuilder: (shape: Shape) => void,
  options?: {
    angle?: number;  // Rotation angle in degrees (default: 360)
    color?: string;
  }
)

// Example: Simple vase
const vase = Solid.revolutionSolid((shape) => {
  shape.moveTo(5, 0);    // Bottom radius (x = radius, y = height)
  shape.lineTo(3, 5);    // Narrow middle
  shape.lineTo(6, 10);   // Wide top
  shape.lineTo(5, 15);   // Rim
}, { color: 'blue' });

// Example: Goblet with curves
const goblet = Solid.revolutionSolid((shape) => {
  shape.moveTo(0, 0);    // Center bottom (stem)
  shape.lineTo(1, 0);    // Stem base
  shape.lineTo(1, 5);    // Stem height
  shape.quadraticCurveTo(5, 7, 6, 10); // Curved bowl
  shape.lineTo(6, 12);   // Bowl sides
  shape.lineTo(0, 12);   // Back to center
}, { color: 'gold' });

// Full Shape API available: lineTo, quadraticCurveTo, bezierCurveTo, arc, etc.
```

**Revolution Solid from Points (Simplified):**

```typescript
Solid.revolutionSolidFromPoints(
  points: [number, number][],
  options?: {
    angle?: number;  // Rotation angle in degrees (default: 360)
    color?: string;
  }
)

// Example: Chess pawn
const pawn = Solid.revolutionSolidFromPoints([
  [0, 0],    // Bottom center (x = radius, y = height)
  [3, 0],    // Bottom edge
  [2, 2],    // Narrow stem
  [4, 8],    // Body
  [2, 10],   // Neck
  [3, 12],   // Head
  [0, 12]    // Top center
], { color: 'white' });

// Example: Partial revolution (180° half bottle)
const halfBottle = Solid.revolutionSolidFromPoints([
  [0, 0],
  [5, 0],
  [5, 8],
  [2, 10],
  [2, 15],
  [0, 15]
], { angle: Solid.DEG_180, color: 'green' });
```

**Revolution Solid from Path (Path-Based):**

```typescript
Solid.revolutionSolidFromPath(
  segments: PathSegment[],
  options?: {
    angle?: number;  // Rotation angle in degrees (default: 360)
    color?: string;
  }
)

// Import factory functions
import { Solid, straight, curve } from '$lib/3d/Solid';

// Example: Rounded bottle with smooth curves
const bottle = Solid.revolutionSolidFromPath([
  straight(5),       // Bottom radius
  curve(2, 90),      // Rounded corner up
  straight(8),       // Body height
  curve(3, -90),     // Curve inward for neck
  straight(5),       // Neck height
  curve(1, -90),     // Top curve
  straight(2)        // Rim width
], { color: 'blue' });

// Example: Chess rook with sharp corners
const rook = Solid.revolutionSolidFromPath([
  straight(4),       // Base radius
  curve(0, 90),      // Sharp corner up (zero radius = sharp)
  straight(10),      // Tower height
  curve(0, -90),     // Sharp corner outward
  straight(1),       // Battlement step
  curve(0, 90),      // Sharp corner up
  straight(1.5),     // Battlement height
  curve(0, 180),     // Turn back
  straight(1.5),     // Down
  curve(0, 90),      // Corner
  straight(1)        // To center
], { color: 'black' });

// Example: Quarter section (90° slice for cross-section view)
const quarterVase = Solid.revolutionSolidFromPath([
  straight(4),
  curve(1, 45),
  straight(6),
  curve(2, 45),
  straight(3)
], { angle: Solid.DEG_90, color: 'purple' });
```

**Profile Coordinate System:**

- **X-axis**: Radius from center (distance from Y-axis)
- **Y-axis**: Height (vertical position)
- Profile is rotated around the Y-axis
- Start at origin (0, 0) or close to Y-axis for proper revolution
- Points with X=0 will be at the center axis

**Key Features:**

- `revolutionSolid()` provides full Three.js Shape API (most flexible)
- `revolutionSolidFromPoints()` is simpler, takes coordinate pairs
- `revolutionSolidFromPath()` uses path segments for smooth curves and sharp corners
- All methods automatically normalize geometry for clean CSG operations
- Radial segments auto-calculated based on angle (8-48 segments)
- Supports partial revolutions (angle < 360°) for cut-away views
- Perfect for rotationally symmetric objects: chess pieces, vases, bottles, goblets, spinning tops

**Common Use Cases:**

- Chess pieces (pawn, rook, bishop, queen, king)
- Tableware (vases, bottles, goblets, wine glasses, bowls)
- Architectural elements (balusters, columns, finials)
- Mechanical parts (knobs, handles, pulleys)
- Decorative objects (candlesticks, lamp bases, ornaments)

### Usage Examples

```typescript
// Rounded corners using sphere subtraction
const roundedCube = Solid.SUBTRACT(
	Solid.cube(20, 20, 20, 'red'),
	Solid.sphere(3, { color: 'red' }).move({ x: 10, y: 10, z: 10 })
);

// Chamfered edge using cone
const chamferedBlock = Solid.SUBTRACT(
	Solid.cube(15, 15, 15, 'blue'),
	Solid.cone(4, 8, { color: 'blue' }).rotate({ x: 90 })
);

// Hexagonal nut
const nut = Solid.SUBTRACT(
	Solid.prism(6, 10, 5, { color: 'gray' }),
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
	const base = Solid.cube(width, height, 2, 'gray');
	const cutouts = Solid.cylinder(5, height + 1, { color: 'gray' });
	return Solid.SUBTRACT(base, cutouts);
};

// Wrap with cache
const cachedComponent = cacheFunction(expensiveComponent);

// Usage: First call computes, subsequent calls with same params return cached result
const part1 = cachedComponent(10, 20); // Computes and caches result
const part2 = cachedComponent(10, 20); // Returns cached result (instant)
const part3 = cachedComponent(15, 25); // Different params - computes new result
```

**Inline Function Caching:**

```typescript
import { cacheInlineFunction } from '$lib/cacheFunction';

// For arrow functions or when function.name isn't available
const cachedPart = cacheInlineFunction('myPart', (size: number) => {
	return Solid.SUBTRACT(
		Solid.cube(size, size, size, 'red'),
		Solid.cylinder(size / 2, size * 2, { color: 'red' })
	);
});

// Real-world example from castle project
export const Wall = cacheInlineFunction(
	'Wall',
	(length: number, config?: { includeFootPath?: boolean }): Solid => {
		const wall = Solid.cube(length, 20, 2, 'green');
		const header = Solid.cube(length, 4, 8, 'green').move({ y: 10 });
		// ... complex zigzag pattern with multiple subtractions
		let result = Solid.UNION(wall, header);

		if (config?.includeFootPath) {
			const footPath = Solid.cube(length, 4, 8).align('bottom').move({ y: 10 });
			result = Solid.UNION(result, footPath);
		}

		return result.align('bottom');
	}
);
```

**How it works:**

- Cache key generated from function name and serialized arguments: `${functionName}:${JSON.stringify(args)}`
- **Results are cloned before caching** to ensure immutability (each call gets independent instance)
- Returns cached clone if key exists in cache
- Otherwise computes result, caches a clone, and returns the original
- Cache persists for the session (not cleared automatically)
- **Important**: Only caches functions returning `Solid` instances

**When to use:**

- ✅ Component functions called multiple times with same parameters
- ✅ Expensive CSG operations in reusable parts (walls, towers, decorative elements)
- ✅ Grid/array patterns where same base shape is used repeatedly
- ✅ Parametric components that are frequently reused in different contexts
- ❌ **Don't use** for functions with side effects or non-serializable parameters (functions, symbols, etc.)
- ❌ **Don't use** for one-time components that are never reused
- ❌ **Don't use** for very simple/fast operations (caching overhead not worth it)

**Example: Reusing cached components:**

```typescript
import { cacheInlineFunction } from '$lib/cacheFunction';
import { Solid } from '$lib/3d/Solid';

// Cached wall component (expensive CSG operations with zigzag pattern)
export const Wall = cacheInlineFunction('Wall', (length: number): Solid => {
	let wall = Solid.cube(length, 20, 2, 'green');
	// ... complex CSG operations with zigzag pattern
	return wall.align('bottom');
});

// Tower component reuses Wall multiple times - Wall(20) computed once!
export const CornerTower = cacheInlineFunction('CornerTower', (): Solid => {
	let tower = Solid.prism(8, 10, 20, { color: 'red' }).align('bottom');

	// First Wall(20) call - computes and caches result
	const wall1 = Wall(20).align('left').move({ x: 8 });
	tower = Solid.SUBTRACT(tower, wall1);

	// Second Wall(20) call - returns cached result (instant!)
	const wall2 = Wall(20).align('right').rotate({ y: 90 }).move({ z: 8 });
	tower = Solid.SUBTRACT(tower, wall2);

	return tower;
});
```

**Example: Cached grid components:**

```typescript
import { cacheFunction } from '$lib/cacheFunction';
import { Solid } from '$lib/3d/Solid';

// Cache the expensive base brick
const brick = cacheFunction((width: number, height: number, depth: number) => {
	return Solid.SUBTRACT(
		Solid.cube(width, height, depth, 'red'),
		Solid.cylinder(0.5, height * 2, { color: 'red' }),
		Solid.cylinder(0.5, height * 2, { color: 'red' }).move({ x: width - 1 })
	);
});

// Use cached brick in grid - brick(3, 1, 1.5) computed once for entire wall!
export const brickWall = (): Solid => {
	const b = brick(3, 1, 1.5); // Computed once
	return Solid.GRID_XY(b, { cols: 10, rows: 8 });
};
```

## Common Issues & Critical Patterns

### Component Not Appearing in UI

- Check `projects/[project]/index.ts` calls `addToComponentStore()`
- Verify `projects/index.ts` exports the project: `export * from './[project]';`
- Ensure component name in `ComponentsMap` is unique
- Restart dev server if hot reload fails

### Solid Renders Black/Wrong

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
- Ensure components return `Solid` (not other types)

### Critical Errors to Avoid

**"First solid in MERGE cannot be negative"** error:

- Thrown when first solid in array passed to `Solid.MERGE([...])` has `.setNegative()` applied
- Fix: Ensure first solid is always positive (base geometry)
- Example wrong: `Solid.MERGE([hole.setNegative(), box])` ❌
- Example correct: `Solid.MERGE([box, hole.setNegative()])` ✅

**Position vs. Move confusion**:

- `at(x, y, z)` is **absolute** - requires all 3 parameters
- `move({ x?, y?, z? })` is **relative** - parameters are optional
- Don't chain `.at()` calls - only the last one takes effect
- Chain `.move()` calls - they accumulate

**CSG operation immutability**:

- All static CSG methods (`SUBTRACT`, `UNION`, `INTERSECT`, `MERGE`) return **new** Solid instances
- Original solids are not modified
- Example: `const result = Solid.SUBTRACT(a, b);` // a and b remain unchanged
