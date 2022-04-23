const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat, combinerOr } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')
const { generateState, getSolution: getCycleParametersRaw } = require('./calculateOpenCycleTsp')

const data = {
	skill: 'createOpenCycleEnergyOverview',
	setup: combinerRepeat('calculateSpecificHeatAndMechanicalWork', 3),
	steps: ['calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', combinerOr('calculateSpecificHeatAndMechanicalWork', 'calculateWithEnthalpy')],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCycleParameters(state) {
	let { m, p1, v1, T1, p2, v2, T2, p3, v3, T3 } = getCycleParametersRaw(state)
	p1 = p1.setSignificantDigits(3)
	v1 = v1.setSignificantDigits(3)
	T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3)
	v2 = v2.setSignificantDigits(3)
	T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3)
	v3 = v3.setSignificantDigits(3)
	T3 = T3.setSignificantDigits(3)
	return { m, p1, v1, T1, p2, v2, T2, p3, v3, T3 }
}

function getSolution(state) {
	const { m, p1, v1, T1, v2, T2, T3 } = getCycleParameters(state)
	let { cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const q12 = p1.multiply(v1).multiply(Math.log(v2.number / v1.number)).setUnit('J/kg').setMinimumSignificantDigits(2)
	const wt12 = q12
	const q23 = new FloatUnit('0 J/kg')
	const wt23 = cp.multiply(T2.subtract(T3)).setUnit('J/kg').setMinimumSignificantDigits(2)
	const q31 = cp.multiply(T1.subtract(T3)).setUnit('J/kg').setMinimumSignificantDigits(2)
	const wt31 = new FloatUnit('0 J/kg')
	const qn = q12.add(q23).add(q31).setMinimumSignificantDigits(2)
	const wn = wt12.add(wt23).add(wt31).setMinimumSignificantDigits(2)
	return { cv, cp, q12, wt12, q23, wt23, q31, wt31, qn, wn }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['q12', 'wt12'], input, solution, data.equalityOptions)
		case 2:
			return performComparison(['q23', 'wt23'], input, solution, data.equalityOptions)
		case 3:
			return performComparison(['q31', 'wt31'], input, solution, data.equalityOptions)
		default:
			return performComparison(['q12', 'wt12', 'q23', 'wt23', 'q31', 'wt31'], input, solution, data.equalityOptions)
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
