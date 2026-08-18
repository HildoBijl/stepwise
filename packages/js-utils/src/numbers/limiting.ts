import { ensureNumber } from './checks'

// Extend the Javascript modulus function to guarantee a result between 0 (inclusive) and n (exclusive).
export function mod(a: number, n: number): number {
	a = ensureNumber(a)
	n = ensureNumber(n)
	if (n <= 0) throw new RangeError(`Input error: modulus must be positive, but received "${n}".`)
	return ((a % n) + n) % n
}

// Clamp the given number between the minimum (default 0) and maximum (default 1).
export function clamp(x: number, min = 0, max = 1): number {
	x = ensureNumber(x, { allowInfinity: true })
	min = ensureNumber(min, { allowInfinity: true })
	max = ensureNumber(max, { allowInfinity: true })
	if (min > max) throw new RangeError('Input error: minimum cannot exceed maximum.')
	return Math.max(Math.min(x, max), min)
}

export type IsBetweenOptions = {
	inclusive?: boolean
}

// Check whether the given number is between the minimum and maximum.
export function isBetween(value: number, min = 0, max = 1, options: IsBetweenOptions = {}): boolean {
	const { inclusive = true } = options
	value = ensureNumber(value, { allowInfinity: true })
	min = ensureNumber(min, { allowInfinity: true })
	max = ensureNumber(max, { allowInfinity: true })
	if (min > max) throw new RangeError('Input error: minimum cannot exceed maximum.')
	if (typeof inclusive !== 'boolean') throw new TypeError(`Input error: inclusive must be a boolean, but received type "${typeof inclusive}".`)
	return inclusive ? (value >= min && value <= max) : (value > min && value < max)
}
import { isNumber } from './checks'
