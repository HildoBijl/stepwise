const { getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { asExpression } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
const { selectRandomVariables, filterVariables } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ']
const usedVariables = ['alpha', 'beta', 'gamma']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'determine2DAngles',
	...stepsToSetup([undefined, undefined, undefined]),
}

function generateState() {
	const limit = 30
	const alpha = getRandomInteger(limit / 5, 80 / 5) * 5 // This is the angle in the Z.
	const a = getRandomInteger(limit / 5, (180 - limit - alpha) / 5) * 5
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a,
		b: 180 - alpha - a,
		c: getRandomInteger(limit / 5, (180 - limit - alpha) / 5) * 5,
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const { a, b, c } = state
	const alpha = asExpression(180 - a - b)
	const beta = asExpression(alpha)
	const gamma = asExpression(180 - c - beta.toNumber())
	return { ...state, variables, alpha, beta, gamma }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('alpha', data)
		case 2:
			return compare('beta', data)
		default:
			return compare('gamma', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
