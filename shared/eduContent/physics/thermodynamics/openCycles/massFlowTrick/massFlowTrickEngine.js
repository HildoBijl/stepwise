const { and } = require('@step-wise/skill-setup')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	setup: and('calculateWithSpecificQuantities', 'massFlowTrick'),
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
	const rho = getRandomFloatUnit({
		min: 0.35,
		max: 0.6,
		unit: 'kg/m^3',
		significantDigits: 2,
	})
	const mdot = getRandomFloatUnit({
		min: 20,
		max: 80,
		unit: 'kg/s',
		significantDigits: 2,
	})

	return { rho, mdot }
}

function getSolution({ rho, mdot }) {
	const v = rho.invert()
	const Vdot = mdot.multiply(v).setUnit('m^3/s')
	return { v, Vdot }
}

function checkInput(data) {
	return compare('Vdot', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
