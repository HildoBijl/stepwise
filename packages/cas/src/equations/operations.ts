import { type ExpressionLike, type MultiplyNumeratorAndDenominatorOptions, expressionOperations } from '../expressions/index.ts'

import { type Equation, type EquationLike, asEquation } from './Equation.ts'

export const equationOperations = {
	multiplyNumeratorAndDenominator(equation: EquationLike, factor: ExpressionLike, options: MultiplyNumeratorAndDenominatorOptions = {}): Equation {
		return asEquation(equation).mapSides(side => expressionOperations.multiplyNumeratorAndDenominator(side, factor, options))
	},
}
