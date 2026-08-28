import { isObject } from './checks.ts'

/*
 * Plain objects
 */

// Check whether a value is a plain object created by {}, new Object() or Object.create. Also exclude React elements (Symbol.for('react.element')) which look like plain objects.
export function isPlainObject(x: unknown): x is Record<string, unknown> {
	if (!isObject(x)) return false

	// Allow plain objects and null-prototype objects.
	const prototype = Object.getPrototypeOf(x)
	if (prototype !== Object.prototype && prototype !== null) return false

	// Exclude React elements. If x has a $$typeof property equal to reactSymbol, it's a React element.
	try {
		const reactSymbol = Symbol.for && Symbol.for('react.element')
		if (Reflect.get(x, '$$typeof') === reactSymbol) return false
	} catch {} // Symbol has weird behavior in some browsers, so catch for safety.

	return true
}

// Check whether a value is a plain object and has no own enumerable keys.
export function isEmptyObject(x: unknown): x is Record<string, unknown> {
	return isPlainObject(x) && Object.keys(x).length === 0
}

// Ensure the value is a plain object; otherwise throw.
export function ensurePlainObject(x: unknown): Record<string, unknown> {
	if (!isPlainObject(x)) throw new TypeError(`Invalid input: expected a plain object but received type "${typeof x}".`)
	return x
}

/*
 * Plain data
 */

// Plain data consists only of primitives, arrays and plain objects, recursively.
export type PlainDataPrimitive = string | number | boolean | null
export type PlainDataValue = PlainDataPrimitive | PlainDataArray | PlainDataObject
export type PlainDataArray = PlainDataValue[]
export type PlainDataObject = { [key: string]: PlainDataValue }

// Check whether a value consists only of plain data.
export function isPlainDataValue(x: unknown): x is PlainDataValue {
	return isPlainDataValueInternal(x, new Set())
}

// Check whether a value is an array consisting only of plain data.
export function isPlainDataArray(x: unknown): x is PlainDataArray {
	return Array.isArray(x) && isPlainDataValueInternal(x, new Set())
}

// Check whether a value is a plain object consisting only of plain data.
export function isPlainDataObject(x: unknown): x is PlainDataObject {
	return isPlainObject(x) && isPlainDataValueInternal(x, new Set())
}

function isPlainDataValueInternal(x: unknown, ancestors: Set<object>): x is PlainDataValue {
	if (x === null || typeof x === 'string' || typeof x === 'boolean' || typeof x === 'number') return true
	if (!Array.isArray(x) && !isPlainObject(x)) return false
	if (ancestors.has(x)) return false

	ancestors.add(x)
	const isValid = Array.isArray(x)
		? Array.from({ length: x.length }, (_, index) => index in x && isPlainDataValueInternal(x[index], ancestors)).every(Boolean)
		: Object.values(x).every(value => isPlainDataValueInternal(value, ancestors))
	ancestors.delete(x)
	return isValid
}
