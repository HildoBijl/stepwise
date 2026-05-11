import { type ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { allSimplificationOptions } from './allSimplificationOptions'

export type SimplificationOption = typeof allSimplificationOptions[number]
export type SimplificationOptions = Record<SimplificationOption, boolean>
export type SimplificationPreset = SimplificationOptions | readonly SimplificationOptions[]

export type SimplificationContext = {
	simplificationOptions: SimplificationOptions
	expressionSettings: ExpressionSettings
	parents: readonly ExpressionNode[]
	simplify: (node: ExpressionNode, options?: Partial<SimplificationOptions>) => ExpressionNode
}
