import { type ExpressionNode, type Sum, integer, product, sum, power } from '../../../../construction'

import { equalNodes, isInteger, isOne, subtract, numericNodeToNumber } from '../../../structural'

import { type BaseAndExponent, getBaseAndExponent, getProductFactors } from '../utils'

export function pullOutCommonSumFactors(node: Sum): ExpressionNode {
	const commonFactors = getCommonFactors(node.terms)
	if (commonFactors.length === 0) return node
	return product(...commonFactors, sum(...node.terms.map(term => removeFactors(term, commonFactors))))
}

function getCommonFactors(terms: readonly ExpressionNode[]): ExpressionNode[] {
	let commonFactors = getProductFactors(terms[0]).filter(factor => !isOne(factor)).map(getBaseAndExponent)
	for (const term of terms.slice(1)) {
		const factors = getProductFactors(term).map(getBaseAndExponent)
		commonFactors = commonFactors.flatMap(commonFactor => {
			const factor = factors.find(factor => equalNodes(factor.base, commonFactor.base, { allowOrderChanges: true }))
			if (!factor) return []
			const exponent = getCommonExponent(commonFactor, factor)
			return exponent === undefined ? [] : [{ base: factor.base, exponent }]
		})
	}
	return commonFactors.map(factor => power(factor.base, factor.exponent))
}

function getCommonExponent(a: BaseAndExponent, b: BaseAndExponent): ExpressionNode | undefined {
	if (equalNodes(a.exponent, b.exponent, { allowOrderChanges: true })) return a.exponent
	if (isInteger(a.exponent) && isInteger(b.exponent)) return integer(Math.min(numericNodeToNumber(a.exponent), numericNodeToNumber(b.exponent)))
	return undefined
}

function removeFactors(term: ExpressionNode, factorsToRemove: ExpressionNode[]): ExpressionNode {
	let factors = getProductFactors(term)
	for (const factorToRemove of factorsToRemove) {
		const removal = getBaseAndExponent(factorToRemove)
		const index = factors.findIndex(factor => equalNodes(getBaseAndExponent(factor).base, removal.base, { allowOrderChanges: true }))
		if (index === -1) throw new Error('Invalid removeFactor call: cannot remove a common factor from a term.')
		const current = getBaseAndExponent(factors[index])
		factors = factors.map((factor, factorIndex) => factorIndex === index ? power(current.base, subtract(current.exponent, removal.exponent)) : factor)
	}
	return product(...factors)
}
