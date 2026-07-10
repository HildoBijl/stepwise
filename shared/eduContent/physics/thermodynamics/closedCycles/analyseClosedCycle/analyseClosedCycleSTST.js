const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { generateState, getSolution: getCycleParameters } = require('../calculateClosedCycle/calculateClosedCycleSTST')
const { getSolution: getEnergyParameters } = require('../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewSTST')

const metaData = {
	skill: 'analyseClosedCycle',
	...stepsToSetup(['calculateClosedCycle', 'createClosedCycleEnergyOverview', undefined, 'calculateWithCOP']),
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
	const { Q23, Q41, Wn } = energyParameters

	const Qin = Q41
	const Qout = Q23.abs()
	const epsilon = Qin.divide(Wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	return { ...energyParameters, ...cycleParameters, choice: 1, Qin, Qout, epsilon, COP }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'], data)
		case 2:
			return compare(['Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41'], data)
		case 3:
			return compare('choice', data)
		default:
			return compare(['choice', 'epsilon', 'COP'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
