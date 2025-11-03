<script lang="ts">
	import './app.postcss';

	import { Canvas } from '@threlte/core';

	import { Mesh } from '$lib/3d/Mesh';
	import type { Solid } from '$lib/3d/Solid';
	import { generateBinaryStlFromVertices } from '$lib/3d/stl';
	import { virtualDownload } from '$lib/download';
	import { MathMax } from '$lib/Math';
	import {} from '$projects';

	import App3DScene from './App3DScene.svelte';
	import AppNavigation from './AppNavigation.svelte';

	let volume = $state(0);
	let name = $state('');
	let solid = $state<Solid | undefined>();
	const setSolid = (recentName: string, s: Solid | Mesh) => {
		name = recentName;
		// Convert Mesh to Solid if needed
		solid = s instanceof Mesh ? s.toSolid() : s;
		volume = MathMax([...solid.getVertices()]);
	};
	const download = () => {
		if (!solid) return;

		const vertices = solid.getVertices();
		const stlData = generateBinaryStlFromVertices(vertices);

		virtualDownload(name + '.stl', stlData);
	};

	let wireframe = $state(false);
</script>

<AppNavigation ondownload={download} onselect={setSolid} bind:wireframe />
<div class="canvasContainer">
	{#if solid}
		{#key solid}
			<Canvas>
				<App3DScene {solid} {volume} {wireframe} />
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
