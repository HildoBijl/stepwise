import { ensureInt } from '../../primitives'

// Return the greatest common divisor of integer numbers.
export function gcd(...numbers: number[]): number {
	numbers = numbers.map(n => ensureInt(n))

	// Check edge cases.
	if (numbers.length === 0) throw new RangeError('gcd requires at least one number.')
	if (numbers.length === 1) return numbers[0]
	if (numbers.length > 2) return gcd(gcd(numbers[0], numbers[1]), ...numbers.slice(2))

	// Run Euclides' algorithm.
	let a = Math.abs(numbers[0])
	let b = Math.abs(numbers[1])
	while (b > 0) {
		const c = b
		b = a % b
		a = c
	}

	// If both inputs were negative, return a negative gcd.
	if (numbers[0] < 0 && numbers[1] < 0) a = -a
	return a
}

// Return the least common multiple of integer numbers.
export function lcm(...numbers: number[]): number {
	numbers = numbers.map(n => Math.abs(ensureInt(n)))

	if (numbers.length === 0) throw new RangeError('lcm requires at least one number.')
	if (numbers.length === 1) return numbers[0]
	if (numbers.length > 2) return lcm(lcm(numbers[0], numbers[1]), ...numbers.slice(2))

	const a = numbers[0]
	const b = numbers[1]
	return a * (b / gcd(a, b))
}
