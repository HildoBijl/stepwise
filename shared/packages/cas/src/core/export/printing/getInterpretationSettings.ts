import { omitDefaults } from '@step-wise/utils'
import { type InterpretationSettings, type InterpretationSettingsInput, defaultInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../construction'
import { hasLog, hasTrigonometry, hasMultiCharacterVariables } from '../../operations'

export function getNodeInterpretationSettings(node: ExpressionNode): InterpretationSettings {
	return {
		logarithms: defaultInterpretationSettings.logarithms || hasLog(node),
		trigonometry: defaultInterpretationSettings.trigonometry || hasTrigonometry(node),
		multiCharacterVariables: defaultInterpretationSettings.multiCharacterVariables || hasMultiCharacterVariables(node),
	}
}

export function getNodeInterpretationSettingsInput(node: ExpressionNode): InterpretationSettingsInput {
	return omitDefaults(getNodeInterpretationSettings(node), defaultInterpretationSettings)
}
