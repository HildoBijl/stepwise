import { mergeDefaults } from '@step-wise/utils'

export type ExpressionSettings = {
	degrees: boolean
}
export type ExpressionSettingsInput = Partial<ExpressionSettings>

export const defaultExpressionSettings: ExpressionSettings = {
	degrees: false, // Affects for instance how trigonometric functions like sine can be reduced to numbers.
}
export function asExpressionSettings(settings: ExpressionSettingsInput): ExpressionSettings {
	return mergeDefaults(settings, defaultExpressionSettings)
}
