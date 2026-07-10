const { FloatUnit } = require('@step-wise/physics-core')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { generateState } = require('../calculateWithSpecificQuantities/calculateWithSpecificQuantitiesBoiler')

const metaData = {
	skill: 'calculateWithEnthalpy',
	...stepsToSetup(['calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation']),
	compare: {
		FloatUnit: {
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

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('q', data)
		case 2:
			return compare('wt', data)
		default:
			return compare('dh', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
