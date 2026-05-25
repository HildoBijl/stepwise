import { expressionComparisons } from '../expressions'

import { type EquationLike, asEquation } from './Equation'

export const equationComparisons = {
	exactEqual(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(correct).elementaryClean().strictEqualStructure(asEquation(input).elementaryClean())
	},

	onlyOrderChanges(input: EquationLike, correct: EquationLike): boolean {
		return asEquation(correct).elementaryClean().equalStructure(asEquation(input).elementaryClean())
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
