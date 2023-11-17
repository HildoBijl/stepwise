const { getRandom, getRandomBoolean, getRandomInteger } = require('../../../util')
const { getStepExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../eduTools')

const variableSet = ['α', 'β', 'γ', 'δ']
const usedVariables = ['alpha', 'beta', 'gamma', 'delta']
const constants = ['a']

const data = {
	skill: 'determine2DAngles',
	steps: [null, null, null, null],
	comparison: {
		default: {},
	},
}

function generateState() {
	const limit = 30
	const twoAlpha = getRandomInteger(Math.ceil(limit / 4), Math.floor((90 - limit) / 4)) * 4 // This is the angle between the lines.
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: 90 - twoAlpha / 2,
		rotation: getRandom(0, 2 * Math.PI),
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

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 4)
		return performComparison('delta', input, solution, data.comparison)
	if (step === 1)
		return performComparison('alpha', input, solution, data.comparison)
	if (step === 2)
		return performComparison('beta', input, solution, data.comparison)
	if (step === 3)
		return performComparison('gamma', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}