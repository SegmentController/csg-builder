/**
 * Camera state structure for URL persistence
 */
export interface CameraState {
	// Camera position
	px: number;
	py: number;
	pz: number;
	// Camera rotation (radians)
	rx: number;
	ry: number;
	rz: number;
	// OrbitControls target
	tx: number;
	ty: number;
	tz: number;
	// Camera zoom
	zoom: number;
}

/**
 * Parse camera state from URL hash
 * @returns Camera state if present in URL, null otherwise
 */
export const parseCameraFromURL = (): CameraState | undefined => {
	const hash = window.location.hash;
	const queryStart = hash.indexOf('?');

	if (queryStart === -1) return undefined;

	const queryString = hash.slice(Math.max(0, queryStart + 1));
	const parameters = new URLSearchParams(queryString);

	// Check if all required params are present
	const requiredParameters = ['px', 'py', 'pz', 'rx', 'ry', 'rz', 'tx', 'ty', 'tz', 'zoom'];
	const hasAllParameters = requiredParameters.every((parameter) => parameters.has(parameter));

	if (!hasAllParameters) return undefined;

	return {
		px: Number.parseFloat(parameters.get('px')!),
		py: Number.parseFloat(parameters.get('py')!),
		pz: Number.parseFloat(parameters.get('pz')!),
		rx: Number.parseFloat(parameters.get('rx')!),
		ry: Number.parseFloat(parameters.get('ry')!),
		rz: Number.parseFloat(parameters.get('rz')!),
		tx: Number.parseFloat(parameters.get('tx')!),
		ty: Number.parseFloat(parameters.get('ty')!),
		tz: Number.parseFloat(parameters.get('tz')!),
		zoom: Number.parseFloat(parameters.get('zoom')!)
	};
};

/**
 * Parse component name from URL hash
 * @returns Component name if present, null otherwise
 */
export const parseComponentFromURL = (): string | undefined => {
	const hash = window.location.hash;
	if (!hash || hash.length <= 1) return undefined;

	// Remove leading #
	let componentName = hash.slice(1);

	// Remove query params if present
	const queryStart = componentName.indexOf('?');
	if (queryStart !== -1) {
		componentName = componentName.slice(0, Math.max(0, queryStart));
	}

	return decodeURIComponent(componentName);
};

/**
 * Build URL hash with component name and optional camera state
 * @param componentName - Name of the component
 * @param cameraState - Optional camera state to include in URL
 * @returns URL hash string (including leading #)
 */
export const buildURLHash = (componentName: string, cameraState?: CameraState | null): string => {
	let hash = `#${componentName}`;

	if (cameraState) {
		const parameters = new URLSearchParams({
			px: cameraState.px.toFixed(3),
			py: cameraState.py.toFixed(3),
			pz: cameraState.pz.toFixed(3),
			rx: cameraState.rx.toFixed(3),
			ry: cameraState.ry.toFixed(3),
			rz: cameraState.rz.toFixed(3),
			tx: cameraState.tx.toFixed(3),
			ty: cameraState.ty.toFixed(3),
			tz: cameraState.tz.toFixed(3),
			zoom: cameraState.zoom.toFixed(3)
		});
		hash += `?${parameters.toString()}`;
	}

	return hash;
};

/**
 * Update URL hash without triggering page reload
 * @param componentName - Name of the component
 * @param cameraState - Optional camera state to include in URL
 */
export const updateURLHash = (
	componentName: string,
	cameraState?: CameraState | undefined
): void => {
	const recentHash = buildURLHash(componentName, cameraState);
	window.location.hash = recentHash;
};
