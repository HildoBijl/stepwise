import { ensureInt } from '../../primitives'

// Cached prime numbers.
const primes = [2, 3, 5, 7, 11]

// Return the prime number with the given index.
export function getPrime(index: number): number {
	index = ensureInt(index, true)
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
	num = ensureInt(num, true, true)
	if (num === 1) return false

	for (let i = 0; true; i++) {
		const prime = getPrime(i)
		if (prime * prime > num)
			return true
		if (num % prime === 0)
			return false
	}
}

// Return the prime factorization as exponents of consecutive primes.
export function getPrimeFactorization(num: number): number[] {
	num = ensureInt(num, true, true)
	const result: number[] = []
	for (let i = 0; num > 1; i++) {
		result[i] = 0
		const prime = getPrime(i)
		while (num % prime === 0) {
			result[i]++
			num /= prime
		}
	}
	return result
}