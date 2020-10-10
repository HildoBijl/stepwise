const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { oxygen: Rs } = require('../../../data/specificGasConstants')
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

	const m = p1.multiply(V1).divide(Rs.multiply(T1.useUnit('K'))).useUnit('kg')

	return { m, p1, T1, T2 }
}

function getCorrect({ m, p1, T1, T2 }) {
	p1 = p1.simplify()
	T1 = T1.simplify()
	T2 = T2.simplify()
	const V1 = m.multiply(Rs).multiply(T1).divide(p1).useUnit('m^3')
	const V2 = V1
	const p2 = m.multiply(Rs).multiply(T2).divide(V2).useUnit('Pa')
	return { m, Rs, p1, p2, V1, V2, T1, T2 }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkField(['p1', 'V1', 'T1'], correct, input, data.equalityOptions)
		case 2:
			return input.ansProcess && input.ansProcess[0] === 1
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
