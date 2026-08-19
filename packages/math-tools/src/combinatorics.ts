import { ensureInteger, integerRange } from '@step-wise/js-utils'

// Cached factorial values, indexed by their argument.
const factorialCache = [1]

// Cached factorial ratios, indexed by numerator and denominator.
const factorialRatioCache: Record<number, Record<number, number>> = {}

// Calculate n!.
export function factorial(n: number): number {
	n = ensureInteger(n, { nonNegative: true, safe: true })
	for (let value = factorialCache.length; value <= n; value++) factorialCache[value] = factorialCache[value - 1] * value
	return factorialCache[n]
}

// Calculate n! / denominator! without separately calculating the two factorials.
export function factorialRatio(n: number, d: number): number {
	n = ensureInteger(n, { nonNegative: true, safe: true })
	d = ensureInteger(d, { nonNegative: true, safe: true })
	if (n < d) throw new RangeError(`Invalid input: factorialRatio requires n >= denominator but received n=${n} and denominator=${d}.`)
	if (d <= 1) return factorial(n)
	if (!factorialRatioCache[n]) factorialRatioCache[n] = {}
	if (factorialRatioCache[n][d] === undefined) factorialRatioCache[n][d] = integerRange(n, d + 1).reduce((result, value) => result * value, 1)
	return factorialRatioCache[n][d]
}

// Cached binomial coefficients.
const binomialCoefficientCache: Record<number, Record<number, number>> = {}

// Calculate the binomial coefficient n choose k.
export function binomialCoefficient(n: number, k: number): number {
	n = ensureInteger(n, { nonNegative: true, safe: true })
	k = ensureInteger(k, { nonNegative: true, safe: true })
	if (n < k) throw new RangeError(`Invalid input: binomialCoefficient requires n >= k but received n=${n} and k=${k}.`)

	if (k > n - k) k = n - k
	if (!binomialCoefficientCache[n]) binomialCoefficientCache[n] = {}
	if (binomialCoefficientCache[n][k] === undefined) {
		let result = 1
		for (let index = 1; index <= k; index++) result *= (n - k + index) / index
		binomialCoefficientCache[n][k] = result
	}
	return binomialCoefficientCache[n][k]
}
