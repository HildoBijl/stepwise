import { getPrimeFactorization } from '@step-wise/math-tools'
import { sum } from '@step-wise/js-utils'

import { Integer, Product, Power } from '../../../../construction'

import { isIntegerNode, isPower } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { mergeProductNumbers, reduceNumberPowers } from '../numeric'

function transform(node: Integer): Integer | Product | Power {
	// Check out trivial cases.
	if (node.value <= 3) return node
	const primeFactors = getPrimeFactorization(node.value)
	if (sum(primeFactors.map(factor => factor.exponent)) <= 1) return node

	// Assemble factors.
	const factors = primeFactors.map(({ prime, exponent }): Integer | Power => {
		const primeNode = new Integer(prime)
		return exponent === 1 ? primeNode : new Power(primeNode, new Integer(exponent))
	})
	if (factors.length === 1) return factors[0]
	return new Product(factors)
}

export const factorizeIntegers = defineRule({
	name: 'factorizeIntegers',
	appliesTo: (node, context): node is Parameters<typeof transform>[0] => isIntegerNode(node) && !context.parents.some((parent, index) => isPower(parent) && isIntegerNode(parent.base) && parent.exponent === (context.parents[index + 1] ?? node)),
	transform,
	conflictsWith: [mergeProductNumbers, reduceNumberPowers],
})
