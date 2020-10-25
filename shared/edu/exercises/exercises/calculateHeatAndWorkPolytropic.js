const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { checkField } = require('../util/check')
const { getRandom } = require('../../../util/random')
let { air: { Rs, cv } } = require('../../../data/gasProperties')

const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', combinerOr('specificGasConstant', 'specificHeats'), combinerOr('calculateWithMass', 'calculateWithTemperature')),
	steps: ['recognizeProcessTypes', null, ['specificGasConstant', 'specificHeats'], null, ['calculateWithMass', 'calculateWithTemperature'], null],

	equalityOptions: {
		Rs: {
			relativeMargin: 0.01,
		},
		cv: {
			relativeMargin: 0.01,
		},
		c: {
			relativeMargin: 0.01,
		},
		m: {
			relativeMargin: 0.001,
			unitCheck: Unit.equalityTypes.exact,
		},
		T1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		T2: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		Q: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		W: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const n = getRandomFloatUnit({
		min: 1.1,
		max: 1.35,
		decimals: 2,
		unit: '',
	})
	const m = getRandomFloatUnit({
		min: 0.3,
		max: 1.5,
		significantDigits: 2,
		unit: 'g',
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		significantDigits: 2,
		unit: 'dC',
	})
	const pressureRatio = getRandom(2, 4)
	const T2 = T1.useUnit('K').multiply(Math.pow(pressureRatio, (1 - 1 / n.number))).useUnit('dC').roundToPrecision()

	return { m, T1, T2, n }
}

function getCorrect({ m, T1, T2, n }) {
	m = m.simplify()
	cv = cv.simplify()
	const c = cv.subtract(Rs.divide(n.number - 1))
	const mdT = m.multiply(T2.subtract(T1))
	const Q = mdT.multiply(c).useUnit('J')
	const W = mdT.multiply(Rs).divide(1 - n.number).useUnit('J')
	return { process: 4, eq: 9, Rs, cv, n, m, c, T1, T2, Q, W }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return input.process === correct.process
		case 2:
			return input.eq === correct.eq
		case 3:
			switch (substep) {
				case 1: return checkField('Rs', correct, input, data.equalityOptions)
				case 2: return checkField('cv', correct, input, data.equalityOptions)
			}
		case 4:
				return checkField('c', correct, input, data.equalityOptions)
		case 5:
			switch (substep) {
				case 1: return checkField('m', correct, input, data.equalityOptions)
				case 2: return checkField(['T1','T2'], correct, input, data.equalityOptions)
			}
		default:
			return checkField(['Q', 'W'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
