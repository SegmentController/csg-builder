import type { Solid } from './3d/Solid';

const cache: Record<string, Solid> = {};

const createCacheKey = (functionName: string, arguments_: unknown[]): string =>
	`${functionName}:${JSON.stringify(arguments_)}`;

export const cacheInlineFunction = <T extends (...arguments_: Parameters<T>) => Solid>(
	functionName: string,
	function_: T
): T => {
	if (!functionName)
		throw new Error('cacheInlineFunction requires a function name for caching purposes');

	return ((...arguments_: Parameters<T>) => {
		const cacheKey = createCacheKey(functionName, arguments_);

		if (cacheKey in cache) return cache[cacheKey];

		const result = function_(...arguments_);
		cache[cacheKey] = result;
		return result;
	}) as T;
};

export const cacheFunction = <T extends (...arguments_: Parameters<T>) => Solid>(function_: T): T =>
	cacheInlineFunction(function_.name, function_);
