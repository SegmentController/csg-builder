/* eslint-disable unicorn/no-array-reduce */
import {
	Box3,
	BoxGeometry,
	BufferGeometry,
	ConeGeometry,
	CylinderGeometry,
	ExtrudeGeometry,
	Shape,
	SphereGeometry,
	Vector3
} from 'three';
import { ADDITION, Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg';

import { MathMinMax } from '$lib/Math';

export class Solid {
	public static evaluator: Evaluator = new Evaluator();

	// Angle constants in degrees
	public static readonly DEG_45 = 45;
	public static readonly DEG_90 = 90;
	public static readonly DEG_180 = 180;
	public static readonly DEG_270 = 270;
	public static readonly DEG_360 = 360;

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
			| BufferGeometry
	): Brush {
		const result = new Brush(geometry.translate(0, 0, 0));
		result.updateMatrixWorld();
		return result;
	}

	static cube = (width: number, height: number, depth: number, color: string = 'gray'): Solid =>
		new Solid(this.geometryToBrush(new BoxGeometry(width, height, depth)), color).normalize();

	static cylinder = (
		radius: number,
		height: number,
		options?: {
			color?: string;
			angle?: number;
			topRadius?: number;
		}
	): Solid => {
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
		const wedgeCutter = this.profilePrismFromPoints(height * 1.5, wedgePoints, color)
			.rotate({ x: 90 })
			.move({ y: height * 0.75 }); // Center wedge on Y-axis

		// Subtract wedge from cylinder to create closed partial geometry
		return fullCylinder.subtract(wedgeCutter);
	};

	static sphere = (
		radius: number,
		options?: {
			color?: string;
			angle?: number; // degrees
		}
	): Solid => {
		const color = options?.color ?? 'gray';
		const angle = options?.angle ?? 360;

		// Create full 360° sphere
		const fullSphere = new Solid(
			this.geometryToBrush(
				new SphereGeometry(radius, MathMinMax(radius * 8, 16, 48), MathMinMax(radius * 8, 16, 48))
			),
			color
		).normalize();

		// If full circle, return as-is (optimization)
		if (angle >= 360) return fullSphere;

		// Create wedge cutter for the section to remove
		const wedgePoints = this.generateWedgePoints(radius, angle);
		if (wedgePoints.length === 0) return fullSphere;

		// Create wedge prism tall enough to cut through entire sphere diameter
		const wedgeCutter = this.profilePrismFromPoints(radius * 4, wedgePoints, color)
			.rotate({ x: 90 }) // Rotate to align with sphere
			.move({ y: radius * 2 }); // Center wedge on Y-axis

		// Subtract wedge from sphere to create closed partial geometry
		return fullSphere.subtract(wedgeCutter);
	};

	static cone = (
		radius: number,
		height: number,
		options?: {
			color?: string;
			angle?: number; // degrees
		}
	): Solid => {
		const color = options?.color ?? 'gray';
		const angle = options?.angle ?? 360;

		// Create full 360° cone
		const fullCone = new Solid(
			this.geometryToBrush(
				new ConeGeometry(
					radius,
					height,
					MathMinMax(radius * 8, 16, 48),
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
		const wedgeCutter = this.profilePrismFromPoints(height * 1.5, wedgePoints, color)
			.rotate({ x: 90 })
			.move({ y: height * 0.75 }); // Center wedge on Y-axis

		// Subtract wedge from cone to create closed partial geometry
		return fullCone.subtract(wedgeCutter);
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
		const wedgeCutter = this.profilePrismFromPoints(height * 1.5, wedgePoints, color)
			.rotate({ x: 90 })
			.move({ y: height * 0.75 }); // Center wedge on Y-axis

		// Subtract wedge from prism to create closed partial geometry
		return fullPrism.subtract(wedgeCutter);
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
		color: string = 'gray'
	): Solid => {
		const shape = new Shape();
		profileBuilder(shape);

		const geometry = new ExtrudeGeometry(shape, {
			depth: height,
			bevelEnabled: false, // Critical for clean CSG operations
			curveSegments: 12,
			steps: 1
		});

		return new Solid(this.geometryToBrush(geometry), color).normalize();
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
		color: string = 'gray'
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
			color
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
	public scale(factors: { x?: number; y?: number; z?: number }): Solid {
		if (factors.x !== undefined) this.brush.scale.x *= factors.x;
		if (factors.y !== undefined) this.brush.scale.y *= factors.y;
		if (factors.z !== undefined) this.brush.scale.z *= factors.z;
		this.brush.updateMatrixWorld();
		return this;
	}

	// Centering method
	public center(axes?: { x?: boolean; y?: boolean; z?: boolean }): Solid {
		const bounds = this.getBounds();

		// Default to all axes if no parameter provided
		const centerX = axes?.x ?? axes === undefined;
		const centerY = axes?.y ?? axes === undefined;
		const centerZ = axes?.z ?? axes === undefined;

		const translateX = centerX ? -bounds.center.x : 0;
		const translateY = centerY ? -bounds.center.y : 0;
		const translateZ = centerZ ? -bounds.center.z : 0;

		this.brush.geometry.translate(translateX, translateY, translateZ);

		if (centerX) this.brush.position.x = 0;
		if (centerY) this.brush.position.y = 0;
		if (centerZ) this.brush.position.z = 0;

		this.brush.updateMatrixWorld();
		return this;
	}

	// Edge alignment method
	public align(direction: 'bottom' | 'top' | 'left' | 'right' | 'front' | 'back'): Solid {
		const bounds = this.getBounds();

		switch (direction) {
			case 'bottom': {
				this.brush.geometry.translate(0, -bounds.min.y, 0);
				this.brush.position.y = 0;
				break;
			}
			case 'top': {
				this.brush.geometry.translate(0, -bounds.max.y, 0);
				this.brush.position.y = 0;
				break;
			}
			case 'left': {
				this.brush.geometry.translate(-bounds.min.x, 0, 0);
				this.brush.position.x = 0;
				break;
			}
			case 'right': {
				this.brush.geometry.translate(-bounds.max.x, 0, 0);
				this.brush.position.x = 0;
				break;
			}
			case 'front': {
				this.brush.geometry.translate(0, 0, -bounds.min.z);
				this.brush.position.z = 0;
				break;
			}
			case 'back': {
				this.brush.geometry.translate(0, 0, -bounds.max.z);
				this.brush.position.z = 0;
				break;
			}
		}

		this.brush.updateMatrixWorld();
		return this;
	}

	// Explicit CSG operations
	public subtract(...others: Solid[]): Solid {
		return others.reduce((accumulator, solid) => {
			const resultBrush = Solid.evaluator.evaluate(accumulator.brush, solid.brush, SUBTRACTION);
			return new Solid(resultBrush, accumulator._color, accumulator._isNegative);
		}, this);
	}

	public union(...others: Solid[]): Solid {
		return others.reduce((accumulator, solid) => {
			const resultBrush = Solid.evaluator.evaluate(accumulator.brush, solid.brush, ADDITION);
			return new Solid(resultBrush, accumulator._color, accumulator._isNegative);
		}, this);
	}

	public intersect(...others: Solid[]): Solid {
		return others.reduce((accumulator, solid) => {
			const resultBrush = Solid.evaluator.evaluate(accumulator.brush, solid.brush, INTERSECTION);
			return new Solid(resultBrush, accumulator._color, accumulator._isNegative);
		}, this);
	}

	// Geometry normalization
	static emptyCube = new Solid(this.geometryToBrush(new BoxGeometry(0, 0, 0)), 'white');
	public normalize(): Solid {
		return this.union(Solid.emptyCube);
	}

	// Negative flag for composition
	public setNegative(negative: boolean = true): Solid {
		return new Solid(this.brush.clone(true), this._color, negative);
	}

	// Material methods
	public setColor(color: string): Solid {
		this._color = color;
		return this;
	}

	// Utility methods
	public getVertices = (): Float32Array =>
		new Float32Array(this.brush.geometry.attributes['position'].array);

	// Helper to round to 2 decimal places
	private roundTo2 = (n: number) => Math.round(n * 100) / 100;

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
		min.set(this.roundTo2(min.x), this.roundTo2(min.y), this.roundTo2(min.z));
		max.set(this.roundTo2(max.x), this.roundTo2(max.y), this.roundTo2(max.z));
		center.set(this.roundTo2(center.x), this.roundTo2(center.y), this.roundTo2(center.z));

		return {
			width: this.roundTo2(max.x - min.x),
			height: this.roundTo2(max.y - min.y),
			depth: this.roundTo2(max.z - min.z),
			min,
			max,
			center
		};
	}
}
