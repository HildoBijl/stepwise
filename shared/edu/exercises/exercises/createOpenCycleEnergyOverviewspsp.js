const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { air } = require('../../../data/gasProperties')
const { combinerRepeat, combinerOr } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParametersRaw } = require('./calculateOpenCyclespsp')

const data = {
	skill: 'createOpenCycleEnergyOverview',
	setup: combinerRepeat('calculateSpecificHeatAndMechanicalWork', 4),
	steps: ['calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', combinerOr('calculateSpecificHeatAndMechanicalWork', 'calculateWithEnthalpy')],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCycleParameters(state) {
	let { k, Rs, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = getCycleParametersRaw(state)
	p1 = p1.setSignificantDigits(3)
	v1 = v1.setSignificantDigits(3)
	T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3)
	v2 = v2.setSignificantDigits(3)
	T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3)
	v3 = v3.setSignificantDigits(3)
	T3 = T3.setSignificantDigits(3)
	p4 = p4.setSignificantDigits(3)
	v4 = v4.setSignificantDigits(3)
	T4 = T4.setSignificantDigits(3)
	return { k, Rs, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 }
}

function getCorrect(state) {
	const { T1, T2, T3, T4 } = getCycleParameters(state)
	let { cv, cp } = air
	cv = cv.simplify()
	cp = cp.simplify()
	const q12 = new FloatUnit('0 J/kg')
	const wt12 = cp.multiply(T1.subtract(T2)).setUnit('J/kg')
	const q23 = cp.multiply(T3.subtract(T2)).setUnit('J/kg')
	const wt23 = new FloatUnit('0 J/kg')
	const q34 = new FloatUnit('0 J/kg')
	const wt34 = cp.multiply(T3.subtract(T4)).setUnit('J/kg')
	const q41 = cp.multiply(T1.subtract(T4)).setUnit('J/kg')
	const wt41 = new FloatUnit('0 J/kg')
	const qn = q12.add(q23).add(q34).add(q41).setMinimumSignificantDigits(2)
	const wn = wt12.add(wt23).add(wt34).add(wt41).setMinimumSignificantDigits(2)
	return { cv, cp, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['q12', 'wt12'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['q23', 'wt23'], correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['q34', 'wt34'], correct, input, data.equalityOptions)
		case 4:
			return checkParameter(['q41', 'wt41'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], correct, input, data.equalityOptions)
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
