const { getRandomInteger } = require('@step-wise/utils')
const { getRandomExponentialFloat } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'enterFloat',
	compare: { ans: { significantDigitTolerance: 0, checkPower: true } },
}

function generateState(example) {
	const x = getRandomExponentialFloat({
		min: example ? 1e-4 : 1e-8,
		max: example ? 1e5 : 1e9,
		randomSign: true,
		significantDigits: getRandomInteger(2, example ? 2 : 4),
	})
	if (x.getDisplayPower() === 0)
		return generateState(example)
	return { x }
}

function getSolution({ x }) {
	return { ans: x }
}

function checkInput(data) {
	return compare('ans', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
