import { mergeDefaults } from '@step-wise/utils'

export type ExpressionComparisonSettings = {
	allowOrderChanges: boolean
}
export type ExpressionComparisonSettingsInput = Partial<ExpressionComparisonSettings>

// The default comparison settings are relatively loose and accepting.
export const defaultExpressionComparisonSettings: ExpressionComparisonSettings = {
	allowOrderChanges: true,
}
export function asExpressionComparisonSettings(settings: ExpressionComparisonSettingsInput): ExpressionComparisonSettings {
	return mergeDefaults(settings, defaultExpressionComparisonSettings)
}

// A variant is used to compare in a more strict sense.
export const strictExpressionComparisonSettings: ExpressionComparisonSettings = {
	allowOrderChanges: false,
}
export function asStrictExpressionComparisonSettings(settings: ExpressionComparisonSettingsInput): ExpressionComparisonSettings {
	return mergeDefaults(settings, strictExpressionComparisonSettings)
}
