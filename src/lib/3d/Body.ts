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

	public clone = (): Body => new Body(this.brush, this.color);

	private static geometryToBrush(geometry: BoxGeometry | CylinderGeometry): Brush {
		const result = new Brush(geometry.translate(0, 0, 0));
		result.updateMatrixWorld();
		return result;
	}
	private static fakeAddition(brush: Brush): Brush {
		return brush;
		return new Evaluator().evaluate(
			brush,
			this.geometryToBrush(new BoxGeometry(0, 0, 0)),
			ADDITION
		);
	}

	static fromCube = (width: number, height: number, depth: number, color: string): Body =>
		new Body(this.fakeAddition(this.geometryToBrush(new BoxGeometry(width, height, depth))), color);

	static fromCylinder = (radius: number, height: number, color: string): Body =>
		new Body(
			this.fakeAddition(
				this.geometryToBrush(
					new CylinderGeometry(radius, radius, height, MathMinMax(radius * 8, 16, 48))
				)
			),
			color
		);

	public merge = (body: Body): Body => {
		this.brush = new Evaluator().evaluate(this.brush, body.brush, ADDITION);
		return this;
	};

	public dX(x: number): Body {
		this.brush.position.x += x;
		this.brush.updateMatrixWorld();
		return this;
	}
	public dY(y: number): Body {
		this.brush.position.y += y;
		this.brush.updateMatrixWorld();
		return this;
	}
	public dZ(z: number): Body {
		this.brush.position.z += z;
		this.brush.updateMatrixWorld();
		return this;
	}

	private angleToRadian = (degree: number) => degree * (Math.PI / 180);
	public rotateX(angle: number): Body {
		this.brush.rotation.x += this.angleToRadian(angle);
		this.brush.updateMatrixWorld();
		return this;
	}
	public rotateY(angle: number): Body {
		this.brush.rotation.y += this.angleToRadian(angle);
		this.brush.updateMatrixWorld();
		return this;
	}
	public rotateZ(angle: number): Body {
		this.brush.rotation.z += this.angleToRadian(angle);
		this.brush.updateMatrixWorld();
		return this;
	}

	public setNegative(neg = true): Body {
		this.negative = neg;
		return this;
	}

	public getVertices = (): Float32Array =>
		new Float32Array(this.brush.geometry.attributes['position'].array);
}
