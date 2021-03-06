const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithEfficiency',
	equalityOptions: { significantDigitMargin: 1 },
}

function generateState() {
	const E = getRandomFloatUnit({
		min: 15,
		max: 60,
		digits: 0,
		unit: 'kWh',
	}).setSignificantDigits(3)
	const eta = getRandomFloatUnit({
		min: 0.915,
		max: 0.995,
		significantDigits: 3,
		unit: '',
	})
	const Ein = E.divide(eta).roundToPrecision()

	return { E, Ein }
}

function getCorrect({ E, Ein }) {
	return E.divide(Ein).setUnit('')
}

function checkInput(state, input, step, substep) {
	return checkParameter('eta', getCorrect(state), input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
