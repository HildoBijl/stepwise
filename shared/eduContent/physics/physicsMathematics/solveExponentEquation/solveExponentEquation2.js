const { getRandomFloat, getRandomExponentialFloat } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../eduTools')

// a + b*x^p = c

const metaData = {
	skill: 'solveExponentEquation',
	comparison: { default: { significantDigitTolerance: 2 } },
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

	const b = c.subtract(a).divide(x.toPower(p)).setSignificantDigits(2).roundToPrecision()

	return { a, b, p, c }
}

function getSolution({ a, b, p, c }) {
	const cMinusA = c.subtract(a, true)
	const cMinusADivB = cMinusA.divide(b, true)
	const ans = cMinusADivB.toPower(p.invert())
	return { cMinusA, cMinusADivB, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
