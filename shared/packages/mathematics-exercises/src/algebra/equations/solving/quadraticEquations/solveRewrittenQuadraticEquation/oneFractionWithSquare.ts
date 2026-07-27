import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { gcd } from '@step-wise/math-tools'
import { Expression, asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare, compareList } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, constantMultiple, exactEqual } = expressionComparisons

// (x+a)^2/(x+b) = cx+d.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

const getParameters = (): [number, number, number, number] => {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [-1, 0, 1, a])
	const c = getRandomInteger(-8, 8, [-1, 0, 1])
	const d = getRandomInteger(-8, 8, [-1, 0, 1, a * c, b * c])
	return [a, b, c, d]
}

const getCoefficients = ([a, b, c, d]: [number, number, number, number], flip: boolean): number[] => {
	const coefficients = [1 - c, 2 * a - c * b - d, a ** 2 - b * d]
	return flip ? coefficients.map(value => -value) : coefficients
}

export default buildStepExercise({
	metaData: {
		skill: 'solveRewrittenQuadraticEquation',
		...stepsToSetup(['bringEquationToStandardForm', 'solveQuadraticEquation']),
		compare: {
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
				compareRight: exactEqual,
			},
			// For the answers, allow the user to either keep the fraction together (default, as "(2+3sqrt(5))/6") or not (extra, as "1/3+sqrt(5)/2").
			ans1: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
			ans2: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
		},
	},

	generateState(example) {
		// Set up general state parameters.
		const x = sample(variableSet)
		const zeroSolutions = sample([true, false, false, false, false]) // Only have zero solutions in a small part of the cases.
		const flip = example ? false : getRandomBoolean()

		// Set up parameters for the equation. Ensure that the number of solutions (zero or non-zero) matches the desired setting.
		let parameters = getParameters()
		const hasZeroSolutions = (parameters: [number, number, number, number]) => {
			const [p, q, r] = getCoefficients(parameters, flip)
			return q ** 2 - 4 * p * r < 0
		}
		while (zeroSolutions !== hasZeroSolutions(parameters)) parameters = getParameters()

		// All done. Return the state.
		const [a, b, c, d] = parameters
		return { a, b, c, d, x, flip }
	},

	getSolution(state) {
		// Assemble the equation.
		const { a, b, c, d, flip } = state
		const variables = filterVariables(state, usedVariables, constants)
		const equationBase = asEquation('(x+a)^2/(x+b) = cx+d').substitute(variables).removeTrivial()
		const equation = flip ? equationBase.switch() : equationBase.self()

		// Bring the equation into standard form.
		const multipliedBase = asEquation('(x+a)^2 = (cx+d)(x+b)').substitute(variables).removeTrivial()
		const multiplied = flip ? multipliedBase.switch() : multipliedBase.self()
		const expanded = multiplied.cancel(['expandProductsOfSums', 'expandPowersOfSums', 'mergeProductFactors'], ['mergeSumNumbers', 'groupSumTerms']).mapEvery(term => term.isPower() ? term.combine() : term) // Expand brackets while not merging number terms. Then only merge number terms in powers (turning x^(1+1) into x^2 and 3^(1+1) into 3^2) and then finalize cleaning.
		const merged = expanded.combine(['sortSums'])
		const moved = merged.subtract(merged.right).combine(['sortSums'])

		// Find out how to adjust the equation in the end.
		const coefficients = getCoefficients([a, b, c, d], flip)
		let divisor = gcd(...coefficients)
		if (Math.sign(divisor) !== Math.sign(coefficients[0])) divisor *= -1
		const standardForm = moved.divide(divisor).combine(['splitFractions'], ['mergeFractionSums']).removeTrivial(['pullOutCommonSumNumbers'])

		// Solve the equation in standard form.
		const [p, q, r] = coefficients.map(coefficient => coefficient / divisor)
		const solutionFull = asExpression('(-q±sqrt(q^2-4*p*r))/(2p)').substitute({ p, q, r }).removeTrivial()
		const rootFull = solutionFull.find(term => term.isSqrt())
		if (!rootFull?.isSqrt()) throw new Error('Expected the quadratic formula to contain a square root.')
		const DFull = rootFull.radicand
		const D = DFull.combine()
		const solutionHalfSimplified = asExpression('(-q±sqrt(D))/(2p)').substitute({ p, q, r, D }).removeTrivial(['mergeProductNumbers'], ['reduceRootsWithZeroRadicand'])
		const solution = solutionFull.combine()
		const solutionsSplit = solution.getSingular().map(solution => solution.removeTrivial())
		const solutions = solutionsSplit.map(solution => solution.normalize().format())
		const numSolutions = D.isNumeric() && D.toNumber() < 0 ? 0 : solutions.length
		const equationsSubstituted = solutions.map(solution => equation.substitute({ [variables.x.toString()]: solution }))
		const [ans1, ans2] = solutions

		// Return all calculated parameters.
		return { ...state, variables, equation, multiplied, expanded, merged, moved, coefficients, divisor, standardForm, p, q, r, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutionsSplit, solutions, numSolutions, equationsSubstituted, ans1, ans2 }
	},

	checkInput(data, step) {
		const { numSolutions } = data.solution!
		switch (step) {
			case 1: return compare('standardForm', data)
			default: return compare('numSolutions', data) && (numSolutions !== 1 || compare('ans1', data)) && (numSolutions !== 2 || compareList(['ans1', 'ans2'], data))
		}
	},
})
