// Check whether a value is an object (and not null).
export function isObject(x: unknown): x is object {
	return typeof x === 'object' && x !== null
}

// Check whether a value is a plain object created by {}, new Object() or Object.create. Also exclude React elements (Symbol.for('react.element')) which look like plain objects.
export function isPlainObject(x: unknown): x is Record<string, unknown> {
	if (!isObject(x)) return false

	// Allow plain objects and null-prototype objects.
	const prototype = Object.getPrototypeOf(x)
  if (prototype !== Object.prototype && prototype !== null) return false

	// Exclude React elements. If x has a $$typeof property equal to reactSymbol, it's a React element.
	try {
		const reactSymbol = Symbol.for && Symbol.for('react.element')
		if ((x as any).$$typeof === reactSymbol) return false
	} catch { } // Symbol has weird behavior in some browsers, so catch for safety.

	return true
}

// Check whether a value is a plain object and has no own enumerable keys.
export function isEmptyObject(x: unknown): x is Record<string, unknown> {
	return isPlainObject(x) && Object.keys(x).length === 0
}

// Ensure the value is an object; otherwise throw.
export function ensureObject(x: unknown): object {
	if (!isObject(x)) throw new TypeError(`Invalid input: expected an object but received type "${typeof x}".`)
	return x
}

// Ensure the value is a plain object; otherwise throw.
export function ensurePlainObject(x: unknown): Record<string, unknown> {
	if (!isPlainObject(x)) throw new TypeError(`Invalid input: expected a plain object but received type "${typeof x}".`)
	return x
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
