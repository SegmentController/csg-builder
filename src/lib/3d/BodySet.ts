import { ADDITION, SUBTRACTION } from 'three-bvh-csg';

import { Body } from './Body';

export class BodySet {
	private bodies: Body[] = [];

	public constructor(...body: (Body | BodySet)[]) {
		this.append(...body);
	}

	public append(...body: (Body | BodySet)[]): BodySet {
		for (const b of body)
			if (b instanceof BodySet) this.bodies.push(...b.getBodies());
			else this.bodies.push(b);
		return this;
	}
	public merge(...body: (Body | BodySet)[]): BodySet {
		if (body.length > 0) this.append(...body);
		if (this.bodies.length > 1) {
			let brush = this.bodies[0].brush;
			const color = this.bodies[0].color;
			for (let c = 1; c < this.bodies.length; c++)
				brush = Body.evaluator.evaluate(
					brush,
					this.bodies[c].brush,
					this.bodies[c].negative ? SUBTRACTION : ADDITION
				);
			this.bodies = [new Body(brush, color)];
		}
		return this;
	}

	public dX(x: number): BodySet {
		for (const body of this.bodies) body.dX(x);
		return this;
	}
	public dY(y: number): BodySet {
		for (const body of this.bodies) body.dY(y);
		return this;
	}
	public dZ(z: number): BodySet {
		for (const body of this.bodies) body.dZ(z);
		return this;
	}

	public d(x: number, y: number, z: number): BodySet {
		for (const body of this.bodies) body.d(x, y, z);
		return this;
	}

	public rotateX(angle: number): BodySet {
		for (const body of this.bodies) body.rotateX(angle);
		return this;
	}
	public rotateY(angle: number): BodySet {
		for (const body of this.bodies) body.rotateY(angle);
		return this;
	}
	public rotateZ(angle: number): BodySet {
		for (const body of this.bodies) body.rotateZ(angle);
		return this;
	}

	public rotate(x: number, y: number, z: number): BodySet {
		for (const body of this.bodies) body.rotate(x, y, z);
		return this;
	}

	public static array(source: Body, cx: number, cy: number): BodySet {
		const result = new BodySet();
		for (let x = 0; x < cx; x++)
			for (let y = 0; y < cy; y++) result.merge(source.clone().d(x * 6, y * 2, 0));
		return result;
	}

	public getBodies = (): Body[] => this.bodies;
}
