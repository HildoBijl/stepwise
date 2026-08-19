import { isPlainObject } from './plainnessChecks'
import { deepEqual } from './comparisons'
import { fromKeys } from './creation'

// Apply a mapping function to a plain object (maps values) or array (maps elements).
export function mapValues<T, U>(input: Record<string, T>, mapper: (value: T, key: string, result: Record<string, U>) => U | undefined): Record<string, U>
export function mapValues<T, U>(input: readonly T[], mapper: (value: T, index: number, result: U[]) => U): U[]
export function mapValues<T = unknown, U = unknown>(input: readonly T[] | Record<string, T>, mapper: unknown): U[] | Record<string, U> {
	if (typeof mapper !== 'function') throw new TypeError('mapValues: mapper must be a function')

	// Array case.
	if (Array.isArray(input)) {
		const arrayMapper = mapper as (value: T, index: number, result: U[]) => U
		const result: U[] = new Array(input.length)
		for (let i = 0; i < input.length; i++) result[i] = arrayMapper(input[i], i, result)
		return result
	}

	// Plain object case.
	if (isPlainObject(input)) {
		const objectMapper = mapper as (value: T, key: string, result: Record<string, U>) => U | undefined
		const objectInput = input as Record<string, T>
		return fromKeys<U>(Object.keys(objectInput), (key, _, result) => objectMapper(objectInput[key], key, result))
	}

	// Any other case.
	throw new TypeError(`mapValues: expected plain object or array but received type "${typeof input}"`)
}

// Try to preserve references from oldValue where possible. If newValue is deeply equal to oldValue, return oldValue (keep reference). If both are arrays or plain objects, recursively attempt to preserve child references. Otherwise return newValue.
export function preserveRefs<T = unknown>(newValue: T, oldValue: T): T {
	// If deeply equal, reuse old reference.
	if (deepEqual(newValue, oldValue)) return oldValue

	// If both are arrays or both are plain objects, recurse into children.
	if (Array.isArray(newValue) && Array.isArray(oldValue)) {
		const newArray = newValue as readonly unknown[]
		const oldArray = oldValue as readonly unknown[]
		return mapValues(newArray, (value, index) => preserveRefs(value, oldArray[index])) as unknown as T
	}
	if (isPlainObject(newValue) && isPlainObject(oldValue)) {
		return mapValues(newValue, (value, key) => preserveRefs(value, oldValue[key])) as unknown as T
	}

	// Fallback: cannot reconcile deeper; return new value.
	return newValue
}

// Pick properties (allowedKeys) from obj.
export function pickKeys<T>(obj: Record<string, T>, allowedKeys: readonly string[]): Record<string, T> {
	if (!isPlainObject(obj)) throw new TypeError('pickKeys: obj must be a plain object')
	const res: Record<string, T> = {}
	for (const key of allowedKeys) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) Object.defineProperty(res, key, { value: obj[key], enumerable: true, configurable: true, writable: true })
	}
	return res
}

// Keep only the options whose keys are present in allowedOptions.
export function pickFromDefaults(allOptions: Record<string, unknown>, allowedOptions: Record<string, unknown>): Record<string, unknown> {
	if (!isPlainObject(allowedOptions)) throw new TypeError('pickFromDefaults: allowedOptions must be a plain object')
	return pickKeys(allOptions, Object.keys(allowedOptions))
}

// Omit properties (keysToRemove) from obj and return a shallow clone without those keys.
export function omitKeys<T extends Record<string, unknown>>(obj: T, keysToRemove: readonly string[]): Partial<T> {
	if (!isPlainObject(obj)) throw new TypeError('omitKeys: obj must be a plain object')
	const result: Record<string, unknown> = { ...obj }
	for (const key of keysToRemove) delete result[key]
	return result as Partial<T>
}

// Remove properties from obj that are equal (===) to those in comparison. Returns a shallow copy where equal properties are omitted.
export function omitDefaults<T extends Record<string, unknown>>(obj: T, comparison: Record<string, unknown>): Partial<T> {
	if (!isPlainObject(comparison)) throw new TypeError('omitDefaults: comparison must be a plain object')
	return mapValues(obj, (value, key) => value === comparison[key] ? undefined : value) as Partial<T>
}

export interface MergeDefaultsOptions {
	filterUnknownKeys?: boolean
}

// Normalize given options by applying defaults. Unknown keys throw by default, or can optionally be filtered out.
export function mergeDefaults<T extends Record<string, unknown>>(givenOptions: Record<string, unknown>, defaultOptions: T, options: MergeDefaultsOptions = {}): T {
	// Check the input.
	if (!isPlainObject(givenOptions)) throw new TypeError('mergeDefaults: givenOptions must be an object')
	if (!isPlainObject(defaultOptions)) throw new TypeError('mergeDefaults: defaultOptions must be an object')
	const { filterUnknownKeys = false } = options

	// Remove unknown keys if requested.
	if (filterUnknownKeys) {
		givenOptions = pickFromDefaults(givenOptions, defaultOptions)
	} else {
		Object.keys(givenOptions).forEach(key => {
			if (!Object.prototype.hasOwnProperty.call(defaultOptions, key)) throw new Error(`Invalid option: "${key}" is not a recognized option`)
		})
	}

	// Merge defaults into the given options.
	const result: Record<string, unknown> = { ...givenOptions }
	const keys = Object.keys(defaultOptions)
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		if (result[key] === undefined && defaultOptions[key] !== undefined) result[key] = defaultOptions[key]
	}

	return result as T
}

// Filter properties of an object, to only keep those satisfying a condition.
export function filterProperties<T extends Record<string, unknown>>(obj: T, filter: (value: T[keyof T], key: keyof T, obj: T) => boolean): Partial<T> {
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => filter(value as T[keyof T], key as keyof T, obj))) as Partial<T>
}
