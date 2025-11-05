import { curve, Solid, straight } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore.svelte';

/**
 * Chess Pawn - Simple example using point array
 * Perfect for beginners, just define the side profile as coordinate pairs
 */
export const chessPawn = (): Solid => {
	return Solid.revolutionSolidFromPoints(
		[
			[0, 0], // Bottom center
			[3, 0], // Bottom edge
			[3, 1], // Base height
			[2, 2], // Narrow stem bottom
			[2, 4], // Stem height
			[4, 8], // Body width
			[3, 10], // Body top
			[2, 10.5], // Neck start
			[2, 11.5], // Neck
			[3, 13], // Head
			[2.5, 14], // Head top
			[0, 14] // Top center (close to axis)
		],
		{ color: 'white' }
	);
};

/**
 * Chess Rook - Path-based with sharp corners
 * Uses zero-radius curves for crisp edges, perfect for architectural shapes
 */
export const chessRook = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(4), // Base radius
			curve(0, 90), // Sharp corner up
			straight(10), // Tower height
			curve(0, -90), // Sharp corner outward
			straight(1), // Battlement platform
			curve(0, 90), // Up to battlement
			straight(1.5), // Battlement wall height
			curve(0, 90), // Turn back
			straight(0.5), // Battlement width
			curve(0, -90), // Down into gap
			straight(1.5), // Gap depth
			curve(0, -90), // Back out
			straight(0.5), // Next battlement
			curve(0, 90), // Up
			straight(1.5), // Wall height
			curve(0, 180), // Turn all the way back
			straight(1.5), // Down
			curve(0, 90), // Corner
			straight(1) // To center
		],
		{ color: 'black' }
	);
};

/**
 * Decorative Vase - Smooth curves for organic shapes
 * Shows how to create flowing, elegant forms with curved segments
 */
export const decorativeVase = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(4), // Base radius
			curve(1, 45), // Gentle curve up
			straight(3), // Narrow section
			curve(2, -45), // Curve outward
			straight(4), // Body height
			curve(3, 45), // Curve inward for neck
			straight(3), // Neck height
			curve(1, -45), // Flare out at rim
			straight(1.5), // Rim width
			curve(0.5, 90), // Smooth top edge
			straight(0.5) // To opening
		],
		{ color: 'blue' }
	);
};

/**
 * Modern Bottle - Mix of straight and curved segments
 * Demonstrates combining different segment types for varied designs
 */
export const modernBottle = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(5), // Base radius
			curve(2, 90), // Rounded bottom corner
			straight(8), // Body height
			curve(2, 90), // Shoulder curve inward
			straight(2), // Narrow to neck
			curve(0, 90), // Sharp corner to neck
			straight(5), // Neck height
			curve(1, -90), // Flare to lip
			straight(0.5), // Lip width
			curve(0.5, 90), // Round top
			straight(0.3) // Opening
		],
		{ color: 'green' }
	);
};

/**
 * Simple Goblet - Using Shape API directly
 * Most flexible method, useful when you need Three.js Shape features
 */
export const simpleGoblet = (): Solid => {
	return Solid.revolutionSolid(
		(shape) => {
			shape.moveTo(0, 0); // Bottom center (stem)
			shape.lineTo(1, 0); // Thin stem base
			shape.lineTo(1, 5); // Stem height
			shape.lineTo(2, 6); // Widen to bowl
			shape.quadraticCurveTo(5, 7, 6, 10); // Curved bowl bottom
			shape.lineTo(6, 12); // Bowl sides
			shape.lineTo(5, 13); // Taper to rim
			shape.lineTo(0, 13); // Back to center
		},
		{ color: 'gold' }
	);
};

/**
 * Chess Bishop - Complex profile with curves
 * Shows creating detailed shapes with mixed straight and curved sections
 */
export const chessBishop = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(3.5), // Base radius
			curve(0.5, 90), // Rounded base
			straight(2), // Base height
			curve(1, 90), // Curve inward
			straight(1.5), // Narrow section
			curve(0, 90), // Sharp turn
			straight(6), // Body height
			curve(2, 45), // Curve to neck
			straight(1), // Neck
			curve(1.5, -45), // Flare to head
			straight(2), // Head height
			curve(1, 45), // Top of head
			straight(0.5) // Crown
		],
		{ color: 'white' }
	);
};

/**
 * Partial Revolution - 90 degree slice
 * Demonstrates creating cut-away views or quarter sections
 */
export const quarterVase = (): Solid => {
	return Solid.revolutionSolidFromPoints(
		[
			[0, 0],
			[4, 0],
			[3, 2],
			[5, 6],
			[4, 10],
			[5, 12],
			[0, 12]
		],
		{ angle: Solid.DEG_90, color: 'purple' }
	);
};

/**
 * Half Revolution - 180 degree
 * Useful for showing internal structure or creating symmetric halves
 */
export const halfBottle = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(5),
			curve(2, 90),
			straight(10),
			curve(3, 90),
			straight(3),
			curve(0, 90),
			straight(6),
			curve(1, -90),
			straight(1)
		],
		{ angle: Solid.DEG_180, color: 'cyan' }
	);
};

/**
 * Spinning Top - Fun toy example
 * Shows how to create playful shapes with revolution solids
 */
export const spinningTop = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(0.5), // Sharp point
			curve(0, 90),
			straight(4), // Cone height
			curve(2, 90), // Rounded transition
			straight(1), // Body
			curve(1, 90), // Top curve
			straight(1.5), // Handle width
			curve(0.5, 90), // Round handle
			straight(0.5) // Handle top
		],
		{ color: 'red' }
	);
};

/**
 * Wine Glass - Elegant stemware
 * Classic example of revolution solid applications
 */
export const wineGlass = (): Solid => {
	return Solid.revolutionSolidFromPath(
		[
			straight(2.5), // Base radius
			curve(0.5, 90), // Base edge
			straight(0.5), // Base height
			curve(0, 90), // Sharp to stem
			straight(0.5), // Thin stem
			curve(0, 90), // To bowl
			straight(8), // Stem height
			curve(0, -90), // Widen to bowl
			straight(1), // Bowl start
			curve(0, -30), // Gentle outward curve
			straight(6), // Bowl height
			curve(1, 30), // Curve back in at top
			straight(0.5) // Rim
		],
		{ color: 'transparent' }
	);
};

// Export all components for the UI
export const components: ComponentsMap = {
	'Chess Pawn': chessPawn,
	'Chess Rook': chessRook,
	'Chess Bishop': chessBishop,
	'Decorative Vase': decorativeVase,
	'Modern Bottle': modernBottle,
	'Simple Goblet': simpleGoblet,
	'Quarter Vase': quarterVase,
	'Half Bottle': halfBottle,
	'Spinning Top': spinningTop,
	'Wine Glass': wineGlass
};
