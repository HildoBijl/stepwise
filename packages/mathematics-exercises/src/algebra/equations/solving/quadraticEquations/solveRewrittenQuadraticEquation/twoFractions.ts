import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { Expression, asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs, compareInputList } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges, constantMultiple, areExactlyEqual } = expressionComparisons

// a/(x+b) + c = d/(x+e).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e']

const getParameters = (example: boolean): [number, number, number, number, number] => {
	const a = randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] })
	const b = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
	const c = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
	const d = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
	const e = randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1, b] })
	return [a, b, c, d, e]
}

const getCoefficients = ([a, b, c, d, e]: [number, number, number, number, number], flip: boolean): number[] => {
	const coefficients = [c, a + c * (b + e) - d, c * b * e + a * e - d * b]
	return flip ? coefficients.map(value => -value) : coefficients
}

export default buildStepExercise({
	metadata: {
		skill: 'solveRewrittenQuadraticEquation',
		...createStepExerciseMetadata(['bringEquationToStandardForm', 'solveQuadraticEquation']),
		comparisons: {
			standardForm: {
				compareLeft: (input: Expression, correct: Expression) => { // Set up an extra check for constant multiples, since the constantMultiple in the CAS isn't fully functional yet.
					if (constantMultiple(input, correct)) return true
					const getFactor = (value: Expression) => {
						const powerTerm = value.find(term => term.isProduct() && term.factors.some(factor => factor.isPower()))
						const numericFactor = powerTerm?.find(factor => factor.isNumeric())
						return numericFactor?.isNumeric() ? numericFactor.toNumber() : 1
					}
					const adjustmentFactor = getFactor(input) / getFactor(correct)
					return constantMultiple(input, correct.multiply(adjustmentFactor).combine())
				},
				compareRight: areExactlyEqual,
			},
			// For the answers, allow the user to either keep the fraction together (default, as "(2+3sqrt(5))/6") or not (extra, as "1/3+sqrt(5)/2").
			ans1: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['combineSumFractions'])),
			ans2: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['combineSumFractions'])),
		},
	},

	generateParameters(example) {
		// Set up general parameters parameters.
		const x = sample(variableSet)
		const zeroSolutions = sample([true, false, false, false, false]) // Only have zero solutions in a small part of the cases.
		const flip = example ? false : randomBoolean()

		// Set up parameters for the equation. Ensure that the number of solutions (zero or non-zero) matches the desired setting.
		const hasZeroSolutions = (parameters: [number, number, number, number, number]) => {
			const [p, q, r] = getCoefficients(parameters, flip)
			return q ** 2 - 4 * p * r < 0
		}
		let parameters: ReturnType<typeof getParameters> | undefined
		for (let attempt = 0; attempt < 100; attempt++) {
			parameters = getParameters(example)
			if (zeroSolutions === hasZeroSolutions(parameters)) break
		}
		if (!parameters || zeroSolutions !== hasZeroSolutions(parameters)) throw new Error('Failed to generate rewritten quadratic-equation parameters with the requested solution count after 100 attempts.')

		// All done. Return the parameters.
		const [a, b, c, d, e] = parameters
		return { a, b, c, d, e, x, flip }
	},

	getSolution(parameters) {
		// Assemble the equation.
		const { a, b, c, d, e, flip } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equationBase = asEquation('a/(x+b) + c = d/(x+e)', { interpretEAsConstant: false }).substitute(variables).removeTrivial()
		const equation = flip ? equationBase.switch() : equationBase.self()

		// Bring the equation into standard form.
		const multipliedBase = asEquation('a*(x+e) + c*(x+b)*(x+e) = d*(x+b)', { interpretEAsConstant: false }).substitute(variables).removeTrivial()
		const multiplied = flip ? multipliedBase.switch() : multipliedBase.self()
		const expanded = multiplied.cancel(['expandProductsOfSums', 'expandPowersOfSums', 'combineLikeFactors'], ['combineNumbersInSums', 'combineLikeTerms']).mapEvery(term => term.isPower() ? term.combine() : term) // Expand brackets while not merging number terms. Then only merge number terms in powers (turning x^(1+1) into x^2 and 3^(1+1) into 3^2) and then finalize cleaning.
		const merged = expanded.combine(['sortSums'])
		const moved = merged.subtract(merged.right).combine(['sortSums'])

		// Find out how to adjust the equation in the end.
		const coefficients = getCoefficients([a, b, c, d, e], flip)
		let divisor = gcd(...coefficients)
		if (Math.sign(divisor) !== Math.sign(coefficients[0])) divisor *= -1
		const standardForm = moved.divide(divisor).combine(['splitFractions'], ['combineSumFractions']).removeTrivial(['factorCommonNumericTerms'])

		// Solve the equation in standard form.
		const [p, q, r] = coefficients.map(coefficient => coefficient / divisor)
		const solutionFull = asExpression('(-q±sqrt(q^2-4*p*r))/(2p)').substitute({ p, q, r }).removeTrivial()
		const rootFull = solutionFull.find(term => term.isSqrt())
		const DFull = asExpression('q^2-4*p*r').substitute({ p, q, r }).removeTrivial()
		const D = DFull.combine()
		const hasRealSolutions = !(D.isNumeric() && D.toNumber() < 0)
		const solutionHalfSimplified = asExpression('(-q±sqrt(D))/(2p)').substitute({ p, q, r, D }).removeTrivial(['combineNumbersInProducts'], ['simplifyZeroRadicandRoots'])
		const solution = hasRealSolutions ? solutionFull.combine() : solutionHalfSimplified
		const solutionsSplit = hasRealSolutions ? solution.getSingular().map(solution => solution.removeTrivial()) : [solution, solution]
		const solutions = hasRealSolutions ? solutionsSplit.map(solution => solution.normalize().format()) : solutionsSplit
		const numSolutions = hasRealSolutions ? solutions.length : 0
		const equationsSubstituted = solutions.map(solution => equation.substitute({ [variables.x.toString()]: solution }))
		const [ans1, ans2] = solutions

		// Return all calculated parameters.
		return { ...parameters, variables, equation, multiplied, expanded, merged, moved, coefficients, divisor, standardForm, p, q, r, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutionsSplit, solutions, numSolutions, equationsSubstituted, ans1, ans2 }
	},

	checkInput(data, step) {
		const { numSolutions } = data.solution!
		switch (step) {
			case 1: return compareInputs('standardForm', data)
			default: return compareInputs('numSolutions', data) && (numSolutions !== 1 || compareInputs('ans1', data)) && (numSolutions !== 2 || compareInputList(['ans1', 'ans2'], data))
		}
	},
})
