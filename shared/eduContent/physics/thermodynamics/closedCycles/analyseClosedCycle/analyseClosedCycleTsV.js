const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getCycleParameters } = require('../calculateClosedCycle/calculateClosedCycleTsV')
const { getSolution: getEnergyParameters } = require('../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewTsV')

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
	const { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	const { cv, cp, Q12, W12, Q23, W23, Q31, W31, Wn } = getEnergyParameters(state)

	const Qin = Q31
	const epsilon = Qin.divide(Wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	return { Rs, k, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn, Qin, epsilon, COP }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	const { choice } = input
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], input, solution, data.comparison)
		case 2:
			return performComparison(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], input, solution, data.comparison)
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