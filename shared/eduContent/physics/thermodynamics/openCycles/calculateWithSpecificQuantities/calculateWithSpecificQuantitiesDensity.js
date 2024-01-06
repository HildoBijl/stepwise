const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithSpecificQuantities',
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
