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
			thetaStart?: number; // degrees
			thetaLength?: number; // degrees
		}
	): Solid => {
		const color = options?.color ?? 'gray';
		const thetaStart = this.degreesToRadians(options?.thetaStart ?? 0);
		const thetaLength = this.degreesToRadians(options?.thetaLength ?? 360);

		// For partial cylinders, use CSG to create closed faces
		if (thetaLength < Math.PI * 2) {
			const fullGeometry = new CylinderGeometry(
				radius,
				radius,
				height,
				MathMinMax(radius * 8, 16, 48),
				1,
				false,
				thetaStart,
				thetaLength
			);
			return this.closePartialGeometry(
				fullGeometry,
				thetaStart,
				thetaLength,
				radius,
				height,
				color
			);
		}

		// For full cylinders, use the direct approach (no CSG overhead)
		return new Solid(
			this.geometryToBrush(
				new CylinderGeometry(radius, radius, height, MathMinMax(radius * 8, 16, 48))
			),
			color
		).normalize();
	};

	static sphere = (
		radius: number,
		options?: {
			color?: string;
			thetaStart?: number; // degrees - horizontal start angle
			thetaLength?: number; // degrees - horizontal sweep
		}
	): Solid => {
		const color = options?.color ?? 'gray';
		const thetaStart = this.degreesToRadians(options?.thetaStart ?? 0);
		const thetaLength = this.degreesToRadians(options?.thetaLength ?? 360);

		// For partial spheres, use CSG to create closed faces
		if (thetaLength < Math.PI * 2) {
			const fullGeometry = new SphereGeometry(
				radius,
				MathMinMax(radius * 8, 16, 48), // widthSegments
				MathMinMax(radius * 8, 16, 48), // heightSegments
				0,
				Math.PI * 2,
				thetaStart,
				thetaLength
			);
			return this.closePartialGeometry(
				fullGeometry,
				thetaStart,
				thetaLength,
				radius,
				radius * 2,
				color
			);
		}

		// For full spheres, use the direct approach (no CSG overhead)
		return new Solid(
			this.geometryToBrush(
				new SphereGeometry(
					radius,
					MathMinMax(radius * 8, 16, 48), // widthSegments
					MathMinMax(radius * 8, 16, 48) // heightSegments
				)
			),
			color
		).normalize();
	};

	static cone = (
		radius: number,
		height: number,
		options?: {
			color?: string;
			thetaStart?: number; // degrees
			thetaLength?: number; // degrees
		}
	): Solid => {
		const color = options?.color ?? 'gray';
		const thetaStart = this.degreesToRadians(options?.thetaStart ?? 0);
		const thetaLength = this.degreesToRadians(options?.thetaLength ?? 360);

		// For partial cones, use CSG to create closed faces
		if (thetaLength < Math.PI * 2) {
			const fullGeometry = new ConeGeometry(
				radius,
				height,
				MathMinMax(radius * 8, 16, 48), // radialSegments
				1,
				false,
				thetaStart,
				thetaLength
			);
			return this.closePartialGeometry(
				fullGeometry,
				thetaStart,
				thetaLength,
				radius,
				height,
				color
			);
		}

		// For full cones, use the direct approach (no CSG overhead)
		return new Solid(
			this.geometryToBrush(new ConeGeometry(radius, height, MathMinMax(radius * 8, 16, 48))),
			color
		).normalize();
	};

	static prism = (
		sides: number,
		radius: number,
		height: number,
		options?: {
			color?: string;
			thetaStart?: number; // degrees
			thetaLength?: number; // degrees
		}
	): Solid => {
		const color = options?.color ?? 'gray';
		const thetaStart = this.degreesToRadians(options?.thetaStart ?? 0);
		const thetaLength = this.degreesToRadians(options?.thetaLength ?? 360);

		// For partial prisms, use CSG to create closed faces
		if (thetaLength < Math.PI * 2) {
			const fullGeometry = new CylinderGeometry(
				radius,
				radius,
				height,
				sides,
				1,
				false,
				thetaStart,
				thetaLength
			);
			return this.closePartialGeometry(
				fullGeometry,
				thetaStart,
				thetaLength,
				radius,
				height,
				color
			);
		}

		// For full prisms, use the direct approach (no CSG overhead)
		return new Solid(
			this.geometryToBrush(new CylinderGeometry(radius, radius, height, sides)),
			color
		).normalize();
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

	// Helper method to close partial geometries using CSG operations
	private static closePartialGeometry(
		fullGeometry: BufferGeometry,
		thetaStart: number, // in radians
		thetaLength: number, // in radians
		radius: number,
		height: number,
		color: string
	): Solid {
		// Create the full geometry as a Solid
		const fullSolid = new Solid(this.geometryToBrush(fullGeometry), color).normalize();
		// to fix error
		return fullSolid;

		// Calculate the wedge angle to remove and its position
		const removeAngle = Math.PI * 2 - thetaLength;
		const wedgeStartAngle = thetaStart + thetaLength;
		const wedgeCenterAngle = wedgeStartAngle + removeAngle / 2;

		// Create a cutting box large enough to encompass the geometry
		const cutSize = Math.max(radius, height) * 3;
		const cutDistance = cutSize / 2;

		// Position the cutting box at the wedge center angle
		const cutX = Math.cos(wedgeCenterAngle) * cutDistance;
		const cutZ = Math.sin(wedgeCenterAngle) * cutDistance;

		const cutBox = Solid.cube(cutSize, cutSize * 2, cutSize, color).at(cutX, 0, cutZ);

		// Rotate the box to align with the wedge
		// The rotation should face outward from the center
		cutBox.rotate({ y: wedgeCenterAngle * (180 / Math.PI) });

		// Subtract the wedge to create closed faces
		return fullSolid.subtract(cutBox);
	}

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
