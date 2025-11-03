# CSG Builder

A TypeScript-based 3D mesh creation tool using a component-based architecture. Build complex 3D models programmatically and export them as STL files.

## Overview

CSG Builder allows you to create 3D meshes using TypeScript code with a React-like component pattern. It leverages Constructive Solid Geometry (CSG) operations to combine, subtract, and transform primitive shapes into complex geometries.

## Features

- **Component-Based Architecture** - Define reusable 3D components as TypeScript functions
- **Primitive Shapes** - Cubes and cylinders with customizable dimensions
- **CSG Operations** - Union and subtraction for complex geometries
- **Transformations** - Translate and rotate objects with chainable methods
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
	const holeX = Solid.cylinder(3, 25, 'blue').rotateZ(90);
	const holeY = Solid.cylinder(3, 25, 'blue');
	const holeZ = Solid.cylinder(3, 25, 'blue').rotateX(90);

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

	// Mark opening as negative - it will cut through whatever this is placed in
	const opening = Solid.cube(width - 4, height - 4, depth * 4, 'gray').setNegative();

	const bar = Solid.cube(2, height, depth - 1, 'brown');

	return new Mesh(frame, opening, bar); // Returns Mesh with negative solid
};

// Usage in wall
export const wallWithWindow = (): Solid => {
	const wall = Solid.cube(20, 20, 1, 'gray');
	const win = window(5, 8, 3).at(10, 5, 0);

	// Window's negative opening automatically cuts the wall!
	return Mesh.compose(wall, win).toSolid();
};
```

### API Reference

#### Solid Class

**Factory Methods:**

- `Solid.cube(width, height, depth, color?)` - Create a cube
- `Solid.cylinder(radius, height, color?)` - Create a cylinder

**Positioning (chainable):**

- `at(x, y, z)` - Set absolute position
- `moveX(dx)` - Move relative along X axis
- `moveY(dy)` - Move relative along Y axis
- `moveZ(dz)` - Move relative along Z axis
- `move(dx, dy, dz)` - Move relative along all axes

**Rotation Methods (chainable, angles in degrees):**

- `rotateX(angle)` - Rotate around X axis
- `rotateY(angle)` - Rotate around Y axis
- `rotateZ(angle)` - Rotate around Z axis
- `rotate(x, y, z)` - Rotate around all axes

**CSG Methods (return new Solid):**

- `subtract(other)` - Boolean subtraction
- `union(other)` - Boolean union
- `intersect(other)` - Boolean intersection

**Composition Methods:**

- `setNegative(negative?)` - Mark solid as negative (for Mesh composition)
- `isNegative` - Getter to check if solid is marked negative

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

**Transformation Methods:**

- Same as Solid class, applied to all solids in the mesh

**Note on Negative Solids:** When a Mesh is merged, it separates positive and negative solids. All positive solids are unioned together first, then all negative solids are subtracted from the result.

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
5. **Return Solid** - Components must return `Solid` (call `toSolid()` on `Mesh`)
6. **Use Parameters** - Make components flexible with function parameters
7. **Test Incrementally** - Build complex models step by step
8. **Absolute vs Relative** - Use `at()` for absolute positioning, `move()` for relative

## Examples

Check out the `projects/sample/` directory for working examples:

- **box.ts** - Simple cube with cylinder
- **brickWall.ts** - Parametric brick wall with pattern
- **sideWindow.ts** - Window component with frame and pane

## Troubleshooting

**Problem:** Component doesn't appear in dropdown

- Ensure it's registered in `projects/[project]/index.ts`
- Check that project is exported in `projects/index.ts`
- Restart dev server

**Problem:** Mesh appears black or invisible

- Verify color is a valid CSS color string
- Ensure component returns `Solid` (call `toSolid()` on `Mesh` if needed)
- Check geometry isn't degenerate (zero volume)

**Problem:** CSG operation is slow

- Reduce polygon count (cylinder segments)
- Simplify geometry before complex operations
- Merge incrementally rather than all at once

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
