import type { ExpressionInputValue } from '@step-wise/math-input-value'

import type { ExpressionNodeStorageValue } from '../core'

import type { ExpressionSettings } from './settings'

export type ExpressionInput = ExpressionInputValue | string | number

export type ExpressionStorageValue = ExpressionNodeStorageValue

export type SerializedExpression = {
	type: 'Expression'
	value: ExpressionStorageValue
	settings?: Partial<ExpressionSettings>
}
