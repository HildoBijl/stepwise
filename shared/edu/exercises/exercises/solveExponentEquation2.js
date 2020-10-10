const { getRandomFloat, getRandomExponentialFloat } = require('../../../inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

// a + b*x^p = c

const data = {
	skill: 'solveExponentEquation',
	equalityOptions: { significantDigitMargin: 2 },
}

function generateState() {
	const a = getRandomFloat({
		min: -20,
		max: 20,
		significantDigits: 2,
		prevent: 0,
	})
	const c = getRandomFloat({
		min: -20,
		max: 20,
		significantDigits: 2,
		prevent: [0, a.number],
	})
	const x = getRandomExponentialFloat({
		min: 0.2,
		max: 40,
		prevent: 1,
	})
	const p = getRandomFloat({
		min: -3,
		max: 3,
		significantDigits: 2,
		prevent: 0,
	})

	const b = c.subtract(a).divide(x.toPower(p)).useSignificantDigits(2).roundToPrecision()

	return { a, b, p, c }
}

function getCorrect({ a, b, p, c }) {
	return c.subtract(a).divide(b).toPower(p.invert())
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