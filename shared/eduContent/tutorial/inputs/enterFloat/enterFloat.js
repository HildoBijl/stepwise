const { getRandomInteger, getRandomExponentialFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'enterFloat',
	comparison: { ans: { significantDigitMargin: 0 } },
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

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
