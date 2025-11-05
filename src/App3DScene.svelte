<script lang="ts">
	/*eslint-disable unicorn/consistent-function-scoping */
	/*eslint-disable @typescript-eslint/no-unused-vars */
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { onMount } from 'svelte';
	import {
		type BufferGeometry,
		DoubleSide,
		type NormalOrGLBufferAttributes,
		type PerspectiveCamera
	} from 'three';
	import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls.js';

	import type { Solid } from '$lib/3d/Solid';
	import type { CameraState } from '$lib/urlState';
	import { updateURLHash } from '$lib/urlState';

	type Properties = {
		solid: Solid;
		volume: number;
		wireframe: boolean;
		cameraState: CameraState | undefined;
		saveCameraToUrl: boolean;
		componentName: string;
	};

	let { solid, volume, wireframe, cameraState, saveCameraToUrl, componentName }: Properties =
		$props();

	const CAMERA_FAR = 2;

	let bufferGeometry = $state<BufferGeometry<NormalOrGLBufferAttributes> | undefined>();
	let cameraReference = $state<PerspectiveCamera>();
	let orbitControlsReference = $state<OrbitControlsType>();
	let debounceTimer: number | undefined;
	let initialCameraStateApplied = false;

	// Apply initial camera state from URL (if present)
	onMount(() => {
		if (bufferGeometry) bufferGeometry.computeVertexNormals();

		// Apply camera state after a short delay to ensure camera and controls are initialized
		setTimeout(() => {
			// Apply camera state from URL if present
			if (cameraState && cameraReference && orbitControlsReference) {
				applyCameraState(cameraState);
			}

			// Mark as ready to start tracking camera changes
			// (Set to true regardless of whether camera state was applied)
			initialCameraStateApplied = true;

			// Attach event listener to OrbitControls for camera changes
			if (orbitControlsReference) {
				orbitControlsReference.addEventListener('change', handleCameraChange);
			}
		}, 100);

		// Cleanup: remove event listener on unmount
		return () => {
			if (orbitControlsReference)
				orbitControlsReference.removeEventListener('change', handleCameraChange);
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	// Apply camera state to camera and orbit controls
	const applyCameraState = (state: CameraState) => {
		if (!cameraReference || !orbitControlsReference) return;

		// Set camera position
		cameraReference.position.set(state.px, state.py, state.pz);

		// Set camera rotation
		cameraReference.rotation.set(state.rx, state.ry, state.rz);

		// Set orbit controls target
		orbitControlsReference.target.set(state.tx, state.ty, state.tz);

		// Set camera zoom
		cameraReference.zoom = state.zoom;
		cameraReference.updateProjectionMatrix();

		// Update orbit controls
		orbitControlsReference.update();
	};

	// Capture current camera state
	const captureCameraState = (): CameraState | undefined => {
		if (!cameraReference || !orbitControlsReference) return undefined;

		return {
			px: cameraReference.position.x,
			py: cameraReference.position.y,
			pz: cameraReference.position.z,
			rx: cameraReference.rotation.x,
			ry: cameraReference.rotation.y,
			rz: cameraReference.rotation.z,
			tx: orbitControlsReference.target.x,
			ty: orbitControlsReference.target.y,
			tz: orbitControlsReference.target.z,
			zoom: cameraReference.zoom
		};
	};

	// Handle camera changes with debouncing
	const handleCameraChange = () => {
		// Don't update URL during initial camera state application
		if (!initialCameraStateApplied) return;

		// Don't update URL if saveCameraToUrl toggle is OFF
		if (!saveCameraToUrl) return;

		// Clear existing timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Set new timer to update URL after 500ms of no changes
		debounceTimer = setTimeout(() => {
			const currentState = captureCameraState();
			if (currentState) {
				updateURLHash(componentName, currentState);
			}
		}, 500) as unknown as number;
	};

	// Reset camera to default position when component changes
	$effect(() => {
		// Access componentName to make this reactive
		const _ = componentName;

		// Reset flag when component changes
		initialCameraStateApplied = false;

		// Reset camera to default position
		if (cameraReference && orbitControlsReference) {
			const defaultPos = CAMERA_FAR * volume;
			cameraReference.position.set(defaultPos, defaultPos, defaultPos);
			cameraReference.rotation.set(0, 0, 0);
			orbitControlsReference.target.set(0, 0, 0);
			cameraReference.zoom = 1;
			cameraReference.updateProjectionMatrix();
			orbitControlsReference.update();
		}
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[CAMERA_FAR * volume, CAMERA_FAR * volume, CAMERA_FAR * volume]}
	bind:ref={cameraReference}
>
	<OrbitControls bind:ref={orbitControlsReference} />
</T.PerspectiveCamera>

<T.PointLight decay={0.1} intensity={1} position={[0, 1 * volume, 2 * volume]} />
<T.AmbientLight color="white" intensity={0.5} />

<T.Mesh>
	<T.BufferGeometry bind:ref={bufferGeometry}>
		<T.BufferAttribute args={[solid.getVertices(), 3]} attach="attributes.position" />
	</T.BufferGeometry>
	<T.MeshPhongMaterial color={solid.color} side={DoubleSide} {wireframe} />
</T.Mesh>
