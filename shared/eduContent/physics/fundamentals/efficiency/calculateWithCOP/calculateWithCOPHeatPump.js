const { getRandomNumber } = require('@step-wise/utils')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithCOP',
	comparison: { default: { float: { significantDigitTolerance: 1 } } },
}

function generateState() {
	const Pe = getRandomFloatUnit({
		min: 8,
		max: 15,
		significantDigits: 2,
		unit: 'kW',
	})
	const COP = getRandomNumber(3, 5)
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
