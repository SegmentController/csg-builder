/* eslint-disable unicorn/no-array-reduce */
import {
	Box3,
	BoxGeometry,
	BufferGeometry,
	ConeGeometry,
	CylinderGeometry,
	ExtrudeGeometry,
	LatheGeometry,
	Shape,
	SphereGeometry,
	Vector3
} from 'three';
import { ADDITION, Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg';

import { MathMinMax, MathRoundTo2 } from '$lib/Math';

// Path segment type definitions
export type StraightSegment = {
	type: 'straight';
	length: number;
};

export type CurveSegment = {
	type: 'curve';
	radius: number;
	angle: number; // degrees, positive = right turn, negative = left turn
};

export type PathSegment = StraightSegment | CurveSegment;

// Factory functions for path segments
export const straight = (length: number): StraightSegment => ({
	type: 'straight',
	length
});

export const curve = (radius: number, angle: number): CurveSegment => ({
	type: 'curve',
	radius,
	angle
});

export class Solid {
	private static evaluator: Evaluator = new Evaluator();

	// Helper to convert degrees to radians
	private static degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

	/**
	 * Generates points for a wedge-shaped profile to be used for CSG cutting operations.
	 * Creates a pie-slice that represents the section to REMOVE from a full 360° geometry.
	 *
	 * @param radius - Outer radius of the wedge (should be larger than target geometry)
	 * @param angle - Angular extent of the section to KEEP in degrees
	 * @returns Array of [x, y] coordinate pairs forming a closed wedge profile
	 */
	private static generateWedgePoints(radius: number, angle: number): [number, number][] {
		// Make wedge larger than geometry to ensure complete cutting
		const cutRadius = radius * 2;

		// Calculate the angular section to REMOVE (inverse of what we want to keep)
		const removeAngle = 360 - angle;

		// If angle is 360 or more, no cutting needed - return empty
		if (removeAngle <= 0) return [];

		// Start removing from the end of the kept section (so kept section starts at 0°)
		const startRad = this.degreesToRadians(angle);
		const endRad = this.degreesToRadians(360); // Complete the circle

		// Calculate arc points (more points for smoother cuts on large angles)
		const arcSegments = Math.max(8, Math.ceil(removeAngle / 15)); // 1 segment per 15°
		const points: [number, number][] = [[0, 0]]; // Start at origin (center)

		// Create arc from start to end angle
		for (let index = 0; index <= arcSegments; index++) {
			const t = index / arcSegments;
			const currentAngle = startRad + (endRad - startRad) * t;
			const x = Math.cos(currentAngle) * cutRadius;
			const y = Math.sin(currentAngle) * cutRadius;
			points[points.length] = [x, y];
		}

		// Close back to origin (creates pie-slice shape)
		points[points.length] = [0, 0];

		return points;
	}

	public brush: Brush;
	private _color: string;
	private _isNegative: boolean;

	constructor(brush: Brush, color: string, isNegative: boolean = false) {
		this.brush = brush;
		this._color = color;
		this._isNegative = isNegative;
		this.brush.updateMatrixWorld();
	}

	public get color(): string {
		return this._color;
	}

	public get isNegative(): boolean {
		return this._isNegative;
	}

	public clone = (): Solid => new Solid(this.brush.clone(true), this._color, this._isNegative);

	private static geometryToBrush(
		geometry:
			| BoxGeometry
			| CylinderGeometry
			| SphereGeometry
			| ConeGeometry
			| ExtrudeGeometry
			| LatheGeometry
			| BufferGeometry
	): Brush {
		const result = new Brush(geometry.translate(0, 0, 0));
		result.updateMatrixWorld();
		return result;
	}

	static cube = (
		width: number,
		height: number,
		depth: number,
		options?: { color?: string }
	): Solid => {
		// Validate dimensions
		if (width <= 0 || height <= 0 || depth <= 0)
			throw new Error(
				`Cube dimensions must be positive (got width: ${width}, height: ${height}, depth: ${depth})`
			);
		if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth))
			throw new Error(
				`Cube dimensions must be finite (got width: ${width}, height: ${height}, depth: ${depth})`
			);

		const color = options?.color ?? 'gray';
		return new Solid(
			this.geometryToBrush(new BoxGeometry(width, height, depth)),
			color
		).normalize();
	};

	static cylinder = (
		radius: number,
		height: number,
		options?: {
			color?: string;
			angle?: number;
			topRadius?: number;
		}
	): Solid => {
		// Validate dimensions
		if (radius <= 0 || height <= 0)
			throw new Error(
				`Cylinder dimensions must be positive (got radius: ${radius}, height: ${height})`
			);
		if (!Number.isFinite(radius) || !Number.isFinite(height))
			throw new Error(
				`Cylinder dimensions must be finite (got radius: ${radius}, height: ${height})`
			);
		if (options?.topRadius !== undefined) {
			if (options.topRadius < 0)
				throw new Error(`Cylinder topRadius must be non-negative (got ${options.topRadius})`);
			if (!Number.isFinite(options.topRadius))
				throw new Error(`Cylinder topRadius must be finite (got ${options.topRadius})`);
		}

		const color = options?.color ?? 'gray';
		const angle = options?.angle ?? 360;

		// Create full 360° cylinder
		const fullCylinder = new Solid(
			this.geometryToBrush(
				new CylinderGeometry(
					options?.topRadius ?? radius,
					radius,
					height,
					MathMinMax(radius * 8, 16, 48),
					1,
					false // openEnded
				)
			),
			color
		).normalize();

		// If full circle, return as-is (optimization)
		if (angle >= 360) return fullCylinder;

		// Create wedge cutter for the section to remove
		const wedgePoints = this.generateWedgePoints(radius, angle);
		if (wedgePoints.length === 0) return fullCylinder;

		// Create wedge prism (make it taller to ensure complete cut)
		const wedgeCutter = this.profilePrismFromPoints(height * 1.5, wedgePoints, { color }).move({
			y: height * 0.75
		}); // Center wedge on Y-axis

		// Subtract wedge from cylinder to create closed partial geometry
		return Solid.SUBTRACT(fullCylinder, wedgeCutter);
	};

	static sphere = (
		radius: number,
		options?: {
			color?: string;
			angle?: number;
			segments?: number;
		}
	): Solid => {
		// Validate dimensions
		if (radius <= 0) throw new Error(`Sphere radius must be positive (got ${radius})`);
		if (!Number.isFinite(radius)) throw new Error(`Sphere radius must be finite (got ${radius})`);

		const color = options?.color ?? 'gray';
		const angle = options?.angle ?? 360;

		// Create full 360° sphere
		const fullSphere = new Solid(
			this.geometryToBrush(
				new SphereGeometry(
					radius,
					options?.segments ?? MathMinMax(radius * 8, 16, 48),
					options?.segments ?? MathMinMax(radius * 8, 16, 48)
				)
			),
			color
		).normalize();

		// If full circle, return as-is (optimization)
		if (angle >= 360) return fullSphere;

		// Create wedge cutter for the section to remove
		const wedgePoints = this.generateWedgePoints(radius, angle);
		if (wedgePoints.length === 0) return fullSphere;

		// Create wedge prism tall enough to cut through entire sphere diameter
		const wedgeCutter = this.profilePrismFromPoints(radius * 4, wedgePoints, { color }).move({
			y: radius * 2
		}); // Center wedge on Y-axis

		// Subtract wedge from sphere to create closed partial geometry
		return Solid.SUBTRACT(fullSphere, wedgeCutter);
	};

	static cone = (
		radius: number,
		height: number,
		options?: {
			color?: string;
			angle?: number;
			segments?: number;
		}
	): Solid => {
		// Validate dimensions
		if (radius <= 0 || height <= 0)
			throw new Error(
				`Cone dimensions must be positive (got radius: ${radius}, height: ${height})`
			);
		if (!Number.isFinite(radius) || !Number.isFinite(height))
			throw new Error(`Cone dimensions must be finite (got radius: ${radius}, height: ${height})`);

		const color = options?.color ?? 'gray';
		const angle = options?.angle ?? 360;

		// Create full 360° cone
		const fullCone = new Solid(
			this.geometryToBrush(
				new ConeGeometry(
					radius,
					height,
					options?.segments ?? MathMinMax(radius * 8, 16, 48),
					1, // heightSegments
					false // openEnded
				)
			),
			color
		).normalize();

		// If full circle, return as-is (optimization)
		if (angle >= 360) return fullCone;

		// Create wedge cutter for the section to remove
		const wedgePoints = this.generateWedgePoints(radius, angle);
		if (wedgePoints.length === 0) return fullCone;

		// Create wedge prism (make it taller to ensure complete cut)
		const wedgeCutter = this.profilePrismFromPoints(height * 1.5, wedgePoints, { color }).move({
			y: height * 0.75
		}); // Center wedge on Y-axis

		// Subtract wedge from cone to create closed partial geometry
		return Solid.SUBTRACT(fullCone, wedgeCutter);
	};

	static prism = (
		sides: number,
		radius: number,
		height: number,
		options?: {
			color?: string;
			angle?: number;
			topRadius?: number;
		}
	): Solid => {
		// Validate dimensions
		if (sides < 3) throw new Error(`Prism must have at least 3 sides (got ${sides})`);
		if (!Number.isInteger(sides)) throw new Error(`Prism sides must be an integer (got ${sides})`);
		if (radius <= 0 || height <= 0)
			throw new Error(
				`Prism dimensions must be positive (got radius: ${radius}, height: ${height})`
			);
		if (!Number.isFinite(radius) || !Number.isFinite(height))
			throw new Error(`Prism dimensions must be finite (got radius: ${radius}, height: ${height})`);
		if (options?.topRadius !== undefined) {
			if (options.topRadius < 0)
				throw new Error(`Prism topRadius must be non-negative (got ${options.topRadius})`);
			if (!Number.isFinite(options.topRadius))
				throw new Error(`Prism topRadius must be finite (got ${options.topRadius})`);
		}

		const color = options?.color ?? 'gray';
		const angle = options?.angle ?? 360;

		// Create full 360° prism
		const fullPrism = new Solid(
			this.geometryToBrush(
				new CylinderGeometry(
					options?.topRadius ?? radius,
					radius,
					height,
					sides,
					1, // heightSegments
					false // openEnded
				)
			),
			color
		).normalize();

		// If full circle, return as-is (optimization)
		if (angle >= 360) return fullPrism;

		// Create wedge cutter for the section to remove
		const wedgePoints = this.generateWedgePoints(radius, angle);
		if (wedgePoints.length === 0) return fullPrism;

		// Create wedge prism (make it taller to ensure complete cut)
		const wedgeCutter = this.profilePrismFromPoints(height * 1.5, wedgePoints, { color }).move({
			y: height * 0.75
		}); // Center wedge on Y-axis

		// Subtract wedge from prism to create closed partial geometry
		return Solid.SUBTRACT(fullPrism, wedgeCutter);
	};

	static trianglePrism = (
		radius: number,
		height: number,
		options?: {
			color?: string;
		}
	): Solid => this.prism(3, radius, height, options);

	/**
	 * Creates a custom profile prism by extruding a 2D shape along the Z-axis.
	 * Provides flexible Shape API for defining complex profiles with curves, arcs, etc.
	 *
	 * @param height - Extrusion height (depth along Z-axis)
	 * @param profileBuilder - Function that receives a Shape instance to define the 2D profile
	 * @param color - Material color (default: 'gray')
	 * @returns Solid with extruded geometry
	 *
	 * @example
	 * // L-bracket
	 * const bracket = Solid.profilePrism(10, (shape) => {
	 *   shape.moveTo(0, 0);
	 *   shape.lineTo(20, 0);
	 *   shape.lineTo(20, 5);
	 *   shape.lineTo(5, 5);
	 *   shape.lineTo(5, 20);
	 *   shape.lineTo(0, 20);
	 *   shape.lineTo(0, 0);
	 * }, 'blue');
	 */
	static profilePrism = (
		height: number,
		profileBuilder: (shape: Shape) => void,
		options?: { color?: string }
	): Solid => {
		const color = options?.color ?? 'gray';
		const shape = new Shape();
		profileBuilder(shape);

		const geometry = new ExtrudeGeometry(shape, {
			depth: height,
			bevelEnabled: false, // Critical for clean CSG operations
			curveSegments: 12,
			steps: 1
		});

		// Center geometry along extrusion axis before rotation
		geometry.translate(0, 0, -height / 2);

		// Rotate so extrusion direction (Z-axis) becomes height (Y-axis)
		return new Solid(this.geometryToBrush(geometry), color).normalize().rotate({ x: 90 });
	};

	/**
	 * Creates a custom profile prism from an array of 2D coordinate points.
	 * The path is automatically closed (last point connects back to first).
	 *
	 * @param height - Extrusion height (depth along Z-axis)
	 * @param points - Array of [x, y] coordinate pairs defining the 2D profile
	 * @param color - Material color (default: 'gray')
	 * @returns Solid with extruded geometry
	 *
	 * @example
	 * // Trapezoid
	 * const trapezoid = Solid.profilePrismFromPoints(
	 *   8,
	 *   [[0, 0], [10, 0], [8, 5], [2, 5]],
	 *   'red'
	 * ); // Automatically closes back to [0, 0]
	 */
	static profilePrismFromPoints = (
		height: number,
		points: [number, number][],
		options?: { color?: string }
	): Solid => {
		if (points.length < 3) {
			throw new Error('profilePrismFromPoints requires at least 3 points');
		}

		return this.profilePrism(
			height,
			(shape) => {
				// Start at first point
				const [startX, startY] = points[0];
				shape.moveTo(startX, startY);

				// Draw lines to remaining points
				for (let index = 1; index < points.length; index++) {
					const [x, y] = points[index];
					shape.lineTo(x, y);
				}

				// Auto-close: connect back to start
				shape.lineTo(startX, startY);
			},
			options
		);
	};

	/**
	 * Creates a custom profile prism from a path defined by straight and curved segments.
	 * Path starts at origin (0, 0) facing right (+X direction) and is automatically closed.
	 *
	 * @param height - Extrusion height (depth along Z-axis)
	 * @param segments - Array of path segments (straight or curve)
	 * @param color - Material color (default: 'gray')
	 * @returns Solid with extruded geometry
	 *
	 * @example
	 * import { Solid, straight, curve } from '$lib/3d/Solid';
	 *
	 * // Rounded rectangle
	 * const roundedRect = Solid.profilePrismFromPath(10, [
	 *   straight(20),
	 *   curve(5, 90),    // Right turn with radius 5
	 *   straight(10),
	 *   curve(5, 90),
	 *   straight(20),
	 *   curve(5, 90),
	 *   straight(10),
	 *   curve(5, 90),
	 * ], 'blue');
	 *
	 * @example
	 * // S-curve path
	 * const sCurve = Solid.profilePrismFromPath(8, [
	 *   straight(10),
	 *   curve(5, 90),     // Right turn
	 *   straight(5),
	 *   curve(5, -90),    // Left turn
	 *   straight(10),
	 * ], 'red');
	 */
	static profilePrismFromPath = (
		height: number,
		segments: PathSegment[],
		options?: { color?: string }
	): Solid => {
		if (segments.length === 0) {
			throw new Error('profilePrismFromPath requires at least one segment');
		}

		// Validate segments
		for (const [index, segment] of segments.entries()) {
			if (segment.type === 'straight') {
				if (segment.length <= 0 || !Number.isFinite(segment.length)) {
					throw new Error(
						`Invalid straight segment at index ${index}: length must be positive and finite (got ${segment.length})`
					);
				}
			} else if (segment.type === 'curve') {
				if (segment.radius < 0 || !Number.isFinite(segment.radius)) {
					throw new Error(
						`Invalid curve segment at index ${index}: radius must be non-negative and finite (got ${segment.radius})`
					);
				}
				if (!Number.isFinite(segment.angle)) {
					throw new TypeError(
						`Invalid curve segment at index ${index}: angle must be finite (got ${segment.angle})`
					);
				}
			}
		}

		return this.profilePrism(
			height,
			(shape) => {
				// Start at origin facing right (+X direction)
				let x = 0;
				let y = 0;
				let heading = 0; // radians, 0 = +X direction

				shape.moveTo(x, y);

				// Process each segment
				for (const segment of segments) {
					if (segment.type === 'straight') {
						// Calculate endpoint based on current heading and length
						const endX = x + segment.length * Math.cos(heading);
						const endY = y + segment.length * Math.sin(heading);

						shape.lineTo(endX, endY);

						// Update position
						x = endX;
						y = endY;
					} else if (segment.type === 'curve') {
						const { radius, angle } = segment;
						const angleRad = this.degreesToRadians(angle);

						// Handle zero-radius curves (sharp corners)
						if (radius === 0) {
							// Just change heading, no arc
							heading -= angleRad; // Subtract for right turn (positive angle)
							continue;
						}

						// Calculate arc center perpendicular to current heading
						// For right turn (positive angle): center is to the right
						// For left turn (negative angle): center is to the left
						const turnDirection = angle >= 0 ? 1 : -1; // 1 = right, -1 = left
						const centerX = x + radius * Math.sin(heading) * turnDirection;
						const centerY = y - radius * Math.cos(heading) * turnDirection;

						// Calculate start angle from center to current point
						const startAngle = Math.atan2(y - centerY, x - centerX);

						// Calculate end angle (subtract angle for right turn, add for left)
						const endAngle = startAngle - angleRad;

						// Determine arc direction (clockwise for right turns)
						const clockwise = angle >= 0;

						// Draw the arc using absarc (absolute center coordinates)
						shape.absarc(centerX, centerY, Math.abs(radius), startAngle, endAngle, clockwise);

						// Calculate new position at end of arc
						x = centerX + Math.abs(radius) * Math.cos(endAngle);
						y = centerY + Math.abs(radius) * Math.sin(endAngle);

						// Update heading (subtract angle for right turn, add for left)
						heading -= angleRad;
					}
				}

				// Auto-close: connect back to origin
				shape.lineTo(0, 0);
			},
			options
		);
	};

	/**
	 * Creates a body of revolution by rotating a 2D profile around the Y-axis.
	 * Perfect for creating rotationally symmetric objects like chess pieces, vases, bottles, etc.
	 * Provides flexible Shape API for defining complex profiles with curves, arcs, etc.
	 *
	 * @param profileBuilder - Function that receives a Shape instance to define the 2D profile
	 * @param options - Configuration options
	 * @param options.angle - Rotation angle in degrees (default: 360 for full revolution)
	 * @param options.color - Material color (default: 'gray')
	 * @returns Solid with lathe geometry
	 *
	 * @example
	 * // Simple vase
	 * const vase = Solid.revolutionSolid((shape) => {
	 *   shape.moveTo(5, 0);    // Bottom radius
	 *   shape.lineTo(3, 5);    // Narrow
	 *   shape.lineTo(6, 10);   // Wide top
	 *   shape.lineTo(5, 15);   // Rim
	 * }, { color: 'blue' });
	 *
	 * @example
	 * // Partial revolution (90° slice)
	 * const slice = Solid.revolutionSolid((shape) => {
	 *   shape.moveTo(0, 0);
	 *   shape.lineTo(5, 0);
	 *   shape.lineTo(5, 10);
	 *   shape.lineTo(0, 10);
	 * }, { angle: 90, color: 'red' });
	 */
	static revolutionSolid = (
		profileBuilder: (shape: Shape) => void,
		options?: {
			angle?: number;
			color?: string;
		}
	): Solid => {
		const angle = options?.angle ?? 360;
		const color = options?.color ?? 'gray';

		// Create shape and extract points
		const shape = new Shape();
		profileBuilder(shape);

		// Convert shape to Vector2 points for LatheGeometry
		const points = shape.getPoints();

		// Calculate radial segments (for full 360° revolution)
		const segments = Math.max(8, Math.ceil(360 / 15)); // Always use 360 for segment calculation

		// Create full 360° lathe geometry
		const fullRevolution = new Solid(
			this.geometryToBrush(new LatheGeometry(points, segments)),
			color
		).normalize();

		// If full circle, return as-is (optimization)
		if (angle >= 360) return fullRevolution;

		// For partial revolutions, calculate max radius and height from profile
		let maxRadius = 0;
		let minHeight = Number.POSITIVE_INFINITY;
		let maxHeight = Number.NEGATIVE_INFINITY;

		for (const point of points) {
			maxRadius = Math.max(maxRadius, Math.abs(point.x));
			minHeight = Math.min(minHeight, point.y);
			maxHeight = Math.max(maxHeight, point.y);
		}

		const profileHeight = maxHeight - minHeight;
		const profileCenter = (minHeight + maxHeight) / 2;

		// Create wedge cutter for the section to remove
		const wedgePoints = this.generateWedgePoints(maxRadius, angle);
		if (wedgePoints.length === 0) return fullRevolution;

		// Create wedge prism (make it taller to ensure complete cut through entire profile)
		// The wedge needs to extend through the entire height range of the profile
		const wedgeHeight = Math.max(profileHeight * 2, maxRadius * 4);
		const wedgeCutter = this.profilePrismFromPoints(wedgeHeight, wedgePoints, { color }).move({
			y: profileCenter + wedgeHeight / 2
		}); // Center the wedge on the profile

		// Subtract wedge from full revolution to create closed partial geometry
		return Solid.SUBTRACT(fullRevolution, wedgeCutter);
	};

	/**
	 * Creates a body of revolution from an array of 2D coordinate points.
	 * The profile is rotated around the Y-axis.
	 *
	 * @param points - Array of [x, y] coordinate pairs defining the profile (x = radius, y = height)
	 * @param options - Configuration options
	 * @param options.angle - Rotation angle in degrees (default: 360 for full revolution)
	 * @param options.color - Material color (default: 'gray')
	 * @returns Solid with lathe geometry
	 *
	 * @example
	 * // Chess pawn
	 * const pawn = Solid.revolutionSolidFromPoints([
	 *   [0, 0],    // Bottom center
	 *   [3, 0],    // Bottom edge
	 *   [2, 2],    // Narrow stem
	 *   [4, 8],    // Body
	 *   [2, 10],   // Neck
	 *   [3, 12],   // Head
	 *   [0, 12]    // Top center
	 * ], { color: 'white' });
	 *
	 * @example
	 * // Partial revolution bottle (180° half)
	 * const halfBottle = Solid.revolutionSolidFromPoints([
	 *   [0, 0],
	 *   [5, 0],
	 *   [5, 8],
	 *   [2, 10],
	 *   [2, 15],
	 *   [3, 16],
	 *   [0, 16]
	 * ], { angle: 180, color: 'green' });
	 */
	static revolutionSolidFromPoints = (
		points: [number, number][],
		options?: {
			angle?: number;
			color?: string;
		}
	): Solid => {
		if (points.length < 2) {
			throw new Error('revolutionSolidFromPoints requires at least 2 points');
		}

		const angle = options?.angle ?? 360;
		const color = options?.color ?? 'gray';

		return this.revolutionSolid(
			(shape) => {
				// Start at first point
				const [startX, startY] = points[0];
				shape.moveTo(startX, startY);

				// Draw lines to remaining points
				for (let index = 1; index < points.length; index++) {
					const [x, y] = points[index];
					shape.lineTo(x, y);
				}
			},
			{ angle, color }
		);
	};

	/**
	 * Creates a body of revolution from a path defined by straight and curved segments.
	 * Path starts at origin (0, 0) facing right (+X direction).
	 * The profile is rotated around the Y-axis.
	 *
	 * @param segments - Array of path segments (straight or curve) defining the profile
	 * @param options - Configuration options
	 * @param options.angle - Rotation angle in degrees (default: 360 for full revolution)
	 * @param options.color - Material color (default: 'gray')
	 * @returns Solid with lathe geometry
	 *
	 * @example
	 * import { Solid, straight, curve } from '$lib/3d/Solid';
	 *
	 * // Rounded bottle with smooth curves
	 * const bottle = Solid.revolutionSolidFromPath([
	 *   straight(5),       // Bottom radius
	 *   curve(2, 90),      // Rounded corner up
	 *   straight(8),       // Body height
	 *   curve(3, -90),     // Curve inward for neck
	 *   straight(5),       // Neck height
	 *   curve(1, -90),     // Top curve
	 *   straight(2)        // Rim width
	 * ], { color: 'blue' });
	 *
	 * @example
	 * // Chess rook with sharp corners
	 * const rook = Solid.revolutionSolidFromPath([
	 *   straight(4),       // Base radius
	 *   curve(0, 90),      // Sharp corner up
	 *   straight(8),       // Tower height
	 *   curve(0, -90),     // Sharp corner out
	 *   straight(1),       // Battlement step
	 *   curve(0, 90),      // Sharp corner up
	 *   straight(2),       // Battlement height
	 *   curve(0, 180),     // Sharp corner back
	 *   straight(2),       // Down
	 *   curve(0, 90),      // Corner
	 *   straight(1)        // To center
	 * ], { color: 'black' });
	 */
	static revolutionSolidFromPath = (
		segments: PathSegment[],
		options?: {
			angle?: number;
			color?: string;
		}
	): Solid => {
		if (segments.length === 0) {
			throw new Error('revolutionSolidFromPath requires at least one segment');
		}

		const angle = options?.angle ?? 360;
		const color = options?.color ?? 'gray';

		// Validate segments (same validation as profilePrismFromPath)
		for (const [index, segment] of segments.entries()) {
			if (segment.type === 'straight') {
				if (segment.length <= 0 || !Number.isFinite(segment.length)) {
					throw new Error(
						`Invalid straight segment at index ${index}: length must be positive and finite (got ${segment.length})`
					);
				}
			} else if (segment.type === 'curve') {
				if (segment.radius < 0 || !Number.isFinite(segment.radius)) {
					throw new Error(
						`Invalid curve segment at index ${index}: radius must be non-negative and finite (got ${segment.radius})`
					);
				}
				if (!Number.isFinite(segment.angle)) {
					throw new TypeError(
						`Invalid curve segment at index ${index}: angle must be finite (got ${segment.angle})`
					);
				}
			}
		}

		return this.revolutionSolid(
			(shape) => {
				// Start at origin facing right (+X direction)
				let x = 0;
				let y = 0;
				let heading = 0; // radians, 0 = +X direction

				shape.moveTo(x, y);

				// Process each segment (same logic as profilePrismFromPath)
				for (const segment of segments) {
					if (segment.type === 'straight') {
						// Calculate endpoint based on current heading and length
						const endX = x + segment.length * Math.cos(heading);
						const endY = y + segment.length * Math.sin(heading);

						shape.lineTo(endX, endY);

						// Update position
						x = endX;
						y = endY;
					} else if (segment.type === 'curve') {
						const { radius, angle: curveAngle } = segment;
						const angleRad = this.degreesToRadians(curveAngle);

						// Handle zero-radius curves (sharp corners)
						if (radius === 0) {
							// Just change heading, no arc
							heading -= angleRad; // Subtract for right turn (positive angle)
							continue;
						}

						// Calculate arc center perpendicular to current heading
						// For right turn (positive angle): center is to the right
						// For left turn (negative angle): center is to the left
						const turnDirection = curveAngle >= 0 ? 1 : -1; // 1 = right, -1 = left
						const centerX = x + radius * Math.sin(heading) * turnDirection;
						const centerY = y - radius * Math.cos(heading) * turnDirection;

						// Calculate start angle from center to current point
						const startAngle = Math.atan2(y - centerY, x - centerX);

						// Calculate end angle (subtract angle for right turn, add for left)
						const endAngle = startAngle - angleRad;

						// Determine arc direction (clockwise for right turns)
						const clockwise = curveAngle >= 0;

						// Draw the arc using absarc (absolute center coordinates)
						shape.absarc(centerX, centerY, Math.abs(radius), startAngle, endAngle, clockwise);

						// Calculate new position at end of arc
						x = centerX + Math.abs(radius) * Math.cos(endAngle);
						y = centerY + Math.abs(radius) * Math.sin(endAngle);

						// Update heading (subtract angle for right turn, add for left)
						heading -= angleRad;
					}
				}
			},
			{ angle, color }
		);
	};

	// Absolute positioning
	public at(x: number, y: number, z: number): Solid {
		this.brush.position.set(x, y, z);
		this.brush.updateMatrixWorld();
		return this;
	}

	// Relative movement with object parameters
	public move(delta: { x?: number; y?: number; z?: number }): Solid {
		if (delta.x !== undefined) this.brush.position.x += delta.x;
		if (delta.y !== undefined) this.brush.position.y += delta.y;
		if (delta.z !== undefined) this.brush.position.z += delta.z;
		this.brush.updateMatrixWorld();
		return this;
	}

	// Rotation with object parameters (angles in degrees)
	private angleToRadian = (degree: number) => degree * (Math.PI / 180);

	public rotate(angles: { x?: number; y?: number; z?: number }): Solid {
		if (angles.x !== undefined) this.brush.rotation.x += this.angleToRadian(angles.x);
		if (angles.y !== undefined) this.brush.rotation.y += this.angleToRadian(angles.y);
		if (angles.z !== undefined) this.brush.rotation.z += this.angleToRadian(angles.z);
		this.brush.updateMatrixWorld();
		return this;
	}

	// Scaling with object parameters (multiplicative)
	public scale(factors: { all?: number; x?: number; y?: number; z?: number }): Solid {
		if (factors.all !== undefined) {
			this.brush.scale.x *= factors.all;
			this.brush.scale.y *= factors.all;
			this.brush.scale.z *= factors.all;
		}
		if (factors.x !== undefined) this.brush.scale.x *= factors.x;
		if (factors.y !== undefined) this.brush.scale.y *= factors.y;
		if (factors.z !== undefined) this.brush.scale.z *= factors.z;
		this.brush.updateMatrixWorld();
		return this;
	}

	// Centering method
	public center(axes?: { x?: boolean; y?: boolean; z?: boolean }): Solid {
		// First, bake all transformations (position, rotation, scale) into geometry
		this.brush.geometry.applyMatrix4(this.brush.matrix);
		this.brush.position.set(0, 0, 0);
		this.brush.rotation.set(0, 0, 0);
		this.brush.scale.set(1, 1, 1);
		this.brush.updateMatrixWorld();

		// Now get fresh bounds (geometry-only, no transformations)
		const bounds = this.getBounds();

		// Default to all axes if no parameter provided
		const centerX = axes?.x ?? axes === undefined;
		const centerY = axes?.y ?? axes === undefined;
		const centerZ = axes?.z ?? axes === undefined;

		const translateX = centerX ? -bounds.center.x : 0;
		const translateY = centerY ? -bounds.center.y : 0;
		const translateZ = centerZ ? -bounds.center.z : 0;

		this.brush.geometry.translate(translateX, translateY, translateZ);
		this.brush.updateMatrixWorld();

		return this;
	}

	// Edge alignment method
	public align(direction: 'bottom' | 'top' | 'left' | 'right' | 'front' | 'back'): Solid {
		// First, bake all transformations (position, rotation, scale) into geometry
		this.brush.geometry.applyMatrix4(this.brush.matrix);
		this.brush.position.set(0, 0, 0);
		this.brush.rotation.set(0, 0, 0);
		this.brush.scale.set(1, 1, 1);
		this.brush.updateMatrixWorld();

		// Now get fresh bounds (geometry-only, no transformations)
		const bounds = this.getBounds();

		switch (direction) {
			case 'bottom': {
				this.brush.geometry.translate(0, -bounds.min.y, 0);
				break;
			}
			case 'top': {
				this.brush.geometry.translate(0, -bounds.max.y, 0);
				break;
			}
			case 'left': {
				this.brush.geometry.translate(-bounds.min.x, 0, 0);
				break;
			}
			case 'right': {
				this.brush.geometry.translate(-bounds.max.x, 0, 0);
				break;
			}
			case 'front': {
				this.brush.geometry.translate(0, 0, -bounds.min.z);
				break;
			}
			case 'back': {
				this.brush.geometry.translate(0, 0, -bounds.max.z);
				break;
			}
		}

		this.brush.updateMatrixWorld();
		return this;
	}

	// Explicit CSG operations
	public static MERGE(solids: Solid[]): Solid {
		if (solids.length > 0 && solids[0].isNegative)
			throw new Error('First solid in MERGE cannot be negative');
		return solids.reduce(
			(accumulator, solid) => {
				const resultBrush = Solid.evaluator.evaluate(
					accumulator.brush,
					solid.brush,
					solid.isNegative ? SUBTRACTION : ADDITION
				);
				return new Solid(resultBrush, accumulator._color);
			},
			Solid.emptyCube.setColor(solids[0]?._color ?? 'gray')
		);
	}

	public static SUBTRACT(source: Solid, ...others: Solid[]): Solid {
		return others.reduce((accumulator, solid) => {
			const resultBrush = Solid.evaluator.evaluate(accumulator.brush, solid.brush, SUBTRACTION);
			return new Solid(resultBrush, accumulator._color);
		}, source);
	}

	public static UNION(source: Solid, ...others: Solid[]): Solid {
		return others.reduce((accumulator, solid) => {
			const resultBrush = Solid.evaluator.evaluate(accumulator.brush, solid.brush, ADDITION);
			return new Solid(resultBrush, accumulator._color);
		}, source);
	}

	public static INTERSECT(a: Solid, b: Solid): Solid {
		return new Solid(Solid.evaluator.evaluate(a.brush, b.brush, INTERSECTION), a._color);
	}

	public static GRID_XYZ(
		solid: Solid,
		options: {
			cols: number;
			rows: number;
			levels: number;
			spacing?: number | [number, number, number];
		}
	): Solid {
		const solids: Solid[] = [];
		const { width, height, depth } = solid.getBounds();
		const spacingArray =
			typeof options.spacing === 'number'
				? [options.spacing, options.spacing, options.spacing]
				: (options.spacing ?? [0, 0, 0]);
		const [spacingX, spacingY, spacingZ] = spacingArray;

		for (let x = 0; x < options.cols; x++)
			for (let y = 0; y < options.rows; y++)
				for (let z = 0; z < options.levels; z++)
					solids.push(
						solid.clone().move({
							x: x * (width + spacingX),
							y: z * (height + spacingY),
							z: y * (depth + spacingZ)
						})
					);

		return Solid.MERGE(solids);
	}

	public static GRID_XY(
		solid: Solid,
		options: { cols: number; rows: number; spacing?: [number, number] }
	): Solid {
		return Solid.GRID_XYZ(solid, {
			cols: options.cols,
			rows: options.rows,
			levels: 1,
			spacing: options.spacing ? [options.spacing[0], 0, options.spacing[1]] : undefined
		});
	}

	public static GRID_X(solid: Solid, options: { cols: number; spacing?: number }): Solid {
		return Solid.GRID_XYZ(solid, {
			cols: options.cols,
			rows: 1,
			levels: 1,
			spacing: options.spacing ? [options.spacing, 0, 0] : undefined
		});
	}

	// Geometry normalization
	private static emptyCube = new Solid(this.geometryToBrush(new BoxGeometry(0, 0, 0)), 'white');
	public normalize(): Solid {
		return Solid.UNION(this, Solid.emptyCube);
	}

	// Negative flag for composition
	public setNegative(negative: boolean = true): Solid {
		this._isNegative = negative;
		return this;
	}

	// Material methods
	public setColor(color: string): Solid {
		this._color = color;
		return this;
	}

	// Utility methods
	public getVertices = (): Float32Array =>
		new Float32Array(this.brush.geometry.attributes['position'].array);

	public getBounds(): {
		width: number;
		height: number;
		depth: number;
		min: Vector3;
		max: Vector3;
		center: Vector3;
	} {
		this.brush.geometry.computeBoundingBox();
		const localBox = this.brush.geometry.boundingBox || new Box3();

		// Transform bounding box to world space using brush's matrix
		const worldBox = localBox.clone();
		worldBox.applyMatrix4(this.brush.matrixWorld);

		const min = worldBox.min.clone();
		const max = worldBox.max.clone();
		const center = new Vector3();
		worldBox.getCenter(center);

		// Round all Vector3 components
		min.set(MathRoundTo2(min.x), MathRoundTo2(min.y), MathRoundTo2(min.z));
		max.set(MathRoundTo2(max.x), MathRoundTo2(max.y), MathRoundTo2(max.z));
		center.set(MathRoundTo2(center.x), MathRoundTo2(center.y), MathRoundTo2(center.z));

		return {
			width: MathRoundTo2(max.x - min.x),
			height: MathRoundTo2(max.y - min.y),
			depth: MathRoundTo2(max.z - min.z),
			min,
			max,
			center
		};
	}
}
