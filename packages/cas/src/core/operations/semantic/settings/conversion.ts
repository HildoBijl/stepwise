import { mergeDefaults } from '@step-wise/js-utils'
import { type ExpressionSettingsOptions, resolveExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction/index.ts'

import { convertExpressionToRadians, convertExpressionToDegrees } from './degrees.ts'

export function convertExpressionSettings(node: ExpressionNode, sourceSettings?: ExpressionSettingsOptions, targetSettings?: ExpressionSettingsOptions): ExpressionNode {
	const resolvedSourceSettings = resolveExpressionSettings(sourceSettings)
	const resolvedTargetSettings = resolveExpressionSettings(targetSettings)
	if (resolvedSourceSettings.angleUnit !== resolvedTargetSettings.angleUnit) node = resolvedSourceSettings.angleUnit === 'degrees' ? convertExpressionToRadians(node) : convertExpressionToDegrees(node)
	return node
}
