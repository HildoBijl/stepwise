import { isPlainObject, mapValues, preserveRefs } from '../objects'

// Evaluate function values recursively inside arrays and plain objects.
export function resolveFunctionValuesDeep<TArgs extends unknown[]>(value: unknown, ...args: TArgs): unknown {
	const resolve = (value: unknown): unknown => {
		if (typeof value === 'function') return (value as (...args: TArgs) => unknown)(...args)
		if (Array.isArray(value) || isPlainObject(value)) return mapValues(value as any, resolve)
		return value
	}
	return preserveRefs(resolve(value), value)
}

// Evaluate the value when it is a function; otherwise return it unchanged.
export function resolveFunctionValue<TArgs extends unknown[]>(value: unknown, ...args: TArgs): unknown {
	return typeof value === 'function' ? (value as (...args: TArgs) => unknown)(...args) : value
}
