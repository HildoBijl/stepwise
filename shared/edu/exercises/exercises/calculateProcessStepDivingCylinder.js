const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { oxygen: { Rs } } = require('../../../data/gasProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
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
		min: 180,
		max: 300,
		significantDigits: 2,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: getRandomInteger(2, 3),
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 20,
		max: 35,
		significantDigits: 2,
		unit: 'dC',
	})
	const T2 = getRandomFloatUnit({
		min: 5,
		max: 15,
		significantDigits: 2,
		unit: 'dC',
	})

	const m = p1.multiply(V1).divide(Rs.multiply(T1.setUnit('K'))).setUnit('kg').roundToPrecision()

	return { m, p1, T1, T2 }
}

function getSolution({ m, p1, T1, T2 }) {
	p1 = p1.simplify()
	T1 = T1.simplify()
	T2 = T2.simplify()
	const V1 = m.multiply(Rs).multiply(T1).divide(p1).setUnit('m^3')
	const V2 = V1
	const p2 = m.multiply(Rs).multiply(T2).divide(V2).setUnit('Pa')
	return { m, Rs, p1, p2, V1, V2, T1, T2 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1'], input, solution, data.comparison)
		case 2:
			return input.process === 1
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
