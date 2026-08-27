import { isPlainObject, mergeDefaults } from '@step-wise/js-utils'

export type AngleUnit = 'radians' | 'degrees'
export type ExpressionSettings = { angleUnit: AngleUnit }
export type ExpressionSettingsOptions = Partial<ExpressionSettings>

export const defaultExpressionSettings: ExpressionSettings = {
	angleUnit: 'radians', // Affects for instance how trigonometric functions like sine can be reduced to numbers.
}

export function isExpressionSettingsOptions(value: unknown): value is ExpressionSettingsOptions {
	return isPlainObject(value) && (value.angleUnit === undefined || value.angleUnit === 'radians' || value.angleUnit === 'degrees')
}

export function resolveExpressionSettings(settings?: ExpressionSettingsOptions): ExpressionSettings {
	return mergeDefaults(settings ?? {}, defaultExpressionSettings)
}
