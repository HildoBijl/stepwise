import { expressionComparisons } from '../expressions'

import { type EquationLike, asEquation } from './Equation'

export const equationComparisons = {
	areExactlyEqual(input: EquationLike, expected: EquationLike): boolean {
		return asEquation(expected).strictEqualStructure(asEquation(input))
	},

	areEqualExceptOrder(input: EquationLike, expected: EquationLike): boolean {
		return asEquation(expected).flatten().equalStructure(asEquation(input).flatten(), false)
	},

	areEqualExceptOrderOrSideSwitch(input: EquationLike, expected: EquationLike): boolean {
		return asEquation(expected).flatten().equalStructure(asEquation(input).flatten())
	},

	haveEquivalentSides(input: EquationLike, expected: EquationLike): boolean {
		const inputEquation = asEquation(input)
		const expectedEquation = asEquation(expected)
		return expectedEquation.everySide((side, sideName) => expressionComparisons.areEquivalent(side, inputEquation[sideName]))
	},
	haveEquivalentSidesAllowingSwitch(input: EquationLike, expected: EquationLike): boolean {
		const inputEquation = asEquation(input)
		const expectedEquation = asEquation(expected)
		return equationComparisons.haveEquivalentSides(inputEquation, expectedEquation) || equationComparisons.haveEquivalentSides(inputEquation.switchSides(), expectedEquation)
	},

	haveEqualNumericValue(input: EquationLike, expected: EquationLike): boolean {
		const inputEquation = asEquation(input)
		const expectedEquation = asEquation(expected)
		return expressionComparisons.haveEqualNumericValue(inputEquation.left, expectedEquation.left) && expressionComparisons.haveEqualNumericValue(inputEquation.right, expectedEquation.right)
	},

	areEquivalent(input: EquationLike, expected: EquationLike): boolean {
		return asEquation(input).isEquivalentTo(expected)
	},

	areIntegerMultiples(input: EquationLike, expected: EquationLike): boolean {
		return asEquation(input).normalizeToZero().left.isIntegerMultiple(asEquation(expected).normalizeToZero().left)
	},

	areConstantMultiples(input: EquationLike, expected: EquationLike): boolean {
		return asEquation(input).isEquivalentTo(expected)
	},
}
