const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat, combinerOr } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParametersRaw } = require('./calculateClosedCycleSTST')

const data = {
	skill: 'createClosedCycleEnergyOverview',
	setup: combinerRepeat('calculateHeatAndWork', 4),
	steps: ['calculateHeatAndWork', 'calculateHeatAndWork', 'calculateHeatAndWork', combinerOr('calculateHeatAndWork', 'calculateWithInternalEnergy')],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCycleParameters(state) {
	let { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCycleParametersRaw(state)
	p1 = p1.useSignificantDigits(3)
	V1 = V1.useSignificantDigits(3)
	T1 = T1.useSignificantDigits(3)
	p2 = p2.useSignificantDigits(3)
	V2 = V2.useSignificantDigits(3)
	T2 = T2.useSignificantDigits(3)
	p3 = p3.useSignificantDigits(3)
	V3 = V3.useSignificantDigits(3)
	T3 = T3.useSignificantDigits(3)
	p4 = p4.useSignificantDigits(3)
	V4 = V4.useSignificantDigits(3)
	T4 = T4.useSignificantDigits(3)
	return { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

function getCorrect(state) {
	const { m, Rs, V1, T1, V2, T2, V3, T3, V4, T4 } = getCycleParameters(state)
	let { cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const mcv = m.multiply(cv)
	const mRs = m.multiply(Rs)
	const Q12 = new FloatUnit('0 J')
	const W12 = mcv.multiply(T1.subtract(T2)).setUnit('J').useMinimumSignificantDigits(2)
	const Q23 = mRs.multiply(T2).multiply(Math.log(V3.number / V2.number)).setUnit('J').useMinimumSignificantDigits(2)
	const W23 = Q23
	const Q34 = new FloatUnit('0 J')
	const W34 = mcv.multiply(T3.subtract(T4)).setUnit('J').useMinimumSignificantDigits(2)
	const Q41 = mRs.multiply(T4).multiply(Math.log(V1.number / V4.number)).setUnit('J').useMinimumSignificantDigits(2)
	const W41 = Q41

	const Qn = Q12.add(Q23).add(Q34).add(Q41).useMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W34).add(W41).useMinimumSignificantDigits(2)
	return { cv, cp, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Qn, Wn }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['Q12', 'W12'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q23', 'W23'], correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['Q34', 'W34'], correct, input, data.equalityOptions)
		case 4:
			return checkParameter(['Q41', 'W41'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCycleParameters,
	getCorrect,
}
