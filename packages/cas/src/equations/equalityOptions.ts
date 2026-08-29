import { hasOnlyKeys, isPlainObject, mergeDefaults, identity } from '@step-wise/js-utils'

import { type ExpressionPreprocessor, type ExpressionComparison } from '../expressions/index.ts'
import { type Equation } from './Equation.ts'

export type EquationPreprocessor = (equation: Equation) => Equation
export type EquationComparison = (input: Equation, expected: Equation) => boolean
export type EquationEqualityOptions = {
	allowOrderChanges: boolean // In expression lists, is x+y the same as y+x and is x*y the same as y*x?
	allowSideSwitch: boolean // Is x=2 the same as 2=x?
	allowNegatingBothSides: boolean // Is x=2 the same as -x=-2x?

	preprocess: EquationPreprocessor // What do we do with the equation before comparing?
	preprocessSide?: ExpressionPreprocessor // What do we do with both sides before comparing?
	preprocessLeft?: ExpressionPreprocessor // What do we do with the left side before comparing?
	preprocessRight?: ExpressionPreprocessor // What do we do with the right side before comparing?

	compareSide?: ExpressionComparison
	compareLeft?: ExpressionComparison
	compareRight?: ExpressionComparison
}
export type EquationEqualityOptionsInput = Partial<EquationEqualityOptions>
export type EquationStructureComparisonOptions = Pick<EquationEqualityOptionsInput, 'allowOrderChanges' | 'allowSideSwitch'>
export type EquationMultipleComparisonOptions = Pick<EquationEqualityOptionsInput, 'allowSideSwitch'>

export const defaultEquationEqualityOptions: EquationEqualityOptions = {
	allowOrderChanges: true,
	allowSideSwitch: true,
	allowNegatingBothSides: false,

	preprocess: identity,
	preprocessSide: undefined,
	preprocessLeft: undefined,
	preprocessRight: undefined,

	compareSide: undefined,
	compareLeft: undefined,
	compareRight: undefined,
}

export function isEquationEqualityOptionsInput(value: unknown): value is EquationEqualityOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['allowOrderChanges', 'allowSideSwitch', 'allowNegatingBothSides', 'preprocess', 'preprocessSide', 'preprocessLeft', 'preprocessRight', 'compareSide', 'compareLeft', 'compareRight'])) return false
	if (value.allowOrderChanges !== undefined && typeof value.allowOrderChanges !== 'boolean') return false
	if (value.allowSideSwitch !== undefined && typeof value.allowSideSwitch !== 'boolean') return false
	if (value.allowNegatingBothSides !== undefined && typeof value.allowNegatingBothSides !== 'boolean') return false
	for (const key of ['preprocess', 'preprocessSide', 'preprocessLeft', 'preprocessRight', 'compareSide', 'compareLeft', 'compareRight'] as const) {
		if (value[key] !== undefined && typeof value[key] !== 'function') return false
	}
	if (value.preprocessSide && (value.preprocessLeft || value.preprocessRight)) return false
	if (value.compareSide && (value.compareLeft || value.compareRight)) return false
	return true
}
export function asEquationEqualityOptions(options: EquationEqualityOptionsInput = {}): EquationEqualityOptions {
	return mergeDefaults(options, defaultEquationEqualityOptions)
}

export function getEquationPreprocessor(options: EquationEqualityOptionsInput): (equation: Equation) => Equation {
	const { preprocess, preprocessSide, preprocessLeft, preprocessRight } = asEquationEqualityOptions(options)
	return (equation: Equation) => {
		equation = preprocess(equation)
		if (preprocessSide && (preprocessLeft || preprocessRight)) throw new Error(`Invalid equation equality options: cannot define both preprocessSide and preprocessLeft/preprocessRight. Either use preprocessSide to preprocess both sides equally, or use preprocessLeft and preprocessRight to define different preprocessing for the two sides.`)
		if (preprocessSide) equation = equation.mapSides(preprocessSide)
		if (preprocessLeft) equation = equation.mapLeft(preprocessLeft)
		if (preprocessRight) equation = equation.mapRight(preprocessRight)
		return equation
	}
}
