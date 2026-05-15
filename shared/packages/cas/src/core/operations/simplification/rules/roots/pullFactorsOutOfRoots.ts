import { largestPowerDivisor } from '@step-wise/math-tools'

import { type ExpressionNode, type RootLike, integer, product, power } from '../../../../construction'

import { isIntegerNode, isPower, isOne } from '../../../structural'

import { getProductFactors } from '../utils'

export function pullFactorsOutOfRoots(node: RootLike): ExpressionNode {
	if (!isIntegerNode(node.degree)) return node
	const { pulledFactor, remainder } = getPulledFactor(node.radicand, node.degree.value)
	return isOne(pulledFactor) ? node : product(...getProductFactors(pulledFactor), node.recreateWith(remainder))
}

// For an ExpressionNode like root[3](16x^8), take the radicand and root degree and find which parts can be pulled out of the root.
function getPulledFactor(radicand: ExpressionNode, degree: number): { pulledFactor: ExpressionNode, remainder: ExpressionNode } {
	const pulledFactors: ExpressionNode[] = []
	const remainderFactors: ExpressionNode[] = []
	for (const factor of getProductFactors(radicand)) {
		// Check integers.
		if (isIntegerNode(factor) && factor.value !== 0) {
			const largestPowerFactor = largestPowerDivisor(factor.value, degree)
			if (largestPowerFactor > 1) {
				pulledFactors.push(integer(Math.round(largestPowerFactor ** (1 / degree))))
				const remainingFactor = factor.value / largestPowerFactor
				if (remainingFactor !== 1) remainderFactors.push(integer(remainingFactor))
				continue
			}
		}

		// Check powers.
		if (isPower(factor) && isIntegerNode(factor.exponent)) {
			const remainingExponent = factor.exponent.value % degree
			const pulledOutExponent = (factor.exponent.value - remainingExponent) / degree
			if (pulledOutExponent !== 0) {
				pulledFactors.push(power(factor.base, pulledOutExponent))
				if (remainingExponent !== 0) remainderFactors.push(power(factor.base, remainingExponent))
				continue
			}
		}
		remainderFactors.push(factor)
	}

	return {
		pulledFactor: product(...pulledFactors),
		remainder: product(...remainderFactors),
	}
}
