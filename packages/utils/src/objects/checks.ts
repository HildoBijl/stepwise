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

// Get the parent (prototype) of a class or object. For classes, pass the class itself (constructor function). For objects, pass the object Returns the prototype (or parent constructor) or null if none.
export function getParentClass(subject: Function | object): any {
	return Object.getPrototypeOf(subject)
}

// Check if an object only has the given keys (possibly only some of them) and not any other.
export function onlyHasKeys(obj: Record<string, unknown>, keys: string[]): boolean {
	return Object.keys(obj).every(key => keys.includes(key))
}
