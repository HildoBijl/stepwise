import { ensureInteger } from '@step-wise/js-utils'

import { getPrimeFactorization } from './primes'

// Check if a number is a perfect power.
export function isPerfectPower(number: number, exponent: number): boolean {
	number = ensureInteger(number, { safe: true })
	exponent = ensureInteger(exponent, { nonNegative: true, safe: true })

	// Basic cases.
	if (exponent === 0) return number === 1
	if (exponent === 1) return true
	if (number < 0 && exponent % 2 === 0) return false
	number = Math.abs(number)
	if (number === 0 || number === 1) return true

	const primeFactors = getPrimeFactorization(number)
	return primeFactors.every(factor => factor.exponent % exponent === 0)
}

// Check if a number is a perfect square.
export function isPerfectSquare(number: number): boolean {
	return isPerfectPower(number, 2)
}

// Return the largest factor whose given power still divides the number.
export function getLargestPerfectPowerDivisor(number: number, exponent: number): number {
	number = ensureInteger(number, { nonNegative: true, nonZero: true, safe: true })
	exponent = ensureInteger(exponent, { nonNegative: true, nonZero: true, safe: true })

	return getPrimeFactorization(number).reduce((result, factor) => result * factor.prime ** (factor.exponent - factor.exponent % exponent), 1)
}
