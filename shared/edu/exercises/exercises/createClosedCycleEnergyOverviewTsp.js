const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat, combinerOr } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParametersRaw } = require('./calculateClosedCycleTsp')

const data = {
	skill: 'createClosedCycleEnergyOverview',
	setup: combinerRepeat('calculateHeatAndWork', 3),
	steps: ['calculateHeatAndWork', 'calculateHeatAndWork', combinerOr('calculateHeatAndWork', 'calculateWithInternalEnergy')],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCycleParameters(state) {
	let { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParametersRaw(state)
	p1 = p1.useSignificantDigits(3)
	V1 = V1.useSignificantDigits(3)
	T1 = T1.useSignificantDigits(3)
	p2 = p2.useSignificantDigits(3)
	V2 = V2.useSignificantDigits(3)
	T2 = T2.useSignificantDigits(3)
	p3 = p3.useSignificantDigits(3)
	V3 = V3.useSignificantDigits(3)
	T3 = T3.useSignificantDigits(3)
	return { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function getCorrect(state) {
	const { m, p1, V1, T1, V2, T2, T3 } = getCycleParameters(state)
	let { cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const Q12 = p1.multiply(V1).multiply(Math.log(V2.number / V1.number)).setUnit('J').useMinimumSignificantDigits(2)
	const W12 = Q12
	const Q23 = new FloatUnit('0 J')
	const W23 = m.multiply(cv).multiply(T2.subtract(T3)).setUnit('J').useMinimumSignificantDigits(2)
	const Q31 = m.multiply(cv).multiply(T1.subtract(T3)).setUnit('J').useMinimumSignificantDigits(2)
	const W31 = new FloatUnit('0 J')
	const Qn = Q12.add(Q23).add(Q31).useMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W31).useMinimumSignificantDigits(2)
	return { cv, cp, Q12, W12, Q23, W23, Q31, W31, Qn, Wn }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['Q12', 'W12'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q23', 'W23'], correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['Q31', 'W31'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], correct, input, data.equalityOptions)
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
