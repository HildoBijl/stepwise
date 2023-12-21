const { getRandomInteger, getRandomExponentialFloat } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const data = {
	skill: 'fillInFloat',
	comparison: { relativeMargin: 0.0001 },
}

function generateState() {
	return {
		x: getRandomExponentialFloat({
			min: 1e-6,
			max: 1e7,
			randomSign: true,
			significantDigits: getRandomInteger(2, 4),
		})
	}
}

function getSolution({ x }) {
	return { ans: x }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('ans', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}