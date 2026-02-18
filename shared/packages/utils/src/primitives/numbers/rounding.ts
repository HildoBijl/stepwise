import { ensureInt } from './checks'

// Round a number to the given number of decimals.
export function roundTo(x: number, decimals = 0): number {
	decimals = ensureInt(decimals)

	// Check boundary cases.
	if (!Number.isFinite(x)) return x
	if (!Number.isFinite(decimals)) return (decimals > 0 ? x : 0)

	// Perform rounding.
	return Math.round(x * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

// Round a number to the given number of significant digits.
export function roundToDigits(x: number, digits: number): number {
	digits = ensureInt(digits, true)

	// Boundary cases.
	if (x === 0) return 0
	if (!Number.isFinite(x)) return x
	if (digits === 0) return 0
	if (digits === Infinity) return x

	// Calculate how many decimals we need to round to, and apply the rounding.
	const decimals = digits - Math.floor(Math.log10(Math.abs(x))) - 1
	return roundTo(x, decimals)
}
