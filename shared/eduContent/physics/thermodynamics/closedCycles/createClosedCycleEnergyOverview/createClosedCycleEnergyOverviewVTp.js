const { or } = require('../../../../../skillTracking')
const { FloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getCycleParametersRaw } = require('../calculateClosedCycle/calculateClosedCycleVTp')

const metaData = {
	skill: 'createClosedCycleEnergyOverview',
	steps: ['calculateHeatAndWork', 'calculateHeatAndWork', or('calculateHeatAndWork', 'calculateWithInternalEnergy')],
	comparison: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

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
	const cycleParameters = getCycleParameters(state)
	const { m, V1, T1, p2, V2, T2, p3, V3, T3 } = cycleParameters
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
	return { ...cycleParameters, cv, cp, Q12, W12, Q23, W23, Q31, W31, Qn, Wn }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['Q12', 'W12'])
		case 2:
			return performComparison(exerciseData, ['Q23', 'W23'])
		case 3:
			return performComparison(exerciseData, ['Q31', 'W31'])
		default:
			return performComparison(exerciseData, ['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
