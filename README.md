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
import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const simpleBox = (): BodySet => {
	return new BodySet(Body.fromCube(10, 10, 10, 'blue'));
};

export const components: ComponentsMap = {
	SimpleBox: () => simpleBox()
};
```

### Example: Complex Component

```typescript
import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import type { ComponentsMap } from '$stores/componentStore.svelte';

export const hollowBox = (): BodySet => {
	// Create outer box
	const outer = Body.fromCube(20, 20, 20, 'red');

	// Create inner box (to be subtracted)
	const inner = Body.fromCube(16, 16, 16, 'red').setNegative();

	// Combine with CSG subtraction
	return new BodySet(outer, inner).merge();
};

export const boxWithHoles = (): BodySet => {
	const box = Body.fromCube(20, 20, 20, 'blue');

	// Create holes using negative cylinders
	const holeX = Body.fromCylinder(3, 25, 'blue').setNegative().rotateZ(90);

	const holeY = Body.fromCylinder(3, 25, 'blue').setNegative();

	const holeZ = Body.fromCylinder(3, 25, 'blue').setNegative().rotateX(90);

	return new BodySet(box, holeX, holeY, holeZ).merge();
};

export const components: ComponentsMap = {
	HollowBox: () => hollowBox(),
	BoxWithHoles: () => boxWithHoles()
};
```

### API Reference

#### Body Class

**Factory Methods:**

- `Body.fromCube(width, height, depth, color)` - Create a cube
- `Body.fromCylinder(radius, height, color)` - Create a cylinder

**Translation Methods (chainable):**

- `dX(x)` - Translate along X axis
- `dY(y)` - Translate along Y axis
- `dZ(z)` - Translate along Z axis
- `d(x, y, z)` - Translate along all axes

**Rotation Methods (chainable, angles in degrees):**

- `rotateX(angle)` - Rotate around X axis
- `rotateY(angle)` - Rotate around Y axis
- `rotateZ(angle)` - Rotate around Z axis
- `rotate(x, y, z)` - Rotate around all axes

**CSG Methods:**

- `setNegative(negative = true)` - Mark for subtraction
- `merge(body)` - Merge with another body
- `clone()` - Create a copy

#### BodySet Class

**Constructor:**

- `new BodySet(...bodies)` - Create set from bodies

**Management:**

- `append(...bodies)` - Add bodies without merging
- `merge(...bodies)` - Add and perform CSG merge

**Transformation Methods:**

- Same as Body class, applied to all bodies in the set

**Static Methods:**

- `BodySet.array(body, cx, cy)` - Create a grid array

### Project Structure

```
csg-builder/
├── src/
│   ├── lib/
│   │   ├── 3d/
│   │   │   ├── Body.ts          # Core 3D primitive class
│   │   │   ├── BodySet.ts       # Body collection manager
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
4. **Negative for Subtraction** - Call `setNegative()` before merging to subtract
5. **Merge When Done** - Call `.merge()` on BodySet before rendering
6. **Use Parameters** - Make components flexible with function parameters
7. **Test Incrementally** - Build complex models step by step

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
- Check that `.merge()` is called on BodySet
- Ensure geometry isn't degenerate (zero volume)

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
