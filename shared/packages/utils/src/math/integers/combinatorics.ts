import { ensureInt, integerRange } from '../../primitives'

// Memoized factorial values.
const factorialMemoization: Record<number, Record<number, number>> = {}

// Calculate n!. If nEnd is given, calculate n! / nEnd!.
export function factorial(n: number, nEnd: number = 0): number {
	// Check input.
	n = ensureInt(n, true)
	nEnd = ensureInt(nEnd, true)
	if (n < nEnd) throw new RangeError(`Invalid input: factorial requires n >= ${nEnd} but received ${n}.`)

	// Extend memoization if needed.
	if (!factorialMemoization[n]) factorialMemoization[n] = {}
	if (factorialMemoization[n][nEnd] === undefined) {
		if (n === 0 || n === nEnd) factorialMemoization[n][nEnd] = 1
		else factorialMemoization[n][nEnd] = integerRange(n, nEnd + 1).reduce((f, x) => f * x, 1)
	}

	// Return result.
	return factorialMemoization[n][nEnd]
}

// Memoized binomial values.
const binomialMemoization: Record<number, Record<number, number>> = {}

// Calculate the binomial coefficient a choose b.
export function binomial(a: number, b: number): number {
	// Check input.
	a = ensureInt(a, true)
	b = ensureInt(b, true)
	if (a < b) throw new RangeError(`Invalid input: binomial requires a >= b but received a=${a} and b=${b}.`)

	// Extend memoization if needed.
	if (b > a - b) b = a - b
	if (!binomialMemoization[a]) binomialMemoization[a] = {}
	if (binomialMemoization[a][b] === undefined) binomialMemoization[a][b] = factorial(a, a - b) / factorial(b)

	// Return result.
	return binomialMemoization[a][b]
}