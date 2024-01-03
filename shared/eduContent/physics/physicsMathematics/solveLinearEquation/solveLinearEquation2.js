const { getRandomInteger, getRandomExponentialFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'solveLinearEquation',
	comparison: { default: { significantDigitMargin: 1 } },
}

function generateState() {
	return {
		a: getRandomExponentialFloat({
			min: 1e-1,
			max: 1e2,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
		b: getRandomExponentialFloat({
			min: 1e-1,
			max: 1e2,
			significantDigits: getRandomInteger(2, 3),
		}),
		c: getRandomExponentialFloat({
			min: 1e-1,
			max: 1e2,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
		d: getRandomExponentialFloat({
			min: 1e-1,
			max: 1e2,
			significantDigits: getRandomInteger(2, 3),
		}),
	}
}

function getSolution({ a, b, c, d }) {
	const ab = a.multiply(b, true)
	const cd = c.multiply(d, true)
	const ans = cd.divide(ab)
	return { ab, cd, ans }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
