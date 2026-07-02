const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getCycleParameters } = require('../calculateClosedCycle/calculateClosedCycleSVSV')
const { getSolution: getEnergyParameters } = require('../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewSVSV')

const metaData = {
	skill: 'analyseClosedCycle',
	...stepsToSetup(['calculateClosedCycle', 'createClosedCycleEnergyOverview', undefined, 'calculateWithEfficiency']),
	comparison: {
		default: {
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
	const { Q23, Wn } = energyParameters

	const Qin = Q23.setMinimumSignificantDigits(2)
	const eta = Wn.divide(Qin).setUnit('')
	return { ...energyParameters, ...cycleParameters, choice: 0, Qin, eta }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'])
		case 2:
			return performComparison(exerciseData, ['Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41'])
		case 3:
			return performComparison(exerciseData, 'choice')
		default:
			return performComparison(exerciseData, ['choice', 'eta'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
