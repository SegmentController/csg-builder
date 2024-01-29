<script lang="ts">
	import './app.postcss';

	import { onMount } from 'svelte';

	import AppNavigation from './AppNavigation.svelte';
	import { Canvas } from '@threlte/core';
	import Mesh3DScene from '$components/Mesh3DScene.svelte';
	import { MathMax } from '$lib/Math';

	import {} from '$projects/sample';

	onMount(() => {});

	let volume: number;
	let wireframe: boolean = false;
	let vertices: Float32Array | undefined = undefined;
</script>

<AppNavigation
	on:select={(e) => {
		vertices = e.detail.vertices;
		volume = MathMax([...e.detail.vertices]);
	}}
/>
<div class="canvasContainer">
	{#if vertices}
		{#key vertices}
			<Canvas>
				<Mesh3DScene {vertices} {volume} {wireframe} />
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
		background: #888;
		background: linear-gradient(-45deg, #888 0%, #ccc 100%);
	}
</style>
