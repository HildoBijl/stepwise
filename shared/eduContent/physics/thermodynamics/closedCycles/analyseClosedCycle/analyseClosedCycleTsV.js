const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getCycleParameters } = require('../calculateClosedCycle/calculateClosedCycleTsV')
const { getSolution: getEnergyParameters } = require('../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewTsV')

const metaData = {
	skill: 'analyseClosedCycle',
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithCOP'],
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
addSetupFromSteps(metaData)

function getSolution(state) {
	const cycleParameters = getCycleParameters(state)
	const energyParameters = getEnergyParameters(state)
	const { Q12, Q31, Wn } = energyParameters

	const Qin = Q31
	const Qout = Q12.abs()
	const epsilon = Qin.divide(Wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	return { ...energyParameters, ...cycleParameters, choice: 1, Qin, Qout, epsilon, COP }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'])
		case 2:
			return performComparison(exerciseData, ['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'])
		case 3:
			return performComparison(exerciseData, 'choice')
		default:
			return performComparison(exerciseData, ['choice', 'epsilon', 'COP'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
