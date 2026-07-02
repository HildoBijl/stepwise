import { hasOneToOneMatching } from '@step-wise/utils'
import { type ExpressionSettingsInput } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { subtract, isZero, expandToSingulars } from '../../structural'
import { simplify, normalize } from '../../simplification'

export function equivalent(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsInput = {}): boolean {
	const aSingulars = expandToSingulars(a)
	const bSingulars = expandToSingulars(b)
	return hasOneToOneMatching(aSingulars, bSingulars, (a, b) => equivalentSingular(a, b, settings))
}

function equivalentSingular(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsInput = {}): boolean {
	return isZero(simplify(subtract(a, b), settings, normalize))
}
