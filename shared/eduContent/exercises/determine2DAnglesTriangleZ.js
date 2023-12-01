const { getRandom, getRandomBoolean, getRandomInteger } = require('../../util')
const { getStepExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../eduTools')

const variableSet = ['α', 'β', 'γ']
const usedVariables = ['alpha', 'beta', 'gamma']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'determine2DAngles',
	steps: [null, null, null],
	comparison: {
		default: {},
	},
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
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const { a, b, c } = state
	const alpha = 180 - a - b
	const beta = alpha
	const gamma = 180 - c - beta
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