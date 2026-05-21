import { type InterpretationSettings, type InterpretationSettingsInput, asInterpretationSettings } from '@step-wise/math-input-value'

import type { ExpressionNode, ConstantNode, NamedConstant, SignNode, Variable, Sum, Product, Fraction, Power, Sqrt, Root, Log, SingleArgumentFunctionNode } from '../../construction'
import { isConstantNode, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isSqrt, isRoot, isLog, isSingleArgumentFunctionNode } from '../../operations'

import { type TexDisplayOptions, type TexDisplayOptionsInput, asTexDisplayOptions } from './texDisplayOptions'
import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusBetweenNodesTex, requiresTimesBetweenFactorsTex } from './listSupport'

// Set up the main nodeToTex function.
export function nodeToTex(node: ExpressionNode, interpretationSettings: InterpretationSettingsInput, displayOptions: TexDisplayOptionsInput = {}) {
	const settings = asInterpretationSettings(interpretationSettings)
	const options = asTexDisplayOptions(displayOptions)
	if (isConstantNode(node)) return constantToTex(node, settings, options)
	if (isSignNode(node)) return signToTex(node, settings, options)
	if (isVariable(node)) return variableToTex(node, settings, options)
	if (isSum(node)) return sumToTex(node, settings, options)
	if (isProduct(node)) return productToTex(node, settings, options)
	if (isFraction(node)) return fractionToTex(node, settings, options)
	if (isPower(node)) return powerToTex(node, settings, options)
	if (isSqrt(node)) return sqrtToTex(node, settings, options)
	if (isRoot(node)) return rootToTex(node, settings, options)
	if (isLog(node)) return logToTex(node, settings, options)
	if (isSingleArgumentFunctionNode(node)) return singleArgumentFunctionToTex(node, settings, options)
	throw new Error(`Invalid toTex call: the subtype "${node.subtype}" has no implemented toTex method.`)
}

function constantToTex(node: ConstantNode, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return isNamedConstant(node) ? getNamedConstantTex(node) : `${node.value.toString().replace('.', options.decimalSeparator === ',' ? '{,}' : options.decimalSeparator)}`
}
function getNamedConstantTex(node: NamedConstant) {
	if (node.symbol === 'π') return '\\pi '
	if (node.symbol === '∞') return '\\infty '
	return node.symbol
}

function signToTex(node: SignNode, settings: InterpretationSettings, options: TexDisplayOptions): string {
	const nodeTex = addBrackets(nodeToTex(node.node, settings, options), requiresBracketsFor(node.node, bracketLevels.negation))
	return `${getSignSymbol(node)}${nodeTex}`
}
function getSignSymbol(node: SignNode): string {
	if (isMinus(node)) return '-'
	if (isPlusMinus(node)) return '\\pm '
	throw new Error(`Invalid getSignSymbol toTex call: cannot turn "${node.name}" sign to tex.`)
}

function variableToTex(node: Variable, settings: InterpretationSettings, options: TexDisplayOptions): string {
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

function sumToTex(node: Sum, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return node.terms.map((term, index) => {
		const previousTerm = index > 0 ? node.terms[index - 1] : undefined
		const prefix = previousTerm && requiresPlusBetweenNodesTex(term, previousTerm) ? '+' : ''
		const termTex = addBrackets(nodeToTex(term, settings, options), requiresBracketsFor(term, bracketLevels.addition, index, node.terms.length))
		return `${prefix}${termTex}`
	}).join('')
}

function productToTex(node: Product, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return node.factors.map((factor, index) => {
		const previousFactor = index > 0 ? node.factors[index - 1] : undefined
		const precursor = previousFactor && requiresTimesBetweenFactorsTex(factor, previousFactor, settings) ? ' \\cdot ' : ''
		const factorTex = addBrackets(nodeToTex(factor, settings, options), requiresBracketsFor(factor, bracketLevels.multiplication, index, node.factors.length))
		return `${precursor}${factorTex}`
	}).join('')
}

function fractionToTex(node: Fraction, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return `\\frac{${nodeToTex(node.numerator, settings, options)}}{${nodeToTex(node.denominator, settings, options)}}`
}

function powerToTex(node: Power, settings: InterpretationSettings, options: TexDisplayOptions): string {
	const baseTex = addBrackets(nodeToTex(node.base, settings, options), requiresBracketsFor(node.base, bracketLevels.powers, 0, 2))
	return `${baseTex}^{${nodeToTex(node.exponent, settings, options)}}`
}

function sqrtToTex(node: Sqrt, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return `\\sqrt{${nodeToTex(node.radicand, settings, options)}}`
}

function rootToTex(node: Root, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return `\\sqrt[${nodeToTex(node.degree, settings, options)}]{${nodeToTex(node.radicand, settings, options)}}`
}

function logToTex(node: Log, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return `\\log_{${nodeToTex(node.base, settings, options)}}\\left(${nodeToTex(node.argument, settings, options)}\\right)`
}

function singleArgumentFunctionToTex(node: SingleArgumentFunctionNode, settings: InterpretationSettings, options: TexDisplayOptions): string {
	return `\\${node.name}${addBrackets(nodeToTex(node.argument, settings, options))}`
}

function addBrackets(str: string, addBrackets = true) {
	return addBrackets ? `\\left(${str}\\right)` : str
}
