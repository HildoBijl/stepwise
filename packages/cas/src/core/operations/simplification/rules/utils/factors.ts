import { splitArray } from '@step-wise/utils'

import { type ExpressionNode, negative, recreateSignNode, sum, product, power } from '../../../../construction'

import { equalNodes, isMinus, isSignNode, isZero, isOne, isNumeric, subtract, numericNodeToNumber } from '../../../structural'

import { getBaseAndExponent, getProductFactors } from '../utils'

import { getSumTerms } from './defaults'

export function getCommonFactors(...terms: readonly ExpressionNode[]): ExpressionNode[] {
	let commonFactors = getProductFactors(terms[0]).filter(factor => !isOne(factor)).map(getBaseAndExponent)
	for (const term of terms.slice(1)) {
		const factors = getProductFactors(term).map(getBaseAndExponent)
		commonFactors = commonFactors.flatMap(commonFactor => {
			const factor = factors.find(factor => equalNodes(factor.base, commonFactor.base))
			if (!factor) return []
			const exponent = getCommonExponent(commonFactor.exponent, factor.exponent)
			return isZero(exponent) ? [] : [{ base: factor.base, exponent }]
		})
	}
	return commonFactors.map(factor => power(factor.base, factor.exponent))
}

function getCommonExponent(a: ExpressionNode, b: ExpressionNode): ExpressionNode {
	// Check edge cases.
	if (equalNodes(a, b)) return a
	if (isNumeric(a) && isNumeric(b)) return numericNodeToNumber(a) < numericNodeToNumber(b) ? a : b

	// Get the smallest constant and variable part separately.
	const [aConstantTerms, aVariableTerms] = splitArray(getSumTerms(a), isNumeric)
	const [bConstantTerms, bVariableTerms] = splitArray(getSumTerms(b), isNumeric)
	const constantSumPart = getCommonExponent(sum(...aConstantTerms), sum(...bConstantTerms)) // For the constant part, pick the smallest number.
	const variableSumPart = sum(
		...aVariableTerms.filter(aTerm => isMinus(aTerm) || bVariableTerms.some(bTerm => equalNodes(aTerm, bTerm))), // Keep negative terms. For positive terms, only keep those present in both.
		...bVariableTerms.filter(bTerm => isMinus(bTerm) && !aVariableTerms.some(aTerm => equalNodes(aTerm, bTerm))), // Add new negative terms, except those already there.
	)
	return isZero(constantSumPart) ? variableSumPart : isZero(variableSumPart) ? constantSumPart : sum(constantSumPart, variableSumPart)
}

export function removeFactors(term: ExpressionNode, factorsToRemove: ExpressionNode[]): ExpressionNode {
	if (isSignNode(term)) return recreateSignNode(term, removeFactors(term.node, factorsToRemove))
	let factors = getProductFactors(term)
	for (const factorToRemove of factorsToRemove) {
		const removal = getBaseAndExponent(factorToRemove)
		const index = factors.findIndex(factor => equalNodes(getBaseAndExponent(factor).base, removal.base))
		if (index === -1) {
			factors = [...factors, power(removal.base, negative(removal.exponent))]
		} else {
			const current = getBaseAndExponent(factors[index])
			factors = factors.map((factor, factorIndex) => factorIndex === index ? power(current.base, subtract(current.exponent, removal.exponent)) : factor)
		}
	}
	return product(...factors)
}
