import { approximatelyEqual } from '@step-wise/js-utils'
import { type ExpressionSettingsOptions, type ExpressionSettings, resolveExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, variableToString } from '../../../construction'

import { isConstantNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isRoot, isSqrt, isLn, isLog, isTrigonometricFunction, isInverseTrigonometricFunction, isSin, isCos, isTan, isArcsin, isArccos, isArctan } from './typeChecks'
import { isSingular } from './algebraicChecks'

// Turn a numeric expression into a Javascript number. Throws on non-numeric elements.
export function numericNodeToNumber(node: ExpressionNode, settings?: ExpressionSettingsOptions): number {
	if (!isSingular(node)) throw new Error('Invalid toNumber call: cannot turn a plural expression into a single number.')
	const number = toNumberInternal(node, resolveExpressionSettings(settings))
	if (!Number.isFinite(number)) throw new Error('Invalid toNumber call: the expression does not have a finite real value.')
	return approximatelyEqual(number, 0) ? 0 : number
}

function toNumberInternal(node: ExpressionNode, settings: ExpressionSettings): number {
	// Constants
	if (isConstantNode(node)) return node.value

	// Signs
	if (isMinus(node)) return -toNumberInternal(node.node, settings)
	if (isPlusMinus(node)) throw new Error('Invalid toNumber call: cannot turn a plus-minus into a single number.')

	// Variables
	if (isVariable(node)) throw new Error(`Invalid toNumber call: cannot turn a variable "${variableToString(node)}" into a number.`)

	// Lists
	if (isSum(node)) return node.terms.reduce((sum, term) => sum + toNumberInternal(term, settings), 0)
	if (isProduct(node)) return node.factors.reduce((product, factor) => product * toNumberInternal(factor, settings), 1)

	// Functions
	if (isFraction(node)) return toNumberInternal(node.numerator, settings) / toNumberInternal(node.denominator, settings)
	if (isPower(node)) return toNumberInternal(node.base, settings) ** toNumberInternal(node.exponent, settings)
	if (isRoot(node)) return evaluateRoot(toNumberInternal(node.radicand, settings), toNumberInternal(node.degree, settings))
	if (isSqrt(node)) return Math.sqrt(toNumberInternal(node.radicand, settings))
	if (isLn(node)) return Math.log(toNumberInternal(node.argument, settings))
	if (isLog(node)) return Math.log(toNumberInternal(node.argument, settings)) / Math.log(toNumberInternal(node.base, settings))

	// Trigonometry
	if (isTrigonometricFunction(node)) {
		const angle = degreesToRadians(toNumberInternal(node.argument, settings), settings)
		if (isSin(node)) return Math.sin(angle)
		if (isCos(node)) return Math.cos(angle)
		if (isTan(node)) return Math.tan(angle)
	}
	if (isInverseTrigonometricFunction(node)) {
		const argument = toNumberInternal(node.argument, settings)
		if (isArcsin(node)) return radiansToDegrees(Math.asin(argument), settings)
		if (isArccos(node)) return radiansToDegrees(Math.acos(argument), settings)
		if (isArctan(node)) return radiansToDegrees(Math.atan(argument), settings)
	}

	// Fallback
	throw new Error(`Invalid toNumber call: no numeric evaluation implemented for subtype "${node.subtype}".`)
}

function evaluateRoot(radicand: number, degree: number): number {
	if (approximatelyEqual(degree, 0)) return NaN
	if (radicand >= 0) return radicand ** (1 / degree)
	const roundedDegree = Math.round(degree)
	if (!approximatelyEqual(degree, roundedDegree) || Math.abs(roundedDegree) % 2 !== 1) return NaN
	return -((-radicand) ** (1 / degree))
}

function degreesToRadians(value: number, settings: ExpressionSettings): number {
	return settings.angleUnit === 'degrees' ? value * Math.PI / 180 : value
}

function radiansToDegrees(value: number, settings: ExpressionSettings): number {
	return settings.angleUnit === 'degrees' ? value * 180 / Math.PI : value
}

// Check if two numeric expressions are equal. Throws when given non-numeric expressions.
export function equalNumbers(a: ExpressionNode, b: ExpressionNode, aSettings: ExpressionSettingsOptions = {}, bSettings: ExpressionSettingsOptions = aSettings): boolean {
	return approximatelyEqual(numericNodeToNumber(a, aSettings), numericNodeToNumber(b, bSettings))
}
