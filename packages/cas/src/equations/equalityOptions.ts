import { mergeDefaults, identity } from '@step-wise/js-utils'

import { type ExpressionPreprocessor, type ExpressionComparison } from '../expressions'
import { type Equation } from './Equation'

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
