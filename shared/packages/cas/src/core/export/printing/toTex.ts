import { mergeDefaults } from '@step-wise/utils'

import type { ExpressionNode, ConstantNode, NamedConstant, SignNode, Variable, Sum, Product, Fraction, Power, Sqrt, Root, Log, SingleArgumentFunctionNode } from '../../construction'
import { isConstantNode, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isSqrt, isRoot, isLog, isSingleArgumentFunctionNode } from '../../operations'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusBetweenNodesTex, requiresTimesBetweenFactorsTex } from './listSupport'

// Define TexDisplayOptions object.
export type DecimalSeparator = '.' | ','
export type TexDisplayOptions = { decimalSeparator: DecimalSeparator }
const defaultTexDisplayOptions = { decimalSeparator: '.' } satisfies TexDisplayOptions

// Set up the main nodeToTex function.
export function nodeToTex(node: ExpressionNode, options: Partial<TexDisplayOptions> = {}) {
	const fullOptions = mergeDefaults(options, defaultTexDisplayOptions)
	if (isConstantNode(node)) return constantToTex(node, fullOptions)
	if (isSignNode(node)) return signToTex(node, fullOptions)
	if (isVariable(node)) return variableToTex(node, fullOptions)
	if (isSum(node)) return sumToTex(node, fullOptions)
	if (isProduct(node)) return productToTex(node, fullOptions)
	if (isFraction(node)) return fractionToTex(node, fullOptions)
	if (isPower(node)) return powerToTex(node, fullOptions)
	if (isSqrt(node)) return sqrtToTex(node, fullOptions)
	if (isRoot(node)) return rootToTex(node, fullOptions)
	if (isLog(node)) return logToTex(node, fullOptions)
	if (isSingleArgumentFunctionNode(node)) return singleArgumentFunctionToTex(node, fullOptions)
	throw new Error(`Invalid toTex call: the subtype "${node.subtype}" has no implemented toTex method.`)
}

function constantToTex(node: ConstantNode, options: TexDisplayOptions): string {
	return isNamedConstant(node) ? getNamedConstantTex(node) : `${node.value.toString().replace('.', options.decimalSeparator === ',' ? '{,}' : options.decimalSeparator)}`
}
function getNamedConstantTex(node: NamedConstant) {
	if (node.symbol === 'π') return '\\pi '
	if (node.symbol === '∞') return '\\infty '
	return node.symbol
}

function signToTex(node: SignNode, options: TexDisplayOptions): string {
	const nodeTex = addBrackets(nodeToTex(node.node, options), requiresBracketsFor(node.node, bracketLevels.negation))
	return `${getSignSymbol(node)}${nodeTex}`
}
function getSignSymbol(node: SignNode): string {
	if (isMinus(node)) return '-'
	if (isPlusMinus(node)) return '\\pm '
	throw new Error(`Invalid getSignSymbol toTex call: cannot turn "${node.name}" sign to tex.`)
}

function variableToTex(node: Variable, options: TexDisplayOptions): string {
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

function sumToTex(node: Sum, options: TexDisplayOptions): string {
	return node.terms.map((term, index) => {
		const previousTerm = index > 0 ? node.terms[index - 1] : undefined
		const prefix = previousTerm && requiresPlusBetweenNodesTex(term, previousTerm) ? '+' : ''
		const termTex = addBrackets(nodeToTex(term, options), requiresBracketsFor(term, bracketLevels.addition, index, node.terms.length))
		return `${prefix}${termTex}`
	}).join('')
}

function productToTex(node: Product, options: TexDisplayOptions): string {
	return node.factors.map((factor, index) => {
		const previousFactor = index > 0 ? node.factors[index - 1] : undefined
		const precursor = previousFactor && requiresTimesBetweenFactorsTex(factor, previousFactor) ? ' \\cdot ' : ''
		const factorTex = addBrackets(nodeToTex(factor, options), requiresBracketsFor(factor, bracketLevels.multiplication, index, node.factors.length))
		return `${precursor}${factorTex}`
	}).join('')
}

function fractionToTex(node: Fraction, options: TexDisplayOptions): string {
	return `\\frac{${nodeToTex(node.numerator, options)}}{${nodeToTex(node.denominator, options)}}`
}

function powerToTex(node: Power, options: TexDisplayOptions): string {
	const baseTex = addBrackets(nodeToTex(node.base, options), requiresBracketsFor(node.base, bracketLevels.powers, 0, 2))
	return `${baseTex}^{${nodeToTex(node.exponent, options)}}`
}

function sqrtToTex(node: Sqrt, options: TexDisplayOptions): string {
	return `\\sqrt{${nodeToTex(node.radicand, options)}}`
}

function rootToTex(node: Root, options: TexDisplayOptions): string {
	return `\\sqrt[${nodeToTex(node.degree, options)}]{${nodeToTex(node.radicand, options)}}`
}

function logToTex(node: Log, options: TexDisplayOptions): string {
	return `\\log_{${nodeToTex(node.base, options)}}\\left(${nodeToTex(node.argument, options)}\\right)`
}

function singleArgumentFunctionToTex(node: SingleArgumentFunctionNode, options: TexDisplayOptions): string {
	return `\\${node.name}${addBrackets(nodeToTex(node.argument, options))}`
}

function addBrackets(str: string, addBrackets = true) {
	return addBrackets ? `\\left(${str}\\right)` : str
}
