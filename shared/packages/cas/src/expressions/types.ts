import type { ExpressionNodeStorageValue } from '../core'

import { type ExpressionSettings } from './settings'

export type ExpressionStorageValue = ExpressionNodeStorageValue

export type SerializedExpression = {
	type: 'Expression'
	value: ExpressionStorageValue
	settings?: Partial<ExpressionSettings>
}
