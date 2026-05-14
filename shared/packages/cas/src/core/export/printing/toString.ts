import { type ExpressionNode, type ConstantNode, type Sign, type Sum, type Product, type Fraction, type Power, type FunctionNode, variableToString } from '../../construction'
import { isConstantNode, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isFunctionNode } from '../../operations'

import { bracketLevels, requiresBracketsFor } from './bracketSupport'
import { requiresPlusBetweenNodes, requiresTimesBetweenFactors } from './listSupport'

export function nodeToString(node: ExpressionNode) {
	if (isConstantNode(node)) return constantToString(node)
	if (isSignNode(node)) return signToString(node)
	if (isVariable(node)) return variableToString(node)
	if (isSum(node)) return sumToString(node)
	if (isProduct(node)) return productToString(node)
	if (isFraction(node)) return fractionToString(node)
	if (isPower(node)) return powerToString(node)
	if (isFunctionNode(node)) return functionToString(node)
	throw new Error(`Invalid toString call: the subtype "${node.subtype}" has no implemented toString method. Could not stringify the object "${node}".`)
}

function constantToString(node: ConstantNode): string {
	return isNamedConstant(node) ? node.symbol : `${node.value}`
}

function signToString(node: Sign): string {
	const nodeStr = addBrackets(nodeToString(node.node), requiresBracketsFor(node.node, bracketLevels.negation))
	return `${getSignSymbol(node)}${nodeStr}`
}
function getSignSymbol(node: Sign): string {
	if (isMinus(node)) return '-'
	if (isPlusMinus(node)) return '±'
	throw new Error(`Invalid getSignSymbol toString call: cannot turn "${node.name}" sign to a string.`)
}

function sumToString(node: Sum): string {
	return node.terms.map((term, index) => {
		const previousTerm = index > 0 ? node.terms[index - 1] : undefined
		const prefix = previousTerm && requiresPlusBetweenNodes(term, previousTerm) ? '+' : ''
		const termStr = addBrackets(nodeToString(term), requiresBracketsFor(term, bracketLevels.addition, index, node.terms.length))
		return `${prefix}${termStr}`
	}).join('')
}

function productToString(node: Product): string {
	return node.factors.map((factor, index) => {
		const previousFactor = index > 0 ? node.factors[index - 1] : undefined
		const precursor = previousFactor && requiresTimesBetweenFactors(factor, previousFactor) ? '*' : ''
		const factorStr = addBrackets(nodeToString(factor), requiresBracketsFor(factor, bracketLevels.multiplication, index, node.factors.length))
		return `${precursor}${factorStr}`
	}).join('')
}

function fractionToString(node: Fraction): string {
	const numeratorStr = addBrackets(nodeToString(node.numerator), requiresBracketsFor(node.numerator, bracketLevels.division, 0, 2))
	const denominatorStr = addBrackets(nodeToString(node.denominator), requiresBracketsFor(node.denominator, bracketLevels.division, 1, 2))
	return `${numeratorStr}/${denominatorStr}`
}

function powerToString(node: Power): string {
	const baseStr = addBrackets(nodeToString(node.base), requiresBracketsFor(node.base, bracketLevels.powers, 0, 2))
	const exponentStr = addBrackets(nodeToString(node.exponent), requiresBracketsFor(node.exponent, bracketLevels.powers, 1, 2))
	return `${baseStr}^${exponentStr}`
}

function functionToString(node: FunctionNode): string {
	const mainArgument = nodeToString(node.args[0])
	const extraArgs = node.args.slice(1).map(arg => nodeToString(arg))
	return `${node.name}${extraArgs.map(arg => `[${arg}]`).join('')}(${mainArgument})`
}

function addBrackets(str: string, addBrackets = true) {
	return addBrackets ? `(${str})` : str
}
