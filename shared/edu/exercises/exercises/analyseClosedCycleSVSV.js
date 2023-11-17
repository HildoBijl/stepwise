const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const { generateState, getSolution: getCycleParameters } = require('./calculateClosedCycleSVSV')
const { getSolution: getEnergyParameters } = require('./createClosedCycleEnergyOverviewSVSV')

const data = {
	skill: 'analyseClosedCycle',
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithEfficiency'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		eta: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}
addSetupFromSteps(data)

function getSolution(state) {
	const { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCycleParameters(state)
	const { cv, cp, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Wn } = getEnergyParameters(state)

	const Qin = Q23.setMinimumSignificantDigits(2)
	const eta = Wn.divide(Qin).setUnit('')

	return { Rs, k, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Wn, Qin, eta }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	const { choice } = input
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'], input, solution, data.comparison)
		case 2:
			return performComparison(['Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41'], input, solution, data.comparison)
		case 3:
			return choice === 0
		default:
			if (choice === 1)
				return false
			return performComparison(['eta'], input, solution, data.comparison)
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
