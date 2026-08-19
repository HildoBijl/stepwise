import { ensureInteger } from '@step-wise/js-utils'

import { getPrimeFactorization } from './primes'

// Check if a number is a perfect power.
export function isPerfectPower(num: number, exponent: number): boolean {
	num = ensureInteger(num)
	exponent = ensureInteger(exponent, { nonNegative: true })

	// Basic cases.
	if (exponent === 0) return num === 1
	if (exponent === 1) return true
	if (num < 0 && exponent % 2 === 0) return false
	num = Math.abs(num)
	if (num === 0 || num === 1) return true

	const primeFactors = getPrimeFactorization(num)
	return primeFactors.every(factor => factor.exponent % exponent === 0)
}

// Check if a number is a perfect square.
export function isSquare(num: number): boolean {
	return isPerfectPower(num, 2)
}

// Return the largest factor whose given power still divides the number.
export function largestPowerDivisor(num: number, power: number): number {
	num = ensureInteger(num, { nonNegative: true, nonZero: true })
	power = ensureInteger(power, { nonNegative: true, nonZero: true })

	return getPrimeFactorization(num).reduce((result, factor) => result * factor.prime ** (factor.exponent - factor.exponent % power), 1)
}
