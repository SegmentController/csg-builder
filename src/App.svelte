<script lang="ts">
	import './app.postcss';

	import { Canvas } from '@threlte/core';

	import type { Body } from '$lib/3d/Body';
	import type { BodySet } from '$lib/3d/BodySet';
	import { generateBinaryStlFromVertices } from '$lib/3d/stl';
	import { virtualDownload } from '$lib/download';
	import { MathMax } from '$lib/Math';
	import {} from '$projects';

	import App3DScene from './App3DScene.svelte';
	import AppNavigation from './AppNavigation.svelte';

	let volume = $state(0);
	let name = $state('');
	let body = $state<Body | undefined>();
	const setBodySet = (recentName: string, bs: BodySet) => {
		name = recentName;
		body = bs.merge().getBodies()[0];
		volume = MathMax([...body.getVertices()]);
	};
	const download = () => {
		if (!body) return;

		const vertices = body.getVertices();
		const stlData = generateBinaryStlFromVertices(vertices);

		virtualDownload(name + '.stl', stlData);
	};

	let wireframe = $state(false);
</script>

<AppNavigation ondownload={download} onselect={setBodySet} bind:wireframe />
<div class="canvasContainer">
	{#if body}
		{#key body}
			<Canvas>
				<App3DScene {body} {volume} {wireframe} />
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
