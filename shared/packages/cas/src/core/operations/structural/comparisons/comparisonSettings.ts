import { mergeDefaults } from '@step-wise/utils'

// The default comparison settings are relatively loose and accepting.
export const defaultExpressionComparisonSettings = {
	allowOrderChanges: true, // In expression lists, check order or check permutation? Is x+y the same as y+x and x*y the same as y*x?
}
export type ExpressionComparisonSettings = typeof defaultExpressionComparisonSettings
export type ExpressionComparisonSettingsInput = Partial<ExpressionComparisonSettings>
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
