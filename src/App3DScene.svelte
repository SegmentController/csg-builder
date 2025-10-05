<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';

	import type { BodySet } from '$lib/3d/BodySet';

	type Properties = {
		bodyset: BodySet;
		volume: number;
		wireframe: boolean;
	};

	let { bodyset, volume, wireframe }: Properties = $props();

	const CAMERA_FAR = 2;

	// Cache vertices to avoid re-creating Float32Array on every render
	const bodiesWithVertices = $derived(
		bodyset.getBodies().map((body) => ({
			body,
			vertices: body.getVertices()
		}))
	);
</script>

<T.PerspectiveCamera
	makeDefault
	position={[CAMERA_FAR * volume, CAMERA_FAR * volume, CAMERA_FAR * volume]}
>
	<OrbitControls />
</T.PerspectiveCamera>

<T.PointLight color="white" decay={1 / 10} position={[0 * volume, 2 * volume, 2 * volume]} />
<T.AmbientLight intensity={1 / 3} />

{#each bodiesWithVertices as { body, vertices }}
	<T.Mesh
		position.x={body.brush.position.x}
		position.y={body.brush.position.z}
		position.z={-body.brush.position.y}
		rotation.x={body.brush.rotation.x}
		rotation.y={body.brush.rotation.y}
		rotation.z={body.brush.rotation.z}
	>
		<T.BufferGeometry>
			<T.BufferAttribute args={[vertices, 3]} attach="attributes.position" />
		</T.BufferGeometry>
		<T.MeshStandardMaterial
			color={body.color}
			opacity={body.negative ? 0.25 : 1}
			transparent
			{wireframe}
		/>
	</T.Mesh>
{/each}
