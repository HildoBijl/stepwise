const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState: generateStateRaw, getSolution: getCycleParameters } = require('../calculateOpenCycle/calculateOpenCycleNspsp')
const { getSolution: getEnergyParameters } = require('../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewNspsp')

const data = {
	skill: 'analyseOpenCycle',
	steps: ['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithCOP', 'massFlowTrick']],

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

function generateState() {
	return {
		...generateStateRaw(),
		mdot: getRandomFloatUnit({
			min: 1,
			max: 9,
			significantDigits: 2,
			unit: 'g/s',
		}),
	}
}
function getSolution(state) {
	const mdot = state.mdot.simplify()
	const { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = getCycleParameters(state)
	const { cv, cp, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn } = getEnergyParameters(state)

	const qin = q41
	const qout = q23.abs()
	const COP = qout.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const epsilon = COP.subtract(1)
	const Ph = qout.multiply(mdot).setUnit('W')
	return { Rs, k, cv, cp, mdot, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn, qin, qout, epsilon, COP, Ph }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], input, solution, data.comparison)
		case 2:
			return performComparison(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], input, solution, data.comparison)
		case 3:
			switch (substep) {
				case 1:
					return performComparison(['epsilon', 'COP'], input, solution, data.comparison)
				case 2:
					return performComparison(['Ph'], input, solution, data.comparison)
			}
		default:
			return performComparison(['epsilon', 'COP', 'Ph'], input, solution, data.comparison)
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