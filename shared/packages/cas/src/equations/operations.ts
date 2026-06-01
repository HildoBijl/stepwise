import { type ExpressionLike, expressionOperations } from '../expressions'

import { type Equation, type EquationLike, asEquation } from './Equation'

export const equationOperations = {
	multiplyNumeratorAndDenominator(equation: EquationLike, factor: ExpressionLike, putAtStart?: boolean): Equation {
		return asEquation(equation).mapSides(side => expressionOperations.multiplyNumeratorAndDenominator(side, factor, putAtStart))
	},
}
