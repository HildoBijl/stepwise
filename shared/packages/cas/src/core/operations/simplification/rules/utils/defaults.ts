import { splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Fraction, Integer, product, fraction } from '../../../../construction'

import { isSignNode, isSum, isProduct, isFraction, isPower, isNumeric, isOne, isRootLike } from '../../../structural'

// Get all the terms in a sum, or turn it into a list if not a sum.
export function getSumTerms(node: ExpressionNode): readonly ExpressionNode[] {
	return isSum(node) ? node.terms : [node]
}

// Get all factors of a product, or turn it into a list if not a product. Remove ones.
export function getProductFactors(node: ExpressionNode): readonly ExpressionNode[] {
	return (isProduct(node) ? node.factors : [node]).filter(factor => !isOne(factor))
}

// Get the base and exponent of a power, or turn it into this if not a power.
export type BaseAndExponent = { base: ExpressionNode, exponent: ExpressionNode }
export function getBaseAndExponent(node: ExpressionNode): BaseAndExponent {
	if (isPower(node)) return { base: node.base, exponent: node.exponent }
	if (isRootLike(node)) return { base: node.radicand, exponent: fraction(1, node.degree) }
	return { base: node, exponent: Integer.one }
}

// Split an expression into two parts: a numeric part and a part that does have variables.
export function getConstantAndVariablePart(node: ExpressionNode): { constantPart: ExpressionNode, variablePart: ExpressionNode } {
	if (isNumeric(node)) {
		return { constantPart: node, variablePart: Integer.one }
	}
	if (isSignNode(node)) {
		const { constantPart, variablePart } = getConstantAndVariablePart(node.node)
		return { constantPart: node.recreateWith(constantPart), variablePart }
	}
	if (isFraction(node)) {
		const numeratorParts = getConstantAndVariablePart(node.numerator)
		const denominatorParts = getConstantAndVariablePart(node.denominator)
		return {
			constantPart: reduceFractionsWithOneDenominator(fraction(numeratorParts.constantPart, denominatorParts.constantPart)),
			variablePart: reduceFractionsWithOneDenominator(fraction(numeratorParts.variablePart, denominatorParts.variablePart)),
		}
	}
	if (isProduct(node)) {
		const [constantFactors, variableFactors] = splitArray(node.factors, isNumeric)
		return { constantPart: product(...constantFactors), variablePart: product(...variableFactors) }
	}
	return { constantPart: Integer.one, variablePart: node }
}

export function reduceFractionsWithOneDenominator(node: Fraction): ExpressionNode {
	return isOne(node.denominator) ? node.numerator : node
}
