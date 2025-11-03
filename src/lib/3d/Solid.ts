import { Box3, BoxGeometry, BufferGeometry, CylinderGeometry, Vector3 } from 'three';
import { ADDITION, Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg';

import { MathMinMax } from '$lib/Math';

export class Solid {
	public static evaluator: Evaluator = new Evaluator();

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

	private static geometryToBrush(geometry: BoxGeometry | CylinderGeometry | BufferGeometry): Brush {
		const result = new Brush(geometry.translate(0, 0, 0));
		result.updateMatrixWorld();
		return result;
	}

	static cube = (width: number, height: number, depth: number, color: string = 'gray'): Solid =>
		new Solid(this.geometryToBrush(new BoxGeometry(width, height, depth)), color);

	static cylinder = (radius: number, height: number, color: string = 'gray'): Solid =>
		new Solid(
			this.geometryToBrush(
				new CylinderGeometry(radius, radius, height, MathMinMax(radius * 8, 16, 48))
			),
			color
		);

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
	public subtract(other: Solid): Solid {
		const resultBrush = Solid.evaluator.evaluate(this.brush, other.brush, SUBTRACTION);
		return new Solid(resultBrush, this._color, this._isNegative);
	}

	public union(other: Solid): Solid {
		const resultBrush = Solid.evaluator.evaluate(this.brush, other.brush, ADDITION);
		return new Solid(resultBrush, this._color, this._isNegative);
	}

	public intersect(other: Solid): Solid {
		const resultBrush = Solid.evaluator.evaluate(this.brush, other.brush, INTERSECTION);
		return new Solid(resultBrush, this._color, this._isNegative);
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

		return {
			width: max.x - min.x,
			height: max.y - min.y,
			depth: max.z - min.z,
			min,
			max,
			center
		};
	}
}
