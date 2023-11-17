const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { air: { Rs } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const comparison = {
	default: {
		relativeMargin: 0.015,
		significantDigitMargin: 1,
	},
	T: {
		absoluteMargin: 0.7,
		significantDigitMargin: 1,
	},
}

const data = {
	skill: 'calculateProcessStep',
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
		min: 1.02,
		max: 1.09,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 3,
		max: 9,
		significantDigits: 2,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})
	const T2 = new FloatUnit('100 dC')

	const m = p1.setUnit('Pa').multiply(V1.setUnit('m^3')).divide(Rs.multiply(T1.setUnit('K'))).setUnit('g').roundToPrecision()

	return { m, V1, T1, T2 }
}

function getSolution({ m, V1, T1, T2 }) {
	m = m.simplify()
	V1 = V1.simplify()
	T1 = T1.simplify()
	T2 = T2.simplify()
	const p1 = m.multiply(Rs).multiply(T1).divide(V1).setUnit('Pa')
	const p2 = p1
	const V2 = m.multiply(Rs).multiply(T2).divide(p2).setUnit('m^3')
	return { m, Rs, p1, p2, V1, V2, T1, T2 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1'], input, solution, data.comparison)
		case 2:
			return input.process === 0
		case 3:
			return performComparison(['p2', 'V2', 'T2'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
