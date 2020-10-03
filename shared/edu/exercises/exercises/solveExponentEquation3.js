const { getRandomFloat, getRandomExponentialFloat } = require('../../../inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

// a*x^c = b*x^d

const data = {
	skill: 'solveExponentEquation',
	equalityOptions: { significantDigitMargin: 2 },
}

function generateState() {
	const x = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
	})
	const power = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		preventZero: true,
	})

	const a = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		significantDigits: 2,
	})
	const d = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
	})

	const c = d.add(power).roundToPrecision()
	const b = a.multiply(x.toPower(power)).roundToPrecision()
	return { a, b, c, d }
}

function getCorrect({ a, b, c, d }) {
	return b.divide(a).toPower(c.subtract(d).invert())
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