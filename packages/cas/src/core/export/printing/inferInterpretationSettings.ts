import { omitDefaults } from '@step-wise/js-utils'
import { type InterpretationSettings, type InterpretationSettingsOptions, defaultInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, namedConstants, variable } from '../../construction'
import { someNode, isNamedConstant, areConstantsEqual, isVariable, areVariablesEqual, containsLogarithm, containsTrigonometricFunction, containsMultiCharacterVariables } from '../../operations'

export function inferInterpretationSettings(node: ExpressionNode): InterpretationSettings {
	return {
		interpretEAsConstant: getEAsConstantSetting(node),
		recognizeLogarithms: defaultInterpretationSettings.recognizeLogarithms || containsLogarithm(node),
		recognizeTrigonometricFunctions: defaultInterpretationSettings.recognizeTrigonometricFunctions || containsTrigonometricFunction(node),
		allowMultiCharacterVariables: defaultInterpretationSettings.allowMultiCharacterVariables || containsMultiCharacterVariables(node),
	}
}

export function inferInterpretationSettingsOptions(node: ExpressionNode): InterpretationSettingsOptions {
	return omitDefaults(inferInterpretationSettings(node), defaultInterpretationSettings)
}

function getEAsConstantSetting(node: ExpressionNode): boolean {
	const hasConstantE = someNode(node, (node: ExpressionNode) => isNamedConstant(node) && areConstantsEqual(node, namedConstants.e))
	const hasVariableE = someNode(node, (node: ExpressionNode) => isVariable(node) && areVariablesEqual(node, variable('e')))
	if (hasConstantE) {
		if (hasVariableE) throw new Error(`Invalid expression interpretation: encountered an expression that both has a variable "e" and a named constant "e". Cannot set up a string that can properly be reinterpreted.`)
		else return true
	} else {
		if (hasVariableE) return false
		return defaultInterpretationSettings.interpretEAsConstant
	}
}
