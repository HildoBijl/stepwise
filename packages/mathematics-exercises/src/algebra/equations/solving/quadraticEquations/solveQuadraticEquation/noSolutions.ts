import { sample, randomInteger } from '@step-wise/js-utils'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'solveQuadraticEquation',
		weight: 1,
		...stepsToSetup(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined]),
		compare: { a: {}, b: {}, c: {}, solutionFull: equivalent, D: {}, numSolutions: {} },
	},

	generateState() {
		let a = 0, b = 0, c = 0
		while (a === 0 || b ** 2 - 4 * a * c >= 0) {
			a = randomInteger(-6, 6, { exclude: [0] })
			b = randomInteger(-12, 12)
			c = randomInteger(-40, 40)
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
		const numSolutions = 0
		return { ...state, variables, equation, solutionFull, rootFull, DFull, D, numSolutions }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['a', 'b', 'c'], data)
			case 2: return compare('solutionFull', data)
			case 3: return compare('D', data)
			default: return compare('numSolutions', data)
		}
	},
})
