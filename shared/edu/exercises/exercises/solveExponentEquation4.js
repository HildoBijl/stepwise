const { getRandomFloat, getRandomExponentialFloat } = require('../../../inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

// a*x^p = b*x^p + c

const data = {
	skill: 'solveExponentEquation',
	equalityOptions: { significantDigitMargin: 2 },
}

function generateState() {
	const x = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
	})
	const p = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		preventZero: true,
	})
	const c = getRandomExponentialFloat({
		min: 1,
		max: 100,
		significantDigits: 2,
	})

	const cTimesPower = c.multiply(x.toPower(p.applyMinus()))
	const b = getRandomFloat({ min: -2, max: 2 }).multiply(cTimesPower).useMinimumSignificantDigits(2).roundToPrecision()
	const a = b.add(cTimesPower).useMinimumSignificantDigits(2).roundToPrecision()

	return { a, b, c, p }
}

function getCorrect({ a, b, c, p }) {
	return a.subtract(b).divide(c).toPower(p.applyMinus().invert()).useMinimumSignificantDigits(2)
}

function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, { ...data.equalityOptions })
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}