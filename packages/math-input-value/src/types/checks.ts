import { isPlainObject } from '@step-wise/js-utils'

import { isInterpretationSettingsOptions, isExpressionSettingsOptions } from '../settings/index.ts'
import { isAccentName } from '../definitions/index.ts'

import type { AccentInputValue, ConstructInputValue, EquationInputValue, ExpressionInputValue, ExpressionValue, InputValue, InputValuePart } from './InputValue.ts'

export function isExpressionInputValue(value: unknown): value is ExpressionInputValue {
	return isMathInputValue(value) && value.type === 'Expression'
}

export function isEquationInputValue(value: unknown): value is EquationInputValue {
	return isMathInputValue(value) && value.type === 'Equation'
}

function isMathInputValue(value: unknown): value is Record<string, unknown> & Omit<InputValue, 'type'> {
	return isPlainObject(value) && isExpressionValue(value.value) && (value.interpretationSettings === undefined || isInterpretationSettingsOptions(value.interpretationSettings)) && (value.expressionSettings === undefined || isExpressionSettingsOptions(value.expressionSettings))
}

export function isExpressionValue(value: unknown): value is ExpressionValue {
	return validateExpressionValue(value, new Set())
}

function validateExpressionValue(value: unknown, ancestors: Set<object>): value is ExpressionValue {
	if (!Array.isArray(value) || value.length === 0 || typeof value[0] !== 'string' || typeof value[value.length - 1] !== 'string' || ancestors.has(value)) return false

	ancestors.add(value)
	const isValid = Array.from({ length: value.length }, (_, index) => index in value && validateInputValuePart(value[index], ancestors)).every(Boolean)
	ancestors.delete(value)
	return isValid
}

export function isInputValuePart(value: unknown): value is InputValuePart {
	return validateInputValuePart(value, new Set())
}

function validateInputValuePart(value: unknown, ancestors: Set<object>): value is InputValuePart {
	return isTextPart(value) || validateConstructInputValue(value, ancestors) || isAccentInputValue(value)
}

export function isConstructInputValue(value: unknown): value is ConstructInputValue {
	return validateConstructInputValue(value, new Set())
}

function validateConstructInputValue(value: unknown, ancestors: Set<object>): value is ConstructInputValue {
	if (!isPlainObject(value) || (value.alias !== undefined && typeof value.alias !== 'string') || ancestors.has(value)) return false

	ancestors.add(value)
	let isValid: boolean
	switch (value.type) {
		case 'Fraction': isValid = validateExpressionValue(value.numerator, ancestors) && validateExpressionValue(value.denominator, ancestors); break
		case 'SquareRoot': isValid = validateExpressionValue(value.radicand, ancestors); break
		case 'Root': isValid = validateExpressionValue(value.degree, ancestors) && validateExpressionValue(value.radicand, ancestors); break
		case 'Logarithm': isValid = validateExpressionValue(value.base, ancestors); break
		case 'SubSup': isValid = (value.subscript === undefined || typeof value.subscript === 'string') && (value.superscript === undefined || validateExpressionValue(value.superscript, ancestors)); break
		default: isValid = false
	}
	ancestors.delete(value)
	return isValid
}

export function isAccentInputValue(value: unknown): value is AccentInputValue {
	return isPlainObject(value) && value.type === 'Accent' && typeof value.name === 'string' && isAccentName(value.name) && (value.alias === undefined || typeof value.alias === 'string') && typeof value.value === 'string'
}

export function isTextPart(value: unknown): value is string {
	return typeof value === 'string'
}
