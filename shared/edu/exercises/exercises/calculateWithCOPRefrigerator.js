const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { getRandom } = require('../../../util/random')
const { checkField } = require('../util/check')

const data = {
	skill: 'calculateWithCOP',
	equalityOptions: { significantDigitMargin: 1 },
}

function generateState() {
	const Ee = getRandomFloatUnit({
		min: 3,
		max: 8,
		significantDigits: 2,
		unit: 'MJ',
	})
	const epsilon = getRandom(2,4)
	const Eout = Ee.multiply(epsilon + 1).roundToPrecision()

	return { Ee, Eout }
}

function getCorrect({ Ee, Eout }) {
	return Eout.subtract(Ee).divide(Ee).setUnit('').useSignificantDigits(2)
}

function checkInput(state, input, step, substep) {
	return checkField('epsilon', getCorrect(state), input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
