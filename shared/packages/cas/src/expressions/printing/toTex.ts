import { decimalSeparatorTex } from '../../settings'

import { ExpressionNode, Constant, PlusMinus, Variable, Sum, Product, Power, isMinusOne, isPlusMinus } from '../nodes'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusInSum, requiresTimesAfterInProductTex, requiresTimesBeforeInProductTex } from './listSupport'

export function toTex(node: ExpressionNode) {
	if (node instanceof Constant) return constantToTex(node)
	if (node instanceof PlusMinus) return '\\pm 1'
	if (node instanceof Variable) return variableToTex(node)
	if (node instanceof Sum) return sumToTex(node)
	if (node instanceof Product) return productToTex(node)
	if (node instanceof Power) return powerToTex(node)

	throw new Error(`Invalid toTex call: the subtype "${node.subtype}" has no implemented toTex method.`)
}

function constantToTex(node: Constant): string {
	return `${node.value}`.replace('.', decimalSeparatorTex)
}

function variableToTex(node: Variable): string {
	// Turn common symbols into Tex commands.
	let result
	if (node.symbol === 'π') result = '\\pi'
	else if (node.symbol === '∞') result = '\\infty'
	else result = node.symbol

	// Add accents and subscripts.
	if (node.accent) result = `\\${node.accent}{${result}}`
	if (node.subscript) result = `${result}_{${node.subscript}}`
	return result
}

function sumToTex(node: Sum): string {
	return node.terms.map((term, index) => {
		const prefix = index > 0 && requiresPlusInSum(term) ? '+' : ''
		const value = requiresBracketsFor(term, bracketLevels.addition, index) ? `\\left(${toTex(term)}\\right)` : toTex(term)
		return `${prefix}${value}`
	}).join('')
}

function productToTex(node: Product): string {
	const hasPlusMinus = node.factors.some(isPlusMinus)
	const factors = hasPlusMinus ? node.factors.filter(factor => !isPlusMinus(factor)) : node.factors
	return `${hasPlusMinus ? ' \\pm ' : ''}${factors.map((factor, index) => factorToTex(factor, index, factors)).join('')}`
}

function factorToTex(factor: ExpressionNode, index: number, factors: readonly ExpressionNode[]): string {
	const previousFactor = index > 0 ? factors[index - 1] : undefined
	const nextFactor = index < factors.length - 1 ? factors[index + 1] : undefined
	const precursor = previousFactor && (requiresTimesBeforeInProductTex(factor, previousFactor) || requiresTimesAfterInProductTex(previousFactor, factor)) && (!isMinusOne(previousFactor) || factor instanceof Constant) ? ' \\cdot ' : ''
	if (nextFactor && isMinusOne(factor) && !(nextFactor instanceof Constant)) return `${precursor}-`
	if (nextFactor && isPlusMinus(factor) && !(nextFactor instanceof Constant)) return `${precursor} \\pm `
	const value = requiresBracketsFor(factor, bracketLevels.multiplication, index) ? `\\left(${toTex(factor)}\\right)` : toTex(factor)
	return `${precursor}${value}`
}

function powerToTex(node: Power): string {
	const baseTex = requiresBracketsFor(node.base, bracketLevels.powers, 0)	? `\\left(${toTex(node.base)}\\right)` : toTex(node.base)
	return `${baseTex}^{${toTex(node.exponent)}}`
}
