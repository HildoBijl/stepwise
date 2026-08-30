import { randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { asExpression, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

const variableSet = ['α', 'β', 'γ']
const usedVariables = ['alpha', 'beta', 'gamma']
const constants = ['a', 'b']

export default buildStepExercise({
	metadata: {
		skill: 'determine2DAngles',
		...createStepExerciseMetadata([undefined, undefined, undefined]),
		comparisons: { Expression: expressionComparisons.haveEqualNumericValue },
	},

	generateParameters() {
		const limit = 30
		const alpha = randomInteger(limit / 5, (90 - limit) / 5) * 5 // This is the angle in the X.
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			alpha: variables.alpha,
			beta: variables.beta,
			gamma: variables.gamma,
			a: 90 - alpha,
			b: randomInteger(10, (180 - limit - alpha) / 5) * 5,
			rotation: randomNumber(0, 2 * Math.PI),
			reflection: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const { a, b } = parameters
		const alpha = asExpression(90 - a)
		const beta = asExpression(alpha)
		const gamma = asExpression(180 - b - beta.toNumber())
		return { ...parameters, variables, alpha, beta, gamma }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('alpha', data)
			case 2: return compareInputs('beta', data)
			default: return compareInputs('gamma', data)
		}
	},
})
