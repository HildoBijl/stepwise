import { hasOneToOneMatching } from '@step-wise/js-utils'
import { type ExpressionSettingsOptions } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction/index.ts'

import { subtract, isZero, expandToSingulars } from '../../structural/index.ts'
import { simplify, normalize } from '../../simplification/index.ts'

export function areEquivalent(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): boolean {
	const aSingulars = expandToSingulars(a)
	const bSingulars = expandToSingulars(b)
	return hasOneToOneMatching(aSingulars, bSingulars, (a, b) => equivalentSingular(a, b, settings))
}

function equivalentSingular(a: ExpressionNode, b: ExpressionNode, settings: ExpressionSettingsOptions = {}): boolean {
	return isZero(simplify(subtract(a, b), settings, normalize))
}
