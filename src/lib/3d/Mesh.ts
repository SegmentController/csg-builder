import { Vector3 } from 'three';
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

	public scale(factors: { all?: number; x?: number; y?: number; z?: number }): Mesh {
		for (const solid of this.solids) solid.scale(factors);
		return this;
	}

	// Bounding box utility
	public getBounds(): {
		width: number;
		height: number;
		depth: number;
		min: Vector3;
		max: Vector3;
		center: Vector3;
	} {
		if (this.solids.length === 0) {
			throw new Error('Cannot get bounds of empty Mesh');
		}

		// Get bounds of first solid to initialize min/max
		const firstBounds = this.solids[0].getBounds();
		const min = firstBounds.min.clone();
		const max = firstBounds.max.clone();

		// Expand to include all other solids
		for (let index = 1; index < this.solids.length; index++) {
			const bounds = this.solids[index].getBounds();
			min.min(bounds.min);
			max.max(bounds.max);
		}

		const center = new Vector3();
		center.addVectors(min, max).multiplyScalar(0.5);

		return {
			width: max.x - min.x,
			height: max.y - min.y,
			depth: max.z - min.z,
			min,
			max,
			center
		};
	}

	// Centering method
	public center(axes?: { x?: boolean; y?: boolean; z?: boolean }): Mesh {
		const bounds = this.getBounds();

		// Default to all axes if no parameter provided
		const centerX = axes?.x ?? axes === undefined;
		const centerY = axes?.y ?? axes === undefined;
		const centerZ = axes?.z ?? axes === undefined;

		const translateX = centerX ? -bounds.center.x : 0;
		const translateY = centerY ? -bounds.center.y : 0;
		const translateZ = centerZ ? -bounds.center.z : 0;

		for (const solid of this.solids) {
			solid.brush.geometry.translate(translateX, translateY, translateZ);

			if (centerX) solid.brush.position.x = 0;
			if (centerY) solid.brush.position.y = 0;
			if (centerZ) solid.brush.position.z = 0;

			solid.brush.updateMatrixWorld();
		}
		return this;
	}

	// Edge alignment method
	public align(direction: 'bottom' | 'top' | 'left' | 'right' | 'front' | 'back'): Mesh {
		const bounds = this.getBounds();

		for (const solid of this.solids) {
			switch (direction) {
				case 'bottom': {
					solid.brush.geometry.translate(0, -bounds.min.y, 0);
					solid.brush.position.y = 0;
					break;
				}
				case 'top': {
					solid.brush.geometry.translate(0, -bounds.max.y, 0);
					solid.brush.position.y = 0;
					break;
				}
				case 'left': {
					solid.brush.geometry.translate(-bounds.min.x, 0, 0);
					solid.brush.position.x = 0;
					break;
				}
				case 'right': {
					solid.brush.geometry.translate(-bounds.max.x, 0, 0);
					solid.brush.position.x = 0;
					break;
				}
				case 'front': {
					solid.brush.geometry.translate(0, 0, -bounds.min.z);
					solid.brush.position.z = 0;
					break;
				}
				case 'back': {
					solid.brush.geometry.translate(0, 0, -bounds.max.z);
					solid.brush.position.z = 0;
					break;
				}
			}
			solid.brush.updateMatrixWorld();
		}
		return this;
	}

	public static gridXYZ(
		solid: Solid,
		options: { cols: number; rows: number; levels: number; spacing?: [number, number, number] }
	): Mesh {
		const result = new Mesh();
		const { width, height, depth } = solid.getBounds();
		const [spacingX, spacingY, spacingZ] = options.spacing ?? [0, 0, 0];

		for (let x = 0; x < options.cols; x++)
			for (let y = 0; y < options.rows; y++)
				for (let z = 0; z < options.levels; z++)
					result.append(
						solid.clone().move({
							x: x * (width + spacingX),
							y: y * (height + spacingY),
							z: z * (depth + spacingZ)
						})
					);

		return result;
	}

	public static gridXY(
		solid: Solid,
		options: { cols: number; rows: number; spacing?: [number, number] }
	): Mesh {
		return Mesh.gridXYZ(solid, {
			cols: options.cols,
			rows: options.rows,
			levels: 1,
			spacing: options.spacing ? [options.spacing[0], options.spacing[1], 0] : undefined
		});
	}

	public static gridX(solid: Solid, options: { cols: number; spacing?: number }): Mesh {
		return Mesh.gridXYZ(solid, {
			cols: options.cols,
			rows: 1,
			levels: 1,
			spacing: options.spacing ? [options.spacing, 0, 0] : undefined
		});
	}

	// Get all solids
	public getSolids = (): Solid[] => this.solids;
}
