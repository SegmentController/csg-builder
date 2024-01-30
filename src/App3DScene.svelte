<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';

	import type { BodySet } from '$lib/3d/BodySet';

	export let bodyset: BodySet;
	export let volume: number;
	export let wireframe: boolean;

	const CAMERA_FAR = 2;
</script>

<T.PerspectiveCamera
	makeDefault
	position={[CAMERA_FAR * volume, CAMERA_FAR * volume, CAMERA_FAR * volume]}
>
	<OrbitControls />
</T.PerspectiveCamera>

<T.PointLight position={[0 * volume, 2 * volume, 2 * volume]} color="white" decay={1 / 10} />
<T.AmbientLight intensity={1 / 3} />

{#each bodyset.getBodies() as body}
	<T.Mesh
		position.x={body.brush.position.x}
		position.y={body.brush.position.z}
		position.z={-body.brush.position.y}
		rotation.x={body.brush.rotation.x}
		rotation.y={body.brush.rotation.y}
		rotation.z={body.brush.rotation.z}
	>
		<T.BufferGeometry>
			<T.BufferAttribute
				args={[body.getVertices(), 3]}
				attach={(parent, self) => {
					parent.setAttribute('position', self);
					parent.computeVertexNormals();
					return () => {};
				}}
			/>
		</T.BufferGeometry>
		<T.MeshStandardMaterial
			color={body.color}
			transparent
			opacity={body.negative ? 0.25 : 1}
			{wireframe}
		/>
	</T.Mesh>
{/each}
