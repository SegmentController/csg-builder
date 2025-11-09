import { Solid } from '$lib/3d/Solid';
import type { ComponentsMap } from '$stores/componentStore';

import { WALL } from './_const';

const WallHeader = (length: number) => {
	let header = Solid.cube(length, WALL.WIDTH * 2, WALL.WIDTH / 2, 'green').move({
		y: WALL.HEIGHT / 2 + WALL.WIDTH,
		z: WALL.WIDTH * 1.75
	});
	const zigzagNeg = Solid.cube(WALL.ZIGZAG_LENGTH, 3, WALL.WIDTH).move({
		x: -length / 2 + WALL.ZIGZAG_LENGTH,
		y: WALL.HEIGHT / 2 + WALL.WIDTH * 2,
		z: WALL.WIDTH * 1.75
	});
	for (let index = 0; index < length / WALL.ZIGZAG_LENGTH / 2; index++) {
		header = Solid.SUBTRACT(header, zigzagNeg);
		zigzagNeg.move({ x: WALL.ZIGZAG_LENGTH * 2 });
	}
	const decor1 = Solid.cylinder(0.5, length)
		.rotate({ z: 90 })
		.move({ x: 0, y: WALL.HEIGHT / 2 + WALL.WIDTH / 2, z: WALL.WIDTH * 2.1 });
	header = Solid.SUBTRACT(header, decor1);

	return header;
};

export const Wall = (length: number, config?: { includeFootPath?: boolean }): Solid => {
	const wall = Solid.cube(length, WALL.HEIGHT, WALL.WIDTH, 'green');
	const header = Solid.cube(length, WALL.WIDTH, WALL.WIDTH * 4, 'green').move({
		y: WALL.HEIGHT / 2 - WALL.WIDTH / 2
	});
	const footer = header
		.clone()
		.move({ y: -WALL.HEIGHT + WALL.WIDTH })
		.scale({ z: 0.5 });
	const headerSide1 = WallHeader(length);
	const headerSide2 = headerSide1.clone().rotate({ y: 180 });

	let result = Solid.UNION(wall, header, footer, headerSide1, headerSide2);
	if (config?.includeFootPath) {
		const footPath = Solid.cube(length, WALL.WIDTH * 2, WALL.WIDTH * 4)
			.align('bottom')
			.move({ y: WALL.HEIGHT / 2 });
		result = Solid.UNION(result, footPath);
	}

	return result.align('bottom');
};

export const WallWithGate = (length: number): Solid => {
	let wall = Wall(length);

	let cubeInner = Solid.cube(
		WALL.GATE_WIDTH,
		WALL.HEIGHT - WALL.GATE_WIDTH / 2,
		WALL.WIDTH * 4
	).align('bottom');
	const circleInner = Solid.cylinder(WALL.GATE_WIDTH / 2, WALL.WIDTH * 4)
		.move({ y: WALL.HEIGHT - WALL.GATE_WIDTH / 2 })
		.rotate({ z: 90, y: 90 });
	cubeInner = Solid.UNION(cubeInner, circleInner);

	wall = Solid.UNION(wall, cubeInner);
	cubeInner.scale({ x: 0.8, y: 0.95, z: 2 });
	wall = Solid.SUBTRACT(wall, cubeInner);

	return wall;
};

export const components: ComponentsMap = {
	Wall100: () => Wall(100),
	WallWithGate100: () => WallWithGate(100)
};
