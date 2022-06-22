const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat, combinerOr } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')
const { generateState, getSolution: getCycleParametersRaw } = require('./calculateClosedCycleTsV')

const data = {
	skill: 'createClosedCycleEnergyOverview',
	setup: combinerRepeat('calculateHeatAndWork', 3),
	steps: ['calculateHeatAndWork', 'calculateHeatAndWork', combinerOr('calculateHeatAndWork', 'calculateWithInternalEnergy')],

	comparison: {
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

function getSolution(state) {
	const { m, p1, V1, T1, V2, T2, T3 } = getCycleParameters(state)
	let { cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const Q12 = p1.multiply(V1).multiply(Math.log(V2.number / V1.number)).setUnit('J').setMinimumSignificantDigits(2)
	const W12 = Q12
	const Q23 = new FloatUnit('0 J')
	const W23 = m.multiply(cv).multiply(T2.subtract(T3)).setUnit('J').setMinimumSignificantDigits(2)
	const Q31 = m.multiply(cv).multiply(T1.subtract(T3)).setUnit('J').setMinimumSignificantDigits(2)
	const W31 = new FloatUnit('0 J')
	const Qn = Q12.add(Q23).add(Q31).setMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W31).setMinimumSignificantDigits(2)
	return { cv, cp, Q12, W12, Q23, W23, Q31, W31, Qn, Wn }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['Q12', 'W12'], input, solution, data.comparison)
		case 2:
			return performComparison(['Q23', 'W23'], input, solution, data.comparison)
		case 3:
			return performComparison(['Q31', 'W31'], input, solution, data.comparison)
		default:
			return performComparison(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCycleParameters,
	getSolution,
}
