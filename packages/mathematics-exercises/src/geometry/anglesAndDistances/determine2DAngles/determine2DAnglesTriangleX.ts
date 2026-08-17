import { getRandomNumber, getRandomBoolean, getRandomInteger } from '@step-wise/js-utils'
import { asExpression } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const variableSet = ['α', 'β', 'γ']
const usedVariables = ['alpha', 'beta', 'gamma']
const constants = ['a', 'b']

export default buildStepExercise({
	metaData: {
		skill: 'determine2DAngles',
		...stepsToSetup([undefined, undefined, undefined]),
	},

	generateState() {
		const limit = 30
		const alpha = getRandomInteger(limit / 5, (90 - limit) / 5) * 5 // This is the angle in the X.
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			alpha: variables.alpha,
			beta: variables.beta,
			gamma: variables.gamma,
			a: 90 - alpha,
			b: getRandomInteger(10, (180 - limit - alpha) / 5) * 5,
			rotation: getRandomNumber(0, 2 * Math.PI),
			reflection: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const { a, b } = state
		const alpha = asExpression(90 - a)
		const beta = asExpression(alpha)
		const gamma = asExpression(180 - b - beta.toNumber())
		return { ...state, variables, alpha, beta, gamma }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('alpha', data)
			case 2: return compare('beta', data)
			default: return compare('gamma', data)
		}
	},
})
