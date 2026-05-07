import { compareNumbers, mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { ExpressionNode, Integer, Float, Variable, PlusMinus, Sum, Product, Fraction, Power, Root, Sqrt, Ln, Log, Sin, Cos, Tan, Arcsin, Arccos, Arctan, variableToString } from '../../construction'

import { isTrigonometricFunction, isInverseTrigonometricFunction, equalVariables } from './typing'
import { isNumeric } from './checks'

// Turn a numeric expression into a Javascript number. Throws on non-numeric elements.
export function toNumber(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}): number {
	const number = toNumberInternal(node, mergeDefaults(settings, defaultExpressionSettings))
	return compareNumbers(number, 0) ? 0 : number
}

function toNumberInternal(node: ExpressionNode, settings: ExpressionSettings): number {
	// Constants
	if (node instanceof Integer || node instanceof Float) return node.value
	if (node instanceof PlusMinus) throw new Error('Invalid toNumber call: cannot turn a PlusMinus into a single number.')

	// Variables
	if (node instanceof Variable) {
		if (equalVariables(node, Variable.pi)) return Math.PI
		if (equalVariables(node, Variable.e)) return Math.E
		if (equalVariables(node, Variable.infinity)) return Infinity
		throw new Error(`Invalid toNumber call: cannot turn a variable "${variableToString(node)}" into a number.`)
	}

	// Lists
	if (node instanceof Sum) return node.terms.reduce((sum, term) => sum + toNumberInternal(term, settings), 0)
	if (node instanceof Product) return node.factors.reduce((product, factor) => product * toNumberInternal(factor, settings), 1)

	// Functions
	if (node instanceof Fraction) return toNumberInternal(node.numerator, settings) / toNumberInternal(node.denominator, settings)
	if (node instanceof Power) return toNumberInternal(node.base, settings) ** toNumberInternal(node.exponent, settings)
	if (node instanceof Root) return toNumberInternal(node.argument, settings) ** (1 / toNumberInternal(node.base, settings))
	if (node instanceof Sqrt) return Math.sqrt(toNumberInternal(node.argument, settings))
	if (node instanceof Ln) return Math.log(toNumberInternal(node.argument, settings))
	if (node instanceof Log) return Math.log(toNumberInternal(node.argument, settings)) / Math.log(toNumberInternal(node.base, settings))

	// Trigonometry
	if (isTrigonometricFunction(node)) {
		const angle = degreesToRadians(toNumberInternal(node.argument, settings), settings)
		if (node instanceof Sin) return Math.sin(angle)
		if (node instanceof Cos) return Math.cos(angle)
		if (node instanceof Tan) return Math.tan(angle)
	}
	if (isInverseTrigonometricFunction(node)) {
		const argument = toNumberInternal(node.argument, settings)
		if (node instanceof Arcsin) return radiansToDegrees(Math.asin(argument), settings)
		if (node instanceof Arccos) return radiansToDegrees(Math.acos(argument), settings)
		if (node instanceof Arctan) return radiansToDegrees(Math.atan(argument), settings)
	}

	// Fallback
	throw new Error(`Invalid toNumber call: no numeric evaluation implemented for subtype "${node.subtype}".`)
}

function degreesToRadians(value: number, settings: ExpressionSettings): number {
	return settings.degrees ? value * Math.PI / 180 : value
}

function radiansToDegrees(value: number, settings: ExpressionSettings): number {
	return settings.degrees ? value * 180 / Math.PI : value
}

// Check if two numeric expressions are equal. Throws when given non-numeric expressions.
export function equalNumbers(a: ExpressionNode, b: ExpressionNode, aSettings: Partial<ExpressionSettings> = {}, bSettings: Partial<ExpressionSettings> = aSettings): boolean {
	return compareNumbers(toNumber(a, aSettings), toNumber(b, bSettings))
}
