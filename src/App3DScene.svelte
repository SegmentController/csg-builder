<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { onMount } from 'svelte';
	import type { BufferGeometry, NormalOrGLBufferAttributes } from 'three';

	import type { Solid } from '$lib/3d/Solid';

	type Properties = {
		solid: Solid;
		volume: number;
		wireframe: boolean;
	};

	let { solid, volume, wireframe }: Properties = $props();

	const CAMERA_FAR = 2;

	let bufferGeometry = $state<BufferGeometry<NormalOrGLBufferAttributes> | undefined>();
	onMount(() => {
		if (bufferGeometry) bufferGeometry.computeVertexNormals();
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[CAMERA_FAR * volume, CAMERA_FAR * volume, CAMERA_FAR * volume]}
>
	<OrbitControls />
</T.PerspectiveCamera>

<T.PointLight decay={0.1} intensity={1} position={[0, 1 * volume, 2 * volume]} />
<T.AmbientLight color="white" intensity={0.5} />

<T.Mesh>
	<T.BufferGeometry bind:ref={bufferGeometry}>
		<T.BufferAttribute args={[solid.getVertices(), 3]} attach="attributes.position" />
	</T.BufferGeometry>
	<T.MeshPhongMaterial color={solid.color} {wireframe} />
</T.Mesh>
