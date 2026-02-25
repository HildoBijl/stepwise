import { isPlainObject } from './checks'
import { deepEquals } from './comparisons'
import { fromKeys } from './creation'

// Set a nested property (creates intermediate objects/arrays as needed). Return a shallow-cloned object/array with the modification; original input is not mutated.
export function setByPath<T = unknown>(input: unknown, path: string[], value: T): unknown {
	if (!Array.isArray(path)) throw new TypeError('setByPath: path must be an array of strings')
	if (path.length === 0) return input

	// Create a shallow clone of the input so we don't mutate the original.
	let obj: any
	if (Array.isArray(input)) obj = [...input]
	else if (isPlainObject(input)) obj = { ...(input as Record<string, unknown>) }
	else obj = {}

	// If this is the last key, assign directly.
	const [first, ...rest] = path
	if (rest.length === 0) {
		obj[first] = value
		return obj
	}

	// Recurse: ensure the child exists and is an object/array-ish value.
	const child = obj[first]
	obj[first] = setByPath(child, rest, value)
	return obj
}

// Apply a mapping function to a plain object (maps values) or array (maps elements).
export function mapValues<T, U>(input: Record<string, T>, mapper: (value: T, key: string, result: Record<string, U>) => U): Record<string, U>
export function mapValues<T, U>(input: T[], mapper: (value: T, index: number, result: U[]) => U): U[]
export function mapValues<T = unknown, U = unknown>(input: T[] | Record<string, T>, mapper: (value: T, key: any, result: any) => U): U[] | Record<string, U> {
	// Array case.
	if (Array.isArray(input)) {
		const m = mapper as (value: T, index: number, result: U[]) => U
		const result: U[] = new Array(input.length)
		for (let i = 0; i < input.length; i++) result[i] = m(input[i], i, result) as U
		return result
	}

	// Plain object case.
	if (isPlainObject(input)) {
		const m = mapper as (value: T, key: string, result: Record<string, U>) => U
		const keys = Object.keys(input)
		return fromKeys<U>(keys, (key, _, result) => m((input as any)[key], key, result))
	}

	// Any other case.
	throw new TypeError(`mapValues: expected plain object or array but received type "${typeof input}"`)
}

// Try to preserve references from oldValue where possible. If newValue deepEquals oldValue, return oldValue (keep reference). If both are arrays or plain objects, recursively attempt to preserve child references. Otherwise return newValue.
export function ensureConsistency<T = unknown>(newValue: T, oldValue: T): T {
	// If deeply equal, reuse old reference.
	if (deepEquals(newValue, oldValue)) return oldValue

	// If both are arrays or both are plain objects, recurse into children.
	if (Array.isArray(newValue) && Array.isArray(oldValue)) return (mapValues(newValue as any[], (v, i) => ensureConsistency(v, (oldValue as any[])[i])) as unknown) as T
	if (isPlainObject(newValue) && isPlainObject(oldValue)) return (mapValues(newValue as Record<string, any>, (v, k) => ensureConsistency(v, (oldValue as any)[k])) as unknown) as T

	// Fallback: cannot reconcile deeper; return new value.
	return newValue
}

// Pick properties (allowedKeys) from obj.
export function filterProperties(obj: Record<string, unknown>, allowedKeys: string[]): Record<string, unknown> {
	if (!isPlainObject(obj)) throw new TypeError('filterProperties: obj must be a plain object')
	const res: Record<string, unknown> = {}
	for (const key of allowedKeys) if (obj[key] !== undefined) res[key] = obj[key]
	return res
}

// Keep only the options whose keys are present in allowedOptions.
export function filterOptions(allOptions: Record<string, unknown>, allowedOptions: Record<string, unknown>): Record<string, unknown> {
	if (!isPlainObject(allowedOptions)) throw new TypeError('filterOptions: allowedOptions must be a plain object')
	return filterProperties(allOptions, Object.keys(allowedOptions))
}

// Omit properties (keysToRemove) from obj and return a shallow clone without those keys.
export function omitProperties<T extends Record<string, unknown>>(obj: T, keysToRemove: string[]): Partial<T> {
	if (!isPlainObject(obj)) throw new TypeError('omitProperties: obj must be a plain object')
	const res = { ...obj }
	for (const k of keysToRemove) delete (res as any)[k]
	return res
}

// Remove properties from obj that are equal (===) to those in comparison. Returns a shallow copy where equal properties are omitted.
export function omitEqualProperties<T extends Record<string, unknown>>(obj: T, comparison: Record<string, unknown>): Partial<T> {
	if (!isPlainObject(comparison)) throw new TypeError('omitEqualProperties: comparison must be a plain object')
	return mapValues(obj, (value, key) => value === comparison[key] ? undefined : value) as Partial<T>
}

// Normalize given options by applying defaults and optionally filtering unknown keys. givenOptions must be an object. defaultOptions must be an object describing allowed keys and defaults. When filterStrangers is false (default) then unknown keys throw; otherwise (on true) they are merely removed.
export function normalizeOptions<T extends Record<string, unknown>>(givenOptions: Record<string, unknown>, defaultOptions: T, filterStrangers = false): T {
	// Check the input.
	if (!isPlainObject(givenOptions)) throw new TypeError('normalizeOptions: givenOptions must be an object')
	if (!isPlainObject(defaultOptions)) throw new TypeError('normalizeOptions: defaultOptions must be an object')

	// Remove unknown keys if requested.
	if (filterStrangers) {
		givenOptions = filterOptions(givenOptions, defaultOptions)
	} else {
		Object.keys(givenOptions).forEach(key => {
			if (!Object.prototype.hasOwnProperty.call(defaultOptions, key))
				throw new Error(`Invalid option: "${key}" is not a recognized option`)
		})
	}

	// Merge defaults into the given options.
	const result: Record<string, unknown> = { ...givenOptions }
	for (const key of Object.keys(defaultOptions)) {
		if (result[key] === undefined && (defaultOptions as any)[key] !== undefined)
			result[key] = (defaultOptions as any)[key]
	}

	return result as T
}
