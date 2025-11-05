<script lang="ts">
	import './app.postcss';

	import { Canvas } from '@threlte/core';

	import { Mesh } from '$lib/3d/Mesh';
	import type { Solid } from '$lib/3d/Solid';
	import { generateBinaryStlFromVertices } from '$lib/3d/stl';
	import { virtualDownload } from '$lib/download';
	import { MathMax } from '$lib/Math';
	import type { CameraState } from '$lib/urlState';
	import { updateURLHash } from '$lib/urlState';
	import {} from '$projects';

	import App3DScene from './App3DScene.svelte';
	import AppNavigation from './AppNavigation.svelte';

	let volume = $state(0);
	let name = $state('');
	let solid = $state<Solid | undefined>();
	let cameraState = $state<CameraState | undefined>();
	let wireframe = $state(false);
	let saveCameraToUrl = $state(false);

	const setSolid = (recentName: string, s: Solid | Mesh) => {
		name = recentName;
		// Convert Mesh to Solid if needed
		solid = s instanceof Mesh ? s.toSolid() : s;
		volume = MathMax([...solid.getVertices()]);
	};

	const setCameraState = (state: CameraState | undefined) => {
		cameraState = state;
	};

	const download = () => {
		if (!solid) return;

		const vertices = solid.getVertices();
		const stlData = generateBinaryStlFromVertices(vertices);

		virtualDownload(name + '.stl', stlData);
	};

	// Clear URL params when saveCameraToUrl is toggled OFF
	$effect(() => {
		// Watch saveCameraToUrl state
		if (!saveCameraToUrl && name) {
			// Clear camera params from URL when toggle is OFF
			updateURLHash(name);
		}
	});
</script>

<AppNavigation
	oncamerastate={setCameraState}
	ondownload={download}
	onselect={setSolid}
	bind:wireframe
	bind:saveCameraToUrl
/>
<div class="canvasContainer">
	{#if solid}
		{#key solid}
			<Canvas>
				<App3DScene
					{cameraState}
					componentName={name}
					{saveCameraToUrl}
					{solid}
					{volume}
					{wireframe}
				/>
			</Canvas>
		{/key}
	{/if}
</div>

<style>
	:global(body) {
		background-color: #f3f4f6;
	}
	.canvasContainer {
		width: 100%;
		height: calc(100vh - 120px);
	}
</style>
