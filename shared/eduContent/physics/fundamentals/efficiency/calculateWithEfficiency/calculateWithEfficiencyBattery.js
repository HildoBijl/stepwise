const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithEfficiency',
	comparison: { default: { significantDigitMargin: 1 } },
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
