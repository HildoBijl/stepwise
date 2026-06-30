const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithEfficiency',
	comparison: { default: { float: { significantDigitTolerance: 1 } } },
}

function generateState() {
	const E = getRandomFloatUnit({
		min: 15,
		max: 60,
		digits: 0,
		unit: 'kWh',
	}).setSignificantDigits(3).roundToPrecision()
	const eta = getRandomFloatUnit({
		min: 0.915,
		max: 0.995,
		significantDigits: 3,
		unit: '',
	})
	const Ein = E.divide(eta).roundToPrecision()

	return { E, Ein }
}

function getSolution({ E, Ein }) {
	return { eta: E.divide(Ein).setUnit('') }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'eta')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
