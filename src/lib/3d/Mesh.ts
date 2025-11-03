import { ADDITION, SUBTRACTION } from 'three-bvh-csg';

import { Solid } from './Solid';

export class Mesh {
	private solids: Solid[] = [];

	public constructor(...solid: (Solid | Mesh)[]) {
		this.append(...solid);
	}

	// Static constructors with explicit operations
	static union(...solids: Solid[]): Mesh {
		return new Mesh(...solids);
	}

	static difference(base: Solid, ...subtract: Solid[]): Mesh {
		const mesh = new Mesh(base);
		for (const s of subtract) {
			mesh.append(s);
		}
		return mesh;
	}

	static intersection(...solids: Solid[]): Mesh {
		// For now, treat like union - full intersection support could be added later
		return new Mesh(...solids);
	}

	// Instance methods
	public append(...solid: (Solid | Mesh)[]): Mesh {
		for (const s of solid) {
			if (s instanceof Mesh) {
				this.solids.push(...s.getSolids());
			} else {
				this.solids.push(s);
			}
		}
		return this;
	}

	public merge(...solid: (Solid | Mesh)[]): Mesh {
		if (solid.length > 0) this.append(...solid);
		if (this.solids.length > 1) {
			// Process solids in declaration order
			let brush = this.solids[0].brush;
			const color = this.solids[0].color;

			if (this.solids[0].isNegative) {
				throw new Error('First solid in Mesh cannot be negative');
			}

			// Process each solid in order
			for (let c = 1; c < this.solids.length; c++) {
				const currentSolid = this.solids[c];
				const operation = currentSolid.isNegative ? SUBTRACTION : ADDITION;
				brush = Solid.evaluator.evaluate(brush, currentSolid.brush, operation);
			}

			this.solids = [new Solid(brush, color, false)];
		}
		return this;
	}

	// Convert to single Solid (performs merge)
	public toSolid(): Solid {
		this.merge();
		return this.solids[0];
	}

	// Static helper for composing solids and meshes
	public static compose(...items: (Solid | Mesh)[]): Mesh {
		return new Mesh(...items);
	}

	// Transformation methods
	public move(delta: { x?: number; y?: number; z?: number }): Mesh {
		for (const solid of this.solids) solid.move(delta);
		return this;
	}

	public at(x: number, y: number, z: number): Mesh {
		for (const solid of this.solids) solid.at(x, y, z);
		return this;
	}

	public rotate(angles: { x?: number; y?: number; z?: number }): Mesh {
		for (const solid of this.solids) solid.rotate(angles);
		return this;
	}

	// Grid utility with configurable spacing
	public static grid(
		solid: Solid,
		options: { cols: number; rows: number; spacing?: [number, number] }
	): Mesh {
		const result = new Mesh();
		const [spacingX, spacingY] = options.spacing ?? [6, 2]; // Default spacing

		for (let x = 0; x < options.cols; x++) {
			for (let y = 0; y < options.rows; y++) {
				result.append(solid.clone().move({ x: x * spacingX, y: y * spacingY, z: 0 }));
			}
		}
		return result;
	}

	// Array utility (kept for compatibility, delegates to grid)
	public static array(source: Solid, cx: number, cy: number): Mesh {
		return Mesh.grid(source, { cols: cx, rows: cy, spacing: [6, 2] });
	}

	// Get all solids
	public getSolids = (): Solid[] => this.solids;
}
