const { getRandom } = require('../../../util/random')
const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { air: { k, Rs, cv } } = require('../../../data/gasProperties')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateMissedWork',
	setup: combinerAnd(combinerRepeat('calculateEntropyChange', 2), 'solveLinearEquation'),
	steps: ['calculateEntropyChange', 'calculateEntropyChange', null, 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

function generateState() {
	// State before compression.
	const pAtm = new FloatUnit('1.0 bar')
	const TAtm = getRandomFloatUnit({
		min: 275,
		max: 300,
		decimals: 0,
		unit: 'K',
	})
	const Vmax = getRandomFloatUnit({
		min: 300,
		max: 600,
		unit: 'cm^3',
	})
	const m = pAtm.multiply(Vmax).divide(Rs.multiply(TAtm)).setUnit('kg').setSignificantDigits(2).roundToPrecision()

	// State after isentropic expansion.
	const V2 = Vmax
	const p2p = getRandomFloatUnit({
		min: 1.3,
		max: 1.8,
		unit: 'bar',
	})
	const T2p = TAtm.multiply(p2p.divide(pAtm)).setUnit('K').setDecimals(-1).roundToPrecision().setDecimals(0) // Gas law

	// State before expansion.
	const volumeFactor = getRandom(12, 20) // = V2/V1
	const V1 = V2.divide(volumeFactor)
	const T1 = T2p.multiply(Math.pow(volumeFactor, k.number - 1)).setDecimals(-1).roundToPrecision().setDecimals(0) // Poisson's law

	// State after actual expansion.
	const n = getRandomFloatUnit({
		min: 1.32,
		max: 1.39,
		unit: '',
	})
	const T2 = T1.multiply(Math.pow(volumeFactor, 1 - n.number)).setDecimals(-1).roundToPrecision().setDecimals(0) // Poisson's law

	return { m, TAtm, T1, T2, T2p }
}

function getCorrect({ m, TAtm, T1, T2, T2p }) {
	const dS12p = new FloatUnit('0 J/K')
	const dS2p2 = m.multiply(cv).multiply(Math.log(T2.number / T2p.number)).setUnit('J/K')
	const dS = dS12p.add(dS2p2)
	const Wm = TAtm.multiply(dS).setUnit('J')
	return { m, cv, TAtm, T1, T2, T2p, dS12p, dS2p2, dS, Wm }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('dS12p', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('dS2p2', correct, input, data.equalityOptions)
		case 3:
			return checkParameter('dS', correct, input, data.equalityOptions)
		default:
			return checkParameter('Wm', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
