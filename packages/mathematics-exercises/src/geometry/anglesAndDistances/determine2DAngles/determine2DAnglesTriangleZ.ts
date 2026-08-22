import { randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { asExpression } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const variableSet = ['α', 'β', 'γ']
const usedVariables = ['alpha', 'beta', 'gamma']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'determine2DAngles',
		...createStepExerciseMetadata([undefined, undefined, undefined]),
	},

	generateParameters() {
		const limit = 30
		const alpha = randomInteger(limit / 5, 80 / 5) * 5 // This is the angle in the Z.
		const a = randomInteger(limit / 5, (180 - limit - alpha) / 5) * 5
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			alpha: variables.alpha,
			beta: variables.beta,
			gamma: variables.gamma,
			a,
			b: 180 - alpha - a,
			c: randomInteger(limit / 5, (180 - limit - alpha) / 5) * 5,
			rotation: randomNumber(0, 2 * Math.PI),
			reflection: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const { a, b, c } = parameters
		const alpha = asExpression(180 - a - b)
		const beta = asExpression(alpha)
		const gamma = asExpression(180 - c - beta.toNumber())
		return { ...parameters, variables, alpha, beta, gamma }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('alpha', data)
			case 2: return compare('beta', data)
			default: return compare('gamma', data)
		}
	},
})
