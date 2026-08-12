import { expressionComparisons } from '../expressions'

import { type EquationLike, asEquation } from './Equation'

export const equationComparisons = {
	exactEqual(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(correct).flatten().strictEqualStructure(asEquation(input).flatten())
	},

	onlyOrderChanges(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(correct).flatten().equalStructure(asEquation(input).flatten(), false)
	},

	onlyOrderChangesAndSwitch(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(correct).flatten().equalStructure(asEquation(input).flatten())
	},

	equivalentSides(input: EquationLike, correct: EquationLike): boolean {
		const inputEquation = asEquation(input)
		const correctEquation = asEquation(correct)
		return correctEquation.everySide((side, sideName) => expressionComparisons.equivalent(side, inputEquation[sideName]))
	}
	,
	equivalentSidesAndSwitch(input: EquationLike, correct: EquationLike): boolean {
		const inputEquation = asEquation(input)
		const correctEquation = asEquation(correct)
		return equationComparisons.equivalentSides(inputEquation, correctEquation) || equationComparisons.equivalentSides(inputEquation.switch(), correctEquation)
	},

	equalNumber(input: EquationLike, correct: EquationLike): boolean {
		const inputEquation = asEquation(input)
		const correctEquation = asEquation(correct)
		return expressionComparisons.equalNumber(inputEquation.left, correctEquation.left) && expressionComparisons.equalNumber(inputEquation.right, correctEquation.right)
	},

	equivalent(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(input).equivalent(correct)
	},

	integerMultiple(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(input).normalizeToZero().left.isIntegerMultiple(asEquation(correct).normalizeToZero().left)
	},

	constantMultiple(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(input).equivalent(correct)
	},
}
