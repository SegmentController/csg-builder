import { ADDITION, Evaluator, SUBTRACTION } from 'three-bvh-csg';

import { Body } from './Body';

export class BodySet {
	private evaluator = new Evaluator();
	private bodies: Body[] = [];

	public constructor(body: Body | Body[] | BodySet | BodySet[]) {
		if (Array.isArray(body)) {
			for (const b of body)
				if (b instanceof BodySet) this.bodies.push(...b.getBodies());
				else this.bodies.push(b);
		} else {
			if (body instanceof BodySet) this.bodies.push(...body.getBodies());
			else this.bodies.push(body);
		}
	}

	public append(body: Body): BodySet {
		this.bodies.push(body);
		return this;
	}
	public merge(body?: Body): BodySet {
		if (body) this.append(body);
		if (this.bodies.length > 1) {
			let brush = this.bodies[0].brush;
			const color = this.bodies[0].color;
			for (let c = 1; c < this.bodies.length; c++)
				brush = this.evaluator.evaluate(
					brush,
					this.bodies[c].brush,
					this.bodies[c].negative ? SUBTRACTION : ADDITION
				);
			this.bodies = [new Body(brush, color)];
		}
		return this;
	}

	public getBodies(): Body[] {
		return this.bodies;
	}
}
