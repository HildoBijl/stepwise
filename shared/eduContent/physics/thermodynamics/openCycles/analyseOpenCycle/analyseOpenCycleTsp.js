const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState: generateStateRaw, getSolution: getCycleParameters } = require('../calculateOpenCycle/calculateOpenCycleTsp')
const { getSolution: getEnergyParameters } = require('../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewTsp')

const metaData = {
	skill: 'analyseOpenCycle',
	steps: ['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithCOP', 'massFlowTrick']],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		epsilon: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		COP: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}
addSetupFromSteps(metaData)

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

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3'])
		case 2:
			return performComparison(exerciseData, ['q12', 'wt12', 'q23', 'wt23', 'q31', 'wt31'])
		case 3:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, ['epsilon', 'COP'])
				case 2:
					return performComparison(exerciseData, 'Pc')
			}
		default:
			return performComparison(exerciseData, ['epsilon', 'COP', 'Pc'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
