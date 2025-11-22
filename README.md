# CSG Builder

A TypeScript-based 3D mesh creation tool using a component-based architecture. Build complex 3D models programmatically and export them as STL files.

[Online CSG-builder demo](https://segmentcontroller.github.io/csg-builder/)

## Overview

CSG Builder allows you to create 3D meshes using TypeScript code with a React-like component pattern. It leverages Constructive Solid Geometry (CSG) operations to combine, subtract, and transform primitive shapes (cubes, cylinders, spheres, cones, and polygon prisms) into complex geometries.

**📖 New to CSG Builder?** Check out the [Examples & Learning Resources](#examples--learning-resources) section below. All example projects are **fully documented with comprehensive inline comments** to help you learn the syntax and patterns.

## Features

- **Component-Based Architecture** - Define reusable 3D components as TypeScript functions
- **Primitive Shapes** - Cubes, cylinders, spheres, cones, and polygon prisms with customizable dimensions
- **Custom Profile Prisms** - Extrude 2D profiles into 3D shapes using points, paths, or Shape API
- **Body of Revolution** - Create rotationally symmetric objects (chess pieces, vases, bottles) by rotating profiles
- **Partial Geometries** - Create pie slices, hemispheres, and wedges with CSG-based angle cutting
- **Static CSG Operations** - Immutable SUBTRACT, UNION, INTERSECT, and MERGE operations for complex geometries
- **Grid Arrays** - Create 1D, 2D, and 3D arrays with static GRID_X, GRID_XY, GRID_XYZ methods
- **Transformations** - Translate, rotate, and scale objects with chainable methods
- **Real-Time Preview** - Interactive 3D viewport with orbit controls
- **STL Export** - Export models in binary STL format for 3D printing
- **Hot Reload** - Instant updates during development with simple browser refresh (Ctrl+R)
- **Comprehensive Documentation** - Fully-commented example projects teaching syntax from basics to advanced patterns

## Examples STLs

[Whole castle](./STLs/Castle.stl)

[Brick Wall with Window](./STLs/BrickWallwithWindow.stl)

[L Profile With Holes](./STLs/LProfileWithHoles.stl)

[Connector Tower 10](./STLs/ConnectorTower10.stl)

![Castle](./STLs/castle.png)

## Tech Stack

- **TypeScript** - Type-safe component definitions
- **Three.js** - 3D rendering engine
- **three-bvh-csg** - High-performance CSG operations
- **Svelte 5** - Reactive UI framework
- **Threlte** - Svelte wrapper for Three.js
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling

## Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Note on Deployment:**

- Build output goes to `./docs` directory

## Usage

### Quick Start

1. Create a new file in `projects/[your-project]/` directory
2. Define your 3D component using the Solid class
3. Export a components map
4. Register your components in the project index
5. View and export your model in the browser

### Example: Simple Box

```typescript
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

export const simpleBox = (): Solid => {
	return Solid.cube(10, 10, 10, 'blue');
};

export const components: ComponentsMap = {
	SimpleBox: () => simpleBox()
};
```

### Example: CSG Operations

```typescript
// Hollow box - outer minus inner
const outer = Solid.cube(20, 20, 20, { color: 'red' });
const inner = Solid.cube(16, 16, 16, { color: 'red' });
const hollowBox = Solid.SUBTRACT(outer, inner);

// Box with holes - subtract multiple cylinders
const box = Solid.cube(20, 20, 20, { color: 'blue' });
const holeX = Solid.cylinder(3, 25, { color: 'blue' }).rotate({ z: 90 });
const holeY = Solid.cylinder(3, 25, { color: 'blue' });
const holeZ = Solid.cylinder(3, 25, { color: 'blue' }).rotate({ x: 90 });
const boxWithHoles = Solid.SUBTRACT(box, holeX, holeY, holeZ);
```

### Example: Reusable Component with Negative Solids

```typescript
// Window that can be placed in any wall and will cut through it
export const window = (width: number, height: number, depth: number): Solid => {
	const frame = Solid.cube(width, height, depth, 'brown');

	// Mark opening as negative - it will be subtracted during MERGE
	const opening = Solid.cube(width - 4, height - 4, depth * 4, 'gray').setNegative();

	const bar = Solid.cube(2, height, depth - 1, 'brown').move({ z: -0.5 });

	// MERGE respects negative flags: frame + opening (subtracted) + bar
	return Solid.MERGE([frame, opening, bar]);
};

// Usage in wall
export const wallWithWindow = (): Solid => {
	const wall = Solid.cube(20, 20, 1, 'gray');
	const win = window(5, 8, 3).move({ x: 10, y: 5 }); // Use move for relative positioning

	// Window's negative opening is already processed in MERGE
	return Solid.UNION(wall, win);
};
```

### Example: Primitives & Partials

```typescript
// Sphere for rounded features
const roundedCorner = Solid.SUBTRACT(
	Solid.cube(20, 20, 20, { color: 'red' }),
	Solid.sphere(3, { color: 'red' }).move({ x: 10, y: 10, z: 10 })
);

// Prism - N-sided shapes
const hexNut = Solid.SUBTRACT(
	Solid.prism(6, 10, 5, { color: 'gray' }),
	Solid.cylinder(4, 6, { color: 'gray' })
).center();

// Partial geometries with angle parameter (in degrees)
const pieSlice = Solid.cylinder(10, 2, { color: 'red', angle: 90 });
const hemisphere = Solid.sphere(8, { color: 'cyan', angle: 180 });
```

### Example: Custom Profile Prisms

Extrude 2D profiles into 3D shapes - three methods:

```typescript
import { Solid, straight, curve } from '$lib/3d/Solid';

// 1. Shape Builder API
const lBracket = Solid.profilePrism(
	10,
	(shape) => {
		shape.moveTo(0, 0);
		shape.lineTo(20, 0);
		shape.lineTo(20, 5);
		shape.lineTo(5, 5);
		shape.lineTo(5, 20);
		shape.lineTo(0, 20);
	},
	{ color: 'blue' }
);

// 2. Point Array
const trapezoid = Solid.profilePrismFromPoints(
	8,
	[
		[0, 0],
		[10, 0],
		[8, 5],
		[2, 5]
	],
	{ color: 'red' }
);

// 3. Path Segments - smooth curves & controlled turns
const roundedRect = Solid.profilePrismFromPath(
	5,
	[
		straight(20),
		curve(5, 90),
		straight(10),
		curve(5, 90),
		straight(20),
		curve(5, 90),
		straight(10),
		curve(5, 90)
	],
	{ color: 'blue' }
);

// Sharp corners with zero-radius curves
const triangle = Solid.profilePrismFromPath(
	4,
	[straight(15), curve(0, 120), straight(15), curve(0, 120), straight(15), curve(0, 120)],
	{ color: 'orange' }
);
```

**Path segments:** `straight(length)`, `curve(radius, angle)` - positive=right, negative=left, 0=sharp

### Example: Body of Revolution (Lathe Geometry)

Create rotationally symmetric objects like chess pieces, vases, and bottles by rotating a 2D profile around the Y-axis:

```typescript
import { Solid, straight, curve } from '$lib/3d/Solid';

// 1. SHAPE BUILDER API - Full control with Three.js Shape methods
export const vase = (): Solid => {
	return Solid.revolutionSolid(
		(shape) => {
			shape.moveTo(5, 0); // Bottom radius (x = radius, y = height)
			shape.lineTo(3, 5); // Narrow middle
			shape.lineTo(6, 10); // Wide top
			shape.lineTo(5, 15); // Rim
			shape.lineTo(0, 15); // Back to center
		},
		{ color: 'blue' }
	);
};

// 2. POINT ARRAY - Simple coordinate-based profiles
export const chessPawn = (): Solid => {
	return Solid.revolutionSolidFromPoints(
		[
			[0, 0], // Bottom center (x = radius, y = height)
			[3, 0], // Bottom edge
			[2, 2], // Narrow stem
			[4, 8], // Body
			[2, 10], // Neck
			[3, 12], // Head
			[0, 12] // Top center
		],
		{ color: 'white' }
	);
};

// 3. PATH SEGMENTS - Smooth curves and controlled turns
export const bottle = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(5), // Bottom radius
			curve(2, 90), // Rounded corner up
			straight(8), // Body height
			curve(3, -90), // Curve inward for neck
			straight(5), // Neck height
			curve(1, -90), // Top curve
			straight(2) // Rim width
		],
		{ color: 'green' }
	);
};

// Partial revolution (90° cut-away)
const quarterVase = Solid.revolutionSolidFromPoints(
	[
		[0, 0],
		[4, 0],
		[3, 2],
		[5, 6],
		[4, 10],
		[0, 10]
	],
	{ angle: 90, color: 'purple' }
);
```

**Profile coords:** X=radius, Y=height. Rotates around Y-axis.
**Uses:** Chess pieces, vases, bottles, tableware, architectural elements

## Performance Optimization

Cache expensive component computations that are called repeatedly:

```typescript
import { cacheFunction, cacheInlineFunction } from '$lib/cacheFunction';

// Named functions
const cachedWall = cacheFunction((length: number, height: number): Solid => {
	return Solid.SUBTRACT(
		Solid.cube(length, height, 2, { color: 'gray' }),
		Solid.cube(5, 8, 3, { color: 'gray' })
	);
});

// Inline/arrow functions
export const Wall = cacheInlineFunction('Wall', (length: number): Solid => {
	/* expensive CSG ops */
	return wall.align('bottom');
});

// Usage
const w1 = Wall(20); // Computes and caches
const w2 = Wall(20); // Returns cached (instant)
const w3 = Wall(30); // Different params, new computation
```

**How it works:** Cache key = `${functionName}:${JSON.stringify(args)}`, results cloned for immutability
**Use for:** Reusable parametric components, expensive CSG ops, grid base shapes
**Don't use for:** One-time components, simple ops, non-serializable params

### API Reference

**Primitives:** `cube(w,h,d,opts)`, `cylinder(r,h,opts)`, `sphere(r,opts)`, `cone(r,h,opts)`, `prism(sides,r,h,opts)`, `trianglePrism(r,h,opts)`
**Profiles:** `profilePrism(h,builder,opts)`, `profilePrismFromPoints(h,points,opts)`, `profilePrismFromPath(h,segments,opts)`
**Revolution:** `revolutionSolid(builder,opts)`, `revolutionSolidFromPoints(points,opts)`, `revolutionSolidFromPath(segments,opts)`
**Path Factories:** `straight(length)`, `curve(radius,angle)` - positive=right, negative=left, 0=sharp

**Transforms (chainable):** `at(x,y,z)` absolute, `move({x?,y?,z?})` relative, `rotate({x?,y?,z?})` degrees, `scale({all?,x?,y?,z?})` multiplicative

**CSG (static, immutable):** `SUBTRACT(src,...cut)`, `UNION(src,...add)`, `INTERSECT(a,b)`, `MERGE(solids[])` - respects `setNegative()`

**Grids (static, immutable):** `GRID_X(solid,{cols,spacing?})`, `GRID_XY(solid,{cols,rows,spacing?})`, `GRID_XYZ(solid,{cols,rows,levels,spacing?})`
Spacing: GRID_X=number, GRID_XY=[x,y], GRID_XYZ=[x,y,z]

**Alignment (chainable):** `center({x?,y?,z?}?)`, `align('bottom'|'top'|'left'|'right'|'front'|'back')`, `getBounds()`

**Other:** `setNegative(bool?)`, `setColor(color)`, `clone()`, `getVertices()`

### Project Structure

```
csg-builder/
├── bin/
│   └── csg-export.ts           # CLI tool for exporting STL files
├── src/
│   ├── lib/
│   │   ├── 3d/
│   │   │   ├── Solid.ts         # Core 3D class with primitives, CSG ops, and grids
│   │   │   └── stl.ts           # STL export functionality
│   │   ├── Math.ts              # Math utilities
│   │   ├── buffer.ts            # Buffer utilities
│   │   └── download.ts          # File download utilities
│   ├── stores/
│   │   ├── componentStore.ts         # Component registry (non-Svelte, for CLI)
│   │   └── componentStore.svelte.ts  # Component registry (Svelte, for web UI)
│   ├── types/                   # TypeScript types
│   ├── App.svelte              # Main application
│   ├── App3DScene.svelte       # 3D viewport
│   └── AppNavigation.svelte    # UI controls
├── projects/
│   ├── index.ts                # Project registry
│   └── [project-name]/         # Your project folders
│       ├── index.ts            # Component registration
│       └── *.ts                # Component definitions
├── package.json
├── tsconfig.json
├── tsconfig.cli.json           # TypeScript config for CLI
├── vite.config.ts
└── README.md
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run export` - Export components to STL files via CLI
- `npm run ts:check` - Run TypeScript type checking
- `npm run lint:check` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format:check` - Check code formatting
- `npm run format:fix` - Auto-format code
- `npm run all` - Format, lint, type-check, and build

## Creating a New Project

1. Create a new directory in `projects/`:

   ```bash
   mkdir projects/my-project
   ```

2. Create `projects/my-project/index.ts`:

   ```typescript
   import { addToComponentStore } from '$stores/componentStore';
   import { components as myComponents } from './myComponent';

   addToComponentStore({
   	...myComponents
   });
   ```

3. Create component files and export them

4. Add to `projects/index.ts`:
   ```typescript
   export * from './my-project';
   ```

**Note on Component Store:**

- Always import from `$stores/componentStore` (not `.svelte`)
- This works for both web UI and CLI contexts
- The system uses a dual-store architecture:
  - `componentStore.ts` - Base store (plain TypeScript array)
  - `componentStore.svelte.ts` - Reactive wrapper for Svelte UI
  - Both share the same underlying data automatically

## Exporting Models

### Web UI Export

1. Select your component from the dropdown menu
2. View the 3D preview in the viewport
3. Click the "Download STL" button
4. Use the STL file with your 3D printer or modeling software

### CLI Export

Export components to STL files directly from the command line without running the web UI:

**List all available components:**

```bash
npm run export -- --list
```

**Export to a file:**

```bash
npm run export -- Box -o box.stl
npm run export -- "Chess Pawn" -o pawn.stl
```

**Export to stdout (pipe to file):**

```bash
npm run export --silent -- Box > box.stl
npm run export --silent -- "Brick Wall" > wall.stl
```

**Note:** Use `--silent` flag when piping to stdout to suppress npm output.

**Benefits of CLI export:**

- Automate STL generation in build scripts
- Batch export multiple components
- Integrate with CI/CD pipelines
- Export without starting the dev server

## Tips and Best Practices

- Keep components pure (return new instances)
- Chain transformations (fluent API)
- Use static CSG methods (immutable)
- **Positioning:** `at(x,y,z)` = absolute (don't chain), `move({x?,y?,z?})` = relative (accumulates)
- **MERGE rule:** First solid cannot be negative
- **Imports:** Use path aliases (`$lib/`, `$stores/`), not relative paths
- **Path factories:** `import { Solid, straight, curve } from '$lib/3d/Solid'`
- **Caching:** Use `cacheInlineFunction()` for expensive reusable components

## Examples & Learning Resources

**projects/examples/** - Progressive tutorial (A-M) with inline docs:

- **A-G:** Primitives, operations, alignment, partials, composition, profiles, revolution
- **H-M:** Scaling, transforms, 3D grids, patterns, optimization, production composition

**projects/castle/** - Production multi-file architecture: modular structure, caching, cross-file dependencies, advanced CSG

**projects/sample/** - Working examples: box, brick wall, window, shapes showcase, chess pieces

Start with examples A-G, then explore castle project for production patterns.

## Troubleshooting

**Component not in dropdown:** Check `addToComponentStore()` in `projects/[project]/index.ts`, export in `projects/index.ts`, restart dev server
**Black/invisible solid:** Valid CSS color, returns `Solid` type, non-zero volume
**"First solid in MERGE cannot be negative":** First element must be positive - `MERGE([box, hole.setNegative()])` ✅
**Slow CSG:** Reduce segments, simplify geometry, chain efficiently
**Positioning issues:** `at(x,y,z)` = absolute (don't chain), `move({x?,y?,z?})` = relative (accumulates)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

Requires WebGL support.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run all` to verify
5. Submit a pull request

## License

[Add your license here]

## Acknowledgments

- [Three.js](https://threejs.org/) - 3D rendering
- [three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) - CSG operations
- [Threlte](https://threlte.xyz/) - Svelte Three.js integration
- [Svelte](https://svelte.dev/) - Reactive framework

## Support

For issues and questions:

- Create an issue on GitHub
- Check existing examples in `projects/sample/`
- Review documentation in `CLAUDE.md`

---

Built with TypeScript, Three.js, and Svelte
