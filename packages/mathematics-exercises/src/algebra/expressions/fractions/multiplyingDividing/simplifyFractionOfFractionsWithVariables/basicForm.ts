import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { hasFractionWithinFraction } = expressionChecks
const { areEquivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p)/(b*(x+c)^q/(x+d)^r).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyFractionOfFractionsWithVariables',
		...createStepExerciseMetadata(['multiplyDivideFractions', 'simplifyFractionWithVariables']),
		comparisons: {
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && areEquivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && areEquivalent(input, correct),
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
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const baseExpression = asExpression('(a(x+c)^p)/(b(x+c)^q/(x+d)^r)').substitute(variables)
		const expression = (parameters.flip ? baseExpression.invert() : baseExpression.self()).removeTrivial()
		const singleFraction = expression.flatten(['combineProductFractions', 'flattenFractions'])
		const ans = expression.combine()
		return { ...parameters, variables, expression, singleFraction, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('singleFraction', data)
			default: return compareInputs('ans', data)
		}
	},
})
