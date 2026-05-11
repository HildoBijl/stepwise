import { largestPowerDivisor } from '@step-wise/math-tools'

import { type ExpressionNode, integer, product, power } from '../../../../construction'

import { isIntegerNode, isPower, isOne } from '../../../structural'

import { type RootLike, getProductFactors, recreateRootLike } from '../utils'

export function pullFactorsOutOfRoots(node: RootLike): ExpressionNode {
	if (!isIntegerNode(node.base)) return node
	const { pulledFactor, remainder } = getPulledFactor(node.argument, node.base.value)
	return isOne(pulledFactor) ? node : product(...getProductFactors(pulledFactor), recreateRootLike(node, remainder))
}

// For an ExpressionNode like root[3](16x^8), take the argument and root base and find which parts can be pulled out of the root.
function getPulledFactor(argument: ExpressionNode, rootBase: number): { pulledFactor: ExpressionNode, remainder: ExpressionNode } {
	const pulledFactors: ExpressionNode[] = []
	const remainderFactors: ExpressionNode[] = []
	for (const factor of getProductFactors(argument)) {
		// Check integers.
		if (isIntegerNode(factor) && factor.value !== 0) {
			const largestPowerFactor = largestPowerDivisor(factor.value, rootBase)
			if (largestPowerFactor > 1) {
				pulledFactors.push(integer(Math.round(largestPowerFactor ** (1 / rootBase))))
				const remainingFactor = factor.value / largestPowerFactor
				if (remainingFactor !== 1) remainderFactors.push(integer(remainingFactor))
				continue
			}
		}

		// Check powers.
		if (isPower(factor) && isIntegerNode(factor.exponent)) {
			const remainingExponent = factor.exponent.value % rootBase
			const pulledOutExponent = (factor.exponent.value - remainingExponent) / rootBase
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
