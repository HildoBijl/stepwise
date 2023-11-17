const { getRandom } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'calculateWithCOP',
	comparison: { significantDigitMargin: 1 },
}

function generateState() {
	const Pe = getRandomFloatUnit({
		min: 8,
		max: 15,
		significantDigits: 2,
		unit: 'kW',
	})
	const COP = getRandom(3,5)
	const Pin = Pe.multiply(COP - 1).roundToPrecision()

	return { Pe, Pin }
}

function getSolution({ Pe, Pin }) {
	return Pin.add(Pe).divide(Pe).setUnit('').setSignificantDigits(2)
}

function checkInput(state, input, step, substep) {
	return performComparison('COP', input, getSolution(state), data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
