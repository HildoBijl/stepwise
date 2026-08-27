import { isPlainObject, InterpretationError } from '@step-wise/js-utils'
import { type ExpressionInputValue, type EquationInputValue, type ExpressionTextCursor, shiftExpressionTextCursorRight, sliceExpressionValue, isEquationInputValue, isTextPart, parseEquationInputValue } from '@step-wise/math-input-value'

import { type InterpretationSettingsOptions, type ExpressionSettingsOptions, isExpressionLike, Expression, asExpression } from '../expressions'

import { type EquationShape, type EquationInput } from './types'

type EquationParts = { left: Expression, right: Expression, settings?: ExpressionSettingsOptions }

function hasEquationShape(value: unknown): value is EquationShape {
	return isPlainObject(value) && isExpressionLike(value.left) && isExpressionLike(value.right)
}

export function isEquationInput(value: unknown): value is EquationInput {
	return isEquationInputValue(value) || hasEquationShape(value) || typeof value === 'string'
}

function interpretInputValue(value: EquationInputValue, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): EquationParts {
	const mergedInterpretationSettings = { ...value.interpretationSettings, ...interpretationSettings }
	const mergedExpressionSettings = { ...value.expressionSettings, ...expressionSettings }
	const adjustedValue: EquationInputValue = {
		...value,
		...(Object.keys(mergedInterpretationSettings).length === 0 ? {} : { interpretationSettings: mergedInterpretationSettings }),
		...(Object.keys(mergedExpressionSettings).length === 0 ? {} : { expressionSettings: mergedExpressionSettings }),
	}
	const equalsCursor = findEqualsCursor(adjustedValue)
	const left: ExpressionInputValue = { ...adjustedValue, value: sliceExpressionValue(adjustedValue.value, undefined, equalsCursor), type: 'Expression' }
	const right: ExpressionInputValue = { ...adjustedValue, value: sliceExpressionValue(adjustedValue.value, shiftExpressionTextCursorRight(equalsCursor), undefined), type: 'Expression' }
	return { left: asExpression(left), right: asExpression(right), settings: Object.keys(mergedExpressionSettings).length === 0 ? undefined : mergedExpressionSettings }
}

function interpretEquationShape(value: EquationShape, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): EquationParts {
	const mergedExpressionSettings = { ...value.settings, ...expressionSettings }
	const settings = Object.keys(mergedExpressionSettings).length === 0 ? undefined : mergedExpressionSettings
	const result: EquationParts = {
		left: asExpression(value.left, interpretationSettings, settings),
		right: asExpression(value.right, interpretationSettings, settings),
	}
	if (settings) result.settings = settings
	return result
}

function interpretString(value: string, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): EquationParts {
	return interpretInputValue(parseEquationInputValue(value, interpretationSettings, expressionSettings), interpretationSettings, expressionSettings)
}

export function interpretEquationInput(value: EquationInput, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): EquationParts {
	if (isEquationInputValue(value)) return interpretInputValue(value, interpretationSettings, expressionSettings)
	if (hasEquationShape(value)) return interpretEquationShape(value, interpretationSettings, expressionSettings)
	if (typeof value === 'string') return interpretString(value, interpretationSettings, expressionSettings)
	throw new Error(`Invalid equation interpretation: cannot turn input of type "${typeof value}" into an equation.`)
}

// Find the cursor of the equals sign in the ExpressionInputValue. Throw an error if there's zero or 2+.
function findEqualsCursor(value: EquationInputValue): ExpressionTextCursor {
	let result: ExpressionTextCursor | undefined
	value.value.forEach((part, partIndex) => {
		if (!isTextPart(part)) return
		const cursor = part.indexOf('=')
		if (cursor === -1) return
		if (result !== undefined || part.indexOf('=', cursor + 1) !== -1) throw new InterpretationError('Could not interpret the equation due to multiple equals signs being present.', 'MultipleEqualsSigns', partIndex)
		result = { part: partIndex, cursor }
	})
	if (result === undefined) throw new InterpretationError('Could not interpret the equation due to no equals sign being present at the ground level of the equation.', 'MissingEqualsSign')
	return result
}
