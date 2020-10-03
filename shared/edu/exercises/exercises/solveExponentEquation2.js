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
	})
	const b = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		randomSign: true,
		significantDigits: 2,
	})
	const x = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
	})
	const p = getRandomFloat({
		min: -3,
		max: 3,
		significantDigits: 2,
	})
	const c = a.add(b.multiply(x.toPower(p))).roundToPrecision()
	return { a, b, p, c }
}

function getCorrect({ a, b, p, c }) {
	return c.subtract(a).divide(b).toPower(p.invert())
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