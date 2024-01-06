const { or } = require('../../../../../skillTracking')
const { FloatUnit } = require('../../../../../inputTypes')
const { air } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getCycleParametersRaw } = require('../calculateOpenCycle/calculateOpenCycleNspsp')

const metaData = {
	skill: 'createOpenCycleEnergyOverview',
	steps: ['calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', or('calculateSpecificHeatAndMechanicalWork', 'calculateWithEnthalpy')],
	comparison: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

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

function getSolution(state) {
	const cycleParameters = getCycleParameters(state)
	const { T1, T2, T3, T4 } = cycleParameters
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
	return { ...cycleParameters, cv, cp, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['q12', 'wt12'])
		case 2:
			return performComparison(exerciseData, ['q23', 'wt23'])
		case 3:
			return performComparison(exerciseData, ['q34', 'wt34'])
		case 4:
			return performComparison(exerciseData, ['q41', 'wt41'])
		default:
			return performComparison(exerciseData, ['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
