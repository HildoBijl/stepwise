import { randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { asExpression } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const variableSet = ['α', 'β', 'γ', 'δ']
const usedVariables = ['alpha', 'beta', 'gamma', 'delta']
const constants = ['a']

export default buildStepExercise({
	metaData: {
		skill: 'determine2DAngles',
		...stepsToSetup([undefined, undefined, undefined, undefined]),
	},

	generateParameters() {
		const limit = 30
		const twoAlpha = randomInteger(Math.ceil(limit / 4), Math.floor((90 - limit) / 4)) * 4 // This is the angle between the lines.
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			alpha: variables.alpha,
			beta: variables.beta,
			gamma: variables.gamma,
			delta: variables.delta,
			a: 90 - twoAlpha / 2,
			rotation: randomNumber(0, 2 * Math.PI),
			reflection: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const { a } = parameters
		const alpha = asExpression(90)
		const beta = asExpression(90 - a)
		const gamma = asExpression(beta)
		const delta = asExpression(180 - 90 - gamma.toNumber() - beta.toNumber())
		return { ...parameters, variables, alpha, beta, gamma, delta }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('alpha', data)
			case 2: return compare('beta', data)
			case 3: return compare('gamma', data)
			default: return compare('delta', data)
		}
	},
})
