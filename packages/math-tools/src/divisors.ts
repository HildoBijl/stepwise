import { ensureInteger } from '@step-wise/js-utils'

// Return the greatest common divisor of integer numbers.
export function gcd(...numbers: number[]): number {
	if (numbers.length === 0) throw new RangeError('gcd requires at least one number.')
	let result = 0
	for (const number of numbers) {
		let remainder = Math.abs(ensureInteger(number, { safe: true }))
		while (remainder > 0) {
			const previousRemainder = remainder
			remainder = result % remainder
			result = previousRemainder
		}
	}
	return result
}

// Return the least common multiple of integer numbers.
export function lcm(...numbers: number[]): number {
	numbers = numbers.map(n => Math.abs(ensureInteger(n, { safe: true })))
	if (numbers.length === 0) throw new RangeError('lcm requires at least one number.')
	if (numbers.some(number => number === 0)) return 0
	return numbers.reduce((result, number) => result * (number / gcd(result, number)))
}
