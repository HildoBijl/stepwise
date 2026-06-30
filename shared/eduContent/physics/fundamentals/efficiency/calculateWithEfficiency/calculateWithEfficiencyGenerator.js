const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithEfficiency',
	comparison: { default: { float: { significantDigitTolerance: 1 } } },
}

function generateState() {
	const P = getRandomFloatUnit({
		min: 2.5,
		max: 20,
		significantDigits: 2,
		unit: 'kW',
	})
	const eta = getRandomFloatUnit({
		min: 0.10,
		max: 0.30,
		significantDigits: 2,
		unit: '',
	})
	const Pin = P.divide(eta).roundToPrecision()

	return { P, Pin }
}

function getSolution({ P, Pin }) {
	return { eta: P.divide(Pin).setUnit('') }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'eta')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
