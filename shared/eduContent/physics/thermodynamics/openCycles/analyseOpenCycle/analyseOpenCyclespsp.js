const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { generateState: generateStateRaw, getSolution: getCycleParameters } = require('../calculateOpenCycle/calculateOpenCyclespsp')
const { getSolution: getEnergyParameters } = require('../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewspsp')

const metaData = {
	skill: 'analyseOpenCycle',
	...stepsToSetup(['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithEfficiency', 'massFlowTrick']]),
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
	},
}

function generateState() {
	return {
		...generateStateRaw(),
		Po: getRandomFloatUnit({
			min: 10,
			max: 30,
			decimals: 0,
			unit: 'MW',
		}),
	}
}

function getSolution(state) {
	const cycleParameters = getCycleParameters(state)
	const energyParameters = getEnergyParameters(state)
	const { q23, wn } = energyParameters

	const P = state.Po.simplify()
	const qin = q23
	const eta = wn.divide(qin).setUnit('').setMinimumSignificantDigits(2)
	const mdot = P.divide(wn).setUnit('kg/s')
	return { ...energyParameters, ...cycleParameters, P, qin, eta, mdot }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'])
		case 2:
			return performComparison(exerciseData, ['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'])
		case 3:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'eta')
				case 2:
					return performComparison(exerciseData, 'mdot')
			}
		default:
			return performComparison(exerciseData, ['eta', 'mdot'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
