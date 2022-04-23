const { getStepExerciseProcessor } = require('../util/stepExercise')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { combinerAnd } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')
const { generateState: generateStateRaw, getSolution: getCycleParameters } = require('./calculateOpenCyclespsp')
const { getSolution: getEnergyParameters } = require('./createOpenCycleEnergyOverviewspsp')

const data = {
	skill: 'analyseOpenCycle',
	setup: combinerAnd('calculateOpenCycle', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
	steps: ['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithEfficiency', 'massFlowTrick']],

	equalityOptions: {
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

function generateState() {
	return {
		...generateStateRaw(),
		P: getRandomFloatUnit({
			min: 10,
			max: 30,
			decimals: 0,
			unit: 'MW',
		}),
	}
}
function getSolution(state) {
	const P = state.P.simplify()
	const { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = getCycleParameters(state)
	const { cv, cp, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn } = getEnergyParameters(state)

	const qin = q23
	const eta = wn.divide(qin).setUnit('').setMinimumSignificantDigits(2)
	const mdot = P.divide(wn).setUnit('kg/s')
	return { Rs, k, cv, cp, P, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn, qin, eta, mdot }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], input, solution, data.equalityOptions)
		case 2:
			return performComparison(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], input, solution, data.equalityOptions)
		case 3:
			switch (substep) {
				case 1:
					return performComparison(['eta'], input, solution, data.equalityOptions)
				case 2:
					return performComparison(['mdot'], input, solution, data.equalityOptions)
			}
		default:
			return performComparison(['eta', 'mdot'], input, solution, data.equalityOptions)
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
