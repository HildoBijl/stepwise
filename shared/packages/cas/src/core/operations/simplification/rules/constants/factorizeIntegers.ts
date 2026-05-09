import { sum } from '@step-wise/utils'
import { getPrime, getPrimeFactorization } from '@step-wise/math-tools'

import { type ExpressionNode, type Integer, integer, product, power } from '../../../../construction'

export function factorizeIntegers(node: Integer): ExpressionNode {
	// Check out trivial cases.
	if (Math.abs(node.value) <= 3) return node
	const primeFactors = getPrimeFactorization(node.value)
	if (sum(primeFactors) <= 1) return node

	// Assemble factors.
	const factors = primeFactors.flatMap((exponent, index) => {
		if (exponent === 0) return []
		const prime = integer(getPrime(index))
		return exponent === 1 ? [prime] : [power(prime, integer(exponent))]
	})
	return product(...factors)
}
