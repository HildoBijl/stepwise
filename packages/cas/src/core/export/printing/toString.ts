import { mergeDefaults } from '@step-wise/utils'
import { type InterpretationSettings, type InterpretationSettingsInput, defaultInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, type ConstantNode, type SignNode, type Sum, type Product, type Fraction, type Power, type FunctionNode, variableToString } from '../../construction'
import { isConstantNode, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isFunctionNode } from '../../operations'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusBetweenNodes, requiresTimesBetweenFactors } from './listSupport'
import { getNodeInterpretationSettingsInput } from './getInterpretationSettings'

export function nodeToString(node: ExpressionNode, interpretationSettings: InterpretationSettingsInput = getNodeInterpretationSettingsInput(node)) {
	const settings = mergeDefaults(interpretationSettings, defaultInterpretationSettings)
	if (isConstantNode(node)) return constantToString(node, settings)
	if (isSignNode(node)) return signToString(node, settings)
	if (isVariable(node)) return variableToString(node)
	if (isSum(node)) return sumToString(node, settings)
	if (isProduct(node)) return productToString(node, settings)
	if (isFraction(node)) return fractionToString(node, settings)
	if (isPower(node)) return powerToString(node, settings)
	if (isFunctionNode(node)) return functionToString(node, settings)
	throw new Error(`Invalid toString call: the subtype "${node.subtype}" has no implemented toString method. Could not stringify the object "${node}".`)
}

function constantToString(node: ConstantNode, settings: InterpretationSettings): string {
	return isNamedConstant(node) ? node.symbol : `${node.value}`
}

function signToString(node: SignNode, settings: InterpretationSettings): string {
	const nodeStr = addBrackets(nodeToString(node.node, settings), requiresBracketsFor(node.node, bracketLevels.negation))
	return `${getSignSymbol(node)}${nodeStr}`
}
function getSignSymbol(node: SignNode): string {
	if (isMinus(node)) return '-'
	if (isPlusMinus(node)) return '±'
	throw new Error(`Invalid getSignSymbol toString call: cannot turn "${node.name}" sign to a string.`)
}

function sumToString(node: Sum, settings: InterpretationSettings): string {
	return node.terms.map((term, index) => {
		const previousTerm = index > 0 ? node.terms[index - 1] : undefined
		const prefix = previousTerm && requiresPlusBetweenNodes(term, previousTerm) ? '+' : ''
		const termStr = addBrackets(nodeToString(term, settings), requiresBracketsFor(term, bracketLevels.addition, index, node.terms.length))
		return `${prefix}${termStr}`
	}).join('')
}

function productToString(node: Product, settings: InterpretationSettings): string {
	return node.factors.map((factor, index) => {
		const previousFactor = index > 0 ? node.factors[index - 1] : undefined
		const precursor = previousFactor && requiresTimesBetweenFactors(factor, previousFactor, settings) ? '*' : ''
		const factorStr = addBrackets(nodeToString(factor, settings), requiresBracketsFor(factor, bracketLevels.multiplication, index, node.factors.length))
		return `${precursor}${factorStr}`
	}).join('')
}

function fractionToString(node: Fraction, settings: InterpretationSettings): string {
	const numeratorStr = addBrackets(nodeToString(node.numerator, settings), requiresBracketsFor(node.numerator, bracketLevels.division, 0, 2))
	const denominatorStr = addBrackets(nodeToString(node.denominator, settings), requiresBracketsFor(node.denominator, bracketLevels.division, 1, 2))
	return `${numeratorStr}/${denominatorStr}`
}

function powerToString(node: Power, settings: InterpretationSettings): string {
	const baseStr = addBrackets(nodeToString(node.base, settings), requiresBracketsFor(node.base, bracketLevels.powers, 0, 2))
	const exponentStr = addBrackets(nodeToString(node.exponent, settings), requiresBracketsFor(node.exponent, bracketLevels.powers, 1, 2))
	return `${baseStr}^${exponentStr}`
}

function functionToString(node: FunctionNode, settings: InterpretationSettings): string {
	const mainArgument = nodeToString(node.args[0], settings)
	const extraArgs = node.args.slice(1).map(arg => nodeToString(arg, settings))
	return `${node.name}${extraArgs.map(arg => `[${arg}]`).join('')}(${mainArgument})`
}

function addBrackets(str: string, addBrackets = true) {
	return addBrackets ? `(${str})` : str
}
