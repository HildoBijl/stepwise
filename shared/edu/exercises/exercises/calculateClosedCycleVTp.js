const { selectRandomly, getRandom } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateClosedCycle',
	setup: combinerRepeat('calculateProcessStep', 2),
	steps: ['calculateProcessStep', 'calculateProcessStep'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

function generateState() {
	const medium = selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const V1 = getRandomFloatUnit({
		min: 20,
		max: 80,
		significantDigits: 2,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 0,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 3,
		significantDigits: 2,
		unit: 'bar',
	})
	const scale = getRandom(2,4) // Increase in volume, temperature and pressure.
	const V3 = V1.multiply(scale).roundToPrecision()

	const { Rs } = gasProperties[medium]
	const m = p1.setUnit('Pa').multiply(V1.setUnit('m^3')).divide(Rs.multiply(T1.setUnit('K'))).setUnit('g').roundToPrecision()

	return { medium, m, p1, T1, V3 }
}

function getCorrect({ medium, m, p1, T1, V3 }) {
	const { Rs } = gasProperties[medium]
	m = m.simplify()
	p1 = p1.simplify()
	T1 = T1.simplify()
	V3 = V3.simplify()
	const mRs = m.multiply(Rs)
	const V1 = mRs.multiply(T1).divide(p1).setUnit('m^3')
	const p3 = p1
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	const T2 = T3
	const V2 = V1
	const p2 = m.multiply(Rs).multiply(T2).divide(V2).setUnit('Pa')
	return { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'V1', 'T1', 'p3', 'V3', 'T3'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['p2', 'V2', 'T2'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
