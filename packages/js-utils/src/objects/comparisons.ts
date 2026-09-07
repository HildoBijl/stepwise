import { isPlainObject } from './plainnessChecks.ts'

// Check whether two objects have the same own keys with strictly equal values.
export function shallowEqualObjects(a: object, b: object): boolean {
	if (Object.is(a, b)) return true
	const aRecord = a as Record<PropertyKey, unknown>
	const bRecord = b as Record<PropertyKey, unknown>
	const aKeys = Reflect.ownKeys(a)
	const bKeys = Reflect.ownKeys(b)
	return aKeys.length === bKeys.length && aKeys.every(key => Object.prototype.hasOwnProperty.call(b, key) && Object.is(aRecord[key], bRecord[key]))
}

// Deeply compare primitives, arrays, plain objects, dates and regular expressions. Unsupported object types throw instead of producing unreliable results.
export function deepEqual(a: unknown, b: unknown): boolean {
	const aToB = new WeakMap<object, object>()
	const bToA = new WeakMap<object, object>()

	const getEnumerableKeys = (value: object): PropertyKey[] => Reflect.ownKeys(value).filter(key => Object.prototype.propertyIsEnumerable.call(value, key))
	const getObjectKind = (value: object): 'array' | 'plainObject' | 'date' | 'regExp' => {
		if (Array.isArray(value)) return 'array'
		if (isPlainObject(value)) return 'plainObject'
		if (value instanceof Date) return 'date'
		if (value instanceof RegExp) return 'regExp'
		throw new TypeError('deepEqual cannot compare this object type; only arrays, plain objects, dates and regular expressions are supported.')
	}

	const innerEquals = (x: unknown, y: unknown): boolean => {
		if (Object.is(x, y)) return true
		if (x === null || y === null || typeof x !== 'object' || typeof y !== 'object') return false

		const xKind = getObjectKind(x)
		const yKind = getObjectKind(y)
		if (xKind !== yKind) return false
		if (xKind === 'date') return Object.is((x as Date).getTime(), (y as Date).getTime())
		if (xKind === 'regExp') return (x as RegExp).source === (y as RegExp).source && (x as RegExp).flags === (y as RegExp).flags
		if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false
		if (xKind === 'array' && (x as unknown[]).length !== (y as unknown[]).length) return false

		const mappedY = aToB.get(x)
		const mappedX = bToA.get(y)
		if (mappedY !== undefined || mappedX !== undefined) return mappedY === y && mappedX === x
		aToB.set(x, y)
		bToA.set(y, x)

		const xKeys = getEnumerableKeys(x)
		const yKeys = getEnumerableKeys(y)
		if (xKeys.length !== yKeys.length) return false
		const yKeySet = new Set(yKeys)
		if (xKeys.some(key => !yKeySet.has(key))) return false

		return xKeys.every(key => innerEquals((x as Record<PropertyKey, unknown>)[key], (y as Record<PropertyKey, unknown>)[key]))
	}

	return innerEquals(a, b)
}
