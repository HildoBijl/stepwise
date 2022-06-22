const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')
const { generateState } = require('./calculateWithSpecificQuantitiesBoiler')

const data = {
	skill: 'calculateWithEnthalpy',
	setup: combinerAnd('calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
	steps: ['calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function getSolution({ Q, m }) {
	Q = Q.simplify()
	const q = Q.divide(m).setUnit('kJ/kg')
	const wt = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { Q, m, q, wt, dh }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('q', input, solution, data.comparison)
		case 2:
			return performComparison('wt', input, solution, data.comparison)
		default:
			return performComparison('dh', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
