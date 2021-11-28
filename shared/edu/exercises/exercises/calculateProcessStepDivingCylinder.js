const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { oxygen: { Rs } } = require('../../../data/gasProperties')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const equalityOptions = {
	default: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
	T: {
		absoluteMargin: 0.2,
		significantDigitMargin: 1,
	},
}

const data = {
	skill: 'calculateProcessStep',
	setup: combinerAnd(combinerRepeat('gasLaw', 2), 'recognizeProcessTypes'),
	steps: ['gasLaw', 'recognizeProcessTypes', 'gasLaw'],

	equalityOptions: {
		default: equalityOptions.default,
		T1: equalityOptions.T,
		T2: equalityOptions.T,
	},
}

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
			return checkParameter(['p1', 'V1', 'T1'], solution, input, data.equalityOptions)
		case 2:
			return input.process === 1
		case 3:
			return checkParameter(['p2', 'V2', 'T2'], solution, input, data.equalityOptions)
		default:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], solution, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
