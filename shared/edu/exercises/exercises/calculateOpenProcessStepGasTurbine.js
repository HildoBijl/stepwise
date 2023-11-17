const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { air: { Rs, k } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const comparison = {
	default: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
	T: {
		absoluteMargin: 0.7,
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}

const data = {
	skill: 'calculateOpenProcessStep',
	steps: ['gasLaw', 'recognizeProcessTypes', 'gasLaw'],

	comparison: {
		default: comparison.default,
		T1: comparison.T,
		T2: comparison.T,
	},
}
addSetupFromSteps(data)

function generateState() {
	const p1 = getRandomFloatUnit({
		min: 6,
		max: 14,
		unit: 'bar',
		significantDigits: 2,
	})
	const pressureRatio = p1.number
	const T0 = getRandomFloatUnit({
		min: 275,
		max: 300,
		unit: 'K',
	})
	const T1 = T0.multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setDecimals(-1).roundToPrecision().setDecimals(0)
	const T2 = getRandomFloatUnit({
		min: 900,
		max: 1300,
		unit: 'K',
		decimals: -1,
	}).setDecimals(0)

	return { p1, T1, T2 }
}

function getSolution({ p1, T1, T2 }) {
	p1 = p1.simplify()
	T1 = T1.simplify()
	T2 = T2.simplify()
	const p2 = p1
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	return { Rs, p1, p2, v1, v2, T1, T2 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'v1', 'T1'], input, solution, data.comparison)
		case 2:
			return input.process === 0
		case 3:
			return performComparison(['p2', 'v2', 'T2'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
