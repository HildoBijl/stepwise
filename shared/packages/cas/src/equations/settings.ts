import { mergeDefaults } from '@step-wise/utils'

import { type ExpressionComparisonSettings, defaultExpressionComparisonSettings, strictExpressionComparisonSettings } from '../expressions'

// Comparison
export type EquationComparisonSettings = ExpressionComparisonSettings & {
	allowSideSwitch: boolean
}
export type EquationComparisonSettingsInput = Partial<EquationComparisonSettings>

export const defaultEquationComparisonSettings = {
	...defaultExpressionComparisonSettings,
	allowSideSwitch: true,
}
export function asEquationComparisonSettings(settings: EquationComparisonSettingsInput): EquationComparisonSettings {
	return mergeDefaults(settings, defaultEquationComparisonSettings)
}

export const strictEquationComparisonSettings = {
	...strictExpressionComparisonSettings,
	allowSideSwitch: false,
}
export function asStrictEquationComparisonSettings(settings: EquationComparisonSettingsInput): EquationComparisonSettings {
	return mergeDefaults(settings, strictEquationComparisonSettings)
}
