export type TypeGuard<T> = (value: unknown) => value is T

// Check whether a value is an object (and not null).
export function isObject(x: unknown): x is object {
	return typeof x === 'object' && x !== null
}

// Ensure the value is an object; otherwise throw.
export function ensureObject(x: unknown): Record<string, unknown> {
	if (!isObject(x)) throw new TypeError(`Invalid input: expected an object but received type "${typeof x}".`)
	return x as Record<string, unknown>
}

// Check whether a value is boolean. (With Typescript type cast.)
export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean'
}

// Ensure a parameter is boolean; otherwise throw.
export function ensureBoolean(x: unknown): boolean {
	if (typeof x !== 'boolean') throw new TypeError(`Invalid input: expected a boolean but received type "${typeof x}".`)
	return x
}

// Check whether every enumerable own string key on an object is included in the allowed keys. Not every allowed key needs to be present.
export function hasOnlyKeys(obj: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
	return Object.keys(obj).every(key => allowedKeys.includes(key))
}
