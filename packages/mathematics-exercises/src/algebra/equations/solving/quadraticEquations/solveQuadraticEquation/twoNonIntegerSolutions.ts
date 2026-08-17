import { sample, getRandomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { Expression, asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare, compareList } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'solveQuadraticEquation',
		weight: 3,
		...stepsToSetup(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined, and('simplifyFraction', 'simplifyRoot')]),
		compare: {
			a: {}, b: {}, c: {}, solutionFull: equivalent, D: {}, numSolutions: {},
			// For the answers, allow the user to either keep the fraction together (default, as "(2+3sqrt(5))/6") or not (extra, as "1/3+sqrt(5)/2").
			ans1: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
			ans2: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
		},
	},

	generateState() {
		let a = 0, b = 0, c = 0
		while (a === 0 || b ** 2 - 4 * a * c <= 0) {
			a = getRandomInteger(-6, 6, [0])
			b = getRandomInteger(-12, 12)
			c = getRandomInteger(-40, 40)
		}
		return { x: sample(variableSet), a: asExpression(a), b: asExpression(b), c: asExpression(c) }
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const equation = asEquation('a*x^2 + b*x + c = 0').substitute(variables).removeTrivial()
		const solutionFull = asExpression('(-b±sqrt(b^2-4*a*c))/(2a)').substitute(variables).removeTrivial()
		const rootFull = solutionFull.find(term => term.isSqrt())
		if (!rootFull?.isSqrt()) throw new Error('Expected the quadratic formula to contain a square root.')
		const DFull = rootFull.radicand
		const D = DFull.combine()
		const solutionHalfSimplified = asExpression('(-b±sqrt(D))/(2a)').substitute({ ...variables, D }).removeTrivial([], ['reduceRootsWithZeroRadicand'])
		const solution = solutionFull.combine()
		const solutionsSplit = solution.getSingular().map(solution => solution.removeTrivial())
		const solutions = solutionsSplit.map(solution => solution.normalize().format())
		const numSolutions = solutions.length
		const equationsSubstituted = solutions.map(solution => equation.substitute({ [variables.x.toString()]: solution }))
		const [ans1, ans2] = solutions
		return { ...state, variables, equation, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutionsSplit, solutions, numSolutions, equationsSubstituted, ans1, ans2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['a', 'b', 'c'], data)
			case 2: return compare('solutionFull', data)
			case 3: return compare('D', data)
			case 4: return compare('numSolutions', data)
			case 5: return compareList(['ans1', 'ans2'], data)
			default: return compare('numSolutions', data) && compareList(['ans1', 'ans2'], data)
		}
	},
})
