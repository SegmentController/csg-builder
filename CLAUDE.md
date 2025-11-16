# CLAUDE.md

Project instructions for Claude Code when working with this codebase.

## Project Overview

CSG Builder: TypeScript-based 3D mesh creation using component architecture. Users write TypeScript to define 3D components (React-like) from primitives (cubes, cylinders, spheres, cones, prisms). Uses CSG operations for boolean operations, exports binary STL.

## Learning Resources

### **projects/examples/** - Tutorial Series (A-M)

Progressive examples with comprehensive inline comments:

**Foundational (A-G):** Primitives, operations, alignment, partials, composition, custom profiles, revolution
**Advanced (H-M):** Scaling, transforms, 3D grids, patterns, optimization, production composition

**Start with A-G for basics, then H-M for advanced patterns.**

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

### Angle Constants

`Solid.DEG_45`, `Solid.DEG_90`, `Solid.DEG_180`, `Solid.DEG_270`, `Solid.DEG_360`

### Basic Shapes

```typescript
Solid.cube(width, height, depth, { color? })
Solid.cylinder(radius, height, { color?, angle? })  // angle in degrees
Solid.sphere(radius, { color?, angle? })
Solid.cone(radius, height, { color?, angle? })
Solid.prism(sides, radius, height, { color?, angle? })
Solid.trianglePrism(radius, height, { color? })
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

`cube(w,h,d,opts)`, `cylinder(r,h,opts)`, `sphere(r,opts)`, `cone(r,h,opts)`, `prism(sides,r,h,opts)`, `trianglePrism(r,h,opts)`

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

### Grids (static, immutable)

`GRID_X(solid,{cols,spacing?})`, `GRID_XY(solid,{cols,rows,spacing?})`, `GRID_XYZ(solid,{cols,rows,levels,spacing?})`

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
