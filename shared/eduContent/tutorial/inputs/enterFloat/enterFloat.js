const { getRandomInteger, getRandomExponentialFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'enterFloat',
	comparison: { ans: { significantDigitMargin: 0 } },
}

function generateState() {
	const x = getRandomExponentialFloat({
		min: 1e-6,
		max: 1e7,
		randomSign: true,
		significantDigits: getRandomInteger(2, 4),
	})
	if (x.getDisplayPower() === 0)
		return generateState()
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
