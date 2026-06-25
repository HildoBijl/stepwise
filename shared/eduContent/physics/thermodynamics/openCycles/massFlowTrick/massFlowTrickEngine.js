const { and } = require('@step-wise/skill-setup')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	setup: and('calculateWithSpecificQuantities', 'massFlowTrick'),
	comparison: {
		default: {
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

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'Vdot')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
