# CSG Builder

A TypeScript-based 3D mesh creation tool using a component-based architecture. Build complex 3D models programmatically and export them as STL files.

## Overview

CSG Builder allows you to create 3D meshes using TypeScript code with a React-like component pattern. It leverages Constructive Solid Geometry (CSG) operations to combine, subtract, and transform primitive shapes (cubes, cylinders, spheres, cones, and polygon prisms) into complex geometries.

## Features

- **Component-Based Architecture** - Define reusable 3D components as TypeScript functions
- **Primitive Shapes** - Cubes, cylinders, spheres, cones, and polygon prisms with customizable dimensions
- **Partial Geometries** - Create pie slices, hemispheres, and wedges with CSG-based angle cutting
- **CSG Operations** - Union and subtraction for complex geometries
- **Transformations** - Translate, rotate, and scale objects with chainable methods
- **Real-Time Preview** - Interactive 3D viewport with orbit controls
- **STL Export** - Export models in binary STL format for 3D printing
- **Hot Reload** - Instant updates during development

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
2. Define your 3D component using the Body and BodySet classes
3. Export a components map
4. Register your components in the project index
5. View and export your model in the browser

### Example: Simple Box

```typescript
import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const simpleBox = (): Solid => {
	return Solid.cube(10, 10, 10, 'blue');
};

export const components: ComponentsMap = {
	SimpleBox: () => simpleBox()
};
```

### Example: Complex Component

```typescript
import { Solid } from '$lib/3d/Solid';
import { Mesh } from '$lib/3d/Mesh';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const hollowBox = (): Solid => {
	// Create outer box
	const outer = Solid.cube(20, 20, 20, 'red');

	// Create inner box and subtract it
	const inner = Solid.cube(16, 16, 16, 'red');

	// Explicit CSG subtraction
	return outer.subtract(inner);
};

export const boxWithHoles = (): Solid => {
	const box = Solid.cube(20, 20, 20, 'blue');

	// Create holes using explicit subtract
	const holeX = Solid.cylinder(3, 25, { color: 'blue' }).rotate({ z: 90 });
	const holeY = Solid.cylinder(3, 25, { color: 'blue' });
	const holeZ = Solid.cylinder(3, 25, { color: 'blue' }).rotate({ x: 90 });

	return box.subtract(holeX).subtract(holeY).subtract(holeZ);
};

export const components: ComponentsMap = {
	HollowBox: () => hollowBox(),
	BoxWithHoles: () => boxWithHoles()
};
```

### Example: Reusable Component with Negative Solids

```typescript
// Window that can be placed in any wall and will cut through it
export const window = (width: number, height: number, depth: number): Mesh => {
	const frame = Solid.cube(width, height, depth, 'brown');

	// Mark opening as negative - it will be subtracted during merge
	const opening = Solid.cube(width - 4, height - 4, depth * 4, 'gray').setNegative();

	const bar = Solid.cube(2, height, depth - 1, 'brown').move({ z: -0.5 });

	// First solid (frame) is positive, opening will be subtracted, then bar added
	return new Mesh(frame, opening, bar);
};

// Usage in wall
export const wallWithWindow = (): Solid => {
	const wall = Solid.cube(20, 20, 1, 'gray');
	const win = window(5, 8, 3).move({ x: 10, y: 5 }); // Use move for relative positioning

	// Window's negative opening is processed when merged
	return Mesh.compose(wall, win).toSolid();
};
```

### Example: Using New Primitive Shapes

```typescript
import { Solid } from '$lib/3d/Solid';
import { Mesh } from '$lib/3d/Mesh';

// Sphere - perfect for rounded features
export const roundedCorner = (): Solid => {
	const cube = Solid.cube(20, 20, 20, 'red');
	const corner = Solid.sphere(3, { color: 'red' }).move({ x: 10, y: 10, z: 10 });
	return cube.subtract(corner); // Rounded corner via subtraction
};

// Cone - great for tapers and chamfers
export const chamferedEdge = (): Solid => {
	const block = Solid.cube(15, 15, 15, 'blue');
	const chamfer = Solid.cone(4, 8, { color: 'blue' }).rotate({ x: 90 }).move({ z: 7.5 });
	return block.subtract(chamfer);
};

// Prism - N-sided shapes (hexagon, octagon, etc.)
export const hexNut = (): Solid => {
	const outer = Solid.prism(6, 10, 5, { color: 'gray' }); // 6 sides = hexagon
	const hole = Solid.cylinder(4, 6, { color: 'gray' });
	return outer.subtract(hole).center();
};

// Triangle Prism - 3-sided prism
export const roof = (): Solid => {
	return Solid.trianglePrism(8, 20, { color: 'brown' }).rotate({ z: 90 }).align('bottom');
};

// Combining multiple new primitives
export const shapesComposition = (): Solid => {
	const base = Solid.cube(20, 4, 20, 'teal').align('bottom');
	const sphere = Solid.sphere(8, { color: 'teal' }).move({ y: 10 });
	const cone = Solid.cone(5, 10, { color: 'teal' }).move({ y: 18 });

	return Mesh.union(base, sphere, cone).toSolid().center({ x: true, z: true });
};

// Partial geometries - closed, manifold shapes via CSG cutting
export const pieSlice = (): Solid => {
	// Quarter cylinder (90° pie slice)
	return Solid.cylinder(10, 2, {
		color: 'red',
		angle: Solid.DEG_90
	}).align('bottom');
};

export const hemisphere = (): Solid => {
	// Half sphere (180°)
	return Solid.sphere(8, {
		color: 'cyan',
		angle: Solid.DEG_180
	});
};

export const coneWedge = (): Solid => {
	// Half cone wedge (180°)
	return Solid.cone(8, 12, {
		color: 'orange',
		angle: Solid.DEG_180
	}).align('bottom');
};

export const partialGear = (): Solid => {
	// Three-quarter octagonal prism (270°) - gear-like shape
	const outer = Solid.prism(8, 10, 4, {
		color: 'silver',
		angle: Solid.DEG_270
	});
	const hole = Solid.cylinder(5, 5, { color: 'silver' });

	return outer.subtract(hole).align('bottom');
};

export const pieChart = (): Solid => {
	// Composite: three 90° slices rotated to form a pie chart
	const slice1 = Solid.cylinder(10, 2, { color: 'red', angle: 90 });
	const slice2 = Solid.cylinder(10, 2, { color: 'blue', angle: 90 }).rotate({ y: 90 });
	const slice3 = Solid.cylinder(10, 2, { color: 'green', angle: 90 }).rotate({ y: 180 });

	return Mesh.union(slice1, slice2, slice3).toSolid().align('bottom');
};
```

### API Reference

#### Solid Class

**Factory Methods:**

- `Solid.cube(width, height, depth, color?)` - Create a rectangular box
- `Solid.cylinder(radius, height, options?)` - Create a cylinder (full or partial)
  - `options: { color?, angle? }` - angle in degrees (1-360, default: 360)
- `Solid.sphere(radius, options?)` - Create a sphere (full or partial)
  - `options: { color?, angle? }` - angle in degrees (1-360, default: 360)
- `Solid.cone(radius, height, options?)` - Create a cone (full or partial)
  - `options: { color?, angle? }` - angle in degrees (1-360, default: 360)
- `Solid.prism(sides, radius, height, options?)` - Create an N-sided prism (full or partial)
  - `options: { color?, angle? }` - angle in degrees (1-360, default: 360)
- `Solid.trianglePrism(radius, height, options?)` - Create a triangular prism (3-sided)
  - `options: { color? }` - color only, no angle support

**Angle Constants:**

For convenience when creating partial geometries, predefined angle constants are available:

- `Solid.DEG_45` = 45° - Small wedge
- `Solid.DEG_90` = 90° - Quarter circle (pie slice)
- `Solid.DEG_180` = 180° - Half circle (hemisphere for sphere, half cylinder, etc.)
- `Solid.DEG_270` = 270° - Three-quarter circle
- `Solid.DEG_360` = 360° - Full circle (default, same as omitting angle parameter)

**Note:** Sphere, cylinder, cone, and prism use adaptive segment counts based on radius for optimal quality and performance. Partial geometries (angle < 360°) are created using CSG subtraction to ensure closed, manifold shapes suitable for further CSG operations.

**Positioning (chainable):**

- `at(x, y, z)` - Set absolute position (all parameters required)
- `move({ x?, y?, z? })` - Move relative with optional axis parameters

**Rotation Methods (chainable, angles in degrees):**

- `rotate({ x?, y?, z? })` - Rotate with optional axis parameters

**Scaling Methods (chainable, multiplicative):**

- `scale({ x?, y?, z? })` - Scale with optional axis parameters (values are multipliers)

**CSG Methods (return new Solid):**

- `subtract(other)` - Boolean subtraction
- `union(other)` - Boolean union
- `intersect(other)` - Boolean intersection

**Composition Methods:**

- `setNegative(negative?)` - Mark solid as negative (for Mesh composition)
- `isNegative` - Getter to check if solid is marked negative

**Alignment Methods (chainable):**

- `center(axes?)` - Center on all axes or specific: `center({ x: true, y: true })`
- `align(direction)` - Align edge to origin: 'bottom', 'top', 'left', 'right', 'front', 'back'
- `getBounds()` - Get bounding box with width, height, depth, min, max, center

**Other Methods:**

- `setColor(color)` - Set color
- `clone()` - Create a copy
- `getVertices()` - Get vertex array for rendering/export

#### Mesh Class

**Static Constructors:**

- `Mesh.union(...solids)` - Create mesh with union operation
- `Mesh.difference(base, ...subtract)` - Create mesh with subtraction
- `Mesh.intersection(...solids)` - Create mesh with intersection
- `Mesh.compose(...items)` - Compose solids/meshes (respects negative flags)
- `Mesh.grid(solid, { cols, rows, spacing? })` - Create grid array
- `Mesh.array(solid, cols, rows)` - Create array with default spacing

**Instance Methods:**

- `append(...solids)` - Add solids without merging
- `merge(...solids)` - Add and perform CSG merge (respects negative solids)
- `toSolid()` - Convert to single merged Solid
- `getSolids()` - Get array of all solids in mesh

**Transformation Methods (applied to all solids in the mesh):**

- `at(x, y, z)` - Set absolute position for all solids
- `move({ x?, y?, z? })` - Move relative with optional axis parameters
- `rotate({ x?, y?, z? })` - Rotate with optional axis parameters
- `center(axes?)` - Center the entire mesh on all axes or specific axes
- `align(direction)` - Align mesh edge to origin
- `getBounds()` - Get combined bounding box of all solids

**Note on Negative Solids:** When a Mesh is merged, solids are processed in **declaration order**. The first solid cannot be negative (base geometry). Each subsequent solid is either added (positive) or subtracted (negative) from the accumulated result. Example: `new Mesh(base, positive1, negative1, positive2)` processes as `((base + positive1) - negative1) + positive2`.

### Project Structure

```
csg-builder/
├── src/
│   ├── lib/
│   │   ├── 3d/
│   │   │   ├── Solid.ts         # Core 3D primitive class
│   │   │   ├── Mesh.ts          # Solid collection manager
│   │   │   └── stl.ts           # STL export functionality
│   │   ├── Math.ts              # Math utilities
│   │   ├── buffer.ts            # Buffer utilities
│   │   └── download.ts          # File download utilities
│   ├── stores/
│   │   └── componentStore.svelte.ts  # Component registry
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
├── vite.config.ts
└── README.md
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
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
   import { addToComponentStore } from '$stores/componentStore.svelte';
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

## Exporting Models

1. Select your component from the dropdown menu
2. View the 3D preview in the viewport
3. Click the "Download STL" button
4. Use the STL file with your 3D printer or modeling software

## Tips and Best Practices

1. **Keep Components Pure** - Component functions should return new instances
2. **Use Descriptive Names** - Component names appear in the UI dropdown
3. **Chain Transformations** - Methods return `this` for fluent API usage
4. **Explicit CSG Operations** - Use `subtract()`, `union()`, `intersect()` methods
5. **Return Solid or Mesh** - Components can return either type (renderer extracts vertices)
6. **Use Parameters** - Make components flexible with function parameters
7. **Test Incrementally** - Build complex models step by step
8. **Absolute vs Relative Positioning**:
   - `at(x, y, z)` - Absolute position (requires all 3 params, don't chain)
   - `move({ x?, y?, z? })` - Relative movement (optional params, accumulates when chained)
9. **Optional Properties** - Only specify axes you want to transform: `.move({ z: -0.5 })`
10. **First Solid Must Be Positive** - In `new Mesh()`, the first solid cannot have `.setNegative()`
11. **Use Path Aliases** - Always import with `$lib/`, `$stores/`, etc. (never relative paths)

## Examples

Check out the `projects/sample/` directory for working examples:

- **box.ts** - Simple cube with cylinder
- **brickWall.ts** - Parametric brick wall with pattern
- **sideWindow.ts** - Window component with frame and pane
- **shapes.ts** - Showcase of all primitive shapes (sphere, cone, prism, etc.) with practical examples

## Troubleshooting

**Problem:** Component doesn't appear in dropdown

- Ensure it's registered in `projects/[project]/index.ts` with `addToComponentStore()`
- Check that project is exported in `projects/index.ts`
- Verify component name in `ComponentsMap` is unique
- Restart dev server

**Problem:** Mesh appears black or invisible

- Verify color is a valid CSS color string
- Ensure component returns `Solid` or `Mesh` (call `toSolid()` on `Mesh` if needed)
- Check geometry isn't degenerate (zero volume)
- Check browser console for geometry errors

**Problem:** "First solid in Mesh cannot be negative" error

- The first solid in `new Mesh(...)` cannot have `.setNegative()` applied
- Fix: Ensure first solid is always positive (base geometry)
- Wrong: `new Mesh(hole.setNegative(), box)` ❌
- Correct: `new Mesh(box, hole.setNegative())` ✅

**Problem:** CSG operation is slow

- Reduce polygon count (cylinder segments scale with radius)
- Simplify geometry before complex operations
- Chain operations efficiently - each CSG operation creates new geometry

**Problem:** Positioning not working as expected

- `at(x, y, z)` requires all 3 parameters and sets absolute position
- `move({ x?, y?, z? })` uses optional parameters for relative movement
- Don't chain `.at()` calls - only the last one takes effect
- `.move()` calls accumulate when chained

**Problem:** STL export fails

- Ensure component returns valid merged geometry
- Check browser console for errors
- Verify final mesh has vertices

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
