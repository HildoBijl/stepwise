import { mergeDefaults, identity } from '@step-wise/utils'

import { type ExpressionPreprocess, type ExpressionComparison } from '../expressions'
import { type Equation } from './Equation'

export type EquationPreprocess = (equation: Equation) => Equation
export type EquationComparison = (input: Equation, correct: Equation) => boolean
export type EquationEqualityOptions = {
	allowOrderChanges: boolean // In expression lists, is x+y the same as y+x and is x*y the same as y*x?
	allowSwitch: boolean // Is x=2 the same as 2=x?

	preprocess: EquationPreprocess // What do we do with the equation before comparing?
	preprocessSide?: ExpressionPreprocess // What do we do with both sides before comparing?
	preprocessLeft?: ExpressionPreprocess // What do we do with the left side before comparing?
	preprocessRight?: ExpressionPreprocess // What do we do with the right side before comparing?

	compareSide?: ExpressionComparison
	compareLeft?: ExpressionComparison
	compareRight?: ExpressionComparison
}
export type EquationEqualityOptionsInput = Partial<EquationEqualityOptions>

export const defaultEquationEqualityOptions: EquationEqualityOptions = {
	allowOrderChanges: true,
	allowSwitch: true,

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
	const { preprocess, preprocessSide, preprocessLeft, preprocessRight, allowOrderChanges, allowSwitch } = asEquationEqualityOptions(options)
	return (equation: Equation) => {
		equation = preprocess(equation)
		if (preprocessSide && (preprocessLeft || preprocessRight)) throw new Error(`Invalid equation equality options: cannot define both preprocessSide and preprocessLeft/preprocessRight. Either use preprocessSide to preprocess both sides equally, or use preprocessLeft and preprocessRight to define different preprocessing for the two sides.`)
		if (preprocessSide) equation = equation.mapSides(preprocessSide)
		if (preprocessLeft) equation = equation.mapLeft(preprocessLeft)
		if (preprocessRight) equation = equation.mapLeft(preprocessRight)
		return equation
	}
}
