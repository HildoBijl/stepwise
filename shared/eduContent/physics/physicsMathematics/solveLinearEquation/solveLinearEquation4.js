const { getRandomFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'solveLinearEquation',
	comparison: { default: { significantDigitMargin: 1 } },
}

function generateState() {
	const state = {
		a: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		b: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		c: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		d: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
		e: getRandomFloat({
			min: -30,
			max: 30,
			significantDigits: 2,
		}),
	}

	if (state.a.add(state.c).subtract(state.e).number === 0) // Invalid?
		return generateState() // Redo
	return state
}

function getSolution({ a, b, c, d, e }) {
	const ace = a.add(c, true).subtract(e, true)
	const db = d.subtract(b, true)
	const ans = db.divide(ace)
	return { ace, db, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
