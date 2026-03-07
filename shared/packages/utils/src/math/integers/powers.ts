import { ensureInt } from '../../primitives'

import { getPrime, getPrimeFactorization } from './primes'

// Check if a number is a perfect power.
export function isPerfectPower(num: number, exponent: number): boolean {
	num = ensureInt(num)
	exponent = ensureInt(exponent, true)

	// Basic cases.
	if (exponent === 0) return num === 1
	if (exponent === 1) return true
	if (num < 0 && exponent % 2 === 0) return false
	num = Math.abs(num)
	if (num === 0 || num === 1) return true

	const primeFactors = getPrimeFactorization(num)
	return primeFactors.every(n => n % exponent === 0)
}

// Check if a number is a perfect square.
export function isSquare(num: number): boolean {
	return isPerfectPower(num, 2)
}

// Return the largest factor whose given power still divides the number.
export function largestPowerDivisor(num: number, power: number): number {
	num = ensureInt(num, true, true)
	power = ensureInt(power, true, true)

	const primeFactors = getPrimeFactorization(num)
	const filtered = primeFactors.map(p => p - (p % power))
	return filtered.reduce((result, primePower, index) => result * getPrime(index) ** primePower, 1)
}
