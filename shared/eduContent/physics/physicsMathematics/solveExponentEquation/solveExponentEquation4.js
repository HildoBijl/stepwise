const { getRandomFloat, getRandomExponentialFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

// a*x^p = b*x^p + c

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
	const p = getRandomFloat({
		min: -3,
		max: 3,
		decimals: 1,
		prevent: 0,
	})
	const c = getRandomExponentialFloat({
		min: 1,
		max: 100,
		significantDigits: 2,
	})

	const cDivPower = c.divide(x.toPower(p))
	const b = getRandomFloat({ min: -2, max: 2 }).multiply(cDivPower).setSignificantDigits(2).roundToPrecision()
	const a = b.add(cDivPower).setSignificantDigits(2).roundToPrecision()

	return { a, b, c, p }
}

function getSolution({ a, b, c, p }) {
	const aMinusB = a.subtract(b, true)
	const cDivAMinusB = c.divide(aMinusB, true)
	const ans = a.subtract(b).divide(c).toPower(p.applyMinus().invert()).setMinimumSignificantDigits(2)
	return { aMinusB, cDivAMinusB, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
