import { isPlainObject } from './plainnessChecks.ts'

export type PropertyPath = readonly (string | number)[]

function ensurePropertyPath(path: unknown, functionName: string): asserts path is PropertyPath {
	if (!Array.isArray(path) || path.some(key => typeof key !== 'string' && typeof key !== 'number')) throw new TypeError(`${functionName}: path must be an array of strings and numbers`)
}

// Get a nested value through a path like ['x', 'y', 'z'] -> obj.x.y.z.
export function getByPath(obj: unknown, path: PropertyPath): unknown {
	ensurePropertyPath(path, 'getByPath')

	// Walk down the path. Stop early on a dead end.
	let result: unknown = obj
	for (const key of path) {
		if ((typeof result !== 'object' && typeof result !== 'function') || result === null) return undefined
		result = Reflect.get(result, key)
	}
	return result
}

// Set a nested property in a plain object or array, creating missing containers as needed. Return a copy with the modification; original input is not mutated.
export function setByPath<T = unknown>(input: unknown, path: PropertyPath, value: T): unknown {
	if (!Array.isArray(input) && !isPlainObject(input)) throw new TypeError('setByPath: input and existing values along the path must be plain objects or arrays')
	ensurePropertyPath(path, 'setByPath')
	if (path.length === 0) return value

	// Create a shallow clone of the input so we don't mutate the original.
	const result: unknown[] | Record<string, unknown> = Array.isArray(input) ? [...input] : { ...input }

	// If this is the last key, assign directly.
	const [first, ...rest] = path
	if (rest.length === 0) {
		Object.defineProperty(result, first, { value, enumerable: true, configurable: true, writable: true })
		return result
	}

	// Recurse, creating a suitable child container when one is missing.
	const hasChild = Object.prototype.hasOwnProperty.call(result, first)
	const existingChild = hasChild ? Reflect.get(result, first) : undefined
	const child = existingChild === undefined ? (typeof rest[0] === 'number' ? [] : {}) : existingChild
	Object.defineProperty(result, first, { value: setByPath(child, rest, value), enumerable: true, configurable: true, writable: true })
	return result
}
