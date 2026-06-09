import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettingsInput, resolveExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { convertDegreesToRadians, convertRadiansToDegrees } from './degrees'

export function convertExpressionSettings(node: ExpressionNode, oldSettings?: ExpressionSettingsInput, newSettings?: ExpressionSettingsInput): ExpressionNode {
	const oldFullSettings = resolveExpressionSettings(oldSettings)
	const newFullSettings = resolveExpressionSettings(newSettings)
	if (oldFullSettings.degrees !== newFullSettings.degrees) node = oldFullSettings.degrees ? convertDegreesToRadians(node) : convertRadiansToDegrees(node)
	return node
}
