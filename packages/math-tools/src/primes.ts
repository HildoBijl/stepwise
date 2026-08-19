import { ensureInteger } from '@step-wise/js-utils'

// Cached prime numbers.
const primes = [2, 3, 5, 7, 11]

// Return the prime number with the given index.
export function getPrime(index: number): number {
	index = ensureInteger(index, { nonNegative: true, safe: true })
	while (index >= primes.length) {
		let candidate = primes[primes.length - 1] + 2
		while (!isPrime(candidate))
			candidate += 2
		primes.push(candidate)
	}
	return primes[index]
}

// Check if a number is prime.
export function isPrime(num: number): boolean {
	num = ensureInteger(num, { nonNegative: true, nonZero: true, safe: true })
	if (num === 1) return false

	for (let i = 0; true; i++) {
		const prime = getPrime(i)
		if (prime * prime > num)
			return true
		if (num % prime === 0)
			return false
	}
}

export type PrimeFactor = {
	prime: number
	exponent: number
}

// Return the prime factorization as prime-exponent entries.
export function getPrimeFactorization(num: number): PrimeFactor[] {
	num = ensureInteger(num, { nonNegative: true, nonZero: true, safe: true })
	const result: PrimeFactor[] = []
	for (let i = 0; num > 1; i++) {
		const prime = getPrime(i)
		if (prime ** 2 > num) {
			result.push({ prime: num, exponent: 1 })
			break
		}

		let exponent = 0
		while (num % prime === 0) {
			exponent++
			num /= prime
		}
		if (exponent > 0) result.push({ prime, exponent })
	}
	return result
}
