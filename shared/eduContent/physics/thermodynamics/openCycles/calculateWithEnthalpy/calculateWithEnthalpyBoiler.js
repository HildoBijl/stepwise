const { FloatUnit } = require('@step-wise/physics-core')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { generateState } = require('../calculateWithSpecificQuantities/calculateWithSpecificQuantitiesBoiler')

const metaData = {
	skill: 'calculateWithEnthalpy',
	...stepsToSetup(['calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation']),
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

function getSolution({ Q, m }) {
	const Qs = Q.simplify()
	const q = Qs.divide(m).setUnit('kJ/kg')
	const c = new FloatUnit('4186 J/kg * dC')
	const dT = q.divide(c).simplify()
	const wt = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { Qs, q, c, dT, wt, dh }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'q')
		case 2:
			return performComparison(exerciseData, 'wt')
		default:
			return performComparison(exerciseData, 'dh')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
