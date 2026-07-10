const { FloatUnit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateWithEnthalpy',
	...stepsToSetup(['massFlowTrick', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation']),
	compare: {
		FloatUnit: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	const mdot = getRandomFloatUnit({
		min: 10,
		max: 50,
		decimals: 0,
		unit: 'kg/s',
	})
	const wt = getRandomFloatUnit({
		min: 600,
		max: 1200,
		unit: 'kJ/kg',
	})
	const P = mdot.multiply(wt).setUnit('MW').roundToPrecision()

	return { P, mdot }
}

function getSolution({ P, mdot }) {
	const Ps = P.simplify()
	const wt = P.divide(mdot).setUnit('kJ/kg')
	const q = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { Ps, q, wt, dh }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('wt', data)
		case 2:
			return compare('q', data)
		default:
			return compare('dh', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
