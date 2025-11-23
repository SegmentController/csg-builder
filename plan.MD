# CSG Builder - Improvement Plan

Analysis of potential improvements and missing features for the CSG Builder project.

## 🟡 MEDIUM PRIORITY (Quality of Life)

### 1. Missing Primitives

- **Rounded Box** (filleted edges - very common)
- **Text Extrusion** (3D text via Three.js TextGeometry)

### 2. Missing CSG Operations

- **MIRROR** - Reflect across planes
- **CHAMFER/FILLET** - Edge rounding (critical for manufacturing)
- **Circular Array** - Polar patterns (currently only XYZ grids)
- **OFFSET** - Grow/shrink with clearances

### 3. Import Capabilities (Currently None)

- Import STL/OBJ as components
- Import SVG paths for profile extrusion
- Boolean operations with imported meshes
