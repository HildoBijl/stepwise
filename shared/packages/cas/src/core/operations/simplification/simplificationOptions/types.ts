import { type ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { allSimplificationOptions } from './allSimplificationOptions'

export type SimplificationOption = typeof allSimplificationOptions[number]
export type SimplificationOptions = Record<SimplificationOption, boolean>
export type SimplificationOptionList = ReadonlySet<SimplificationOption> | readonly SimplificationOption[]
export type SimplificationOptionsInput = Partial<SimplificationOptions> | SimplificationOptionList
export type AddSimplificationOptions = Partial<SimplificationOptions> | SimplificationOptionList
export type RemoveSimplificationOptions = SimplificationOptionList

export type SimplificationPreset = SimplificationOptions | readonly SimplificationOptions[] // Legacy Simplification Presets

export type SimplificationContext = {
	simplificationOptions: SimplificationOptions
	expressionSettings: ExpressionSettings
	parents: readonly ExpressionNode[]
	simplify: (node: ExpressionNode, options?: SimplificationOptionsInput, addOptions?: AddSimplificationOptions, removeOptions?: RemoveSimplificationOptions) => ExpressionNode
}
