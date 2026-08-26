import { mergeDefaults } from '@step-wise/js-utils'
import { type ExpressionSettingsOptions, resolveExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { convertDegreesToRadians, convertRadiansToDegrees } from './degrees'

export function convertExpressionSettings(node: ExpressionNode, oldSettings?: ExpressionSettingsOptions, newSettings?: ExpressionSettingsOptions): ExpressionNode {
	const oldFullSettings = resolveExpressionSettings(oldSettings)
	const newFullSettings = resolveExpressionSettings(newSettings)
	if (oldFullSettings.angleUnit !== newFullSettings.angleUnit) node = oldFullSettings.angleUnit === 'degrees' ? convertDegreesToRadians(node) : convertRadiansToDegrees(node)
	return node
}
