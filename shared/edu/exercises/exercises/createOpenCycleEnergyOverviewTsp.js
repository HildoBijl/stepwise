const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat, combinerOr } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParametersRaw } = require('./calculateOpenCycleTsp')

const data = {
	skill: 'createOpenCycleEnergyOverview',
	setup: combinerRepeat('calculateSpecificHeatAndTechnicalWork', 3),
	steps: ['calculateSpecificHeatAndTechnicalWork', 'calculateSpecificHeatAndTechnicalWork', combinerOr('calculateSpecificHeatAndTechnicalWork', 'calculateWithEnthalpy')],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCycleParameters(state) {
	let { m, p1, v1, T1, p2, v2, T2, p3, v3, T3 } = getCycleParametersRaw(state)
	p1 = p1.useSignificantDigits(3)
	v1 = v1.useSignificantDigits(3)
	T1 = T1.useSignificantDigits(3)
	p2 = p2.useSignificantDigits(3)
	v2 = v2.useSignificantDigits(3)
	T2 = T2.useSignificantDigits(3)
	p3 = p3.useSignificantDigits(3)
	v3 = v3.useSignificantDigits(3)
	T3 = T3.useSignificantDigits(3)
	return { m, p1, v1, T1, p2, v2, T2, p3, v3, T3 }
}

function getCorrect(state) {
	const { m, p1, v1, T1, v2, T2, T3 } = getCycleParameters(state)
	let { cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const q12 = p1.multiply(v1).multiply(Math.log(v2.number / v1.number)).setUnit('J/kg').useMinimumSignificantDigits(2)
	const wt12 = q12
	const q23 = new FloatUnit('0 J/kg')
	const wt23 = cp.multiply(T2.subtract(T3)).setUnit('J/kg').useMinimumSignificantDigits(2)
	const q31 = cp.multiply(T1.subtract(T3)).setUnit('J/kg').useMinimumSignificantDigits(2)
	const wt31 = new FloatUnit('0 J/kg')
	const qn = q12.add(q23).add(q31).useMinimumSignificantDigits(2)
	const wn = wt12.add(wt23).add(wt31).useMinimumSignificantDigits(2)
	return { cv, cp, q12, wt12, q23, wt23, q31, wt31, qn, wn }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['q12', 'wt12'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['q23', 'wt23'], correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['q31', 'wt31'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['q12', 'wt12', 'q23', 'wt23', 'q31', 'wt31'], correct, input, data.equalityOptions)
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
