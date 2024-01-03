const { getRandomInteger, getRandomExponentialFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'solveLinearEquation',
	comparison: { default: { significantDigitMargin: 1 } },
}

function generateState() {
	return {
		a: getRandomExponentialFloat({
			min: 1e-3,
			max: 1e3,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
		b: getRandomExponentialFloat({
			min: 1e-2,
			max: 1e4,
			randomSign: true,
			significantDigits: getRandomInteger(2, 3),
		}),
	}
}

function getSolution({ a, b }) {
	return { ans: b.divide(a) }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
