const { getRandom } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
let { air: { Rs, cv } } = require('../../../data/gasProperties')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithInternalEnergy',
	setup: combinerAnd('gasLaw', 'specificHeats', 'solveLinearEquation'),
	steps: ['gasLaw', 'specificHeats', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		cv: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
		},
	},
}

function generateState() {
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p2 = getRandomFloatUnit({
		min: 2.5,
		max: 3.8,
		significantDigits: 2,
		unit: 'bar',
	})
	const V2 = getRandomFloatUnit({
		min: 1,
		max: 3,
		significantDigits: 2,
		unit: 'l',
	})
	const n = getRandom(1.1, 1.3)
	const pressureRatio = p2.number
	const T2 = T1.setUnit('K').multiply(Math.pow(pressureRatio, (n - 1) / n)).setUnit('dC')
	return { T1, p2, V2, T2 }
}

function getCorrect({ T1, p2, V2, T2 }) {
	T1 = T1.simplify()
	p2 = p2.simplify()
	V2 = V2.simplify()
	T2 = T2.simplify()
	cv = cv.simplify()
	const m = p2.multiply(V2).divide(Rs.multiply(T2)).setUnit('kg')
	const dU = m.multiply(cv).multiply(T2.subtract(T1)).setUnit('J')
	return { cv, Rs, T1, p2, V2, T2, m, dU }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('m', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('cv', correct, input, data.equalityOptions)
		default:
			return checkParameter('dU', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
