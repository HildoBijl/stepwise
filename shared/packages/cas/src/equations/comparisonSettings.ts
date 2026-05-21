import { mergeDefaults } from '@step-wise/utils'

import { defaultExpressionComparisonSettings, strictExpressionComparisonSettings } from '../expressions'

// Default comparison
export const defaultEquationComparisonSettings = {
	...defaultExpressionComparisonSettings,
	allowSideSwitch: true, // Is x+2=5 the same as 5=x+2?
}
export type EquationComparisonSettings = typeof defaultEquationComparisonSettings
export type EquationComparisonSettingsInput = Partial<EquationComparisonSettings>
export function asEquationComparisonSettings(settings: EquationComparisonSettingsInput): EquationComparisonSettings {
	return mergeDefaults(settings, defaultEquationComparisonSettings)
}

// Strict comparison
export const strictEquationComparisonSettings = {
	...strictExpressionComparisonSettings,
	allowSideSwitch: false,
}
export function asStrictEquationComparisonSettings(settings: EquationComparisonSettingsInput): EquationComparisonSettings {
	return mergeDefaults(settings, strictEquationComparisonSettings)
}
