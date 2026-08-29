import { hasOnlyKeys, isInteger, isNumber, isPlainObject, isString } from '@step-wise/js-utils'
import { isAccentName } from '@step-wise/math-input-value'

import { namedConstantsBySymbol } from '../../construction/index.ts'

import type { ExpressionNodeStorageValue } from './types.ts'

export function isExpressionNodeStorageValue(value: unknown): value is ExpressionNodeStorageValue {
	return isExpressionNodeStorageValueInternal(value, new Set())
}

function isExpressionNodeStorageValueInternal(value: unknown, ancestors: Set<object>): value is ExpressionNodeStorageValue {
	if (!isPlainObject(value) || ancestors.has(value)) return false
	ancestors.add(value)
	const valid = validateExpressionNodeStorageValue(value, ancestors)
	ancestors.delete(value)
	return valid
}

function validateExpressionNodeStorageValue(value: Record<string, unknown>, ancestors: Set<object>): boolean {
	switch (value.subtype) {
		case 'Integer': return hasOnlyKeys(value, ['subtype', 'value']) && isInteger(value.value) && value.value >= 0
		case 'Float': return hasOnlyKeys(value, ['subtype', 'value']) && isNumber(value.value) && value.value >= 0
		case 'NamedConstant': return hasOnlyKeys(value, ['subtype', 'symbol']) && isString(value.symbol) && Object.hasOwn(namedConstantsBySymbol, value.symbol)
		case 'Minus':
		case 'PlusMinus': return hasOnlyKeys(value, ['subtype', 'node']) && isExpressionNodeStorageValueInternal(value.node, ancestors)
		case 'Variable': return isVariableStorageValue(value)
		case 'Sum': return hasOnlyKeys(value, ['subtype', 'terms']) && isExpressionNodeStorageValueArray(value.terms, ancestors, 2)
		case 'Product': return hasOnlyKeys(value, ['subtype', 'factors']) && isExpressionNodeStorageValueArray(value.factors, ancestors, 2)
		case 'Power': return hasOnlyKeys(value, ['subtype', 'base', 'exponent']) && isExpressionNodeStorageValueInternal(value.base, ancestors) && isExpressionNodeStorageValueInternal(value.exponent, ancestors)
		case 'Fraction': return hasOnlyKeys(value, ['subtype', 'numerator', 'denominator']) && isExpressionNodeStorageValueInternal(value.numerator, ancestors) && isExpressionNodeStorageValueInternal(value.denominator, ancestors)
		case 'Sqrt': return hasOnlyKeys(value, ['subtype', 'radicand']) && isExpressionNodeStorageValueInternal(value.radicand, ancestors)
		case 'Root': return hasOnlyKeys(value, ['subtype', 'radicand', 'degree']) && isExpressionNodeStorageValueInternal(value.radicand, ancestors) && isExpressionNodeStorageValueInternal(value.degree, ancestors)
		case 'Ln':
		case 'Sin':
		case 'Cos':
		case 'Tan':
		case 'Arcsin':
		case 'Arccos':
		case 'Arctan': return hasOnlyKeys(value, ['subtype', 'argument']) && isExpressionNodeStorageValueInternal(value.argument, ancestors)
		case 'Log': return hasOnlyKeys(value, ['subtype', 'argument', 'base']) && isExpressionNodeStorageValueInternal(value.argument, ancestors) && isExpressionNodeStorageValueInternal(value.base, ancestors)
		default: return false
	}
}

function isVariableStorageValue(value: Record<string, unknown>): boolean {
	if (!hasOnlyKeys(value, ['subtype', 'symbol', 'subscript', 'accent']) || !isString(value.symbol) || value.symbol === '' || /[()_]/.test(value.symbol)) return false
	if (value.subscript !== undefined && (!isString(value.subscript) || value.subscript === '' || /[()]/.test(value.subscript))) return false
	return value.accent === undefined || isString(value.accent) && isAccentName(value.accent)
}

function isExpressionNodeStorageValueArray(value: unknown, ancestors: Set<object>, minimumLength = 0): value is ExpressionNodeStorageValue[] {
	if (!Array.isArray(value) || value.length < minimumLength || ancestors.has(value)) return false
	ancestors.add(value)
	for (let index = 0; index < value.length; index++) {
		if (!Object.hasOwn(value, index) || !isExpressionNodeStorageValueInternal(value[index], ancestors)) {
			ancestors.delete(value)
			return false
		}
	}
	ancestors.delete(value)
	return true
}
