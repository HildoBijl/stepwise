import type { ExpressionInputValue } from '@step-wise/math-input-value'

import type { ExpressionNodeStorageValue } from '../core'

import type { ExpressionSettings } from './settings'

// Input
export type ExpressionInput = ExpressionInputValue | string | number

// Serialization
export type ExpressionStorageValue = ExpressionNodeStorageValue
export type SerializedExpression = {
	type: 'Expression'
	value: ExpressionStorageValue
	settings?: Partial<ExpressionSettings>
}
