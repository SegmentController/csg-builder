import { BoxGeometry, CylinderGeometry } from 'three';
import { ADDITION, Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg';

import { MathMinMax } from '$lib/Math';
import { switchType } from '$types/switchType';

export class Mesh {
	private brush: Brush;
	private evaluator = new Evaluator();

	constructor(brush: Brush) {
		this.brush = brush;
		this.brush.updateMatrixWorld();
	}

	private static GeometryToBrush(geometry: BoxGeometry | CylinderGeometry): Brush {
		const result = new Brush(geometry.translate(0, 0, 0));

		switchType(geometry).case(CylinderGeometry, () => result.rotateX(Math.PI / 2));
		result.updateMatrixWorld();

		return result;
	}

	static fromCube(width: number, height: number, depth: number): Mesh {
		return new Mesh(this.GeometryToBrush(new BoxGeometry(width, height, depth))).add(
			Mesh.fromCylinder(0, 0)
		); //Bugfix
	}

	static fromCylinder(radius: number, height: number): Mesh {
		return new Mesh(
			this.GeometryToBrush(
				new CylinderGeometry(radius, radius, height, MathMinMax(radius * 8, 16, 48))
			)
		);
	}

	public add(mesh: Mesh): Mesh {
		this.brush = this.evaluator.evaluate(this.brush, mesh.brush, ADDITION);
		this.brush.updateMatrixWorld();
		return this;
	}
	public sub(mesh: Mesh): Mesh {
		this.brush = this.evaluator.evaluate(this.brush, mesh.brush, SUBTRACTION);
		this.brush.updateMatrixWorld();
		return this;
	}
	public intersect(mesh: Mesh): Mesh {
		this.brush = this.evaluator.evaluate(this.brush, mesh.brush, INTERSECTION);
		this.brush.updateMatrixWorld();
		return this;
	}

	public get vertices(): Float32Array {
		return new Float32Array(this.brush.geometry.attributes['position'].array);
	}
}
