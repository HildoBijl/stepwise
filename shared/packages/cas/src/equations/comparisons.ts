// Legacy CAS functions: These are now methods within the objects. For temporary backwards compatibility, we define these functions here anyway.

import { compareNumbers } from '@step-wise/utils'

import { type EquationLike, asEquation } from './Equation'

export function equationExactEqual(input: EquationLike, correct: EquationLike): boolean {
	return asEquation(correct).elementaryClean().strictEqualStructure(asEquation(input).elementaryClean())
}

export function equationOnlyOrderChanges(input: EquationLike, correct: EquationLike): boolean {
	return asEquation(correct).elementaryClean().equalStructure(asEquation(input).elementaryClean())
}

export function equationEqualNumber(input: EquationLike, correct: EquationLike): boolean {
	const inputEquation = asEquation(input)
	const correctEquation = asEquation(correct)

	if (!inputEquation.isNumeric() || !correctEquation.isNumeric()) return false
	return compareNumbers(inputEquation.left.toNumber(), correctEquation.left.toNumber()) &&
		compareNumbers(inputEquation.right.toNumber(), correctEquation.right.toNumber())
}

export function equationEquivalent(input: EquationLike, correct: EquationLike): boolean {
	return asEquation(input).equivalent(correct)
}

export function equationIntegerMultiple(input: EquationLike, correct: EquationLike): boolean {
	return asEquation(input).normalizeToZero().left.isIntegerMultiple(asEquation(correct).normalizeToZero().left)
}

export function equationConstantMultiple(input: EquationLike, correct: EquationLike): boolean {
	return asEquation(input).equivalent(correct)
}

export const equationComparisons = {
	exactEqual: equationExactEqual,
	onlyOrderChanges: equationOnlyOrderChanges,
	equalNumber: equationEqualNumber,
	equivalent: equationEquivalent,
	integerMultiple: equationIntegerMultiple,
	constantMultiple: equationConstantMultiple,
}
