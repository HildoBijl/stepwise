import { InterpretationError } from '@step-wise/utils'
import { type ExpressionInputValue, type InputCursorEnd, moveRight, getSubExpression, isExpressionInputValue, stringToInputValue } from '@step-wise/math-input-value'

import { type InterpretationSettings, type ExpressionSettings, Expression, asExpression } from '../expressions'

import { type EquationInput } from './types'

type EquationParts = { left: Expression, right: Expression, expressionSettings?: Partial<ExpressionSettings> }

function interpretInputValue(value: ExpressionInputValue): EquationParts {
	const equalsPosition = findEqualsPosition(value)
	const left = { ...value, value: getSubExpression(value.value, undefined, equalsPosition) }
	const right = { ...value, value: getSubExpression(value.value, moveRight(equalsPosition), undefined) }
	return { left: asExpression(left), right: asExpression(right), expressionSettings: value.expressionSettings }
}

function interpretString(value: string, interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings>): EquationParts {
	return interpretInputValue(stringToInputValue(value, interpretationSettings, expressionSettings))
}

export function isEquationInput(value: unknown): value is EquationInput {
	return isExpressionInputValue(value) || typeof value === 'string'
}

export function interpretEquationInput(value: EquationInput, interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings>): EquationParts {
	if (isExpressionInputValue(value)) return interpretInputValue(value)
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
