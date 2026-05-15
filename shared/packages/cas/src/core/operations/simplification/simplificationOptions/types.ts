import { type ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { allSimplificationOptionsList } from './allSimplificationOptions'

export type SimplificationOption = typeof allSimplificationOptionsList[number]
export type SimplificationOptions = ReadonlySet<SimplificationOption>
export type SimplificationOptionsInput = SimplificationOptions | readonly SimplificationOption[]

export type Simplify = (node: ExpressionNode, options?: SimplificationOptionsInput) => ExpressionNode
export type SimplificationContext = {
	simplificationOptions: SimplificationOptions
	expressionSettings: ExpressionSettings
	parents: readonly ExpressionNode[]
	simplify: Simplify
}

// Legacy Simplification Presets: use objects to represent simplification options.
export type SimplificationOptionsObject = Record<SimplificationOption, boolean>
export type SimplificationPreset = SimplificationOptionsObject | readonly SimplificationOptionsObject[]
