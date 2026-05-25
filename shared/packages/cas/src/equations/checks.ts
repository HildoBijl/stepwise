import { type VariableLike, expressionChecks } from '../expressions'

import { type EquationLike, asEquation } from './Equation'

export const equationChecks = {
	hasSumWithinProduct(input: EquationLike): boolean { return asEquation(input).someSide(side => expressionChecks.hasSumWithinProduct(side)) },
	hasSumWithinFraction(input: EquationLike): boolean { return asEquation(input).someSide(side => expressionChecks.hasSumWithinFraction(side)) },
	hasFraction(input: EquationLike): boolean { return asEquation(input).someSide(side => expressionChecks.hasFraction(side)) },
	hasFractionSatisfying(input: EquationLike, check: Parameters<typeof expressionChecks.hasFractionSatisfying>[1]): boolean { return asEquation(input).someSide(side => expressionChecks.hasFractionSatisfying(side, check)) },
	hasFractionWithinFraction(input: EquationLike): boolean { return asEquation(input).someSide(side => expressionChecks.hasFractionWithinFraction(side)) },
	hasVariableInDenominator(input: EquationLike, variable: VariableLike): boolean { return asEquation(input).someSide(side => expressionChecks.hasVariableInDenominator(side, variable)) },
	hasPower(input: EquationLike): boolean { return asEquation(input).someSide(side => expressionChecks.hasPower(side)) },
}
