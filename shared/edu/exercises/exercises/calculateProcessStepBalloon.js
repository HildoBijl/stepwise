const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { air: { Rs } } = require('../../../data/gasProperties')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkField } = require('../util/check')

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
		p1: equalityOptions.default,
		p2: equalityOptions.default,
		V1: equalityOptions.default,
		V2: equalityOptions.default,
		T1: equalityOptions.T,
		T2: equalityOptions.T,
	},
}

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

function getCorrect({ m, V1, T1, T2 }) {
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
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkField(['p1', 'V1', 'T1'], correct, input, data.equalityOptions)
		case 2:
			return input.process === 0
		case 3:
			return checkField(['p2', 'V2', 'T2'], correct, input, data.equalityOptions)
		default:
			return checkField(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
