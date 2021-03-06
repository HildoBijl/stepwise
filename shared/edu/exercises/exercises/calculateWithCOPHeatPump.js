const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { getRandom } = require('../../../util/random')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithCOP',
	equalityOptions: { significantDigitMargin: 1 },
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

function getCorrect({ Pe, Pin }) {
	return Pin.add(Pe).divide(Pe).setUnit('').setSignificantDigits(2)
}

function checkInput(state, input, step, substep) {
	return checkParameter('COP', getCorrect(state), input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
