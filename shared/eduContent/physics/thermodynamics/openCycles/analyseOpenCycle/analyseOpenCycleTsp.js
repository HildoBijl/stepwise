const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { generateState: generateStateRaw, getSolution: getCycleParameters } = require('../calculateOpenCycle/calculateOpenCycleTsp')
const { getSolution: getEnergyParameters } = require('../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewTsp')

const metaData = {
	skill: 'analyseOpenCycle',
	...stepsToSetup(['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithCOP', 'massFlowTrick']]),
	compare: {
		FloatUnit: {
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

function generateState() {
	return {
		...generateStateRaw(),
		mdoto: getRandomFloatUnit({
			min: 1,
			max: 10,
			significantDigits: 2,
			unit: 'g/s',
		}),
	}
}

function getSolution(state) {
	const cycleParameters = getCycleParameters(state)
	const energyParameters = getEnergyParameters(state)
	const { q31, wn } = energyParameters

	const mdot = state.mdoto.simplify()
	const qin = q31
	const epsilon = qin.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	const Pc = qin.multiply(mdot).setUnit('W')
	return { ...energyParameters, ...cycleParameters, mdot, qin, epsilon, COP, Pc }
}

function checkInput(data, step, substep) {
	switch (step) {
		case 1:
			return compare(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3'], data)
		case 2:
			return compare(['q12', 'wt12', 'q23', 'wt23', 'q31', 'wt31'], data)
		case 3:
			switch (substep) {
				case 1:
					return compare(['epsilon', 'COP'], data)
				case 2:
					return compare('Pc', data)
			}
		default:
			return compare(['epsilon', 'COP', 'Pc'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
