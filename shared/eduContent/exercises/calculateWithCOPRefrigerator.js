const { getRandom } = require('../../util')
const { getRandomFloatUnit } = require('../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../eduTools')

const data = {
	skill: 'calculateWithCOP',
	comparison: { significantDigitMargin: 1 },
}

function generateState() {
	const Ee = getRandomFloatUnit({
		min: 3,
		max: 8,
		significantDigits: 2,
		unit: 'MJ',
	})
	const epsilon = getRandom(2,4)
	const Eout = Ee.multiply(epsilon + 1).roundToPrecision()

	return { Ee, Eout }
}

function getSolution({ Ee, Eout }) {
	return Eout.subtract(Ee).divide(Ee).setUnit('').setSignificantDigits(2)
}

function checkInput(state, input, step, substep) {
	return performComparison('epsilon', input, getSolution(state), data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
