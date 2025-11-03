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

	// Relative movement (renamed from dX, dY, dZ, d)
	public moveX(dx: number): Solid {
		this.brush.position.x += dx;
		this.brush.updateMatrixWorld();
		return this;
	}

	public moveY(dy: number): Solid {
		this.brush.position.y += dy;
		this.brush.updateMatrixWorld();
		return this;
	}

	public moveZ(dz: number): Solid {
		this.brush.position.z += dz;
		this.brush.updateMatrixWorld();
		return this;
	}

	public move(dx: number, dy: number, dz: number): Solid {
		this.brush.position.x += dx;
		this.brush.position.y += dy;
		this.brush.position.z += dz;
		this.brush.updateMatrixWorld();
		return this;
	}

	// Rotation methods (keep existing names)
	private angleToRadian = (degree: number) => degree * (Math.PI / 180);

	public rotateX(angle: number): Solid {
		this.brush.rotation.x += this.angleToRadian(angle);
		this.brush.updateMatrixWorld();
		return this;
	}

	public rotateY(angle: number): Solid {
		this.brush.rotation.y += this.angleToRadian(angle);
		this.brush.updateMatrixWorld();
		return this;
	}

	public rotateZ(angle: number): Solid {
		this.brush.rotation.z += this.angleToRadian(angle);
		this.brush.updateMatrixWorld();
		return this;
	}

	public rotate(x: number, y: number, z: number): Solid {
		this.brush.rotation.x += this.angleToRadian(x);
		this.brush.rotation.y += this.angleToRadian(y);
		this.brush.rotation.z += this.angleToRadian(z);
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
