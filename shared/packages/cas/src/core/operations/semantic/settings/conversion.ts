import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { convertDegreesToRadians, convertRadiansToDegrees } from './degrees'

export function convertExpressionSettings(node: ExpressionNode, oldSettings: Partial<ExpressionSettings>, newSettings: Partial<ExpressionSettings>): ExpressionNode {
	const oldFullSettings = mergeDefaults(oldSettings, defaultExpressionSettings)
	const newFullSettings = mergeDefaults(newSettings, defaultExpressionSettings)
	if (oldFullSettings.degrees !== newFullSettings.degrees) node = oldFullSettings.degrees ? convertDegreesToRadians(node) : convertRadiansToDegrees(node)
	return node
}
