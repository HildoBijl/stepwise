import { omitDefaults } from '@step-wise/js-utils'
import { type InterpretationSettings, type InterpretationSettingsOptions, defaultInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, namedConstants, variable } from '../../construction'
import { someDescendant, isNamedConstant, equalConstants, isVariable, equalVariables, hasLog, hasTrigonometry, hasMultiCharacterVariables } from '../../operations'

export function getNodeInterpretationSettings(node: ExpressionNode): InterpretationSettings {
	return {
		interpretEAsConstant: getEAsConstantSetting(node),
		recognizeLogarithms: defaultInterpretationSettings.recognizeLogarithms || hasLog(node),
		recognizeTrigonometricFunctions: defaultInterpretationSettings.recognizeTrigonometricFunctions || hasTrigonometry(node),
		allowMultiCharacterVariables: defaultInterpretationSettings.allowMultiCharacterVariables || hasMultiCharacterVariables(node),
	}
}

export function getNodeInterpretationSettingsInput(node: ExpressionNode): InterpretationSettingsOptions {
	return omitDefaults(getNodeInterpretationSettings(node), defaultInterpretationSettings)
}

function getEAsConstantSetting(node: ExpressionNode): boolean {
	const hasConstantE = someDescendant(node, (node: ExpressionNode) => isNamedConstant(node) && equalConstants(node, namedConstants.e), true)
	const hasVariableE = someDescendant(node, (node: ExpressionNode) => isVariable(node) && equalVariables(node, variable('e')))
	if (hasConstantE) {
		if (hasVariableE) throw new Error(`Invalid expression interpretation: encountered an expression that both has a variable "e" and a named constant "e". Cannot set up a string that can properly be reinterpreted.`)
		else return true
	} else {
		if (hasVariableE) return false
		return defaultInterpretationSettings.interpretEAsConstant
	}
}
