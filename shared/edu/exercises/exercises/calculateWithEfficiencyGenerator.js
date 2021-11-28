const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateWithEfficiency',
	equalityOptions: { significantDigitMargin: 1 },
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
	return P.divide(Pin).setUnit('')
}

function checkInput(state, input, step, substep) {
	return checkParameter('eta', getSolution(state), input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
