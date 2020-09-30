const { getRandomFloat } = require('../../../inputTypes/Float')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { air: Rs } = require('../../../data/specificGasConstants')
const { combinerRepeat } = require('../../../skillTracking')

const data = {
	setup: combinerRepeat('gasLaw', 2),
	steps: ['gasLaw', 'gasLaw'],

	equalityOptions: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}

function generateState() {
	// Define first situation.
	const p1 = new FloatUnit('1.0 bar')
	const V1 = getRandomFloatUnit({
		min: 2,
		max: 10,
		significantDigits: 2,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: 2,
		unit: 'dC',
	})

	// Define process.
	const n = getRandomFloat({
		min: 1.1,
		max: 1.4,
	}).number
	const p2 = getRandomFloatUnit({
		min: 2,
		max: 5,
		significantDigits: 2,
		unit: 'bar',
	})

	// Find end-point.
	const pressureRatio = p2.float.number / p1.float.number
	const V2 = new FloatUnit({
		float: {
			number: V1.float.number * Math.pow(pressureRatio, -1 / n),
			significantDigits: 2,
		},
		unit: 'l',
	}).roundToPrecision()

	return { p1, p2, V1, V2, T1 }
}

function getCorrect({ p1, p2, V1, V2, T1 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	T1 = T1.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).useUnit('kg')
	const T2 = T1.multiply(p2).multiply(V2).divide(p1.multiply(V1)).useUnit('K')
	return { p1, p2, V1, V2, T1, T2, m, Rs }
}

function checkInput(state, { ansT2, ansm }, step, substep) {
	const { m, T2 } = getCorrect(state)

	switch (step) {
		case 1:
			return m.equals(ansm, data.equalityOptions)
		default:
			return T2.equals(ansT2, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
