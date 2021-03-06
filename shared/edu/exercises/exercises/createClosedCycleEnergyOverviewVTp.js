const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat, combinerOr } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParametersRaw } = require('./calculateClosedCycleVTp')

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
	p1 = p1.setSignificantDigits(3)
	V1 = V1.setSignificantDigits(3)
	T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3)
	V2 = V2.setSignificantDigits(3)
	T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3)
	V3 = V3.setSignificantDigits(3)
	T3 = T3.setSignificantDigits(3)
	return { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function getCorrect(state) {
	const { m, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	let { cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const Q12 = m.multiply(cv).multiply(T2.subtract(T1)).setUnit('J').setMinimumSignificantDigits(2)
	const W12 = new FloatUnit('0 J')
	const Q23 = p2.multiply(V2).multiply(Math.log(V3.number / V2.number)).setUnit('J').setMinimumSignificantDigits(2)
	const W23 = Q23
	const Q31 = m.multiply(cp).multiply(T1.subtract(T3)).setUnit('J').setMinimumSignificantDigits(2)
	const W31 = p3.multiply(V1.subtract(V3)).setUnit('J').setMinimumSignificantDigits(2)
	const Qn = Q12.add(Q23).add(Q31).setMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W31).setMinimumSignificantDigits(2)
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
