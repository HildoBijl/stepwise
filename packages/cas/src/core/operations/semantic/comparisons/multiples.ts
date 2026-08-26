import { type ExpressionSettingsOptions } from '@step-wise/math-input-value'

import { type ExpressionNode, fraction } from '../../../construction'

import { isInteger, isZero, isNumeric } from '../../structural'
import { normalize, simplify } from '../../simplification'

export function isConstantMultiple(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): boolean {
	const normalized = getNormalizedPair(a, b, settings)
	if (isZero(normalized.a) || isZero(normalized.b)) return isZero(normalized.a) === isZero(normalized.b)
	return isNumeric(getNormalizedQuotient(normalized.a, normalized.b, settings))
}

export function isIntegerMultiple(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): boolean {
	const normalized = getNormalizedPair(a, b, settings)
	if (isZero(normalized.a) || isZero(normalized.b)) return isZero(normalized.a) === isZero(normalized.b)
	return isInteger(getNormalizedQuotient(normalized.a, normalized.b, settings))
}

function getNormalizedPair(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions) {
	return {
		a: simplify(a, settings, normalize),
		b: simplify(b, settings, normalize),
	}
}

function getNormalizedQuotient(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): ExpressionNode {
	return simplify(fraction(a, b), settings, normalize)
}
