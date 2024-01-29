<script lang="ts">
	import './app.postcss';

	import { Canvas } from '@threlte/core';

	import App3DScene from './App3DScene.svelte';
	import { MathMax } from '$lib/Math';
	import {} from '$projects/sample';

	import AppNavigation from './AppNavigation.svelte';

	let volume: number;
	let vertices: Float32Array | undefined;
	const setVertices = (v: Float32Array) => (volume = MathMax([...(vertices = v)]));

	let wireframe: boolean = false;
</script>

<AppNavigation on:select={(event) => setVertices(event.detail)} bind:wireframe />
<div class="canvasContainer">
	{#if vertices}
		{#key vertices}
			<Canvas>
				<App3DScene {vertices} {volume} {wireframe} />
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
		height: calc(100vh - 94px);
	}
</style>
