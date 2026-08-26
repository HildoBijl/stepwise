import { sample, randomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { Expression, asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs, compareInputList } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'solveQuadraticEquation',
		weight: 3,
		...createStepExerciseMetadata(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined, and('simplifyFraction', 'simplifyRoot')]),
		comparisons: {
			a: {}, b: {}, c: {}, solutionFull: equivalent, D: {}, numSolutions: {},
			// For the answers, allow the user to either keep the fraction together (default, as "(2+3sqrt(5))/6") or not (extra, as "1/3+sqrt(5)/2").
			ans1: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
			ans2: (input: Expression, correct: Expression) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
		},
	},

	generateParameters() {
		let a = 0, b = 0, c = 0
		for (let attempt = 0; attempt < 100; attempt++) {
			a = randomInteger(-6, 6, { exclude: [0] })
			b = randomInteger(-12, 12)
			c = randomInteger(-40, 40)
			const discriminant = b ** 2 - 4 * a * c
			if (discriminant > 0 && !Number.isInteger(Math.sqrt(discriminant))) break
		}
		const discriminant = b ** 2 - 4 * a * c
		if (discriminant <= 0 || Number.isInteger(Math.sqrt(discriminant))) throw new Error('Failed to generate a quadratic equation with two non-integer solutions after 100 attempts.')
		return { x: sample(variableSet), a: asExpression(a), b: asExpression(b), c: asExpression(c) }
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
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
		return { ...parameters, variables, equation, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutionsSplit, solutions, numSolutions, equationsSubstituted, ans1, ans2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['a', 'b', 'c'], data)
			case 2: return compareInputs('solutionFull', data)
			case 3: return compareInputs('D', data)
			case 4: return compareInputs('numSolutions', data)
			case 5: return compareInputList(['ans1', 'ans2'], data)
			default: return compareInputs('numSolutions', data) && compareInputList(['ans1', 'ans2'], data)
		}
	},
})
