import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { and } from '@step-wise/skill-setup'
import { type Equation, type Expression, asEquation, expressionComparisons, equationChecks, equationComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { hasVariableInDenominator, hasSumWithinProduct } = equationChecks
const { areExactlyEqual } = expressionComparisons
const { areEquivalent } = equationComparisons

// ax+b=(cx(x+d))/(x^2+e)
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e']

function getParameters(): [number, number, number, number, number] {
	const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
	const b = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
	const c = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
	const d = randomInteger(-8, 8, { exclude: [-1, 0, 1, b / a] })
	const e = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
	return [a, b, c, d, e]
}

function getCoefficients([a, b, c, d, e]: [number, number, number, number, number], flip: boolean): number[] {
	const p = a
	const q = b - c
	const r = a * e - c * d
	const s = b * e
	let coefficients = [p, q, r, s]
	if (flip) coefficients = coefficients.map(value => -value)
	return coefficients
}

export default buildStepExercise({
	metadata: {
		skill: 'bringEquationToStandardForm',
		...createStepExerciseMetadata(['multiplyAllEquationTerms', 'expandDoubleBrackets', and('moveEquationTerm', 'mergeSimilarTerms'), 'multiplyAllEquationTerms']),
		comparisons: {
			multiplied: (input: Equation, correct: Equation, solution: { variables: Record<string, Expression> }) => !hasVariableInDenominator(input, solution.variables.x) && areEquivalent(input, correct),
			expanded: (input: Equation, correct: Equation, solution: { variables: Record<string, Expression> }) => !hasVariableInDenominator(input, solution.variables.x) && !hasSumWithinProduct(input) && areEquivalent(input, correct),
			moved: { compareLeft: expressionComparisons.areConstantMultiples, compareRight: expressionComparisons.areExactlyEqual },
			ans: (input: Equation, correct: Equation, { normalize }: { normalize: boolean }) => (areExactlyEqual(input.left, correct.left) || (!normalize && areExactlyEqual(input.left, correct.left.negate()))) && areExactlyEqual(input.right, correct.right),
		},
	},

	generateParameters(example) {
		// Set up general parameters parameters.
		const x = sample(variableSet)
		const normalize = example ? false : randomBoolean()
		const flip = example ? false : randomBoolean()

		// Set up parameters for the equation. Ensure that (on a non-normalize exercise) there is a factor to divide by.
		let parameters: ReturnType<typeof getParameters> | undefined
		for (let attempt = 0; attempt < 100; attempt++) {
			parameters = getParameters()
			if (normalize || gcd(...getCoefficients(parameters, flip)) !== 1) break
		}
		if (!parameters || (!normalize && gcd(...getCoefficients(parameters, flip)) === 1)) throw new Error('Failed to generate non-normalized cubic-equation coefficients after 100 attempts.')

		// All done. Return the parameters.
		const [a, b, c, d, e] = parameters
		return { a, b, c, d, e, x, flip, normalize }
	},

	getSolution(parameters) {
		// Assemble the equation.
		const { a, b, c, d, e, flip, normalize } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const baseEquation = asEquation('ax+b=(cx(x+d))/(x^2+e)', { interpretEAsConstant: false }).substitute(variables).removeTrivial()
		const equation = flip ? baseEquation.switchSides() : baseEquation.self()

		// Rewrite the equation in various ways.
		const baseMultiplied = asEquation('(ax+b)(x^2+e) = cx(x+d)', { interpretEAsConstant: false }).substitute(variables).removeTrivial()
		const multiplied = flip ? baseMultiplied.switchSides() : baseMultiplied.self()
		const expanded = multiplied.cancel(['expandProductsOfSums', 'expandPowersOfSums', 'combineLikeFactors'], ['combineNumbersInSums', 'combineLikeTerms']).mapExpressions(term => term.isPower() ? term.combine() : term).cancel([], ['combineNumbersInSums', 'combineLikeTerms']) // Expand brackets while not merging number terms. Then only merge number terms in powers (turning x^(1+1) into x^2 and 3^(1+1) into 3^2) and then finalize cleaning.
		const merged = expanded.combine(['sortSums'])
		const moved = merged.subtract(merged.right).combine(['sortSums'])

		// Find out how to adjust the equation in the end.
		const coefficients = getCoefficients([a, b, c, d, e], flip)
		let divisor = normalize ? coefficients[0] : gcd(...coefficients)
		if (Math.sign(divisor) !== Math.sign(coefficients[0])) divisor *= -1
		const ans = moved.divide(divisor).combine(['splitFractions'], ['combineSumFractions']).removeTrivial(['factorCommonNumericTerms'])

		// Return all calculated parameters.
		return { ...parameters, variables, equation, multiplied, expanded, merged, moved, coefficients, divisor, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('multiplied', data)
			case 2: return compareInputs('expanded', data)
			case 3: return compareInputs('moved', data)
			default: return compareInputs('ans', data)
		}
	},
})
