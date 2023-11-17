const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor, performComparison } = require('../../../eduTools')

const data = {
	skill: 'calculateWithEfficiency',
	comparison: { significantDigitMargin: 1 },
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
	return E.divide(Ein).setUnit('')
}

function checkInput(state, input, step, substep) {
	return performComparison('eta', input, getSolution(state), data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
