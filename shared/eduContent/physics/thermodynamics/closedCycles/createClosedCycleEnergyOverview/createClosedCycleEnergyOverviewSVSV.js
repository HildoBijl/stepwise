const { or } = require('../../../../../skillTracking')
const { FloatUnit } = require('../../../../../inputTypes')
const { air } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getCycleParametersRaw } = require('../calculateClosedCycle/calculateClosedCycleSVSV')

const data = {
	skill: 'createClosedCycleEnergyOverview',
	steps: ['calculateHeatAndWork', 'calculateHeatAndWork', 'calculateHeatAndWork', or('calculateHeatAndWork', 'calculateWithInternalEnergy')],

	comparison: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function getCycleParameters(state) {
	let { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCycleParametersRaw(state)
	p1 = p1.setSignificantDigits(3)
	V1 = V1.setSignificantDigits(3)
	T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3)
	V2 = V2.setSignificantDigits(3)
	T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3)
	V3 = V3.setSignificantDigits(3)
	T3 = T3.setSignificantDigits(3)
	p4 = p4.setSignificantDigits(3)
	V4 = V4.setSignificantDigits(3)
	T4 = T4.setSignificantDigits(3)
	return { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

function getSolution(state) {
	const { m, T1, T2, T3, T4 } = getCycleParameters(state)
	let { cv, cp } = air
	cv = cv.simplify()
	cp = cp.simplify()
	const mcv = m.multiply(cv)
	const Q12 = new FloatUnit('0 J')
	const W12 = mcv.multiply(T1.subtract(T2)).setUnit('J').setMinimumSignificantDigits(2)
	const Q23 = mcv.multiply(T3.subtract(T2)).setUnit('J').setMinimumSignificantDigits(2)
	const W23 = new FloatUnit('0 J')
	const Q34 = new FloatUnit('0 J')
	const W34 = mcv.multiply(T3.subtract(T4)).setUnit('J').setMinimumSignificantDigits(2)
	const Q41 = mcv.multiply(T1.subtract(T4)).setUnit('J').setMinimumSignificantDigits(2)
	const W41 = new FloatUnit('0 J')

	const Qn = Q12.add(Q23).add(Q34).add(Q41).setMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W34).add(W41).setMinimumSignificantDigits(2)
	return { cv, cp, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Qn, Wn }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['Q12', 'W12'], input, solution, data.comparison)
		case 2:
			return performComparison(['Q23', 'W23'], input, solution, data.comparison)
		case 3:
			return performComparison(['Q34', 'W34'], input, solution, data.comparison)
		case 4:
			return performComparison(['Q41', 'W41'], input, solution, data.comparison)
		default:
			return performComparison(['Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41'], input, solution, data.comparison)
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