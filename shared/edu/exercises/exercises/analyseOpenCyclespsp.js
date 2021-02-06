const { getStepExerciseProcessor } = require('../util/stepExercise')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState: generateStateRaw, getCorrect: getCycleParameters } = require('./calculateOpenCyclespsp')
const { getCorrect: getEnergyParameters } = require('./createOpenCycleEnergyOverviewspsp')

const data = {
	skill: 'analyseOpenCycle',
	setup: combinerAnd('calculateOpenCycle', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
	steps: ['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithEfficiency', 'massFlowTrick']],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
		eta: {
			relativeMargin: 0.04,
			significantDigitMargin: 1,
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
function getCorrect(state) {
	const P = state.P.simplify()
	const { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = getCycleParameters(state)
	const { cv, cp, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn } = getEnergyParameters(state)

	const qin = q23
	const eta = wn.divide(qin).setUnit('').setMinimumSignificantDigits(2)
	const mdot = P.divide(wn).setUnit('kg/s')
	return { Rs, k, cv, cp, P, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn, qin, eta, mdot }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], correct, input, data.equalityOptions)
		case 3:
			switch (substep) {
				case 1:
					return checkParameter(['eta'], correct, input, data.equalityOptions)
				case 2:
					return checkParameter(['mdot'], correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['eta', 'mdot'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCycleParameters,
	getCorrect,
}
