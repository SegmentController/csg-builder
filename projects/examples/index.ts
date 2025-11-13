/**
 * Examples Project - Component Registry
 *
 * This file demonstrates the component registration pattern used in CSG Builder.
 * Examples are organized alphabetically (A → G) in a progressive learning sequence:
 *
 * A. Basic Primitives (Foundation)
 * B. CSG Operations (Boolean operations: union, subtract, intersect)
 * C. Alignment & Positioning (Centering, edge alignment, transforms)
 * D. Partial Geometries (Angle parameters for circular shapes)
 * E. Complex Composition (Multi-component patterns, grids, negative solids)
 * F. Custom Profile Prisms (2D profiles extruded to 3D)
 * G. Revolution Solids (Rotational symmetry: chess pieces, vases)
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

// Register all example components in the global component store
// The spread operator merges all component maps into a single object
addToComponentStore({
	...solidsComponents,
	...operationsComponents,
	...alignmentComponents,
	...partialsComponents,
	...wallAndWindowComponents,
	...shapesComponents,
	...revolutionComponents
});
