# CSG Builder - Improvement Plan

Analysis of potential improvements and missing features for the CSG Builder project.

## 🔴 HIGH PRIORITY (Production Blockers)

### 1. SHELL Operation - Critical for 3D Printing
Currently missing the ability to hollow out solids with wall thickness. This is essential for:
- Reducing print time and material costs
- Creating functional containers, enclosures, boxes
- Manufacturing realistic parts

### 2. Mesh Validation
No way to verify if geometry is:
- Manifold (watertight)
- Printable
- Free of self-intersections
- Has proper normals

Suggest adding: `isValid()`, `getSelfIntersections()`, `repair()`

### 3. Error Handling Architecture
Inconsistent error handling across primitives. Need:
- Custom error classes (`CSGError`, `ValidationError`, `GeometryError`)
- Better validation in `scale()`, `rotate()` (currently allows NaN, Infinity, zero)
- UI error boundaries

### 4. Additional Export Formats
Only supports binary STL. Industry needs:
- **3MF** (modern standard with color support)
- **OBJ** (with materials)
- **GLTF/GLB** (web standard)
- **ASCII STL** (for debugging)

### 5. Cache Memory Management
Current `cacheFunction.ts` has no eviction strategy - **memory leak risk**. Needs:
- LRU cache with size limits
- `clearCache()` method
- Cache statistics

## 🟡 MEDIUM PRIORITY (Quality of Life)

### 6. Missing Primitives
- **Torus** (rings, washers, O-rings)
- **Rounded Box** (filleted edges - very common)
- **Capsule** (cylinder with hemispherical ends)
- **Text Extrusion** (3D text via Three.js TextGeometry)

### 7. Missing CSG Operations
- **MIRROR** - Reflect across planes
- **CHAMFER/FILLET** - Edge rounding (critical for manufacturing)
- **Circular Array** - Polar patterns (currently only XYZ grids)
- **OFFSET** - Grow/shrink with clearances

### 8. Import Capabilities (Currently None)
- Import STL/OBJ as components
- Import SVG paths for profile extrusion
- Boolean operations with imported meshes

### 9. Enhanced UI Features
- Parameter sliders for live adjustment
- Measurement tools (distance, angle)
- Section views (cut-away visualization)
- Multiple viewports (top/front/side/perspective)
- Layer-by-layer preview for printing

### 10. Performance Optimization
- Web workers for CSG operations (prevent UI blocking)
- Progress callbacks for long operations
- Geometry simplification/decimation options
- Cancellation support

## 🟢 LOW PRIORITY (Nice to Have)

### 11. Advanced Manufacturing Features
- Thread generation (ISO metric, ACME)
- Gear generation (spur, helical, bevel)
- Knurling patterns
- Draft angles for injection molding

### 12. Parametric Constraints
- Constraint system (edges parallel, distances fixed)
- Dimension-driven design
- Design history with undo/redo

### 13. Generative Design
- Pattern generators (Voronoi, lattice, cellular)
- Noise-based displacement
- Fractal geometries

### 14. Developer Experience
- Visual regression testing
- Performance benchmarks
- Auto-generated API documentation
- VS Code extension for preview

## 📋 Architecture Improvements

### 15. Code Organization
`Solid.ts` is 1140 lines - should split into:
- `primitives.ts` - Shape factories
- `transforms.ts` - Transformations
- `csg-operations.ts` - Boolean ops
- `grids.ts` - Arrays
- `utilities.ts` - Bounds, validation

### 16. Missing Abstractions
- Plugin system for custom primitives
- `IPrimitive`, `ICSGOperation`, `IExporter` interfaces
- Event system for operation lifecycle

---

## 💡 Quick Wins

If you want to start with the **easiest high-impact improvements**:

1. **Add Torus primitive** (~50 lines, huge usability gain)
2. **Add MIRROR operation** (~30 lines, very common need)
3. **Add cache size limit** (~20 lines, prevents memory leaks)
4. **Add `isValid()` geometry check** (~40 lines, critical for 3D printing)
5. **Add rounded box primitive** (~60 lines, most requested shape)

## Detailed Analysis Summary

### Core Functionality Gaps

**Missing Primitives:**
- Torus (common for rings, washers, O-rings)
- Capsule/Pill (cylinder with hemispherical ends)
- Rounded Box (cube with filleted edges)
- Wedge (triangular prism - currently requires custom profile)
- Pyramid (square-based)
- Ellipsoid (stretched sphere)
- Text/Font Extrusion (3D text generation)

**Missing CSG Operations:**
- SHELL - Hollow out with wall thickness
- OFFSET - Grow/shrink uniformly
- CHAMFER/FILLET - Edge rounding
- MIRROR - Reflect across planes
- Circular/polar arrays (currently only XYZ grids)

**Missing Transformation Features:**
- Matrix transformations (direct 4x4 matrix)
- Pivot point control (rotate/scale around custom points)
- Snap to grid
- Mirroring/reflection helpers

### API Improvements

**Validation Issues:**
- `scale()` allows negative, zero, NaN, Infinity
- No validation in many transformation methods
- Missing input sanitization

**Missing Convenience Methods:**

Alignment & Positioning:
- `alignTo(otherSolid, direction)` - Align relative to another solid
- `distributeEvenly(solids[], axis, spacing)` - Space solids evenly
- `centerBetween(solid1, solid2)` - Position between two solids
- `snapToGrid(gridSize)` - Quantize position

Measurement & Inspection:
- `getVolume()` - Calculate solid volume
- `getSurfaceArea()` - Calculate surface area
- `getEdges()` - Extract edge information
- `isValid()` - Check if manifold/printable
- `hasIntersections(other)` - Collision detection

Material/Appearance:
- `setMaterial(properties)` - Extended material properties
- `setOpacity(value)` - Transparency control
- `setTexture(image)` - Texture mapping

### Developer Experience

**Missing Testing:**
- Integration tests for complex CSG operations
- Visual regression testing
- Performance benchmarks
- Test coverage reporting

**Documentation Gaps:**
- Auto-generated API reference
- Video tutorials
- Cookbook of common patterns (gears, threads, hinges)
- Performance tuning guide
- Troubleshooting guide
- Migration guides and changelog

**Developer Tooling:**
- VS Code extension for preview
- Debugger for CSG operations
- Profiler for slow operations
- Linter rules for best practices
- Code snippets/templates
- Hot reload preserving camera position

### Performance

**Cache Issues (cacheFunction.ts):**
- JSON.stringify is expensive
- No cache eviction (memory leak risk)
- No size limits
- No metrics (hit rate, size)

**Recommendations:**
- LRU cache eviction policy
- Cache statistics
- Faster hashing (xxhash, murmurhash)
- `clearCache()` and `getCacheStats()`
- Memory monitoring

**CSG Performance:**
- No progressive rendering
- No web worker support
- No geometry simplification
- No LOD (Level of Detail) system

### Production Readiness

**Error Handling:**
- Inconsistent validation
- No error recovery
- No custom error types
- No warning system
- Generic error messages

**Export Formats:**
Currently: Binary STL only

Missing:
- ASCII STL (debugging)
- OBJ (with colors/materials)
- GLTF/GLB (industry standard)
- 3MF (modern 3D printing with color)
- STEP/IGES (CAD interoperability)
- SVG slices (2D cross-sections)

**Import Capabilities:**
Missing entirely:
- Import STL/OBJ files as components
- Import 2D SVG paths for extrusion
- Import heightmaps for terrain
- Boolean operations with imported meshes

### Advanced Features

**Parametric Design:**
Partially supported via parameters, but missing:
- Constraints system
- Dimension-driven design
- Equation-based geometry
- Design variables with ranges/sliders
- Design history/undo-redo

**Generative Design:**
- Pattern generators (Voronoi, cellular, lattice)
- Fractal geometries
- L-systems for organic structures
- Noise-based displacement
- Procedural textures

**Advanced Manufacturing:**
- Thread generation (ISO metric, ACME, etc.)
- Gear generation (spur, helical, bevel)
- Spring generation with proper pitch
- Knurling patterns (diamond, straight)
- Draft angles for injection molding
- Support structure generation for 3D printing

**UI Enhancements:**
Current UI is minimal - opportunities:
- Parameter sliders for live adjustment
- Layer-by-layer preview (slicing)
- Measurement tools
- Section views (cut-away)
- Exploded views
- Assembly constraints
- Animation timeline
- Multiple viewport layouts
- Orthographic vs perspective toggle
- Grid overlay with snapping

**Collaboration Features:**
- Share designs via URL (serialize component)
- Export TypeScript from UI-built models
- Version control integration
- Multi-user editing (real-time)
- Component library marketplace
- Cloud rendering for complex models

### Technical Debt

**Code Quality:**
- Solid.ts is 1140 lines (too large)
- Mixing concerns (geometry, transforms, CSG, utilities)
- No interfaces/abstractions for extensibility

**Missing Abstractions:**
- No plugin system
- No middleware pattern
- No event system
- No dependency injection

**Type Safety:**
- Component store uses `any` in places
- No strict null checks in some areas
- Missing generic constraints

---

## Implementation Priority

### Phase 1: Critical Production Needs
1. SHELL operation
2. Mesh validation (`isValid()`)
3. Error handling architecture
4. 3MF/OBJ export
5. Cache eviction strategy

### Phase 2: Quality of Life
1. Torus, rounded box, capsule primitives
2. MIRROR, CHAMFER operations
3. Import capabilities
4. UI parameter controls
5. Web worker support

### Phase 3: Advanced Features
1. Generative patterns
2. Thread/gear generators
3. Animation timeline
4. Collaboration features
5. VS Code extension

---

*Analysis completed: 2025-11-22*
*Based on codebase analysis of CSG Builder v1.x*
