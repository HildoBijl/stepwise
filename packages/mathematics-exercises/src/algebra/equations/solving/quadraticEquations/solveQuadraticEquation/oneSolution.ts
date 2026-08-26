import { sample, randomInteger } from '@step-wise/js-utils'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'solveQuadraticEquation',
		weight: 1,
		...createStepExerciseMetadata(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined, 'simplifyFraction']),
		comparisons: { a: {}, b: {}, c: {}, solutionFull: equivalent, D: {}, numSolutions: {}, ans1: onlyOrderChanges },
	},

	generateParameters() {
		// We want integer coefficients in the equation, but a possibly non-integer solution "numerator/denominator". So we set up the equation a*(x - numerator/denominator)^2 = 0, rewrite it to a*x^2 - 2*a*(numerator/denominator) + a*(numerator/denominator)^2 = 0, and check if this gives integer coefficients.
		let a = 0, denominator = 1, numerator = 0
		for (let attempt = 0; attempt < 100; attempt++) {
			a = randomInteger(-6, 6, { exclude: [0] })
			numerator = randomInteger(-12, 12)
			denominator = randomInteger(-6, 6, { exclude: [0] })
			if (2 * a * numerator % denominator === 0 && a * numerator ** 2 % denominator ** 2 === 0 && numerator !== 0) break
		}
		if (2 * a * numerator % denominator !== 0 || a * numerator ** 2 % denominator ** 2 !== 0 || numerator === 0) throw new Error('Failed to generate a quadratic equation with one solution after 100 attempts.')
		const b = -2 * a * numerator / denominator
		const c = a * (numerator / denominator) ** 2
		return { x: sample(variableSet), a: asExpression(a), b: asExpression(b), c: asExpression(c) }
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equation = asEquation('a*x^2 + b*x + c = 0').substitute(variables).removeTrivial()
		const solutionFull = asExpression('(-b±sqrt(b^2-4*a*c))/(2a)').substitute(variables).removeTrivial()
		const rootFull = solutionFull.find(term => term.isSqrt())
		if (!rootFull?.isSqrt()) throw new Error('Expected the quadratic formula to contain a square root.')
		const DFull = rootFull.radicand
		const D = DFull.combine()
		const solutionHalfSimplified = asExpression('(-b±sqrt(D))/(2a)').substitute({ ...variables, D }).removeTrivial([], ['reduceRootsWithZeroRadicand'])
		const solution = solutionFull.combine()
		const solutions = solution.getSingular().map(solution => solution.removeTrivial().combine())
		const numSolutions = solutions.length
		const [ans1] = solutions
		const equationsSubstituted = equation.substitute({ [variables.x.toString()]: ans1 })
		return { ...parameters, variables, equation, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutions, numSolutions, equationsSubstituted, ans1 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['a', 'b', 'c'], data)
			case 2: return compareInputs('solutionFull', data)
			case 3: return compareInputs('D', data)
			case 4: return compareInputs('numSolutions', data)
			case 5: return compareInputs('ans1', data)
			default: return compareInputs(['numSolutions', 'ans1'], data)
		}
	},
})
