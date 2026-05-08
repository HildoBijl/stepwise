import { decimalSeparatorTex } from '../../../settings'

import { ExpressionNode, ConstantNode, Sign, Variable, Sum, Product, Fraction, Power, Sqrt, Root, Log, SingleArgumentFunctionNode } from '../../construction'
import { isConstantNode, isSignNode, isVariableNode, isSum, isProduct, isFraction, isPower, isSqrt, isRoot, isLog, isSingleArgumentFunctionNode } from '../../operations'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusInSum, requiresTimesAfterInProductTex, requiresTimesBeforeInProductTex } from './listSupport'

export function toTex(node: ExpressionNode) {
	if (isConstantNode(node)) return constantToTex(node)
	if (isSignNode(node)) return signToTex(node)
	if (isVariableNode(node)) return variableToTex(node)
	if (isSum(node)) return sumToTex(node)
	if (isProduct(node)) return productToTex(node)
	if (isFraction(node)) return fractionToTex(node)
	if (isPower(node)) return powerToTex(node)
	if (isSqrt(node)) return sqrtToTex(node)
	if (isRoot(node)) return rootToTex(node)
	if (isLog(node)) return logToTex(node)
	if (isSingleArgumentFunctionNode(node)) return singleArgumentFunctionToTex(node)
	throw new Error(`Invalid toTex call: the subtype "${node.subtype}" has no implemented toTex method.`)
}

function constantToTex(node: ConstantNode): string {
	return `${node.value}`.replace('.', decimalSeparatorTex)
}

function signToTex(node: Sign): string {
	const nodeTex = addBrackets(toTex(node.node), requiresBracketsFor(node.node, bracketLevels.negation))
	return `${getSignSymbol(node)}${nodeTex}`
}
function getSignSymbol(node: Sign): string {
	if (node.plusMinus) return '\\pm '
	if (node.negative) return '-'
	throw new Error(`Invalid Sign: cannot have a sign that is neither negative nor plus-minus.`)
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
		const termTex = addBrackets(toTex(term), requiresBracketsFor(term, bracketLevels.addition, index, node.terms.length))
		return `${prefix}${termTex}`
	}).join('')
}

function productToTex(node: Product): string {
	return node.factors.map((factor, index) => {
		const previousFactor = index > 0 ? node.factors[index - 1] : undefined
		const precursor = previousFactor && (requiresTimesBeforeInProductTex(factor, previousFactor) || requiresTimesAfterInProductTex(previousFactor, factor)) ? ' \\cdot ' : ''
		const factorTex = addBrackets(toTex(factor), requiresBracketsFor(factor, bracketLevels.multiplication, index, node.factors.length))
		return `${precursor}${factorTex}`
	}).join('')
}

function fractionToTex(node: Fraction): string {
	return `\\frac{${toTex(node.numerator)}}{${toTex(node.denominator)}}`
}

function powerToTex(node: Power): string {
	const baseTex = addBrackets(toTex(node.base), requiresBracketsFor(node.base, bracketLevels.powers, 0, 2))
	return `${baseTex}^{${toTex(node.exponent)}}`
}

function sqrtToTex(node: Sqrt): string {
	return `\\sqrt{${toTex(node.argument)}}`
}

function rootToTex(node: Root): string {
	return `\\sqrt[${toTex(node.base)}]{${toTex(node.argument)}}`
}

function logToTex(node: Log): string {
	return `\\log_{${toTex(node.base)}}\\left(${toTex(node.argument)}\\right)`
}

function singleArgumentFunctionToTex(node: SingleArgumentFunctionNode): string {
	return `\\${node.name}${addBrackets(toTex(node.argument))}`
}

function addBrackets(str: string, addBrackets = true) {
	return addBrackets ? `\\left(${str}\\right)` : str
}
