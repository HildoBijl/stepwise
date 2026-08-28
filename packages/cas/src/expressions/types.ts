import type { ExpressionInputValue } from '@step-wise/math-input-value'

import type { ExpressionNodeStorageValue } from '../core/index.ts'

import type { ExpressionSettingsOptions } from './settings.ts'

// Input
export type ExpressionInput = ExpressionInputValue | string | number

// Serialization
export type ExpressionStorageValue = ExpressionNodeStorageValue
export type SerializedExpression = {
	type: 'Expression'
	value: ExpressionStorageValue
	settings?: ExpressionSettingsOptions
}
