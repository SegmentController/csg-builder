<script lang="ts">
	import './app.postcss';

	import { Canvas } from '@threlte/core';

	import type { BodySet } from '$lib/3d/BodySet';
	import { generateBinaryStlFromVertices } from '$lib/3d/stl';
	import { virtualDownload } from '$lib/download';
	import { MathMax } from '$lib/Math';
	import {} from '$projects';

	import App3DScene from './App3DScene.svelte';
	import AppNavigation from './AppNavigation.svelte';

	let volume: number;
	let name: string;
	let bodyset: BodySet | undefined;
	const setBodySet = (recentName: string, bs: BodySet) => {
		name = recentName;
		bodyset = bs;
		volume = MathMax(bs.getBodies().map((b) => MathMax([...b.getVertices()])));
	};
	const download = () => {
		if (!bodyset) return;

		bodyset.merge();
		const vertices = bodyset.getBodies()[0].getVertices();
		const stlData = generateBinaryStlFromVertices(vertices);

		virtualDownload(name + '.stl', stlData);
	};

	let wireframe: boolean = false;
</script>

<AppNavigation ondownload={download} onselect={setBodySet} bind:wireframe />
<div class="canvasContainer">
	{#if bodyset}
		{#key bodyset}
			<Canvas>
				<App3DScene {bodyset} {volume} {wireframe} />
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
