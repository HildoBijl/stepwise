import { ensureInteger } from '@step-wise/js-utils'

// Cached prime numbers.
const cachedPrimes = [2, 3, 5, 7, 11]

// Return the prime number with the given index.
export function getPrimeByIndex(index: number): number {
	index = ensureInteger(index, { nonNegative: true, safe: true })
	while (index >= cachedPrimes.length) {
		let candidate = cachedPrimes[cachedPrimes.length - 1] + 2
		while (!isPrime(candidate)) candidate += 2
		cachedPrimes.push(candidate)
	}
	return cachedPrimes[index]
}

// Check if a number is prime.
export function isPrime(number: number): boolean {
	number = ensureInteger(number, { nonNegative: true, nonZero: true, safe: true })
	if (number === 1) return false
	for (let index = 0; true; index++) {
		const prime = getPrimeByIndex(index)
		if (prime * prime > number) return true
		if (number % prime === 0) return false
	}
}

export type PrimeFactorizationEntry = {
	prime: number
	exponent: number
}

// Return the prime factorization as prime-exponent entries.
export function getPrimeFactorization(number: number): PrimeFactorizationEntry[] {
	number = ensureInteger(number, { nonNegative: true, nonZero: true, safe: true })
	const result: PrimeFactorizationEntry[] = []
	for (let index = 0; number > 1; index++) {
		const prime = getPrimeByIndex(index)
		if (prime ** 2 > number) {
			result.push({ prime: number, exponent: 1 })
			break
		}

		let exponent = 0
		while (number % prime === 0) {
			exponent++
			number /= prime
		}
		if (exponent > 0) result.push({ prime, exponent })
	}
	return result
}
