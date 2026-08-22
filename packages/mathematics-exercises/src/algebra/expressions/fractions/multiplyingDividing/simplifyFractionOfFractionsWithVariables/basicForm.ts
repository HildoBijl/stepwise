import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p)/(b*(x+c)^q/(x+d)^r).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyFractionOfFractionsWithVariables',
		...createStepExerciseMetadata(['multiplyDivideFractions', 'simplifyFractionWithVariables']),
		compare: {
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
		},
	},

	generateParameters() {
		const factor = randomInteger(2, 6)
		const a = factor * randomInteger(2, 6)
		const b = factor * randomInteger(2, 6, { exclude: [a / factor] })
		const c = randomInteger(-4, 4)
		const d = randomInteger(-4, 4, { exclude: [c] })
		const p = randomInteger(2, 4)
		const q = p + randomInteger(1, 3)
		const r = randomInteger(2, 4)
		return {
			x: sample(variableSet),
			a, b, c, d, p, q, r,
			flip: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const baseExpression = asExpression('(a(x+c)^p)/(b(x+c)^q/(x+d)^r)').substitute(variables)
		const expression = (parameters.flip ? baseExpression.invert() : baseExpression.self()).removeTrivial()
		const singleFraction = expression.flatten(['mergeFractionProducts', 'flattenFractions'])
		const ans = expression.combine()
		return { ...parameters, variables, expression, singleFraction, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('singleFraction', data)
			default: return compare('ans', data)
		}
	},
})
