import type { ExpressionNode, ConstantNode, NamedConstant, SignNode, Variable, Sum, Product, Fraction, Power, Sqrt, Root, Log, SingleArgumentFunctionNode } from '../../construction'
import { isConstantNode, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isSqrt, isRoot, isLog, isSingleArgumentFunctionNode } from '../../operations'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusBetweenNodesTex, requiresTimesBetweenFactorsTex } from './listSupport'

export function nodeToTex(node: ExpressionNode) {
	if (isConstantNode(node)) return constantToTex(node)
	if (isSignNode(node)) return signToTex(node)
	if (isVariable(node)) return variableToTex(node)
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
	return isNamedConstant(node) ? getNamedConstantTex(node) : `${node.value}`
}
function getNamedConstantTex(node: NamedConstant) {
	if (node.symbol === 'π') return '\\pi '
	if (node.symbol === '∞') return '\\infty '
	return node.symbol
}

function signToTex(node: SignNode): string {
	const nodeTex = addBrackets(nodeToTex(node.node), requiresBracketsFor(node.node, bracketLevels.negation))
	return `${getSignSymbol(node)}${nodeTex}`
}
function getSignSymbol(node: SignNode): string {
	if (isMinus(node)) return '-'
	if (isPlusMinus(node)) return '\\pm '
	throw new Error(`Invalid getSignSymbol toTex call: cannot turn "${node.name}" sign to tex.`)
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
		const previousTerm = index > 0 ? node.terms[index - 1] : undefined
		const prefix = previousTerm && requiresPlusBetweenNodesTex(term, previousTerm) ? '+' : ''
		const termTex = addBrackets(nodeToTex(term), requiresBracketsFor(term, bracketLevels.addition, index, node.terms.length))
		return `${prefix}${termTex}`
	}).join('')
}

function productToTex(node: Product): string {
	return node.factors.map((factor, index) => {
		const previousFactor = index > 0 ? node.factors[index - 1] : undefined
		const precursor = previousFactor && requiresTimesBetweenFactorsTex(factor, previousFactor) ? ' \\cdot ' : ''
		const factorTex = addBrackets(nodeToTex(factor), requiresBracketsFor(factor, bracketLevels.multiplication, index, node.factors.length))
		return `${precursor}${factorTex}`
	}).join('')
}

function fractionToTex(node: Fraction): string {
	return `\\frac{${nodeToTex(node.numerator)}}{${nodeToTex(node.denominator)}}`
}

function powerToTex(node: Power): string {
	const baseTex = addBrackets(nodeToTex(node.base), requiresBracketsFor(node.base, bracketLevels.powers, 0, 2))
	return `${baseTex}^{${nodeToTex(node.exponent)}}`
}

function sqrtToTex(node: Sqrt): string {
	return `\\sqrt{${nodeToTex(node.argument)}}`
}

function rootToTex(node: Root): string {
	return `\\sqrt[${nodeToTex(node.base)}]{${nodeToTex(node.argument)}}`
}

function logToTex(node: Log): string {
	return `\\log_{${nodeToTex(node.base)}}\\left(${nodeToTex(node.argument)}\\right)`
}

function singleArgumentFunctionToTex(node: SingleArgumentFunctionNode): string {
	return `\\${node.name}${addBrackets(nodeToTex(node.argument))}`
}

function addBrackets(str: string, addBrackets = true) {
	return addBrackets ? `\\left(${str}\\right)` : str
}
