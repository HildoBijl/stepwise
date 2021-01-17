const { selectRandomly } = require('../../../util/random')
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
			relativeMargin: 0.015,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const medium = selectRandomly(['air', 'argon', 'carbonDioxide', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const V1 = getRandomFloatUnit({
		min: 1,
		max: 3,
		significantDigits: 2,
		unit: 'm^3',
	})
	const T1 = getRandomFloatUnit({
		min: 0,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = getRandomFloatUnit({
		min: 1,
		max: 2,
		significantDigits: 2,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 6,
		max: 12,
		significantDigits: 2,
		unit: 'bar',
	})

	return { medium, p1, V1, T1, p2 }
}

function getCorrect({ medium, p1, V1, T1, p2 }) {
	const { Rs, k } = gasProperties[medium]
	p1 = p1.simplify()
	V1 = V1.simplify()
	T1 = T1.simplify()
	p2 = p2.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
	const mRs = m.multiply(Rs)
	const T2 = T1
	const V2 = mRs.multiply(T2).divide(p2).setUnit('m^3')
	const V3 = V1
	const p3 = p2.multiply(Math.pow(V2.number/V3.number, k.number))
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	return { medium, m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['p3', 'V3', 'T3'], correct, input, data.equalityOptions)
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
