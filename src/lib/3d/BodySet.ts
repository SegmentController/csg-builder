import { ADDITION, Evaluator, SUBTRACTION } from 'three-bvh-csg';

import { Body } from './Body';

export class BodySet {
	private evaluator = new Evaluator();
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

	public getBodies = (): Body[] => this.bodies;
}
