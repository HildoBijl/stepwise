import { isPlainObject, mapValues, preserveRefs } from '../objects'

// Resolve functions recursively inside arrays and plain objects.
export function resolveFunctions<TArgs extends unknown[]>(param: unknown, ...args: TArgs): unknown {
	const resolve = (value: unknown): unknown => {
		if (typeof value === 'function') return (value as (...args: TArgs) => unknown)(...args)
		if (Array.isArray(value) || isPlainObject(value)) return mapValues(value as any, resolve)
		return value
	}
	return preserveRefs(resolve(param), param)
}

// Resolve a function shallowly without recursing into arrays or objects.
export function resolveFunctionsShallow<TArgs extends unknown[]>(param: unknown, ...args: TArgs): unknown {
	return typeof param === 'function' ? (param as (...args: TArgs) => unknown)(...args) : param
}
