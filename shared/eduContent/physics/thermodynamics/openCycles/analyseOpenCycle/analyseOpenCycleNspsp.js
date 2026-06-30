const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState: generateStateRaw, getSolution: getCycleParameters } = require('../calculateOpenCycle/calculateOpenCycleNspsp')
const { getSolution: getEnergyParameters } = require('../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewNspsp')

const metaData = {
	skill: 'analyseOpenCycle',
	steps: ['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithCOP', 'massFlowTrick']],
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
		epsilon: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 1,
			},
		},
		COP: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 1,
			},
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	return {
		...generateStateRaw(),
		mdoto: getRandomFloatUnit({
			min: 1,
			max: 9,
			significantDigits: 2,
			unit: 'g/s',
		}),
	}
}

function getSolution(state) {
	const cycleParameters = getCycleParameters(state)
	const energyParameters = getEnergyParameters(state)
	const { q23, q41, wn } = energyParameters

	const mdot = state.mdoto.simplify()
	const qin = q41
	const qout = q23.abs()
	const COP = qout.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const epsilon = COP.subtract(1)
	const Ph = qout.multiply(mdot).setUnit('W')
	return { ...energyParameters, ...cycleParameters, mdot, qin, qout, epsilon, COP, Ph }
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
					return performComparison(exerciseData, ['epsilon', 'COP'])
				case 2:
					return performComparison(exerciseData, 'Ph')
			}
		default:
			return performComparison(exerciseData, ['epsilon', 'COP', 'Ph'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
