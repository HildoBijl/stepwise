import { type ExpressionSettingsOptions } from '@step-wise/math-input-value'

import { type ExpressionNode, fraction } from '../../../construction'

import { isInteger, isZero, isNumeric } from '../../structural'
import { normalize, simplify } from '../../simplification'

export function isConstantMultiple(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): boolean {
	const normalized = normalizePair(a, b, settings)
	if (isZero(normalized.a) || isZero(normalized.b)) return isZero(normalized.a) === isZero(normalized.b)
	return isNumeric(normalizeQuotient(normalized.a, normalized.b, settings))
}

export function isIntegerMultiple(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): boolean {
	const normalized = normalizePair(a, b, settings)
	if (isZero(normalized.a) || isZero(normalized.b)) return isZero(normalized.a) === isZero(normalized.b)
	return isInteger(normalizeQuotient(normalized.a, normalized.b, settings))
}

function normalizePair(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions) {
	return {
		a: simplify(a, settings, normalize),
		b: simplify(b, settings, normalize),
	}
}

function normalizeQuotient(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): ExpressionNode {
	return simplify(fraction(a, b), settings, normalize)
}
