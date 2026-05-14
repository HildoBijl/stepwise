import { type ExpressionNode, type Fraction, negative, fraction, power, product, sum } from '../../../../construction'

import { equalNodes } from '../../../structural'

import { getBaseAndExponent, getProductFactors } from '../utils'

export function mergeFractionFactors(node: Fraction): ExpressionNode {
	// Match the factors within the fraction.
	const groups: FactorGroup[] = []
	const numeratorFactors = getProductFactors(node.numerator)
	const denominatorFactors = getProductFactors(node.denominator)
	for (const factor of numeratorFactors) addFactorToGroups(groups, factor, false)
	for (const factor of denominatorFactors) addFactorToGroups(groups, factor, true)
	if (groups.length === numeratorFactors.length + denominatorFactors.length) return node

	// Assemble a new fraction with the given factors.
	const groupToFactor = (group: FactorGroup) => group.exponents.length === 1 ? group.original : power(group.base, sum(...group.exponents))
	const numerator = product(...groups.filter(group => !group.inDenominator).map(groupToFactor))
	const denominator = product(...groups.filter(group => group.inDenominator).map(groupToFactor))
	return fraction(numerator, denominator)
}

type FactorGroup = { base: ExpressionNode, exponents: ExpressionNode[], original: ExpressionNode, inDenominator: boolean }
function addFactorToGroups(groups: FactorGroup[], factor: ExpressionNode, inDenominator: boolean): void {
	const { base, exponent } = getBaseAndExponent(factor)
	const group = groups.find(group => equalNodes(group.base, base))
	if (group) group.exponents.push(group.inDenominator === inDenominator ? exponent : negative(exponent))
	else groups.push({ base, exponents: [exponent], original: factor, inDenominator })
}
