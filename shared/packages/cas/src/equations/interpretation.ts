import { isPlainObject, InterpretationError } from '@step-wise/utils'
import { type ExpressionInputValue, type InputCursorEnd, moveRight, getSubExpression, isExpressionInputValue, stringToInputValue } from '@step-wise/math-input-value'

import { type InterpretationSettingsInput, type ExpressionSettingsInput, isExpressionLike, Expression, asExpression } from '../expressions'

import { type EquationShape, type EquationInput } from './types'

type EquationParts = { left: Expression, right: Expression, settings?: ExpressionSettingsInput }

function hasEquationShape(value: unknown): value is EquationShape {
	return isPlainObject(value) && isExpressionLike(value.left) && isExpressionLike(value.right)
}

export function isEquationInput(value: unknown): value is EquationInput {
	return isExpressionInputValue(value) || hasEquationShape(value) || typeof value === 'string'
}

function interpretInputValue(value: ExpressionInputValue): EquationParts {
	const equalsPosition = findEqualsPosition(value)
	const left = { ...value, value: getSubExpression(value.value, undefined, equalsPosition) }
	const right = { ...value, value: getSubExpression(value.value, moveRight(equalsPosition), undefined) }
	return { left: asExpression(left), right: asExpression(right), settings: value.expressionSettings }
}

function interpretEquationShape(value: EquationShape): EquationParts {
	const result: EquationParts = { left: asExpression(value.left), right: asExpression(value.right) }
	if (value.settings) result.settings = value.settings
	return result
}

function interpretString(value: string, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): EquationParts {
	return interpretInputValue(stringToInputValue(value, interpretationSettings, expressionSettings))
}

export function interpretEquationInput(value: EquationInput, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): EquationParts {
	if (isExpressionInputValue(value)) return interpretInputValue(value)
	if (hasEquationShape(value)) return interpretEquationShape(value)
	if (typeof value === 'string') return interpretString(value, interpretationSettings, expressionSettings)
	throw new Error(`Invalid equation interpretation: cannot turn input of type "${typeof value}" into an equation.`)
}

// Find the position of the equals sign in the ExpressionInputValue. Throw an error if there's zero or 2+.
function findEqualsPosition(value: ExpressionInputValue): InputCursorEnd {
	let result: InputCursorEnd | undefined
	value.value.forEach((part, partIndex) => {
		if (part.type !== 'ExpressionPart') return
		const cursor = part.value.indexOf('=')
		if (cursor === -1) return
		if (result !== undefined || part.value.indexOf('=', cursor + 1) !== -1) throw new InterpretationError('Could not interpret the equation due to multiple equals signs being present.', 'MultipleEqualsSigns', partIndex)
		result = { part: partIndex, cursor }
	})
	if (result === undefined) throw new InterpretationError('Could not interpret the equation due to no equals sign being present at the ground level of the equation.', 'MissingEqualsSign')
	return result
}
