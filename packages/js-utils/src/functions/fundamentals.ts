// Do nothing.
export function noop(): void {}

// Return the first parameter unchanged.
export function identity<T>(x: T): T {
	return x
}

// Ensure the given value is a function.
export function ensureFunction<T extends Function>(fn: T): T
export function ensureFunction(fn: unknown): Function
export function ensureFunction(fn: unknown): Function {
	if (typeof fn !== 'function')
		throw new TypeError(`Input error: expected a function but received type "${typeof fn}".`)
	return fn
}
