// Deep equality check between two values.
export function deepEquals(a: unknown, b: unknown): boolean {
	// Quick check for simple non-object cases. Returns boolean when conclusive, otherwise undefined.
	const quickCheck = (x: any, y: any): boolean | undefined => {
		// Fast path: same reference (also covers primitives).
		if (x === y) return true

		// Handle NaN (NaN !== NaN, but considered equal here).
		if (typeof x === 'number' && typeof y === 'number' && Number.isNaN(x) && Number.isNaN(y)) return true

		// Compare types quickly.
		const typeX = typeof x
		const typeY = typeof y
		if (typeX !== typeY) return false

		// Handle primitives (string, number (non-NaN), boolean, symbol, undefined).
		if (x === null || y === null) return false
		if (typeX !== 'object') return x === y

		// Not conclusive for objects.
		return undefined
	}

	// Run the basic check. If it's conclusive, return this. This may save us from having to set up a weak set and running recursion.
	const quickCheckResult = quickCheck(a, b)
	if (quickCheckResult !== undefined) return quickCheckResult

	// Do a recursive traversal with cycle detection. Use a WeakMap<object, WeakSet<object>> to remember visited (a -> set of b's we've compared with).
	const visited = new WeakMap<object, WeakSet<object>>()
	const innerEquals = (x: any, y: any): boolean => {
		// Run the basic check. If it's conclusive, return this.
		const quickCheckResult = quickCheck(x, y)
		if (quickCheckResult !== undefined) return quickCheckResult

		// Now we know both are objects (non-null). Check special-case Dates and RegExps.
		if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime()
		if (x instanceof RegExp && y instanceof RegExp) return x.source === y.source && x.flags === y.flags

		// Cycle detection: have we already compared this pair?
		let mapped = visited.get(x)
		if (mapped && mapped.has(y)) return true
		if (!mapped) {
			mapped = new WeakSet()
			visited.set(x, mapped)
		}
		mapped.add(y)

		// Arrays: compare length, then compare each element.
		if (Array.isArray(x) && Array.isArray(y)) {
			if (x.length !== y.length) return false
			for (let i = 0; i < x.length; i++) {
				if (!innerEquals(x[i], y[i])) return false
			}
			return true
		}

		// If one is an array and the other is not -> not equal.
		if (Array.isArray(x) !== Array.isArray(y)) return false

		// Make sure prototypes match. This avoids considering objects of different classes equal.
		if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false

		// Plain enumerable own-property keys check.
		const xKeys = Object.keys(x)
		const yKeys = Object.keys(y)
		if (xKeys.length !== yKeys.length) return false

		// Use a Set for y keys for O(1) lookups.
		const yKeySet = new Set(yKeys)
		for (const k of xKeys) if (!yKeySet.has(k)) return false

		// Deep-compare each property.
		for (const k of xKeys) if (!innerEquals(x[k], y[k])) return false

		// No reason found for inequality.
		return true
	}

	// Recursively call the checking function.
	return innerEquals(a, b)
}
