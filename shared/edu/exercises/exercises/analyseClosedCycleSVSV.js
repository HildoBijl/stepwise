const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter: checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParameters } = require('./calculateClosedCycleSVSV')
const { getCorrect: getEnergyParameters } = require('./createClosedCycleEnergyOverviewSVSV')

const data = {
	skill: 'analyseClosedCycle',
	setup: combinerAnd('calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateWithEfficiency'),
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithEfficiency'],

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

function getCorrect(state) {
	const { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCycleParameters(state)
	const { cv, cp, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Wn } = getEnergyParameters(state)

	const Qin = Q23.useMinimumSignificantDigits(2)
	const eta = Wn.divide(Qin).setUnit('')

	return { Rs, k, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Wn, Qin, eta }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	const { choice } = input
	switch (step) {
		case 1:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41'], correct, input, data.equalityOptions)
		case 3:
			return choice === 0
		default:
			if (choice === 1)
				return false
			return checkParameter(['eta'], correct, input, data.equalityOptions)
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
