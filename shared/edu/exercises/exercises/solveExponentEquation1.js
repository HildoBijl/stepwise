const { getRandomFloat, getRandomExponentialFloat } = require('../../../inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

// a/x^p = b/c^p (=fraction)

const data = {
	skill: 'solveExponentEquation',
	equalityOptions: { significantDigitMargin: 2 },
}

function generateState() {
	const fraction = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
	})
	const p = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		prevent: 0,
	})
	const x = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		prevent: 1,
	})
	const c = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		significantDigits: 2,
	})

	const a = fraction.multiply(x.toPower(p)).setSignificantDigits(2).roundToPrecision()
	const b = fraction.multiply(c.toPower(p)).setSignificantDigits(2).roundToPrecision()

	return { a, b, c, p }
}

function getCorrect({ a, b, c, p }) {
	return a.divide(b).toPower(p.invert()).multiply(c).setMinimumSignificantDigits(2)
}

function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}