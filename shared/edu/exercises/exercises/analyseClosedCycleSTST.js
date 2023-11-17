const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const { generateState, getSolution: getCycleParameters } = require('./calculateClosedCycleSTST')
const { getSolution: getEnergyParameters } = require('./createClosedCycleEnergyOverviewSTST')

const data = {
	skill: 'analyseClosedCycle',
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithCOP'],

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

	const Qin = Q41
	const epsilon = Qin.divide(Wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	return { Rs, k, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Wn, Qin, epsilon, COP }
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
			return choice === 1
		default:
			if (choice === 0)
				return false
			return performComparison(['epsilon', 'COP'], input, solution, data.comparison)
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
