import type { ExpressionInputValue } from '@step-wise/math-input-value'

import type { Expression, ExpressionAncestors, ExpressionStorageValue, ExpressionSettings } from '../expressions'

// Equation attributes
export const equationSideNames = ['left', 'right'] as const
export type EquationSideName = typeof equationSideNames[number]

// Method argument types
export type EquationSideCheck = (side: Expression, sideName: EquationSideName) => boolean
export type EquationSideTransform = (side: Expression, sideName: EquationSideName) => Expression
export type EquationSideFunction = (side: Expression, sideName: EquationSideName) => void
export type ExpressionInEquationCheck = (expression: Expression, ancestors: ExpressionAncestors, sideName: EquationSideName) => boolean
export type ExpressionInEquationTransform = (expression: Expression, ancestors: ExpressionAncestors, sideName: EquationSideName) => Expression
export type ExpressionInEquationFunction = (expression: Expression, ancestors: ExpressionAncestors, sideName: EquationSideName) => void

// Input
export type EquationInput = ExpressionInputValue | string

// Serialization
export type EquationStorageValue = Record<EquationSideName, ExpressionStorageValue>
export type SerializedEquation = {
	type: 'Equation'
	value: EquationStorageValue
	settings?: Partial<ExpressionSettings>
}
