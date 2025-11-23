# CLAUDE.md

Project instructions for Claude Code when working with this codebase.

## Project Overview

CSG Builder: TypeScript-based 3D mesh creation using component architecture. Users write TypeScript to define 3D components (React-like) from primitives (cubes, cylinders, spheres, cones, prisms). Uses CSG operations for boolean operations, exports binary STL.

## Learning Resources

### **projects/examples/** - Tutorial Series (A-N)

Progressive examples with comprehensive inline comments:

**Foundational (A-G):** Primitives, operations, alignment, partials, composition, custom profiles, revolution
**Advanced (H-N):** Scaling, transforms, 3D grids, patterns, optimization, production composition, import capabilities

**Start with A-G for basics, then H-N for advanced patterns.**

### **projects/castle/** - Production Architecture

Complete multi-file project showing: modular structure, hierarchical composition, shared config, performance optimization, cross-file dependencies, advanced CSG.

## Commands

```bash
npm run dev              # Dev server (http://localhost:5173)
npm run build            # Production build to ./docs
npm run export           # CLI STL export tool
npm run all              # format, lint, typecheck, build
```

## Architecture

### Two-Layer System

1. **Primitive Layer** (`Solid` class in `src/lib/3d/Solid.ts`)
   - Wraps Three.js `Brush` from `three-bvh-csg`
   - Factory methods: `cube()`, `cylinder()`, `sphere()`, `cone()`, `prism()`, `trianglePrism()`
   - **Static CSG**: `SUBTRACT()`, `UNION()`, `INTERSECT()`, `MERGE()` - all immutable
   - **Static Grids**: `GRID_X()`, `GRID_XY()`, `GRID_XYZ()`
   - Fluent API: transformations return `this`

2. **Component Registry** (dual-store)
   - **Base**: `componentStore.ts` - Plain array for CLI/Node
   - **Svelte**: `componentStore.svelte.ts` - Reactive wrapper for UI
   - Auto-register via `addToComponentStore()`
   - Type-safe `ComponentsMap` enforces functions returning `Solid`

### Data Flow

**Web:** projects/_.ts → addToComponentStore() → reactive store → UI dropdown → rendering → STL export
**CLI:** projects/_.ts → addToComponentStore() → base store → bin/csg-export.ts → STL file

### Path Aliases (ALWAYS use these)

- `$lib/*` → `src/lib/*`
- `$stores/*` → `src/stores/*`
- `$types/*`, `$components/*`, `$projects`

### Component Registration

```
projects/
  [project-name]/
    index.ts          # Calls addToComponentStore()
    component.ts      # Exports ComponentsMap
```

**Critical:** Each project must be re-exported in `projects/index.ts`

**Always import:** `import { addToComponentStore } from '$stores/componentStore'` (NOT `.svelte`)

## Key Implementation Details

### CSG Operations

- **All static and immutable** - return new Solid instances
- `Solid.evaluator` performs all operations
- **MERGE([base, pos, neg, pos])**: Processes in array order, respects negative flags
- First solid cannot be negative (throws error)
- Negative solids: `setNegative()` marks for subtraction in `MERGE()`
- Partial geometries (angle < 360°): Uses CSG subtraction with wedge cutter

### Coordinate System

- Three.js right-handed: X-right, Y-up, Z-toward camera
- **Absolute**: `at(x, y, z)` - all params required, sets position
- **Relative**: `move({ x?, y?, z? })` - optional properties, accumulates
- **Rotation**: degrees, converts internally
- **Scaling**: `scale({ all?, x?, y?, z? })` - multiplicative, cumulative

### Geometry Normalization

Auto-normalized: `cylinder()`, `sphere()`, `cone()`, `prism()`. Forces CSG rebuild via union with empty cube, prevents artifacts.

### Centering & Alignment

```typescript
solid.getBounds(); // { width, height, depth, min, max, center }
solid.center(); // All axes at origin
solid.center({ x: true, y: true }); // Specific axes
solid.align('bottom'); // Edge to coordinate plane
// Directions: 'bottom', 'top', 'left', 'right', 'front', 'back'
```

### STL Export

Binary STL: 80-byte header, 4-byte triangle count, per-triangle data. **Coordinate swap:** `(X, Y, Z) → (X, -Z, Y)`.

### CLI Export

```bash
npm run export -- --list
npm run export -- Box -o box.stl
npm run export --silent -- Box > box.stl
```

## Primitives API

### Basic Shapes

```typescript
Solid.cube(width, height, depth, { color? })
Solid.roundedBox(width, height, depth, { color?, radius?, segments? })
Solid.cylinder(radius, height, { color?, angle? })  // angle in degrees
Solid.sphere(radius, { color?, angle? })
Solid.cone(radius, height, { color?, angle? })
Solid.prism(sides, radius, height, { color?, angle? })
Solid.trianglePrism(radius, height, { color? })
Solid.text(text, { color?, size?, height?, curveSegments?, bevelEnabled? })
```

### Custom Profile Prisms

```typescript
// Shape API
Solid.profilePrism(height, (shape) => { shape.moveTo/lineTo/arc... }, { color? })

// Points array
Solid.profilePrismFromPoints(height, [[x,y], ...], { color? })

// Path segments
import { straight, curve } from '$lib/3d/Solid';
Solid.profilePrismFromPath(height, [straight(10), curve(5, 90), ...], { color? })
// straight(length), curve(radius, angle) - positive=right, negative=left, 0=sharp
```

### Body of Revolution

```typescript
// Shape API
Solid.revolutionSolid((shape) => { ... }, { angle?, color? })

// Points (x=radius, y=height)
Solid.revolutionSolidFromPoints([[x,y], ...], { angle?, color? })

// Path segments
Solid.revolutionSolidFromPath([straight(5), curve(2, 90), ...], { angle?, color? })
```

**Profile coordinates:** X=radius from center, Y=height, rotates around Y-axis

### 3D Text Extrusion

Create 3D text shapes with customizable size and extrusion depth:

```typescript
// Simple text
const label = Solid.text('Hello', { size: 10, height: 2, color: 'blue' });

// Text with bevel (rounded edges)
const logo = Solid.text('LOGO', { size: 15, height: 3, bevelEnabled: true, color: 'gold' });

// Text as cutter for engraving
const plate = Solid.cube(50, 20, 5, { color: 'gray' });
const text = Solid.text('ENGRAVED', { size: 4, height: 10, color: 'gray' });
const engraved = Solid.SUBTRACT(plate, text);

// Embossed text (raised text on surface)
const base = Solid.cube(40, 30, 3, { color: 'gray' });
const embossText = Solid.text('LOGO', { size: 6, height: 2, color: 'gold' }).move({ y: 3 }); // Position on top of base
const embossed = Solid.UNION(base, embossText);
```

**Text Parameters:**

- `text`: The string to render (required, cannot be empty)
- `size`: Font size (default: 10)
- `height`: Extrusion depth along Y-axis (default: 2)
- `curveSegments`: Smoothness of curves (default: 12, lower=faster but blockier)
- `bevelEnabled`: Add rounded edges to text (default: false)
- `color`: Color of the text geometry

**Important Notes:**

- Uses Helvetiker Regular font (built-in)
- Text is automatically centered on XZ plane and aligned to Y=0
- For engraving/embossing, make text height > target depth to ensure complete cut
- **Performance warning:** Long text (>10 characters) or high curveSegments can slow CSG operations
- For better performance with long text, reduce `curveSegments` to 8

### Rounded Box

Create boxes with filleted/rounded edges:

```typescript
// Basic rounded box with auto-calculated radius (10% of smallest dimension)
const box = Solid.roundedBox(10, 10, 10, { color: 'teal' });

// Custom radius
const customBox = Solid.roundedBox(20, 15, 10, { color: 'blue', radius: 2 });

// High quality rounding (more segments)
const smoothBox = Solid.roundedBox(10, 10, 10, { color: 'red', radius: 1.5, segments: 4 });
```

**Rounded Box Parameters:**

- `width`, `height`, `depth`: Box dimensions (required, must be positive)
- `radius`: Corner radius (default: 10% of smallest dimension)
  - Must be ≤ half of smallest dimension
  - Larger radius = more rounded corners
- `segments`: Rounding quality (default: 2)
  - Higher values = smoother but more geometry
  - 2 is sufficient for most cases

**Use Cases:**

- Mechanical parts with filleted edges
- Product design and prototyping
- Realistic objects (boxes are rarely sharp-edged in real life)
- Ergonomic designs

## Import Capabilities

### STL Import

Load external STL files (binary or ASCII format) as Solid components:

```typescript
// Import STL file using Vite's import syntax
import stlData from './model.stl?raw'; // ASCII STL
// For binary STL, use ?url and fetch as ArrayBuffer

// Create Solid from STL data
const imported = Solid.fromSTL(stlData, { color: 'blue' });

// Use in boolean operations
const cube = Solid.cube(20, 20, 20, { color: 'red' });
const result = Solid.SUBTRACT(cube, imported);

// Transform imported geometry
const transformed = Solid.fromSTL(stlData, { color: 'green' })
	.scale({ all: 0.5 })
	.rotate({ y: 45 })
	.move({ y: 10 });
```

**Key points:**

- Supports both binary and ASCII STL formats
- Automatically normalized for CSG operations
- Works with all standard Solid methods (transforms, CSG, grids)
- Uses STLLoader from Three.js (no additional dependencies)

### SVG Path Import

Import SVG path data and extrude into 3D profiles:

```typescript
// Simple SVG rectangle path
const rectPath = 'M 0 0 L 20 0 L 20 10 L 0 10 Z';
const rect = Solid.profilePrismFromSVG(rectPath, 5, { color: 'blue' });

// Complex path with curves (Q = quadratic bezier) - creates wavy pattern
const curvedPath = 'M 0 5 Q 5 0, 10 5 Q 15 10, 20 5 L 20 10 L 0 10 Z';
const curved = Solid.profilePrismFromSVG(curvedPath, 8, { color: 'pink' });

// Star shape
const starPath = 'M 10 0 L 12 8 L 20 8 L 14 13 L 16 21 L 10 16 L 4 21 L 6 13 L 0 8 L 8 8 Z';
const star = Solid.profilePrismFromSVG(starPath, 3, { color: 'gold' });

// Use in boolean operations
const plate = Solid.cube(30, 20, 5, { color: 'gray' });
const result = Solid.SUBTRACT(plate, star);
```

**SVG Path Commands Supported:**

- M/m - Move to
- L/l - Line to
- H/h - Horizontal line
- V/v - Vertical line
- C/c - Cubic bezier curve
- Q/q - Quadratic bezier curve
- A/a - Arc
- Z/z - Close path

**Key points:**

- Extrudes SVG path along Y-axis
- Handles SVG coordinate system (Y-down → Y-up conversion)
- Works with all CSG operations
- Perfect for logos, custom profiles, 2D designs
- Uses SVGLoader from Three.js (no additional dependencies)

### Boolean Operations with Imports

All imported geometries work seamlessly with CSG operations:

```typescript
// STL + Primitive
const stl = Solid.fromSTL(stlData, { color: 'red' });
const cube = Solid.cube(20, 20, 20, { color: 'red' });
const combined = Solid.UNION(stl, cube);

// SVG + STL
const svg = Solid.profilePrismFromSVG(path, 5, { color: 'blue' });
const stl = Solid.fromSTL(data, { color: 'blue' });
const result = Solid.SUBTRACT(stl, svg);

// Grid from imports
const imported = Solid.fromSTL(data, { color: 'purple' });
const grid = Solid.GRID_XY(imported, { cols: 3, rows: 3, spacing: [5, 5] });
```

## Component Patterns

### Basic Component

```typescript
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const myPart = (w: number, h: number): Solid => {
	const base = Solid.cube(w, h, 1, { color: 'blue' });
	const hole = Solid.cylinder(2, 5, { color: 'blue' }).rotate({ x: 90 });
	return Solid.SUBTRACT(base, hole);
};

export const components: ComponentsMap = {
	MyPart: () => myPart(10, 10)
};
```

### Negative Solids for MERGE

```typescript
export const window = (w: number, h: number): Solid => {
	const frame = Solid.cube(w, h, 3, { color: 'brown' });
	const opening = Solid.cube(w - 4, h - 4, 10, { color: 'gray' }).setNegative();
	const bar = Solid.cube(1, h, 2, { color: 'brown' });
	return Solid.MERGE([frame, opening, bar]);
};

const wall = Solid.cube(20, 20, 1, { color: 'gray' });
const win = window(5, 8).move({ x: 10, y: 5 });
return Solid.UNION(wall, win); // Window's hole cuts through
```

### Grid Arrays

```typescript
const brick = Solid.cube(3, 1, 1, { color: 'red' });
Solid.GRID_X(brick, { cols: 10, spacing: 1 }); // 1D
Solid.GRID_XY(brick, { cols: 10, rows: 5, spacing: [1, 0.5] }); // 2D
Solid.GRID_XYZ(brick, { cols: 5, rows: 5, levels: 3, spacing: [1, 1, 2] }); // 3D
```

### Circular Arrays

Arrange solids in circular/radial patterns (polar arrays):

```typescript
// Gear teeth - elements face outward by default
// IMPORTANT: Element must extend in +X direction to face outward when rotated
// Width (X) > depth (Z) makes tooth point radially
const disk = Solid.cylinder(15, 8, { color: 'gray' }).align('bottom');
const tooth = Solid.cube(3, 10, 2, { color: 'gray' }) // 3 wide (X), 2 deep (Z)
	.center({ x: true, z: true })
	.align('bottom')
	.move({ y: 8 }); // Position on top of disk
const teeth = Solid.ARRAY_CIRCULAR(tooth, { count: 24, radius: 17 });
const gear = Solid.UNION(disk, teeth);

// Bolt holes - no rotation needed for holes
const hole = Solid.cylinder(2, 10, { color: 'blue' }).setNegative();
const pattern = Solid.ARRAY_CIRCULAR(hole, { count: 8, radius: 20, rotateElements: false });

// Half circle (amphitheater seating)
const seat = Solid.cube(2, 1, 2, { color: 'red' });
const seating = Solid.ARRAY_CIRCULAR(seat, { count: 15, radius: 25, startAngle: 0, endAngle: 180 });

// Wheel spokes from center (radius = 0, just rotation)
const spoke = Solid.cube(1, 20, 2, { color: 'silver' }).center({ x: true, z: true });
const spokes = Solid.ARRAY_CIRCULAR(spoke, { count: 12, radius: 0 });

// Decorative rosette with multiple layers
const orb = Solid.sphere(2, { color: 'gold' });
const innerRing = Solid.ARRAY_CIRCULAR(orb, { count: 8, radius: 8, rotateElements: false });
const outerRing = Solid.ARRAY_CIRCULAR(orb, { count: 16, radius: 15, rotateElements: false });
const rosette = Solid.UNION(innerRing, outerRing);
```

**Parameters:**

- `count`: Number of copies (required, must be >= 1)
- `radius`: Radius of circular arrangement (required, must be > 0)
- `startAngle`: Starting angle in degrees (default: 0)
- `endAngle`: Ending angle in degrees (default: 360)
- `rotateElements`: Rotate elements to face outward (default: true)

**Key Behaviors:**

- Elements distributed evenly in XZ plane (horizontal circle around Y-axis)
- By default, elements rotate to face outward (like gear teeth)
- Set `rotateElements: false` for spheres, holes, or decorative elements
- Partial circles: use `startAngle`/`endAngle` for arcs (e.g., 0° to 180° = half circle)
- Elements evenly spaced within angular range (startAngle included, endAngle excluded for full circles)
- **Y position preserved**: Elements maintain their vertical (Y) position, allowing layered circular patterns
- **Element orientation**: For radial elements, create them so they extend in the +X direction. When rotated, they'll face outward correctly. Example: for a tooth pointing outward, use `cube(3, 10, 2)` not `cube(2, 10, 3)` - width > depth
- **IMPORTANT**: Center elements with `.center({ x: true, z: true })` before passing to ARRAY_CIRCULAR. The `radius` parameter handles X/Z positioning, but you can use `.move({ y })` for vertical placement

**Common Use Cases:**

- Mechanical: Gear teeth, splines, bolt holes, heat sink fins
- Architectural: Columns, amphitheater seating, circular windows
- Decorative: Medallions, rosettes, clock markers, mandalas
- Functional: Turbine blades, fan blades, ventilation slots, spokes

### Mirror Operations

Create reflections and symmetric objects by mirroring across axis planes:

```typescript
// Simple mirror - creates reflected copy
const shape = Solid.cube(10, 5, 3, { color: 'blue' }).move({ x: 8 });
const mirrored = Solid.MIRROR(shape, 'X');

// Bilateral symmetry - combine original + mirror
const half = Solid.cube(10, 20, 5, { color: 'brown' }).move({ x: 10 });
const symmetric = Solid.UNION(half, Solid.MIRROR(half, 'X'));

// Full 3D symmetry - chain multiple mirrors
const quarter = Solid.cube(5, 5, 5, { color: 'red' }).move({ x: 10, z: 10 });
const halfX = Solid.UNION(quarter, Solid.MIRROR(quarter, 'X'));
const full = Solid.UNION(halfX, Solid.MIRROR(halfX, 'Z'));

// Works with negative solids
const hole = Solid.cylinder(2, 10, { color: 'blue' }).move({ x: 5 }).setNegative();
const holes = Solid.MERGE([
	Solid.cube(30, 30, 5, { color: 'blue' }),
	hole,
	Solid.MIRROR(hole, 'X')
]);

// Archway with symmetric pillars
const pillar = Solid.cube(5, 30, 8, { color: 'brown' }).move({ x: 15 }).align('bottom');
const arch = Solid.UNION(pillar, Solid.MIRROR(pillar, 'X'));
```

**Axis Parameter:**

- `'X'`: Mirrors across YZ plane (flips X coordinates) - for left/right symmetry
- `'Y'`: Mirrors across XZ plane (flips Y coordinates) - for top/bottom symmetry
- `'Z'`: Mirrors across XY plane (flips Z coordinates) - for front/back symmetry

**Key Behaviors:**

- Returns **only the mirrored copy** (not combined with original)
- Use `UNION(original, MIRROR(original, axis))` for bilateral symmetry
- Bakes all transformations before mirroring (position, rotation, scale)
- Preserves negative flag - mirrored negative solids remain negative
- Works with all primitives, CSG results, and complex shapes
- Can chain mirrors for multi-axis symmetry
- Immutable - does not modify original solid

**Common Use Cases:**

- Mechanical: Symmetric gears, propellers, mirror-image parts
- Architectural: Arches, symmetric facades, bilateral structures
- Organic: Butterflies, leaves, faces (bilateral symmetry)
- Decorative: Symmetric patterns, medallions, ornaments
- Functional: Mirrored mounting holes, symmetric assemblies

## Performance - Caching

```typescript
import { cacheFunction, cacheInlineFunction } from '$lib/cacheFunction';

// Named function
const cachedWall = cacheFunction((length: number) => {
	/* ... */
});

// Inline function
export const Wall = cacheInlineFunction('Wall', (length: number): Solid => {
	/* expensive CSG ops */
	return wall.align('bottom');
});

// Usage: same params = cached result
const w1 = Wall(20); // Computes and caches
const w2 = Wall(20); // Returns cached (instant)
const w3 = Wall(30); // Different params, new computation
```

**Cache key:** `${functionName}:${JSON.stringify(args)}`
**Use for:** Reusable parametric components, expensive CSG ops, grid base shapes
**Don't use for:** One-time components, simple ops, non-serializable params

## Solid Class API Reference

### Factory Methods

`cube(w,h,d,opts)`, `roundedBox(w,h,d,opts)`, `cylinder(r,h,opts)`, `sphere(r,opts)`, `cone(r,h,opts)`, `prism(sides,r,h,opts)`, `trianglePrism(r,h,opts)`, `text(text,opts)`

### Import Methods

`fromSTL(data,opts)`, `profilePrismFromSVG(svgPathData,height,opts)`

### Custom Profiles

`profilePrism(h,builder,opts)`, `profilePrismFromPoints(h,pts,opts)`, `profilePrismFromPath(h,segs,opts)`

### Revolution

`revolutionSolid(builder,opts)`, `revolutionSolidFromPoints(pts,opts)`, `revolutionSolidFromPath(segs,opts)`

### Path Factories

`straight(length)`, `curve(radius, angle)`

### Transforms (chainable)

`at(x,y,z)`, `move({x?,y?,z?})`, `rotate({x?,y?,z?})`, `scale({all?,x?,y?,z?})`

### CSG (static, immutable)

`SUBTRACT(src,...others)`, `UNION(src,...others)`, `INTERSECT(a,b)`, `MERGE(solids[])`

### Grids & Arrays (static, immutable)

`GRID_X(solid,{cols,spacing?})`, `GRID_XY(solid,{cols,rows,spacing?})`, `GRID_XYZ(solid,{cols,rows,levels,spacing?})`, `ARRAY_CIRCULAR(solid,{count,radius,startAngle?,endAngle?,rotateElements?})`, `MIRROR(solid,axis)`

### Alignment (chainable)

`center(axes?)`, `align(dir)`, `getBounds()`

### Other

`setNegative(bool?)`, `setColor(color)`, `clone()`, `getVertices()`

## Critical Errors to Avoid

1. **"First solid in MERGE cannot be negative"** - First element in `MERGE([...])` array must be positive
2. **Position confusion** - `at()` is absolute (all 3 params), `move()` is relative (optional)
3. **Chaining `.at()`** - Only last takes effect, don't chain
4. **CSG immutability** - Static methods return new Solid, originals unchanged
5. **Component not appearing** - Check `addToComponentStore()` call and `projects/index.ts` export
6. **Import paths** - Always use aliases (`$lib/`, `$stores/`), never relative paths
7. **Component store import** - Always from `componentStore`, NOT `componentStore.svelte`

## Best Practices

- Keep components pure (return new instances)
- Use descriptive names (appear in UI)
- Chain transformations (fluent API)
- Use static CSG methods (immutable)
- Use parameters for flexibility
- Absolute: `at(x,y,z)` (don't chain), Relative: `move({x?,y?,z?})` (accumulates)
- Profile/revolution imports: `import { Solid, straight, curve } from '$lib/3d/Solid'`
- Cache expensive reusable components with `cacheInlineFunction()`

## Adding New Primitives

1. Import Three.js geometry in `Solid.ts`
2. Update `geometryToBrush()` type signature
3. Add factory method with adaptive segments: `MathMinMax(value * factor, min, max)`
4. Optionally call `normalize()` after creation

## Project Structure

```
csg-builder/
├── bin/csg-export.ts           # CLI export tool
├── src/
│   ├── lib/3d/
│   │   ├── Solid.ts            # Core primitives, CSG, grids
│   │   └── stl.ts              # STL export
│   ├── stores/
│   │   ├── componentStore.ts         # Base (CLI)
│   │   └── componentStore.svelte.ts  # Reactive (UI)
│   └── App*.svelte             # UI components
├── projects/
│   ├── index.ts                # Registry
│   └── [project]/
│       ├── index.ts            # Registration
│       └── *.ts                # Components
└── tsconfig.json/cli.json
```
