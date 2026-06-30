const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithSpecificQuantities',
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
		min: 0.4,
		max: 1.2,
		unit: 'kg/m^3',
		significantDigits: 2,
	})

	return { rho }
}

function getSolution({ rho }) {
	const v = rho.invert()
	return { v }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'v')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
