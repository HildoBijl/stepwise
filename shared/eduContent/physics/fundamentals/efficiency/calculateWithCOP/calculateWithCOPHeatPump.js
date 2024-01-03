const { getRandom } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithCOP',
	comparison: { default: { significantDigitMargin: 1 } },
}

function generateState() {
	const Pe = getRandomFloatUnit({
		min: 8,
		max: 15,
		significantDigits: 2,
		unit: 'kW',
	})
	const COP = getRandom(3, 5)
	const Pin = Pe.multiply(COP - 1).roundToPrecision()

	return { Pe, Pin }
}

function getSolution({ Pe, Pin }) {
	return {
		Pout: Pin.add(Pe, true),
		COP: Pin.add(Pe).divide(Pe).setUnit('').setSignificantDigits(2),
	}
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'COP')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
