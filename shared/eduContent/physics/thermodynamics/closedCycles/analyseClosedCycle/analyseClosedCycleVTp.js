const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { generateState, getSolution: getCycleParameters } = require('../calculateClosedCycle/calculateClosedCycleVTp')
const { getSolution: getEnergyParameters } = require('../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewVTp')

const metaData = {
	skill: 'analyseClosedCycle',
	...stepsToSetup(['calculateClosedCycle', 'createClosedCycleEnergyOverview', undefined, 'calculateWithEfficiency']),
	compare: {
		FloatUnit: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
		eta: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 1,
			},
		},
		choice: {},
	},
}

function getSolution(state) {
	const cycleParameters = getCycleParameters(state)
	const energyParameters = getEnergyParameters(state)
	const { Q12, Q23, Wn } = energyParameters

	const Qin = Q12.add(Q23).setMinimumSignificantDigits(2)
	const eta = Wn.divide(Qin).setUnit('')
	return { ...energyParameters, ...cycleParameters, choice: 0, Qin, eta }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], data)
		case 2:
			return compare(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], data)
		case 3:
			return compare('choice', data)
		default:
			return compare(['choice', 'eta'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
