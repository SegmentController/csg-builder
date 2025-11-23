# Changelog

All notable changes to this project will be documented in this file.

## [2025-11-23]

### Features

#### Import Capabilities

- **STL File Import**: Load external STL files (binary and ASCII formats) as Solid components
  - New `Solid.fromSTL()` method for importing 3D models
  - Automatic normalization for seamless CSG operations
  - Full support for transforms, boolean operations, and grid arrays
  - Uses Three.js STLLoader (no additional dependencies)

- **SVG Path Import**: Import SVG paths and extrude them into 3D profiles
  - New `Solid.profilePrismFromSVG()` method for extruding SVG paths
  - Supports all standard SVG path commands (M/m, L/l, H/h, V/v, C/c, Q/q, A/a, Z/z)
  - Automatic Y-axis coordinate conversion (SVG Y-down → 3D Y-up)
  - Perfect for logos, custom profiles, and 2D designs
  - Uses Three.js SVGLoader (no additional dependencies)

- **Combined Import Operations**: Imported geometries work seamlessly with CSG operations
  - STL + primitives boolean operations
  - SVG + STL combinations
  - Grid arrays from imported geometries

#### New Examples

- Added comprehensive tutorial `N-importing.ts` with 14 example components
  - STL import basics, transformations, and boolean operations
  - SVG shapes: rectangles, stars, curves, hearts
  - Advanced combinations: parametric imports, STL+SVG mixing, grid patterns
- Added sample STL asset (`projects/examples/assets/sample.stl`) for testing

### Improvements

#### Code Architecture

- Extracted path segment types to dedicated module (`src/lib/3d/path-factories.ts`)
  - `StraightSegment` and `CurveSegment` types now in separate file
  - `straight()` and `curve()` factory functions modularized
  - Better code organization and reusability

#### Input Validation

- Enhanced validation across all primitive creation methods
  - Comprehensive validation for cube, cylinder, sphere, cone, and prism
  - Transform method validation (scale, rotate, move, at)
  - Better error handling for edge cases
  - NaN and Infinity detection with clear error messages
  - Zero and negative dimension validation

### Testing

- Added comprehensive validation test suite (`tests/unit/lib/3d/Solid.validation.test.ts`)
  - 380 lines of test coverage
  - Primitive validation tests for all geometry types
  - Transform validation tests (scale, rotate, move, at)
  - Edge case coverage: very small values, very large values, NaN, Infinity
  - Zero dimensions and negative value handling tests

### Documentation

- Updated `CLAUDE.md` with complete import capabilities documentation
  - STL import usage and examples
  - SVG path import usage and supported commands
  - Boolean operations with imported geometries
- Updated `README.md` with import feature overview
- Added extensive inline comments in example files

### Internal

- Added project planning document (`plan.MD`)
- Merged fixes from main branch (wedge positions)
