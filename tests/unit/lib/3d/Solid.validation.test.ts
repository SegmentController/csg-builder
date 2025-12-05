import { describe, expect, it } from 'vitest';

import { Solid } from '$lib/3d/Solid';

describe('Solid - Validation', () => {
	describe('Primitive Validation - cube()', () => {
		it('should reject zero dimensions', () => {
			expect(() => Solid.cube(0, 10, 10)).toThrow('must be positive');
			expect(() => Solid.cube(10, 0, 10)).toThrow('must be positive');
			expect(() => Solid.cube(10, 10, 0)).toThrow('must be positive');
		});

		it('should reject negative dimensions', () => {
			expect(() => Solid.cube(-5, 10, 10)).toThrow('must be positive');
			expect(() => Solid.cube(10, -5, 10)).toThrow('must be positive');
			expect(() => Solid.cube(10, 10, -5)).toThrow('must be positive');
		});

		it('should reject NaN dimensions', () => {
			expect(() => Solid.cube(Number.NaN, 10, 10)).toThrow('must be finite');
			expect(() => Solid.cube(10, Number.NaN, 10)).toThrow('must be finite');
			expect(() => Solid.cube(10, 10, Number.NaN)).toThrow('must be finite');
		});

		it('should reject Infinity dimensions', () => {
			expect(() => Solid.cube(Infinity, 10, 10)).toThrow('must be finite');
			expect(() => Solid.cube(10, Infinity, 10)).toThrow('must be finite');
			expect(() => Solid.cube(10, 10, Infinity)).toThrow('must be finite');
			expect(() => Solid.cube(-Infinity, 10, 10)).toThrow('must be finite');
		});
	});

	describe('Primitive Validation - cylinder()', () => {
		it('should reject zero dimensions', () => {
			expect(() => Solid.cylinder(0, 10)).toThrow('must be positive');
			expect(() => Solid.cylinder(10, 0)).toThrow('must be positive');
		});

		it('should reject negative dimensions', () => {
			expect(() => Solid.cylinder(-5, 10)).toThrow('must be positive');
			expect(() => Solid.cylinder(10, -5)).toThrow('must be positive');
		});

		it('should reject NaN dimensions', () => {
			expect(() => Solid.cylinder(Number.NaN, 10)).toThrow('must be finite');
			expect(() => Solid.cylinder(10, Number.NaN)).toThrow('must be finite');
		});

		it('should reject Infinity dimensions', () => {
			expect(() => Solid.cylinder(Infinity, 10)).toThrow('must be finite');
			expect(() => Solid.cylinder(10, Infinity)).toThrow('must be finite');
		});

		it('should reject negative topRadius', () => {
			expect(() => Solid.cylinder(10, 10, { topRadius: -5 })).toThrow(
				'topRadius must be non-negative'
			);
		});

		it('should reject NaN topRadius', () => {
			expect(() => Solid.cylinder(10, 10, { topRadius: Number.NaN })).toThrow(
				'topRadius must be finite'
			);
		});

		it('should reject Infinity topRadius', () => {
			expect(() => Solid.cylinder(10, 10, { topRadius: Infinity })).toThrow(
				'topRadius must be finite'
			);
		});
	});

	describe('Primitive Validation - sphere()', () => {
		it('should reject zero radius', () => {
			expect(() => Solid.sphere(0)).toThrow('must be positive');
		});

		it('should reject negative radius', () => {
			expect(() => Solid.sphere(-5)).toThrow('must be positive');
		});

		it('should reject NaN radius', () => {
			expect(() => Solid.sphere(Number.NaN)).toThrow('must be finite');
		});

		it('should reject Infinity radius', () => {
			expect(() => Solid.sphere(Infinity)).toThrow('must be finite');
			expect(() => Solid.sphere(-Infinity)).toThrow('must be finite');
		});
	});

	describe('Primitive Validation - cone()', () => {
		it('should reject zero dimensions', () => {
			expect(() => Solid.cone(0, 10)).toThrow('must be positive');
			expect(() => Solid.cone(10, 0)).toThrow('must be positive');
		});

		it('should reject negative dimensions', () => {
			expect(() => Solid.cone(-5, 10)).toThrow('must be positive');
			expect(() => Solid.cone(10, -5)).toThrow('must be positive');
		});

		it('should reject NaN dimensions', () => {
			expect(() => Solid.cone(Number.NaN, 10)).toThrow('must be finite');
			expect(() => Solid.cone(10, Number.NaN)).toThrow('must be finite');
		});

		it('should reject Infinity dimensions', () => {
			expect(() => Solid.cone(Infinity, 10)).toThrow('must be finite');
			expect(() => Solid.cone(10, Infinity)).toThrow('must be finite');
		});
	});

	describe('Primitive Validation - prism()', () => {
		it('should reject less than 3 sides', () => {
			expect(() => Solid.prism(2, 5, 10)).toThrow('must have at least 3 sides');
			expect(() => Solid.prism(1, 5, 10)).toThrow('must have at least 3 sides');
			expect(() => Solid.prism(0, 5, 10)).toThrow('must have at least 3 sides');
		});

		it('should reject non-integer sides', () => {
			expect(() => Solid.prism(3.5, 5, 10)).toThrow('sides must be an integer');
			expect(() => Solid.prism(5.1, 5, 10)).toThrow('sides must be an integer');
		});

		it('should reject zero dimensions', () => {
			expect(() => Solid.prism(6, 0, 10)).toThrow('must be positive');
			expect(() => Solid.prism(6, 10, 0)).toThrow('must be positive');
		});

		it('should reject negative dimensions', () => {
			expect(() => Solid.prism(6, -5, 10)).toThrow('must be positive');
			expect(() => Solid.prism(6, 10, -5)).toThrow('must be positive');
		});

		it('should reject NaN dimensions', () => {
			expect(() => Solid.prism(6, Number.NaN, 10)).toThrow('must be finite');
			expect(() => Solid.prism(6, 10, Number.NaN)).toThrow('must be finite');
		});

		it('should reject Infinity dimensions', () => {
			expect(() => Solid.prism(6, Infinity, 10)).toThrow('must be finite');
			expect(() => Solid.prism(6, 10, Infinity)).toThrow('must be finite');
		});

		it('should reject negative topRadius', () => {
			expect(() => Solid.prism(6, 10, 10, { topRadius: -5 })).toThrow(
				'topRadius must be non-negative'
			);
		});

		it('should reject NaN topRadius', () => {
			expect(() => Solid.prism(6, 10, 10, { topRadius: Number.NaN })).toThrow(
				'topRadius must be finite'
			);
		});

		it('should reject Infinity topRadius', () => {
			expect(() => Solid.prism(6, 10, 10, { topRadius: Infinity })).toThrow(
				'topRadius must be finite'
			);
		});
	});

	describe('Transform Validation - scale()', () => {
		it('should reject NaN in scale.all', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ all: Number.NaN })).toThrow("Scale factor 'all' must be finite");
		});

		it('should reject Infinity in scale.all', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ all: Infinity })).toThrow("Scale factor 'all' must be finite");
			expect(() => cube.scale({ all: -Infinity })).toThrow("Scale factor 'all' must be finite");
		});

		it('should reject zero in scale.all', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ all: 0 })).toThrow(
				"Scale factor 'all' cannot be zero (creates degenerate geometry)"
			);
		});

		it('should reject NaN in scale.x', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ x: Number.NaN })).toThrow("Scale factor 'x' must be finite");
		});

		it('should reject NaN in scale.y', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ y: Number.NaN })).toThrow("Scale factor 'y' must be finite");
		});

		it('should reject NaN in scale.z', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ z: Number.NaN })).toThrow("Scale factor 'z' must be finite");
		});

		it('should reject zero in scale.x', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ x: 0 })).toThrow(
				"Scale factor 'x' cannot be zero (creates degenerate geometry)"
			);
		});

		it('should reject zero in scale.y', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ y: 0 })).toThrow(
				"Scale factor 'y' cannot be zero (creates degenerate geometry)"
			);
		});

		it('should reject zero in scale.z', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ z: 0 })).toThrow(
				"Scale factor 'z' cannot be zero (creates degenerate geometry)"
			);
		});

		it('should reject Infinity in individual scale factors', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ x: Infinity })).toThrow("Scale factor 'x' must be finite");
			expect(() => cube.scale({ y: Infinity })).toThrow("Scale factor 'y' must be finite");
			expect(() => cube.scale({ z: Infinity })).toThrow("Scale factor 'z' must be finite");
		});

		it('should allow negative scale factors (mirroring)', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ all: -1 })).not.toThrow();
			expect(() => cube.scale({ x: -2 })).not.toThrow();
		});
	});

	describe('Transform Validation - rotate()', () => {
		it('should reject NaN in rotate.x', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ x: Number.NaN })).toThrow("Rotation angle 'x' must be finite");
		});

		it('should reject NaN in rotate.y', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ y: Number.NaN })).toThrow("Rotation angle 'y' must be finite");
		});

		it('should reject NaN in rotate.z', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ z: Number.NaN })).toThrow("Rotation angle 'z' must be finite");
		});

		it('should reject Infinity in rotate.x', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ x: Infinity })).toThrow("Rotation angle 'x' must be finite");
			expect(() => cube.rotate({ x: -Infinity })).toThrow("Rotation angle 'x' must be finite");
		});

		it('should reject Infinity in rotate.y', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ y: Infinity })).toThrow("Rotation angle 'y' must be finite");
		});

		it('should reject Infinity in rotate.z', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ z: Infinity })).toThrow("Rotation angle 'z' must be finite");
		});

		it('should allow zero rotation', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ x: 0 })).not.toThrow();
		});

		it('should allow negative rotation', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.rotate({ x: -90 })).not.toThrow();
		});
	});

	describe('Transform Validation - move()', () => {
		it('should sanitize NaN to 0 in move.x', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ x: Number.NaN })).not.toThrow();
			// NaN is treated as 0, so position should stay at 0
			expect(cube.getBounds().center.x).toBe(0);
		});

		it('should sanitize NaN to 0 in move.y', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ y: Number.NaN })).not.toThrow();
			expect(cube.getBounds().center.y).toBe(0);
		});

		it('should sanitize NaN to 0 in move.z', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ z: Number.NaN })).not.toThrow();
			expect(cube.getBounds().center.z).toBe(0);
		});

		it('should sanitize Infinity to 0 in move.x', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ x: Infinity })).not.toThrow();
			expect(() => cube.move({ x: -Infinity })).not.toThrow();
		});

		it('should sanitize Infinity to 0 in move.y', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ y: Infinity })).not.toThrow();
		});

		it('should sanitize Infinity to 0 in move.z', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ z: Infinity })).not.toThrow();
		});

		it('should allow zero movement', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ x: 0 })).not.toThrow();
		});

		it('should allow negative movement', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.move({ x: -10 })).not.toThrow();
		});
	});

	describe('Transform Validation - at()', () => {
		it('should reject NaN in x coordinate', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.at(Number.NaN, 0, 0)).toThrow('Position coordinates must be finite');
		});

		it('should reject NaN in y coordinate', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.at(0, Number.NaN, 0)).toThrow('Position coordinates must be finite');
		});

		it('should reject NaN in z coordinate', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.at(0, 0, Number.NaN)).toThrow('Position coordinates must be finite');
		});

		it('should reject Infinity in any coordinate', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.at(Infinity, 0, 0)).toThrow('Position coordinates must be finite');
			expect(() => cube.at(0, Infinity, 0)).toThrow('Position coordinates must be finite');
			expect(() => cube.at(0, 0, Infinity)).toThrow('Position coordinates must be finite');
			expect(() => cube.at(-Infinity, 0, 0)).toThrow('Position coordinates must be finite');
		});

		it('should allow zero coordinates', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.at(0, 0, 0)).not.toThrow();
		});

		it('should allow negative coordinates', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.at(-10, -20, -30)).not.toThrow();
		});
	});

	describe('Edge Cases', () => {
		it('should handle very small but valid dimensions', () => {
			expect(() => Solid.cube(0.001, 0.001, 0.001)).not.toThrow();
			expect(() => Solid.sphere(0.001)).not.toThrow();
		});

		it('should handle very large but valid dimensions', () => {
			expect(() => Solid.cube(1_000_000, 1_000_000, 1_000_000)).not.toThrow();
			expect(() => Solid.sphere(1_000_000)).not.toThrow();
		});

		it('should handle very small but valid scale factors', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ all: 0.001 })).not.toThrow();
		});

		it('should handle very large but valid scale factors', () => {
			const cube = Solid.cube(10, 10, 10);
			expect(() => cube.scale({ all: 1000 })).not.toThrow();
		});
	});
});
