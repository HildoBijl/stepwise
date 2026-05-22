// Legacy CAS functions: These are now methods within the objects. For temporary backwards compatibility, we define these functions here anyway.

import { type VariableLike, hasSumWithinProduct, hasSumWithinFraction, hasFraction, hasFractionSatisfying, hasFractionWithinFraction, hasVariableInDenominator, hasPower } from '../expressions'

import { type EquationLike, asEquation } from './Equation'

export function equationHasSumWithinProduct(input: EquationLike): boolean {
	return asEquation(input).someSide(side => hasSumWithinProduct(side))
}

export function equationHasSumWithinFraction(input: EquationLike): boolean {
	return asEquation(input).someSide(side => hasSumWithinFraction(side))
}

export function equationHasFraction(input: EquationLike): boolean {
	return asEquation(input).someSide(side => hasFraction(side))
}

export function equationHasFractionSatisfying(input: EquationLike, check: Parameters<typeof hasFractionSatisfying>[1]): boolean {
	return asEquation(input).someSide(side => hasFractionSatisfying(side, check))
}

export function equationHasFractionWithinFraction(input: EquationLike): boolean {
	return asEquation(input).someSide(side => hasFractionWithinFraction(side))
}

export function equationHasVariableInDenominator(input: EquationLike, variable: VariableLike): boolean {
	return asEquation(input).someSide(side => hasVariableInDenominator(side, variable))
}

export function equationHasPower(input: EquationLike): boolean {
	return asEquation(input).someSide(side => hasPower(side))
}

export const equationChecks = {
	hasSumWithinProduct: equationHasSumWithinProduct,
	hasSumWithinFraction: equationHasSumWithinFraction,
	hasFraction: equationHasFraction,
	hasFractionSatisfying: equationHasFractionSatisfying,
	hasFractionWithinFraction: equationHasFractionWithinFraction,
	hasVariableInDenominator: equationHasVariableInDenominator,
	hasPower: equationHasPower,
}
