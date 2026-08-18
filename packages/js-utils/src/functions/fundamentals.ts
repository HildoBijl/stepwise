// Do nothing.
export function noop(): void { }

// Return the first parameter unchanged.
export function identity<T>(x: T): T {
	return x
}

export type Callable = (...args: never[]) => unknown

// Ensure the given value is a function.
export function ensureFunction<T extends Callable>(fn: T): T
export function ensureFunction(fn: unknown): Callable
export function ensureFunction(fn: unknown): Callable {
	if (typeof fn !== 'function') throw new TypeError(`Input error: expected a function but received type "${typeof fn}".`)
	return fn as Callable
}
