# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSG Builder is a web-based 3D STL file generator for THT (Through-Hole Technology) PCB component holders. The application uses Constructive Solid Geometry (CSG) operations via three-bvh-csg to create 3D models that can be exported as binary STL files for 3D printing.

**Live site:** https://segmentcontroller.github.io/pcb-tht-holder/

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
- Can be marked as negative (for subtraction operations)
- Static factory methods: `Body.fromCube()` and `Body.fromCylinder()`

**BodySet (`src/lib/3d/BodySet.ts`)**: Container for multiple Body objects with:

- `append()`: Adds bodies to the set without merging
- `merge()`: Combines all bodies using CSG operations (ADDITION for normal bodies, SUBTRACTION for negative bodies)
- Supports array generation for repeated patterns
- Transformations apply to all bodies in the set

### Component/Project System

Projects are defined in the `projects/` directory and registered via the component store:

1. Create a new folder under `projects/` (e.g., `projects/myproject/`)
2. Define geometry functions that return `BodySet` objects
3. Register components using `addToComponentStore()` with a name and `receiveData` function
4. Export from `projects/index.ts`

The component store (`src/stores/componentStore.ts`) manages available models that appear in the UI dropdown.

### STL Export

Binary STL generation (`src/lib/3d/stl.ts`):

- Takes Float32Array vertices from merged geometry
- Coordinate system transformation: Y and Z axes are swapped during export
- Outputs standard binary STL format (80-byte header + triangle count + 50 bytes per triangle)

### UI Components

**App.svelte**: Main component that:

- Orchestrates the navigation, 3D scene, and download functionality
- Manages the selected BodySet
- Triggers STL generation and download

**AppNavigation.svelte**: Navigation bar with:

- Model selector dropdown (populated from component store)
- Wireframe toggle
- Download button
- Performance metrics (generation time, triangle count)
- URL hash-based model selection for deep linking

**App3DScene.svelte**: 3D rendering using @threlte/core:

- Renders each Body as a separate mesh
- Coordinate transformation for display (Y/Z swap)
- Supports wireframe mode
- Handles negative bodies with transparency

## Path Aliases

The project uses TypeScript path aliases configured in both `tsconfig.json` and `vite.config.ts`:

- `$components/*` → `./src/components/*`
- `$lib/*` → `./src/lib/*`
- `$stores/*` → `./src/stores/*`
- `$types/*` → `./src/types/*`
- `$projects` → `./projects`

## Build Output

Production builds output to `docs/` directory (configured for GitHub Pages deployment) with base path `/pcb-tht-holder`.

## Technology Stack

- **Framework:** Svelte 5
- **Build tool:** Vite
- **3D library:** Three.js with @threlte/core wrapper
- **CSG operations:** three-bvh-csg
- **UI components:** Flowbite Svelte
- **Styling:** Tailwind CSS 4
