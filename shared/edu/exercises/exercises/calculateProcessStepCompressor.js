const { selectRandomly } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkField } = require('../util/check')
const kValues = require('../../../data/specificHeatRatios')
const RsValues = require('../../../data/specificGasConstants')

const equalityOptions = {
	default: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}

const data = {
	skill: 'calculateProcessStep',
	setup: combinerAnd(combinerRepeat('gasLaw', 2), 'recognizeProcessTypes', 'poissonsLaw'),
	steps: ['gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw'],

	equalityOptions: {
		p1: equalityOptions.default,
		p2: equalityOptions.default,
		V1: equalityOptions.default,
		V2: equalityOptions.default,
		T1: equalityOptions.default,
		T2: equalityOptions.default,
	},
}

function generateState() {
	const gas = selectRandomly(['methane', 'helium', 'hydrogen'])
	const p1 = getRandomFloatUnit({
		min: 1,
		max: 9,
		decimals: 1,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 10,
		max: 30,
		decimals: 0,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 25,
		decimals: 0,
		unit: 'dC',
	})
	const p2 = getRandomFloatUnit({
		min: 40,
		max: 90,
		decimals: -1,
		unit: 'bar',
	}).useDecimals(0)

	const k = kValues[gas]
	const Rs = RsValues[gas]
	const m = p1.simplify().multiply(V1.simplify()).divide(Rs.multiply(T1.simplify())).useUnit('g').roundToPrecision()
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k)).roundToPrecision()

	return { gas, m, T1, V1, V2 }
}

function getCorrect({ gas, m, T1, V1, V2 }) {
	const k = kValues[gas]
	const Rs = RsValues[gas]
	m = m.simplify()
	T1 = T1.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	const p1 = m.multiply(Rs).multiply(T1).divide(V1).useUnit('Pa')
	const p2 = p1.multiply(Math.pow(V1.number / V2.number, k))
	const T2 = p2.multiply(V2).divide(m.multiply(Rs)).useUnit('K')
	return { k, Rs, m, p1, V1, T1, p2, V2, T2 }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkField(['p1', 'V1', 'T1'], correct, input, data.equalityOptions)
		case 2:
			return input.ansProcess[0] === 3
		case 3:
			const choice = input.choice && input.choice[0] || 0
			return checkField(choice === 0 ? 'p2' : 'T2', correct, input, data.equalityOptions)
		case 4:
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
