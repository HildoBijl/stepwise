const { getRandomFloat, getRandomExponentialFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

// a*x^c = b*x^d

const metaData = {
	skill: 'solveExponentEquation',
	comparison: { default: { significantDigitMargin: 2 } },
}

function generateState() {
	const x = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		prevent: 1,
	})
	const a = getRandomExponentialFloat({
		min: 0.1,
		max: 10,
		significantDigits: 2,
	})
	const c = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		prevent: 0,
	})
	const d = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		prevent: [0, c.number],
	})

	const b = a.multiply(x.toPower(c.subtract(d))).setSignificantDigits(2).roundToPrecision()

	return { a, b, c, d }
}

function getSolution({ a, b, c, d }) {
	const power = c.subtract(d, true)
	const bDivA = b.divide(a, true)
	const ans = b.divide(a).toPower(c.subtract(d).invert())
	return { power, bDivA, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
