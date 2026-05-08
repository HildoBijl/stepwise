import { decimalSeparator } from '../../../settings'

import { ExpressionNode, ConstantNode, Sign, Sum, Product, Fraction, Power, FunctionNode, variableToString } from '../../construction'
import { isConstantNode, isSign, isVariableNode, isSum, isProduct, isFraction, isPower, isFunctionNode } from '../../operations'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusInSum, requiresTimesAfterInProduct, requiresTimesBeforeInProduct } from './listSupport'

export function toString(node: ExpressionNode) {
	if (isConstantNode(node)) return constantToString(node)
	if (isSign(node)) return signToString(node)
	if (isVariableNode(node)) return variableToString(node)
	if (isSum(node)) return sumToString(node)
	if (isProduct(node)) return productToString(node)
	if (isFraction(node)) return fractionToString(node)
	if (isPower(node)) return powerToString(node)
	if (isFunctionNode(node)) return functionToString(node)
	throw new Error(`Invalid toString call: the subtype "${node.subtype}" has no implemented toString method. Could not stringify the object "${node}".`)
}

function constantToString(node: ConstantNode): string {
	return `${node.value}`.replace('.', decimalSeparator)
}

function signToString(node: Sign): string {
	const nodeStr = addBrackets(toString(node.node), requiresBracketsFor(node.node, bracketLevels.negation))
	return `${getSignSymbol(node)}${nodeStr}`
}
function getSignSymbol(node: Sign): string {
	if (node.plusMinus) return '±'
	if (node.negative) return '-'
	throw new Error(`Invalid Sign: cannot have a sign that is neither negative nor plus-minus.`)
}

function sumToString(node: Sum): string {
	return node.terms.map((term, index) => {
		const prefix = index > 0 && requiresPlusInSum(term) ? '+' : ''
		const termStr = addBrackets(toString(term), requiresBracketsFor(term, bracketLevels.addition, index, node.terms.length))
		return `${prefix}${termStr}`
	}).join('')
}

function productToString(node: Product): string {
	return node.factors.map((factor, index) => {
		const previousFactor = index > 0 ? node.factors[index - 1] : undefined
		const precursor = previousFactor && (requiresTimesBeforeInProduct(factor, previousFactor) || requiresTimesAfterInProduct(previousFactor, factor)) ? '*' : ''
		const factorStr = addBrackets(toString(factor), requiresBracketsFor(factor, bracketLevels.multiplication, index, node.factors.length))
		return `${precursor}${factorStr}`
	}).join('')
}

function fractionToString(node: Fraction): string {
	const numeratorStr = addBrackets(toString(node.numerator), requiresBracketsFor(node.numerator, bracketLevels.division, 0, 2))
	const denominatorStr = addBrackets(toString(node.denominator), requiresBracketsFor(node.denominator, bracketLevels.division, 1, 2))
	return `${numeratorStr}/${denominatorStr}`
}

function powerToString(node: Power): string {
	const baseStr = addBrackets(toString(node.base), requiresBracketsFor(node.base, bracketLevels.powers, 0, 2))
	const exponentStr = addBrackets(toString(node.exponent), requiresBracketsFor(node.exponent, bracketLevels.powers, 1, 2))
	return `${baseStr}^${exponentStr}`
}

function functionToString(node: FunctionNode): string {
	const mainArgument = toString(node.args[0])
	const extraArgs = node.args.slice(1).map(arg => toString(arg))
	return `${node.name}${extraArgs.map(arg => `[${arg}]`).join('')}(${mainArgument})`
}

function addBrackets(str: string, addBrackets = true) {
	return addBrackets ? `(${str})` : str
}
