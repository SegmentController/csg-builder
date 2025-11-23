/**
 * Examples Project - Component Registry
 *
 * This file demonstrates the component registration pattern used in CSG Builder.
 * Examples are organized alphabetically (A → M) in a progressive learning sequence:
 *
 * FOUNDATIONAL (A-G):
 * A. Basic Primitives (Foundation)
 * B. CSG Operations (Boolean operations: union, subtract, intersect)
 * C. Alignment & Positioning (Centering, edge alignment, transforms)
 * D. Partial Geometries (Angle parameters for circular shapes)
 * E. Complex Composition (Multi-component patterns, grids, negative solids)
 * F. Custom Profile Prisms (2D profiles extruded to 3D)
 * G. Revolution Solids (Rotational symmetry: chess pieces, vases)
 *
 * ADVANCED (H-X):
 * H. Scaling Fundamentals (Uniform, axis-specific, cumulative scaling)
 * I. Complex Transform Chains (Order of operations, positioning patterns)
 * J. 3D Grid Patterns (GRID_XYZ, spacing, volumetric arrays)
 * K. Advanced 3D Spatial Arrangements (Programmatic generation, getBounds)
 * L. Performance & Caching (cacheFunction, optimization patterns)
 * M. Complex Multi-Concept Composition (Production-ready complete structures)
 * N. Import Capabilities (STL files, SVG paths, boolean operations with imports)
 * O. Circular Arrays (Polar patterns: gears, bolt holes, spokes, decorative)
 * P. Mirror Operations (Reflection and symmetry across axis planes)
 *
 * All components are registered via addToComponentStore() and become available in the UI dropdown.
 */

import { addToComponentStore } from '$stores/componentStore';

import { components as solidsComponents } from './A.solids';
import { components as operationsComponents } from './B.operations';
import { components as alignmentComponents } from './C.alignment';
import { components as partialsComponents } from './D.partials';
import { components as wallAndWindowComponents } from './E.wallAndWindow';
import { components as shapesComponents } from './F.shapes';
import { components as revolutionComponents } from './G.revolution';
import { components as scalingComponents } from './H.scaling';
import { components as transformsComponents } from './I.transforms';
import { components as grid3dComponents } from './J.grid3d';
import { components as patterns3dComponents } from './K.patterns3d';
import { components as optimizationComponents } from './L.optimization';
import { components as compositionComponents } from './M.composition';
import { components as importingComponents } from './N-importing';
import { components as circularArraysComponents } from './O.circularArrays';
import { components as mirrorComponents } from './P.mirror';

// Register all example components in the global component store
// The spread operator merges all component maps into a single object
addToComponentStore({
	...solidsComponents,
	...operationsComponents,
	...alignmentComponents,
	...partialsComponents,
	...wallAndWindowComponents,
	...shapesComponents,
	...revolutionComponents,
	...scalingComponents,
	...transformsComponents,
	...grid3dComponents,
	...patterns3dComponents,
	...optimizationComponents,
	...compositionComponents,
	...importingComponents,
	...circularArraysComponents,
	...mirrorComponents
});
