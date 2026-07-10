const { getRandomNumber } = require('@step-wise/utils')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateWithCOP',
	compare: { FloatUnit: { float: { significantDigitTolerance: 1 } } },
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

function checkInput(data) {
	return compare('COP', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
