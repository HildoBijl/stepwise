const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState } = require('./calculateWithSpecificQuantitiesBoiler')

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

function getSolution({ Q, m }) {
	Q = Q.simplify()
	q = Q.divide(m).setUnit('kJ/kg')
	wt = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { Q, m, q, wt, dh }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return checkParameter('q', solution, input, data.equalityOptions)
		case 2:
			return checkParameter('wt', solution, input, data.equalityOptions)
		default:
			return checkParameter('dh', solution, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
