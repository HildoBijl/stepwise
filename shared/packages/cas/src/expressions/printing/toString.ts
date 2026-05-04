import { decimalSeparator } from '../../settings'

import { ExpressionNode, Constant, PlusMinus, Variable, Sum, Product, Power, isMinusOne, isPlusMinus } from '../nodes'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusInSum, requiresTimesAfterInProduct, requiresTimesBeforeInProduct } from './listSupport'

export function toString(node: ExpressionNode) {
	if (node instanceof Constant) return constantToString(node)
	if (node instanceof PlusMinus) return '±1'
	if (node instanceof Variable) return variableToString(node)
	if (node instanceof Sum) return sumToString(node)
	if (node instanceof Product) return productToString(node)
	if (node instanceof Power) return powerToString(node)

	throw new Error(`Invalid toString call: the subtype "${node.subtype}" has no implemented toString method. Could not stringify the object "${node}".`)
}

function constantToString(node: Constant): string {
	return `${node.value}`.replace('.', decimalSeparator)
}

function variableToString(node: Variable): string {
	let result = node.symbol
	if (node.accent) result = `${node.accent}(${result})`
	if (node.subscript) result = node.subscript.length > 1 ? `${result}_(${node.subscript})` : `${result}_${node.subscript}`
	return result
}

function sumToString(node: Sum): string {
	return node.terms.map((term, index) => {
		const prefix = index > 0 && requiresPlusInSum(term) ? '+' : ''
		const value = requiresBracketsFor(term, bracketLevels.addition, index) ? `(${toString(term)})` : toString(term)
		return `${prefix}${value}`
	}).join('')
}

function productToString(node: Product): string {
	const hasPlusMinus = node.factors.some(isPlusMinus)
	const factors = hasPlusMinus ? node.factors.filter(factor => !isPlusMinus(factor)) : node.factors
	return `${hasPlusMinus ? '±' : ''}${factors.map((factor, index) => factorToString(factor, index, factors)).join('')}`
}

function factorToString(factor: ExpressionNode, index: number, factors: readonly ExpressionNode[]): string {
	const previousFactor = index > 0 ? factors[index - 1] : undefined
	const nextFactor = index < factors.length - 1 ? factors[index + 1] : undefined
	const precursor = previousFactor && (requiresTimesBeforeInProduct(factor, previousFactor) || requiresTimesAfterInProduct(previousFactor, factor)) && (!isMinusOne(previousFactor) || factor instanceof Constant) ? '*' : ''
	if (nextFactor && isMinusOne(factor) && !(nextFactor instanceof Constant)) return `${precursor}-`
	if (nextFactor && isPlusMinus(factor) && !(nextFactor instanceof Constant)) return `${precursor}±`
	const value = requiresBracketsFor(factor, bracketLevels.multiplication, index) ? `(${toString(factor)})` : toString(factor)
	return `${precursor}${value}`
}

function powerToString(node: Power): string {
	const baseStr = requiresBracketsFor(node.base, bracketLevels.powers, 0) ? `(${toString(node.base)})` : toString(node.base)
	const exponentStr = requiresBracketsFor(node.exponent, bracketLevels.powers, 1) ? `(${toString(node.exponent)})` : toString(node.exponent)
	return `${baseStr}^${exponentStr}`
}
