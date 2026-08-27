import { type ExpressionLike, type MultiplyNumeratorAndDenominatorOptions, expressionOperations } from '../expressions'

import { type Equation, type EquationLike, asEquation } from './Equation'

export const equationOperations = {
	multiplyNumeratorAndDenominator(equation: EquationLike, factor: ExpressionLike, options: MultiplyNumeratorAndDenominatorOptions = {}): Equation {
		return asEquation(equation).mapSides(side => expressionOperations.multiplyNumeratorAndDenominator(side, factor, options))
	},
}
