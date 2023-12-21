const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const data = {
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
	return { rho, v }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('v', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}