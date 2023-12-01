const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../eduTools')

const { generateState, getSolution: getCycleParameters } = require('./calculateClosedCycleVTp')
const { getSolution: getEnergyParameters } = require('./createClosedCycleEnergyOverviewVTp')

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
	const { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	const { cv, cp, Q12, W12, Q23, W23, Q31, W31, Wn } = getEnergyParameters(state)

	const Qin = Q12.add(Q23).setMinimumSignificantDigits(2)
	const eta = Wn.divide(Qin).setUnit('')
	return { Rs, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn, Qin, eta }
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
			return choice === 0
		default:
			if (choice === 1)
				return false
			return performComparison('eta', input, solution, data.comparison)
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
