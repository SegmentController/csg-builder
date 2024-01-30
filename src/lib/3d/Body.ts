import { BoxGeometry, CylinderGeometry } from 'three';
import { ADDITION, Brush, Evaluator } from 'three-bvh-csg';

import { MathMinMax } from '$lib/Math';

export class Body {
	public brush: Brush;
	public negative: boolean = false;

	constructor(
		brush: Brush,
		public color: string
	) {
		this.brush = brush;
		this.brush.updateMatrixWorld();
	}

	public clone(): Body {
		return new Body(this.brush, this.color);
	}

	private static geometryToBrush(geometry: BoxGeometry | CylinderGeometry): Brush {
		const result = new Brush(geometry.translate(0, 0, 0));
		result.updateMatrixWorld();
		return result;
	}
	private static fakeAddition(brush: Brush): Brush {
		return new Evaluator().evaluate(
			brush,
			this.geometryToBrush(new BoxGeometry(0, 0, 0)),
			ADDITION
		);
	}

	static fromCube(width: number, height: number, depth: number, color: string): Body {
		return new Body(
			this.fakeAddition(this.geometryToBrush(new BoxGeometry(width, height, depth))),
			color
		);
	}

	static fromCylinder(radius: number, height: number, color: string): Body {
		return new Body(
			this.fakeAddition(
				this.geometryToBrush(
					new CylinderGeometry(radius, radius, height, MathMinMax(radius * 8, 16, 48))
				)
			),
			color
		);
	}

	public x(x: number): Body {
		this.brush.position.setX(x);
		this.brush.updateMatrixWorld();
		return this;
	}
	public y(y: number): Body {
		this.brush.position.setY(y);
		this.brush.updateMatrixWorld();
		return this;
	}
	public z(z: number): Body {
		this.brush.position.setZ(z);
		this.brush.updateMatrixWorld();
		return this;
	}

	public setNegative(neg = true): Body {
		this.negative = neg;
		return this;
	}

	public get vertices(): Float32Array {
		return new Float32Array(this.brush.geometry.attributes['position'].array);
	}
}
