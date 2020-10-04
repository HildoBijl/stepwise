const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { helium: Rs } = require('../../../data/specificGasConstants')
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
		min: 20,
		max: 300,
		significantDigits: 2,
		unit: 'm^3',
	})
	const T1 = getRandomFloatUnit({
		min: 275,
		max: 295,
		significantDigits: 3,
		unit: 'K',
	})

	// Define end-point.
	const p2 = getRandomFloatUnit({
		min: 5,
		max: 20,
		significantDigits: 2,
		unit: 'mbar',
	})
	const T2 = getRandomFloatUnit({
		min: 200,
		max: 250,
		significantDigits: 3,
		unit: 'K',
	})

	return { p1, p2, T1, T2, V1 }
}

function getCorrect({ p1, p2, T1, T2, V1 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	T1 = T1.simplify()
	T2 = T2.simplify()
	V1 = V1.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).useUnit('kg')
	const V2 = m.multiply(Rs).multiply(T2).divide(p2).useUnit('m^3')
	return { p1, p2, V1, V2, T1, T2, m, Rs }
}

function checkInput(state, { ansV2, ansm }, step, substep) {
	const { m, V2 } = getCorrect(state)

	switch (step) {
		case 1:
			return m.equals(ansm, data.equalityOptions)
		default:
			return V2.equals(ansV2, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
