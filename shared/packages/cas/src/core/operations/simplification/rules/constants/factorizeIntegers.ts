import { sum } from '@step-wise/utils'
import { getPrime, getPrimeFactorization } from '@step-wise/math-tools'

import { Integer, Product, Power } from '../../../../construction'

export function factorizeIntegers(node: Integer): Integer | Product | Power {
	// Check out trivial cases.
	if (Math.abs(node.value) <= 3) return node
	const primeFactors = getPrimeFactorization(node.value)
	if (sum(primeFactors) <= 1) return node

	// Assemble factors.
	const factors = primeFactors.flatMap((exponent, index): (Integer | Power)[] => {
		if (exponent === 0) return []
		const prime = new Integer(getPrime(index))
		return exponent === 1 ? [prime] : [new Power(prime, new Integer(exponent))]
	})
	if (factors.length === 1) return factors[0]
	return new Product(factors)
}
