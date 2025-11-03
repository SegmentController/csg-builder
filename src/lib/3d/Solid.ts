import { BoxGeometry, BufferGeometry, CylinderGeometry } from 'three';
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
}
