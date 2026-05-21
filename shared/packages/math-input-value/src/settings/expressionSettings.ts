import { mergeDefaults } from '@step-wise/utils'

export const defaultExpressionSettings = {
	degrees: false, // Affects for instance how trigonometric functions like sine can be reduced to numbers.
}

export type ExpressionSettings = typeof defaultExpressionSettings
export type ExpressionSettingsInput = Partial<ExpressionSettings>

export function asExpressionSettings(settings: ExpressionSettingsInput): ExpressionSettings {
	return mergeDefaults(settings, defaultExpressionSettings)
}
