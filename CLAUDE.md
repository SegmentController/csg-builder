# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSG Builder is a web-based 3D STL file generator for THT (Through-Hole Technology) PCB component holders. The application uses Constructive Solid Geometry (CSG) operations via three-bvh-csg to create 3D models that can be exported as binary STL files for 3D printing.

**Live site:** https://segmentcontroller.github.io/pcb-tht-holder/

## Requirements

- Node.js >= 22.0.0
- npm >= 10.0.0

## Development Commands

```bash
# Development server with network access
npm run dev

# Type checking
npm run ts:check

# Linting
npm run lint:check
npm run lint:fix

# Formatting
npm run format:check
npm run format:fix

# Build for production (outputs to docs/ directory)
npm run build

# Preview production build
npm run preview

# Run all checks and build
npm run all
```

## Architecture

### Core Geometry System

The application uses a layered CSG system built on three.js and three-bvh-csg:

**Body (`src/lib/3d/Body.ts`)**: Represents a single 3D primitive (cube or cylinder) with:

- Wraps a three-bvh-csg `Brush` object
- Supports transformations: `dX/dY/dZ` for translation, `rotateX/rotateY/rotateZ` for rotation
- Can be marked as negative (for subtraction operations via `setNegative()`)
- Static factory methods: `Body.fromCube()` and `Body.fromCylinder()`

**BodySet (`src/lib/3d/BodySet.ts`)**: Container for multiple Body objects with:

- `append()`: Adds bodies to the set without merging
- `merge()`: Combines all bodies using CSG operations (ADDITION for normal bodies, SUBTRACTION for negative bodies)
- Supports array generation for repeated patterns via `BodySet.array()`
- Transformations apply to all bodies in the set

### Coordinate System Transformations

**CRITICAL**: The application uses different coordinate systems internally vs for rendering/export:

- **Internal (Body/BodySet)**: Standard Three.js coordinates (X, Y, Z)
- **3D Display (App3DScene.svelte:26-28)**: Y and Z are swapped for camera positioning
- **STL Export (stl.ts:16-17)**: Y and Z coordinates are swapped, and Z is negated

When debugging position/rotation issues, always verify which coordinate system you're working in.

### Component/Project System

Projects are defined in the `projects/` directory and registered via the component store:

1. Create a new folder under `projects/` (e.g., `projects/myproject/`)
2. Define geometry functions that return `BodySet` objects
3. Register components using `addToComponentStore()` with a name and `receiveData` function
4. Export from `projects/index.ts`

**Example:**

```typescript
// projects/myproject/mypart.ts
import { Body } from '$lib/3d/Body';
import { BodySet } from '$lib/3d/BodySet';
import { addToComponentStore } from '$stores/componentStore';

export const myPart = (): BodySet => {
	const base = Body.fromCube(10, 10, 2, 'blue');
	const hole = Body.fromCylinder(2, 3, 'red').setNegative(true);

	return new BodySet(base, hole);
};

addToComponentStore({
	name: 'My Part',
	receiveData: () => myPart()
});
```

The component store (`src/stores/componentStore.ts`) manages available models that appear in the UI dropdown.

### STL Export

Binary STL generation (`src/lib/3d/stl.ts`):

- Takes Float32Array vertices from merged geometry
- Uses low-level binary writers from `src/lib/buffer.ts` (writeInt16LE, writeInt32LE, writeFloatLE)
- Coordinate system transformation: Y and Z axes are swapped, Z is negated
- Outputs standard binary STL format (80-byte header + triangle count + 50 bytes per triangle)
- Download handled by `src/lib/download.ts` using Blob URLs with dynamic filename based on model name

### UI Components

**App.svelte**: Main component that:

- Orchestrates the navigation, 3D scene, and download functionality
- Manages the selected BodySet and model name
- Triggers STL generation and download with proper filename (`{modelName}.stl`)

**AppNavigation.svelte**: Navigation bar with:

- Model selector dropdown (populated from component store)
- Wireframe toggle
- Download button
- Performance metrics (generation time, triangle count)
- URL hash-based model selection for deep linking
- Uses Svelte 5 callback props (`onselect`, `ondownload`) instead of deprecated event dispatcher

**App3DScene.svelte**: 3D rendering using @threlte/core:

- Renders each Body as a separate mesh
- Coordinate transformation for display (Y/Z swap)
- Supports wireframe mode
- Handles negative bodies with transparency (opacity 0.25)

## Path Aliases

The project uses TypeScript path aliases configured in both `tsconfig.json` and `vite.config.ts`:

- `$components/*` → `./src/components/*`
- `$lib/*` → `./src/lib/*`
- `$stores/*` → `./src/stores/*`
- `$types/*` → `./src/types/*`
- `$projects` → `./projects`

## Build Configuration

- **Output directory**: `docs/` (configured for GitHub Pages deployment)
- **Base path**: `/pcb-tht-holder` (in production)
- **Build target**: `esnext` (in vite.config.ts)

## Known Issues

- **Body.ts:27-32**: The `fakeAddition()` method has unreachable code after the early return. The commented-out code performs a fake SUBTRACTION operation that is currently disabled.

## Technology Stack

- **Framework:** Svelte 5 (using modern callback props pattern, not event dispatchers)
- **Build tool:** Vite 7
- **3D library:** Three.js with @threlte/core wrapper
- **CSG operations:** three-bvh-csg
- **UI components:** Flowbite Svelte
- **Styling:** Tailwind CSS 4
