const { getRandomNumber, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { getStepExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ', 'δ']
const usedVariables = ['alpha', 'beta', 'gamma', 'delta']
const constants = ['a']

const metaData = {
	skill: 'determine2DAngles',
	steps: [null, null, null, null],
	comparison: { default: {} },
}

function generateState() {
	const limit = 30
	const twoAlpha = getRandomInteger(Math.ceil(limit / 4), Math.floor((90 - limit) / 4)) * 4 // This is the angle between the lines.
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: 90 - twoAlpha / 2,
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const { a } = state
	const alpha = 90
	const beta = 90 - a
	const gamma = beta
	const delta = 180 - 90 - gamma - beta
	return { ...state, variables, alpha, beta, gamma, delta }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'alpha')
		case 2:
			return performComparison(exerciseData, 'beta')
		case 3:
			return performComparison(exerciseData, 'gamma')
		default:
			return performComparison(exerciseData, 'delta')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
