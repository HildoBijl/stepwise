const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithEnthalpy',
	setup: combinerAnd('calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
	steps: ['calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const q = getRandomFloatUnit({
		min: 150,
		max: 250,
		unit: 'kJ/kg',
	})
	const Q = getRandomFloatUnit({
		min: 100,
		max: 200,
		decimals: -1,
		unit: 'MJ',
	}).useDecimals(0)
	const m = Q.divide(q).setUnit('kg').useDecimals(-1).roundToPrecision().useDecimals(0)

	return { Q, m }
}

function getCorrect({ Q, m }) {
	Q = Q.simplify()
	q = Q.divide(m).setUnit('kJ/kg')
	wt = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { Q, m, q, wt, dh }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('q', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('wt', correct, input, data.equalityOptions)
		default:
			return checkParameter('dh', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
