const { getRandom, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { getStepExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ']
const usedVariables = ['alpha', 'beta', 'gamma']
const constants = ['a', 'b']

const data = {
	skill: 'determine2DAngles',
	steps: [null, null, null],
	comparison: {
		default: {},
	},
}

function generateState() {
	const limit = 30
	const alpha = getRandomInteger(limit/5, (90-limit)/5) * 5 // This is the angle in the X.
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: 90 - alpha,
		b: getRandomInteger(10, (180 - limit - alpha) / 5) * 5,
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const { a, b } = state
	const alpha = 90 - a
	const beta = alpha
	const gamma = 180 - b - beta
	return { ...state, variables, alpha, beta, gamma }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('gamma', input, solution, data.comparison)
	if (step === 1)
		return performComparison('alpha', input, solution, data.comparison)
	if (step === 2)
		return performComparison('beta', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}